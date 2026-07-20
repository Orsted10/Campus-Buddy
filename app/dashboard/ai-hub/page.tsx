'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, Mic, FileText, ArrowRight, Zap, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AIHubPage() {
  const router = useRouter()

  const features = [
    {
      id: 'mock-interview',
      title: 'AI Mock Interviewer',
      description: 'Practice live voice-to-voice technical interviews with our advanced Llama 3 AI agent.',
      icon: <Mic className="w-8 h-8 text-blue-500" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      badge: 'Interactive Voice',
      link: '/dashboard/ai-hub/interview'
    },
    {
      id: 'career-agent',
      title: 'Auto Cover Letters',
      description: 'Paste a job description and let AI instantly write a hyper-personalized cover letter based on your real grades.',
      icon: <FileText className="w-8 h-8 text-green-500" />,
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      badge: 'Zero Effort',
      link: '/dashboard/ai-hub/career'
    },
    {
      id: 'ocr-notes',
      title: 'Smart Notes OCR',
      description: 'Snap a picture of handwritten notes or whiteboards to instantly generate a mock test using WASM Tesseract.js.',
      icon: <FileText className="w-8 h-8 text-amber-500" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      badge: 'WASM Local',
      link: '/dashboard/ai-hub/ocr'
    },
    {
      id: 'lecture-summarizer',
      title: 'Lecture Summarizer',
      description: 'Upload a lecture recording to automatically generate high-yield bullet points and Tinder-style flashcards.',
      icon: <Mic className="w-8 h-8 text-purple-500" />,
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      badge: 'Flashcards',
      link: '/dashboard/ai-hub/summarizer'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 pt-safe font-inter">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10 border-b pb-6 border-border">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner border border-primary/20">
          <BrainCircuit className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            AI Hub <Sparkles className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            Powered by Groq (Llama 3)
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => router.push(feature.link)}
            className={`group cursor-pointer relative overflow-hidden rounded-3xl border ${feature.border} bg-card hover:bg-muted/50 transition-all duration-300 p-8 shadow-lg hover:shadow-xl`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 ${feature.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${feature.bg} shadow-sm border ${feature.border}`}>
                  {feature.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${feature.bg} ${feature.border} border`}>
                  {feature.badge}
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="pt-4 flex items-center text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Launch Agent <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
