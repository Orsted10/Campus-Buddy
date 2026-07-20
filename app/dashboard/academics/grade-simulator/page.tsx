'use client'

import { useState, useEffect } from 'react'
import { Calculator, ArrowLeft, Target, Award, Brain, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePortalStore } from '@/store/usePortalStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function GradeSimulatorPage() {
  const router = useRouter()
  const { marks } = usePortalStore()
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [targetScore, setTargetScore] = useState<number>(85) // Desired total marks out of 100
  const [internalMarks, setInternalMarks] = useState<number>(0)
  const [maxInternalMarks, setMaxInternalMarks] = useState<number>(60) // Assuming internals are out of 60, final out of 40

  useEffect(() => {
    if (marks && marks.length > 0 && !selectedSubject) {
      setSelectedSubject(marks[0].subject)
    }
  }, [marks, selectedSubject])

  useEffect(() => {
    if (selectedSubject && marks) {
      const subject = marks.find(m => m.subject === selectedSubject)
      if (subject && subject.evaluations) {
        // Calculate total internal marks. We assume all non-End-Term are internals.
        let total = 0
        let max = 0
        subject.evaluations.forEach((ev: any) => {
          // If type doesn't contain "End Term" or "Final", add to internals
          if (!ev.type.toLowerCase().includes('end term') && !ev.type.toLowerCase().includes('final')) {
            const mark = parseFloat(ev.marks)
            const evMax = ev.max_marks ? parseFloat(ev.max_marks) : 20 // Fallback if missing
            if (!isNaN(mark)) total += mark
            if (!isNaN(evMax)) max += evMax
          }
        })
        setInternalMarks(total || 0)
        setMaxInternalMarks(max > 0 ? max : 60)
      }
    }
  }, [selectedSubject, marks])

  const maxFinalMarks = 100 - maxInternalMarks
  const requiredFinalMarks = Math.max(0, targetScore - internalMarks)
  
  const achievable = requiredFinalMarks <= maxFinalMarks
  
  // Calculate trajectory strings
  const getTrajectoryString = () => {
    if (!achievable) return `Mathematically impossible. You need ${requiredFinalMarks.toFixed(1)} but only ${maxFinalMarks} remain.`
    if (requiredFinalMarks === 0) return `You already achieved your target score! No marks needed in the final.`
    return `You need ${requiredFinalMarks.toFixed(1)} / ${maxFinalMarks} in the final to hit your target.`
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 pt-safe font-inter">
      <div className="flex items-center gap-4 mb-8 border-b pb-6 border-border">
        <button onClick={() => router.back()} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
            <Calculator className="w-8 h-8 text-primary" />
            Predictive Grading Simulator
          </h1>
          <p className="text-muted-foreground font-medium">Find out exactly what you need on the final to get your target grade.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="glass-panel border-border shadow-premium-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Select Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marks && marks.length > 0 ? (
                <select 
                  className="w-full p-3 rounded-xl bg-background border border-border text-foreground font-semibold appearance-none cursor-pointer focus:ring-2 focus:ring-primary outline-none"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {marks.map((m: any, i: number) => (
                    <option key={i} value={m.subject}>{m.subject}</option>
                  ))}
                </select>
              ) : (
                <p className="text-muted-foreground text-sm">No marks synced yet. Go to Academics to sync.</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-border shadow-premium-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Simulate Target Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Target Total</p>
                <p className="text-4xl font-black text-primary">{targetScore}</p>
              </div>
              
              <input 
                type="range" 
                min="0" max="100" 
                value={targetScore} 
                onChange={(e) => setTargetScore(parseInt(e.target.value))}
                className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" 
              />
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>0 (Fail)</span>
                <span>40 (Pass)</span>
                <span>80 (A)</span>
                <span>100 (O)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-border shadow-premium-sm overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none ${achievable ? 'bg-green-500/10' : 'bg-red-500/10'}`} />
            
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                The Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Current Internals</p>
                  <p className="text-2xl font-black">{internalMarks.toFixed(1)} <span className="text-sm font-medium text-muted-foreground">/ {maxInternalMarks}</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <p className="text-xs font-bold text-primary uppercase mb-1">Required in Final</p>
                  <p className="text-2xl font-black text-primary">{requiredFinalMarks.toFixed(1)} <span className="text-sm font-medium opacity-60">/ {maxFinalMarks}</span></p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${achievable ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
                <p className="font-bold text-sm leading-relaxed">{getTrajectoryString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border shadow-premium-sm bg-indigo-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-500">
                <Brain className="w-5 h-5" />
                AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {achievable && requiredFinalMarks > 0 ? 
                  `To get a ${requiredFinalMarks.toFixed(1)} out of ${maxFinalMarks}, you need to score roughly ${((requiredFinalMarks / maxFinalMarks) * 100).toFixed(0)}% on the final. Focus on the core units that carry the most weight. You can skip the hardest unit entirely if you secure full marks in the others.` :
                  achievable && requiredFinalMarks === 0 ? 
                  `You've already secured your target score! Use your remaining study hours to focus on other harder subjects.` :
                  `Your target score is mathematically impossible based on your current internal marks. We recommend adjusting your goal and prioritizing a strong pass.`
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
