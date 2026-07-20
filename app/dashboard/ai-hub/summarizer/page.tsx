'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Upload, Mic, Loader2, ArrowLeft, RefreshCw, Layers } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import RecordRTC from 'recordrtc'

export default function SummarizerPage() {
  const router = useRouter()
  
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'summarizing' | 'done'>('idle')
  const [data, setData] = useState<{ bullets: string[], flashcards: any[] } | null>(null)
  const [cards, setCards] = useState<any[]>([])
  
  const recorderRef = useRef<RecordRTC | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stopAudioTracks = () => {
     if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
     }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processAudioBlob(file)
  }

  const toggleRecording = async () => {
    if (status === 'recording') {
       setStatus('transcribing')
       if (recorderRef.current) {
          recorderRef.current.stopRecording(() => {
             const blob = recorderRef.current!.getBlob()
             stopAudioTracks()
             processAudioBlob(blob)
          })
       }
    } else {
       try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          streamRef.current = stream
          recorderRef.current = new RecordRTC(stream, { type: 'audio', mimeType: 'audio/webm' })
          recorderRef.current.startRecording()
          setStatus('recording')
       } catch (err) {
          toast.error("Microphone access denied.")
       }
    }
  }

  const processAudioBlob = async (blob: Blob | File) => {
    setStatus('transcribing')
    try {
       // 1. Transcribe via Groq Whisper
       const formData = new FormData()
       formData.append('file', blob)
       
       const transRes = await fetch('/api/ai/transcribe', { method: 'POST', body: formData })
       const transData = await transRes.json()
       if (transData.error) throw new Error(transData.error)
       
       const text = transData.text
       if (!text || text.length < 10) throw new Error("Audio too short or silent.")

       // 2. Summarize via Groq Llama 3
       setStatus('summarizing')
       const sumRes = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
       })
       const sumData = await sumRes.json()
       if (sumData.error) throw new Error(sumData.error)
       
       setData(sumData.data)
       setCards(sumData.data.flashcards)
       setStatus('done')
       
    } catch (error: any) {
       toast.error(error.message || 'Failed to process lecture.')
       setStatus('idle')
    }
  }
  
  const reset = () => {
     setStatus('idle')
     setData(null)
     setCards([])
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 pt-safe flex flex-col min-h-[85vh]">
      <div className="flex items-center gap-4 border-b pb-6 border-border shrink-0">
        <button onClick={() => router.back()} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-foreground">Lecture Summarizer</h1>
          <p className="text-sm text-muted-foreground font-medium">Turn raw audio into bullet points & flashcards</p>
        </div>
      </div>

      {status === 'idle' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 border-2 border-dashed border-border rounded-3xl text-center space-y-8 bg-black/5 dark:bg-white/5 m-auto w-full"
        >
          <div className="space-y-4">
             <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
               <Layers className="w-10 h-10 text-primary" />
             </div>
             <h3 className="font-bold text-xl text-foreground">Record or Upload Lecture</h3>
             <p className="text-muted-foreground max-w-md mx-auto text-sm">
               We use Groq's insanely fast Whisper model to transcribe the audio, then Llama 3 compresses it into high-yield points and Anki flashcards.
             </p>
          </div>

          <div className="flex items-center justify-center gap-6">
             <button 
               onClick={toggleRecording}
               className="px-8 py-4 rounded-2xl font-black bg-primary text-background glow-olive hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
             >
               <Mic className="w-6 h-6" /> Record Now
             </button>
             
             <span className="text-muted-foreground font-bold">OR</span>
             
             <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="px-8 py-4 rounded-2xl font-black bg-card border-2 border-border hover:border-primary/50 transition-all flex items-center gap-2"
             >
               <Upload className="w-6 h-6" /> Upload Audio
             </button>
          </div>
        </motion.div>
      )}

      {status === 'recording' && (
         <div className="m-auto flex flex-col items-center justify-center space-y-6">
            <motion.div 
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ repeat: Infinity, duration: 1.5 }}
               className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center"
            >
               <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                  <Mic className="w-10 h-10 text-white" />
               </div>
            </motion.div>
            <div className="text-center">
               <h3 className="font-bold text-xl text-red-500">Recording Lecture...</h3>
               <p className="text-muted-foreground text-sm mt-1">Make sure the professor is audible.</p>
            </div>
            <button 
               onClick={toggleRecording}
               className="px-8 py-3 rounded-full font-bold bg-background border border-border hover:bg-muted transition-all"
            >
               Stop & Summarize
            </button>
         </div>
      )}

      {(status === 'transcribing' || status === 'summarizing') && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="m-auto p-10 border border-border rounded-3xl text-center space-y-6 bg-card shadow-premium-sm w-full max-w-md"
        >
           <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
           <div>
             <h3 className="font-bold text-xl text-foreground">
               {status === 'transcribing' ? 'Transcribing Audio...' : 'Generating Summary...'}
             </h3>
             <p className="text-muted-foreground text-sm mt-2">
               {status === 'transcribing' ? 'Powered by Groq Whisper-Large-V3' : 'Powered by Groq Llama-3.1-8b'}
             </p>
           </div>
        </motion.div>
      )}

      {status === 'done' && data && (
        <div className="grid md:grid-cols-2 gap-8 flex-1">
           {/* Bullet Points */}
           <div className="bg-card p-6 rounded-3xl border border-border overflow-y-auto max-h-[60vh] scrollbar-hide shadow-premium-md">
              <h3 className="font-black text-lg mb-6 sticky top-0 bg-card py-2 border-b border-border z-10 uppercase tracking-widest text-primary">10 High-Yield Points</h3>
              <ul className="space-y-4">
                 {data.bullets.map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-sm leading-relaxed text-foreground/90 font-medium bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
                       <span className="font-black text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                       <span>{point}</span>
                    </li>
                 ))}
              </ul>
           </div>

           {/* Tinder Style Flashcards */}
           <div className="flex flex-col items-center justify-center">
              <h3 className="font-black text-lg mb-6 uppercase tracking-widest text-foreground text-center">Interactive Flashcards</h3>
              
              <div className="relative w-full max-w-sm h-80 perspective-1000">
                 <AnimatePresence>
                    {cards.length > 0 ? (
                       <TinderCard 
                         key={cards[0].front} 
                         card={cards[0]} 
                         onSwipe={() => setCards(c => c.slice(1))} 
                       />
                    ) : (
                       <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="absolute inset-0 flex flex-col items-center justify-center text-center bg-card border border-border rounded-3xl shadow-md"
                       >
                          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                             <CheckCircle2 className="w-8 h-8 text-green-500" />
                          </div>
                          <h4 className="font-bold text-xl">All caught up!</h4>
                          <p className="text-muted-foreground text-sm mt-2">You reviewed all the flashcards.</p>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              <div className="mt-8 flex gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                 <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full">Swipe Left (Review)</span>
                 <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full">Swipe Right (Got It)</span>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function TinderCard({ card, onSwipe }: { card: any, onSwipe: () => void }) {
   const [flipped, setFlipped] = useState(false)
   const x = useMotionValue(0)
   const rotate = useTransform(x, [-200, 200], [-15, 15])
   const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

   const handleDragEnd = (e: any, info: any) => {
      if (Math.abs(info.offset.x) > 100) {
         onSwipe()
      }
   }

   return (
      <motion.div
         drag="x"
         dragConstraints={{ left: 0, right: 0 }}
         onDragEnd={handleDragEnd}
         style={{ x, rotate, opacity }}
         exit={{ x: x.get() > 0 ? 300 : -300, opacity: 0 }}
         transition={{ type: 'spring', stiffness: 300, damping: 20 }}
         onClick={() => setFlipped(!flipped)}
         className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing preserve-3d"
      >
         <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-card to-card border-2 border-border shadow-xl rounded-3xl p-6 flex flex-col justify-center items-center text-center">
               <span className="absolute top-4 right-4 text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">Question</span>
               <h3 className="font-bold text-xl text-foreground">{card.front}</h3>
               <p className="absolute bottom-4 text-xs font-bold text-primary animate-pulse">Tap to flip</p>
            </div>
            
            {/* Back */}
            <div className="absolute inset-0 backface-hidden bg-primary text-primary-foreground shadow-xl rounded-3xl p-6 flex flex-col justify-center items-center text-center rotate-y-180">
               <span className="absolute top-4 right-4 text-[10px] font-black uppercase text-primary-foreground/50 tracking-widest">Answer</span>
               <p className="font-medium text-lg">{card.back}</p>
            </div>
         </div>
      </motion.div>
   )
}
