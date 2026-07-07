'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Award, Loader2, RefreshCw, GraduationCap } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePortalStore } from '@/store/usePortalStore'
import { getApiUrl } from '@/lib/api-config'
import { Button } from '@/components/ui/button'

function EvaluationsTab() {
  const router = useRouter()
  const { marks: cachedMarks, portalStatus, lastSync } = usePortalStore()
  const [subjects, setSubjects] = useState<any[]>(cachedMarks || [])
  const [loading, setLoading] = useState(cachedMarks ? (cachedMarks.length === 0) : true)
  const [metadata, setMetadata] = useState({
    isCached: !!lastSync && (portalStatus === 'no_session'),
    lastSync: lastSync || null
  })

  useEffect(() => {
    async function loadMarks() {
      try {
        const res = await fetch(getApiUrl('/api/culko?endpoint=marks'))
        const result = await res.json()
        
        if (result.success) {
          setSubjects(result.data || [])
          setMetadata({
            isCached: result.isCached,
            lastSync: result.updatedAt
          })
        }
      } catch (err) {
        console.error("Failed to refresh marks:", err)
      } finally {
        setLoading(false)
      }
    }
    loadMarks()
  }, [])

  if (loading && subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Loading Evaluations...</p>
      </div>
    )
  }

  const isDisconnected = portalStatus === 'no_session'
  if (subjects.length === 0 && isDisconnected) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center h-[40vh] text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Portal Sync Required</h2>
        <p className="text-muted-foreground max-w-md">
          You need to sync your CULKO portal to view your structured marks and grades.
        </p>
        <button 
          onClick={() => router.push('/dashboard/academics')} 
          className="bg-primary text-background px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          Connect Now
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <p className="text-muted-foreground font-medium">Detailed evaluation breakdowns (MSTs, Practicals, etc.) grouped by subject</p>
        {metadata.isCached ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-500">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Archived {metadata.lastSync ? `(${new Date(metadata.lastSync).toLocaleDateString()})` : ''}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Sync
          </div>
        )}
      </div>

      {subjects.length === 0 ? (
        <Card className="glass-panel border-dashed border-black/10 dark:border-white/10">
          <CardContent className="py-16 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">No Data Available</h3>
            <p className="text-muted-foreground">No marks data found. Your results may not be published yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-6">
          {subjects.map((subject: any, idx: number) => {
            const evals = subject.evaluations || []
            
            const scorable = evals.filter((e: any) => !isNaN(parseFloat(e.marks)) && !isNaN(parseFloat(e.grade)))
            let obtained = 0, total = 0
            scorable.forEach((e: any) => {
              obtained += parseFloat(e.marks)
              total += parseFloat(e.grade)
            })

            const percentage = total > 0 ? (obtained / total) * 100 : null
            const glowColor = percentage === null ? 'border-black/5 dark:border-white/10 shadow-sm' 
                            : percentage >= 80 ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/20' 
                            : percentage >= 40 ? 'shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-500/20' 
                            : 'shadow-[0_0_15px_rgba(239,68,68,0.3)] border-red-500/20'
            
            const textColor = percentage === null ? 'text-muted-foreground'
                            : percentage >= 80 ? 'text-emerald-500 font-black'
                            : percentage >= 40 ? 'text-blue-500 font-black'
                            : 'text-red-500 font-black'

            return (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`} 
                className={`glass-panel px-3 sm:px-6 py-1 sm:py-2 overflow-hidden transition-all duration-300 hover:bg-card/60 ${glowColor} rounded-2xl`}
              >
                <AccordionTrigger className="hover:no-underline py-4 sm:py-5 text-left group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-1 sm:pr-4 gap-2 sm:gap-4">
                    <span className="font-bold text-base sm:text-xl text-foreground group-hover:text-primary transition-colors leading-tight">{subject.subject}</span>
                    {total > 0 ? (
                      <span className="text-sm font-bold bg-primary/5 dark:bg-background/50 border border-black/10 dark:border-white/10 text-foreground px-4 py-1.5 rounded-full backdrop-blur-md">
                        <span className={textColor}>
                          {obtained.toFixed(1)}
                        </span> 
                        <span className="text-muted-foreground mx-1">/</span> 
                        {total.toFixed(0)} scored
                      </span>
                    ) : (
                      <span className="text-sm font-bold bg-muted/20 border border-black/10 dark:border-white/10 text-muted-foreground px-4 py-1.5 rounded-full backdrop-blur-md">
                        No Marks
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-4 border-t border-black/5 dark:border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {evals.map((evaluation: any, eIdx: number) => {
                      const isNumber = !isNaN(parseFloat(evaluation.marks))
                      const marksVal = parseFloat(evaluation.marks)
                      const maxVal = parseFloat(evaluation.grade)
                      const badgeColor = isNumber 
                        ? (marksVal / maxVal >= 0.8 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                          : (marksVal / maxVal >= 0.4 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                          : 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'))
                        : 'text-foreground'

                      return (
                        <div key={eIdx} className="bg-background/40 border border-black/5 dark:border-white/5 rounded-xl p-4 flex justify-between items-center transition-all hover:bg-background/60 hover:-translate-y-1 hover:shadow-lg group">
                          <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate mr-3" title={evaluation.type}>
                            {evaluation.type}
                          </span>
                          <div className="flex flex-col items-end shrink-0">
                            <span className={`text-xl font-black ${badgeColor}`}>
                              {evaluation.marks}
                            </span>
                            {evaluation.grade && (
                              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">
                                MAX {evaluation.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {evals.length === 0 && (
                    <div className="text-sm text-muted-foreground italic pl-2 bg-background/20 p-4 rounded-xl text-center">
                      No evaluations posted yet.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}


function ResultsTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailedViewSemesters, setDetailedViewSemesters] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/culko?endpoint=results')
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error || 'Failed to fetch results')
      
      if (json.success && json.data) {
        setData(json.data)
      } else {
        throw new Error('Could not parse result data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleDetailedView = (semester: string) => {
    setDetailedViewSemesters(prev => ({
      ...prev,
      [semester]: !prev[semester]
    }))
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs">Scraping Academic Results...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <Card className="border-destructive bg-destructive/5 shadow-none">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load results</h3>
            <p className="text-sm text-destructive/80 mb-6">{error}</p>
            <Button onClick={fetchResults} variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-muted-foreground font-medium">View your final SGPA, CGPA, and optionally load your session internal/external marks</p>
        <Card className="bg-primary text-primary-foreground border-none glass-panel relative overflow-hidden group w-full md:w-auto">
          <div className="absolute inset-0 bg-primary/50 group-hover:bg-primary/60 transition-colors" />
          <CardContent className="p-4 flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-2 rounded-full">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80">Cumulative CGPA</p>
              <p className="text-3xl font-bold">{data?.cgpa}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {(!data?.semesters || data?.semesters?.length === 0) && (
          <Card className="glass-panel border-dashed border-black/10 dark:border-white/10">
            <CardContent className="py-16 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">No Results Available</h3>
              <p className="text-muted-foreground">Your final semester results could not be fetched.</p>
            </CardContent>
          </Card>
        )}
        
        {data?.semesters?.map((sem: any, idx: number) => {
          const isDetailed = detailedViewSemesters[sem.semester] || false;

          return (
            <Card key={idx} className="overflow-hidden glass-panel border-black/5 dark:border-white/10 rounded-2xl transition-all duration-300 hover:bg-card/60 hover:shadow-lg hover:border-primary/20">
              <CardHeader className="bg-secondary/30 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="text-xl font-bold text-foreground">Semester {sem.semester}</CardTitle>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <Button 
                      variant={isDetailed ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDetailedView(sem.semester)}
                      className={`rounded-full text-xs font-semibold px-4 shadow-sm border-black/10 dark:border-white/10 transition-colors ${isDetailed ? 'bg-primary text-primary-foreground' : 'bg-background/50 backdrop-blur-md hover:bg-muted/80 text-muted-foreground hover:text-foreground'}`}
                    >
                      {isDetailed ? "Hide Detailed Marks" : "Show Detailed Marks"}
                    </Button>
                    <div className="bg-background/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 shadow-sm flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">SGPA</span>
                      <span className="font-black text-primary">{sem.sgpa}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 dark:border-white/5 bg-muted/10">
                      <th className="text-left py-4 px-6 font-semibold text-muted-foreground">Subject Code</th>
                      <th className="text-left py-4 px-6 font-semibold text-muted-foreground">Subject Name</th>
                      {isDetailed && (
                        <>
                          <th className="text-right py-4 px-6 font-semibold text-muted-foreground">Internal</th>
                          <th className="text-right py-4 px-6 font-semibold text-muted-foreground">External</th>
                        </>
                      )}
                      <th className="text-right py-4 px-6 font-semibold text-muted-foreground">Credits</th>
                      <th className="text-right py-4 px-6 font-semibold text-muted-foreground">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.subjects.map((sub: any, subIdx: number) => (
                      <tr key={subIdx} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-muted/10 transition-colors">
                        <td className="py-4 px-6 font-semibold">{sub.code}</td>
                        <td className="py-4 px-6 text-muted-foreground max-w-[200px] truncate" title={sub.name}>{sub.name}</td>
                        {isDetailed && (
                          <>
                            <td className="py-4 px-6 text-right tabular-nums font-medium">{sub.internalMarks || '-'}</td>
                            <td className="py-4 px-6 text-right tabular-nums font-medium">{sub.externalMarks || '-'}</td>
                          </>
                        )}
                        <td className="py-4 px-6 text-right">{sub.credits}</td>
                        <td className="py-4 px-6 text-right font-black text-primary">{sub.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  )
}

export default function MarksPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 glass-panel rounded-2xl relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all" />
          <Award className="w-8 h-8 text-primary relative z-10" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">Marks & Grades</h1>
          <p className="text-muted-foreground font-medium mt-1">Access your detailed evaluations and final results</p>
        </div>
      </div>

      <Tabs defaultValue="evaluations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-1 h-auto">
          <TabsTrigger value="evaluations" className="rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold tracking-tight transition-all">
            Evaluations Breakdown
          </TabsTrigger>
          <TabsTrigger value="results" className="rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-semibold tracking-tight transition-all">
            Final Results & CGPA
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="evaluations" className="mt-0 outline-none">
          <EvaluationsTab />
        </TabsContent>
        
        <TabsContent value="results" className="mt-0 outline-none">
          <ResultsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
