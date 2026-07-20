'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, AlertCircle, Loader2, PlayCircle, StopCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePortalStore } from '@/store/usePortalStore'

// Use browser native speech APIs to keep it completely free
const SpeechRecognition = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

export default function MockInterviewPage() {
  const router = useRouter()
  const { profile } = usePortalStore()
  
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([])
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, transcript])

  // Start the interview
  const startInterview = async () => {
    if (!SpeechRecognition) {
      setErrorMsg("Your browser doesn't support the native Speech API. Please use Chrome or Edge.")
      setStatus('error')
      return
    }

    try {
      setMessages([])
      setStatus('processing')
      const degree = profile?.program || 'Computer Science'
      
      // Ping API to get the first question
      const response = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           action: 'start', 
           degree 
        })
      })

      const data = await response.json()
      if (data.error) {
         setErrorMsg(data.error)
         setStatus('error')
         return
      }

      setMessages([{ role: 'ai', text: data.message }])
      speak(data.message)
    } catch (e: any) {
      setErrorMsg('Failed to connect to AI Agent.')
      setStatus('error')
    }
  }

  const speak = (text: string) => {
    setStatus('speaking')
    window.speechSynthesis.cancel() // Stop anything currently playing
    
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || voices.find(v => v.lang.includes('en-GB'))
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.rate = 1.05
    utterance.pitch = 1
    
    utterance.onend = () => {
      setStatus('idle')
    }
    
    synthesisRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const toggleRecording = () => {
    if (status === 'speaking') {
       window.speechSynthesis.cancel()
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      setStatus('idle')
      if (transcript.trim()) {
         submitAnswer(transcript)
      }
    } else {
      if (!SpeechRecognition) return
      
      setTranscript('')
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript
        }
        setTranscript(currentTranscript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
        setStatus('idle')
      }

      recognitionRef.current.start()
      setIsRecording(true)
      setStatus('listening')
    }
  }

  const submitAnswer = async (answerText: string) => {
    const updatedMessages = [...messages, { role: 'user', text: answerText }]
    setMessages(updatedMessages as any)
    setTranscript('')
    setStatus('processing')
    
    try {
      const response = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           action: 'answer', 
           history: updatedMessages
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      
      setMessages([...updatedMessages, { role: 'ai', text: data.message }])
      speak(data.message)
    } catch (e: any) {
      toast.error('AI disconnected. Try again.')
      setStatus('idle')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 pt-safe flex flex-col h-[85vh]">
      <div className="flex items-center justify-between border-b pb-6 border-border shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">AI Mock Interviewer</h1>
            <p className="text-sm text-muted-foreground font-medium">Voice-to-voice technical screening</p>
          </div>
        </div>
        
        {messages.length === 0 && status === 'idle' && (
          <button 
            onClick={startInterview}
            className="flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform glow-olive-sm"
          >
            <PlayCircle className="w-5 h-5" /> Start
          </button>
        )}
      </div>

      {status === 'error' ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-4 m-auto">
           <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
           <p className="font-bold text-red-500">{errorMsg}</p>
        </div>
      ) : (
        <>
          {/* Chat Container */}
          <div ref={chatRef} className="flex-1 overflow-y-auto space-y-6 p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 scroll-smooth">
            {messages.length === 0 && status !== 'processing' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <Mic className="w-16 h-16" />
                <p className="font-medium text-lg max-w-sm">Tap Start to begin your technical screening. The AI will evaluate your answers in real-time.</p>
              </div>
            ) : null}

            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-card border border-border shadow-md rounded-tl-sm text-foreground'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}

            {/* Live Transcript / Loading states */}
            {status === 'processing' && (
               <div className="flex justify-start">
                  <div className="bg-card border border-border shadow-md rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
                     <Loader2 className="w-5 h-5 text-primary animate-spin" />
                     <span className="text-sm font-medium text-muted-foreground">AI is thinking...</span>
                  </div>
               </div>
            )}

            {isRecording && transcript && (
               <div className="flex justify-end">
                  <div className="max-w-[80%] p-4 rounded-2xl bg-primary/20 text-primary border border-primary/30 rounded-tr-sm">
                    <p className="text-sm italic">{transcript} <span className="animate-pulse">|</span></p>
                  </div>
               </div>
            )}
          </div>

          {/* Controls */}
          <div className="shrink-0 flex items-center justify-center pt-4">
            <AnimatePresence>
              {messages.length > 0 && status !== 'processing' && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleRecording}
                  className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white shadow-red-500/20' 
                      : 'bg-primary text-background glow-olive'
                  }`}
                >
                  {isRecording && <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-50" />}
                  {isRecording ? <StopCircle className="w-10 h-10 relative z-10" /> : <Mic className="w-10 h-10 relative z-10" />}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          {isRecording && (
            <p className="text-center text-xs font-bold text-red-500 animate-pulse uppercase tracking-widest">Listening... tap to stop</p>
          )}
          {status === 'speaking' && !isRecording && (
            <p className="text-center text-xs font-bold text-primary animate-pulse uppercase tracking-widest">AI is speaking... tap mic to interrupt</p>
          )}
        </>
      )}
    </div>
  )
}
