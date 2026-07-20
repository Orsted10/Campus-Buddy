'use client'

import { useState } from 'react'
import { useCompletion } from '@ai-sdk/react'
import { FileText, Building2, Briefcase, Sparkles, Loader2, Copy, Check, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePortalStore } from '@/store/usePortalStore'
import { motion } from 'framer-motion'

export default function CareerAgentPage() {
  const router = useRouter()
  const { profile, courses } = usePortalStore()
  
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [copied, setCopied] = useState(false)

  // Use the AI SDK's useCompletion hook to stream the response
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/ai/cover-letter',
    onError: (err) => {
      toast.error(err.message || 'Failed to generate cover letter.')
    }
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Pass the user's real university data to the AI
    const studentContext = {
      degree: profile?.program || 'Student',
      courses: courses.map(c => c.subjectName).join(', ')
    }

    await complete('', {
       body: {
         company,
         role,
         jobDescription,
         studentContext
       }
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(completion)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 pt-safe font-inter">
      <div className="flex items-center gap-4 mb-8 border-b pb-6 border-border">
        <button onClick={() => router.back()} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-foreground">AI Career Agent</h1>
          <p className="text-muted-foreground font-medium">Auto-generate tailored cover letters using your real grades.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4" /> Company Name
              </label>
              <input
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google, Microsoft, Local Startup"
                className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4" /> Role Title
              </label>
              <input
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer Intern"
                className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" /> Job Description
              </label>
              <textarea
                required
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the requirements or job description here..."
                rows={6}
                className="w-full p-4 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !company || !role || !jobDescription}
            className="w-full py-4 rounded-xl font-bold bg-primary text-background glow-olive-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isLoading ? 'Drafting Masterpiece...' : 'Generate Cover Letter'}
          </button>
          
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
             <p className="text-sm font-medium text-primary">
                The AI will automatically include your degree <strong>({profile?.program || 'Not found'})</strong> and cross-reference your completed courses to match the job requirements!
             </p>
          </div>
        </form>

        {/* Output Area */}
        <div className="relative flex flex-col h-full min-h-[500px]">
          <div className="absolute inset-0 bg-card border border-border rounded-3xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Generated Draft
              </span>
              {completion && (
                <button 
                  onClick={handleCopy}
                  className="p-2 bg-background hover:bg-muted border border-border rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap leading-relaxed text-foreground">
               {error && <p className="text-red-500 font-medium">Error: {error.message}</p>}
               {!completion && !isLoading && !error && (
                 <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <FileText className="w-16 h-16 mb-4" />
                    <p className="max-w-xs text-center font-medium">Your personalized cover letter will appear here, streaming in real-time.</p>
                 </div>
               )}
               {completion}
               {isLoading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
