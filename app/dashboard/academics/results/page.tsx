'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, AlertCircle, RefreshCw, GraduationCap, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function ResultsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Track which semesters are showing detailed marks
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Scraping academic results...</p>
      </div>
    )
  }

  if (error) {
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results & Grades</h1>
          <p className="text-muted-foreground">View your cumulative and session-wise performance</p>
        </div>
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-4 flex items-center gap-4">
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
        {data?.semesters?.length === 0 && (
          <p className="text-muted-foreground text-center py-10">No final results found.</p>
        )}
        {data?.semesters?.map((sem: any, idx: number) => {
          const isDetailed = detailedViewSemesters[sem.semester] || false;

          return (
            <Card key={idx} className="overflow-hidden shadow-sm">
              <CardHeader className="bg-secondary/50 border-b pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="text-lg">Semester {sem.semester}</CardTitle>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-medium">Detailed Marks</span>
                      <Switch 
                        checked={isDetailed} 
                        onCheckedChange={() => toggleDetailedView(sem.semester)} 
                      />
                    </div>
                    <div className="bg-background px-3 py-1 rounded-full border shadow-sm flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">SGPA</span>
                      <span className="font-bold text-primary">{sem.sgpa}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject Code</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject Name</th>
                      {isDetailed && (
                        <>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Internal</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">External</th>
                        </>
                      )}
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Credits</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.subjects.map((sub: any, subIdx: number) => (
                      <tr key={subIdx} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-4 font-medium">{sub.code}</td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate" title={sub.name}>{sub.name}</td>
                        {isDetailed && (
                          <>
                            <td className="py-3 px-4 text-right tabular-nums">{sub.internalMarks || '-'}</td>
                            <td className="py-3 px-4 text-right tabular-nums">{sub.externalMarks || '-'}</td>
                          </>
                        )}
                        <td className="py-3 px-4 text-right">{sub.credits}</td>
                        <td className="py-3 px-4 text-right font-bold">{sub.grade}</td>
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
