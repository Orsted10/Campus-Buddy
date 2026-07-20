'use client'

import { useState, useEffect } from 'react'
import { FileText, Building2, Briefcase, Sparkles, Loader2, Copy, Check, ArrowLeft, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

export default function CareerAgentPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('career_matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        toast.error("Failed to fetch matches. Run Phase 3 SQL schema.")
        console.error(error)
      } else if (data) {
        setMatches(data)
      }
    } catch (e) {
      console.error("Network error fetching matches:", e)
      toast.error("Network error fetching career matches.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Cover letter copied!')
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 pt-safe font-inter">
      <div className="flex items-center gap-4 mb-8 border-b pb-6 border-border">
        <button onClick={() => router.back()} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-foreground">Autonomous AI Career Agent</h1>
          <p className="text-muted-foreground font-medium">Daily curated internship matches with auto-generated cover letters based on your scraped profile.</p>
        </div>
      </div>

      <div className="space-y-6">
         <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5 text-green-500" />
               </div>
               <div>
                  <h3 className="font-bold text-green-500">Agent Status: Active</h3>
                  <p className="text-xs text-green-600/80">Cron job running daily at 04:00 AM (Scraping LinkedIn via Puppeteer/Render)</p>
               </div>
            </div>
            <button onClick={fetchMatches} className="px-4 py-2 bg-green-500 text-white font-bold text-sm rounded-xl hover:scale-105 transition-all shadow-lg shadow-green-500/20">
               Refresh Matches
            </button>
         </div>

         {loading ? (
            <div className="flex justify-center p-12">
               <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
         ) : matches.length === 0 ? (
            <div className="text-center p-16 border-2 border-dashed border-border rounded-3xl bg-black/5 dark:bg-white/5">
               <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
               <h3 className="text-xl font-bold">No matches yet</h3>
               <p className="text-muted-foreground mt-2">The cron job hasn't found any internships matching your profile today. Check back tomorrow!</p>
               
               {/* Quick Mock data for demo since cron hasn't run */}
               <button 
                 onClick={() => {
                   setMatches([{
                     id: 'mock',
                     company_name: 'Google',
                     role_title: 'Software Engineering Intern, Summer 2027',
                     match_score: 98,
                     cover_letter: "Dear Hiring Manager at Google,\n\nI am incredibly excited to apply for the SWE Intern position. My coursework in Data Structures and Algorithms (A+) combined with my proven track record in full-stack development perfectly aligns with the requirements of this role.\n\nThank you for your consideration,\n[Your Name]",
                     job_url: "https://careers.google.com"
                   }])
                 }}
                 className="mt-6 px-6 py-3 bg-secondary rounded-xl text-sm font-bold border border-border"
               >
                 Inject Demo Match
               </button>
            </div>
         ) : (
            <div className="grid lg:grid-cols-2 gap-6">
               {matches.map((match) => (
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     key={match.id} 
                     className="bg-card border border-border rounded-3xl p-6 shadow-premium-sm space-y-4"
                  >
                     <div className="flex justify-between items-start">
                        <div>
                           <h3 className="font-black text-xl text-foreground">{match.role_title}</h3>
                           <div className="flex items-center gap-2 text-muted-foreground mt-1">
                              <Building2 className="w-4 h-4" />
                              <span className="font-bold">{match.company_name}</span>
                           </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-inner">
                           <span className="font-black text-green-500 text-sm">{match.match_score}%</span>
                        </div>
                     </div>

                     <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl relative group">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2 block">Auto-Generated Cover Letter</span>
                        <p className="text-sm leading-relaxed text-foreground/80 line-clamp-4 group-hover:line-clamp-none transition-all duration-300 whitespace-pre-wrap">
                           {match.cover_letter}
                        </p>
                        <button 
                           onClick={() => handleCopy(match.cover_letter)}
                           className="absolute top-4 right-4 p-2 bg-background border border-border rounded-lg shadow-sm hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                        >
                           <Copy className="w-4 h-4 text-foreground" />
                        </button>
                     </div>

                     <div className="flex gap-3 pt-2">
                        <a 
                           href={match.job_url} target="_blank" rel="noreferrer"
                           className="flex-1 py-3 bg-secondary border border-border rounded-xl font-bold text-sm text-center flex justify-center items-center gap-2 hover:bg-secondary/80 transition-colors"
                        >
                           <ExternalLink className="w-4 h-4" /> View Job
                        </a>
                        <button 
                           className="flex-1 py-3 bg-primary text-background rounded-xl font-bold text-sm glow-olive-sm hover:scale-105 active:scale-95 transition-transform"
                           onClick={() => toast.success("Marked as Applied!")}
                        >
                           Mark Applied
                        </button>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}
      </div>
    </div>
  )
}
