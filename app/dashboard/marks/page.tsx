'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, RefreshCw, GraduationCap, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function MarksPage() {
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-black/5 dark:border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 glass-panel rounded-2xl relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all" />
            <Award className="w-8 h-8 text-primary relative z-10" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">Marks & Grades</h1>
            <p className="text-muted-foreground font-medium mt-1">View your cumulative and session-wise performance</p>
          </div>
        </div>

        <Card className="bg-primary text-primary-foreground border-none glass-panel relative overflow-hidden group">
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
              <h3 className="text-xl font-bold text-foreground mb-2">No Data Available</h3>
              <p className="text-muted-foreground">No marks data found. Your results may not be published yet.</p>
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
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-medium">Detailed Marks</span>
                      <Switch 
                        checked={isDetailed} 
                        onCheckedChange={() => toggleDetailedView(sem.semester)} 
                      />
                    </div>
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
