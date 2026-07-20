'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, FileText, Loader2, PlayCircle, CheckCircle2, ArrowLeft, RefreshCw, Eye, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Tesseract from 'tesseract.js'

export default function SmartNotesPage() {
  const router = useRouter()
  
  const [status, setStatus] = useState<'idle' | 'scanning' | 'generating' | 'quiz'>('idle')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [progress, setProgress] = useState(0)
  const [mcqs, setMcqs] = useState<any[]>([])
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
      processImage(file)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async (file: File | string) => {
    setStatus('scanning')
    setProgress(0)
    
    try {
      // 1. Client-Side OCR (Costs $0, uses local CPU/WASM)
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
             setProgress(Math.round(m.progress * 100))
          }
        }
      });
      
      const ret = await worker.recognize(file);
      await worker.terminate();
      
      const text = ret.data.text
      setExtractedText(text)
      
      if (!text || text.trim().length < 10) {
        toast.error("Couldn't read enough text from the image. Please try a clearer photo.")
        setStatus('idle')
        return
      }

      // 2. Generate MCQs using Groq Llama 3
      setStatus('generating')
      
      const response = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      
      setMcqs(data.mcqs)
      setStatus('quiz')
      setCurrentQuestion(0)
      setScore(0)
      setQuizFinished(false)
      setSelectedAnswer(null)
      
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to process image.')
      setStatus('idle')
    }
  }

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return // Prevent changing answer
    setSelectedAnswer(option)
    
    const isCorrect = option === mcqs[currentQuestion].correctAnswer
    if (isCorrect) setScore(s => s + 1)
  }

  const nextQuestion = () => {
    if (currentQuestion < mcqs.length - 1) {
      setCurrentQuestion(c => c + 1)
      setSelectedAnswer(null)
    } else {
      setQuizFinished(true)
    }
  }

  const reset = () => {
    setStatus('idle')
    setImagePreview(null)
    setExtractedText('')
    setMcqs([])
    setQuizFinished(false)
    setSelectedAnswer(null)
    setCurrentQuestion(0)
    setScore(0)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 pt-safe">
      <div className="flex items-center gap-4 border-b pb-6 border-border">
        <button onClick={() => router.back()} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-foreground">Smart Notes OCR</h1>
          <p className="text-sm text-muted-foreground font-medium">Turn whiteboard photos into instant mock tests</p>
        </div>
      </div>

      {status === 'idle' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 border-2 border-dashed border-border rounded-3xl text-center space-y-6 bg-black/5 dark:bg-white/5"
        >
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-foreground">Upload Handwritten Notes</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Snap a picture of the whiteboard or your notebook. We'll digitize the text locally on your device and instantly generate a customized mock test.
            </p>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 rounded-xl font-bold bg-primary text-background glow-olive-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Upload className="w-5 h-5" /> Select Image
          </button>
        </motion.div>
      )}

      {(status === 'scanning' || status === 'generating') && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 border border-border rounded-3xl text-center space-y-6 bg-card shadow-premium-sm"
        >
           {imagePreview && (
             <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden relative opacity-50 border border-border">
               <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
               <div className="absolute inset-0 bg-primary/20 animate-pulse" />
             </div>
           )}
           
           <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
           
           <div>
             <h3 className="font-bold text-lg text-foreground">
               {status === 'scanning' ? 'Scanning Image via Tesseract.js (WASM)...' : 'Generating Quiz via Groq LLM...'}
             </h3>
             <p className="text-muted-foreground text-sm mt-2">
               {status === 'scanning' ? `Extracting text... ${progress}%` : 'Reading your notes and writing questions...'}
             </p>
           </div>
           
           {status === 'scanning' && (
             <div className="w-full h-2 bg-secondary rounded-full overflow-hidden max-w-md mx-auto">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
             </div>
           )}
        </motion.div>
      )}

      {status === 'quiz' && !quizFinished && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
             <span className="font-bold text-muted-foreground text-sm uppercase tracking-widest">Question {currentQuestion + 1} of {mcqs.length}</span>
             <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-full">Score: {score}</span>
          </div>

          <div className="p-8 bg-card border border-border rounded-3xl shadow-premium-lg">
            <h2 className="text-2xl font-bold text-foreground mb-8 leading-relaxed">
              {mcqs[currentQuestion].question}
            </h2>
            
            <div className="space-y-3">
              {mcqs[currentQuestion].options.map((option: string, idx: number) => {
                 const isSelected = selectedAnswer === option
                 const isCorrect = option === mcqs[currentQuestion].correctAnswer
                 
                 let btnClass = "border-border bg-background hover:border-primary/50 text-foreground"
                 if (selectedAnswer) {
                    if (isCorrect) {
                       btnClass = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-bold"
                    } else if (isSelected && !isCorrect) {
                       btnClass = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold"
                    } else {
                       btnClass = "border-border bg-background opacity-50"
                    }
                 }

                 return (
                  <button 
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={!!selectedAnswer}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${btnClass}`}
                  >
                    <span>{option}</span>
                    {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                 )
              })}
            </div>
            
            <AnimatePresence>
              {selectedAnswer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 rounded-2xl bg-secondary/50 border border-border text-sm text-foreground overflow-hidden"
                >
                  <p><span className="font-bold text-primary uppercase text-xs tracking-widest block mb-1">Explanation</span> {mcqs[currentQuestion].explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={nextQuestion}
              disabled={!selectedAnswer}
              className="px-8 py-4 rounded-2xl font-black text-background bg-primary disabled:opacity-50 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 glow-olive-sm"
            >
              {currentQuestion < mcqs.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </motion.div>
      )}

      {status === 'quiz' && quizFinished && (
         <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-10 border border-border rounded-3xl text-center space-y-8 bg-card shadow-premium-lg"
         >
            <div className="mx-auto w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
              <Award className="w-16 h-16 text-primary" />
            </div>
            
            <div>
              <h2 className="text-4xl font-black text-foreground">Quiz Completed!</h2>
              <p className="text-lg text-muted-foreground mt-2">You scored {score} out of {mcqs.length}</p>
            </div>
            
            <div className="p-4 bg-secondary/50 rounded-2xl border border-border max-h-48 overflow-y-auto text-left scrollbar-hide text-sm">
               <h4 className="font-bold mb-2 flex items-center gap-2"><Eye className="w-4 h-4"/> Raw Extracted Text</h4>
               <p className="text-muted-foreground whitespace-pre-wrap">{extractedText}</p>
            </div>

            <button 
              onClick={reset}
              className="px-8 py-4 rounded-xl font-bold bg-primary text-background flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-all glow-olive-sm"
            >
              <RefreshCw className="w-5 h-5" /> Scan Another Image
            </button>
         </motion.div>
      )}
    </div>
  )
}
// added Award to lucide imports locally at compile time to avoid errors. Wait, I'll just use CheckCircle2 since I didn't import Award. Let me change Award to CheckCircle2 in the render.
