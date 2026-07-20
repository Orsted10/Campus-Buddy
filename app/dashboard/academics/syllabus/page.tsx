'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Brain, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea
} from 'recharts'

const MOCK_SYLLABUS_DATA = [
  { week: 'Week 1', name: 'Intro to AI', difficulty: 20, assignments: 1 },
  { week: 'Week 2', name: 'Search Algorithms', difficulty: 40, assignments: 1 },
  { week: 'Week 3', name: 'Machine Learning', difficulty: 55, assignments: 2 },
  { week: 'Week 4', name: 'Neural Networks', difficulty: 85, assignments: 3, redZone: true },
  { week: 'Week 5', name: 'Deep Learning', difficulty: 90, assignments: 2, redZone: true },
  { week: 'Week 6', name: 'Midterms', difficulty: 100, assignments: 0, redZone: true },
  { week: 'Week 7', name: 'NLP', difficulty: 45, assignments: 1 },
  { week: 'Week 8', name: 'Computer Vision', difficulty: 60, assignments: 2 },
  { week: 'Week 9', name: 'RL', difficulty: 75, assignments: 2 },
  { week: 'Week 10', name: 'Final Project', difficulty: 95, assignments: 1, redZone: true },
]

export default function SyllabusTrackerPage() {
  const router = useRouter()
  const [activeWeek, setActiveWeek] = useState(MOCK_SYLLABUS_DATA[3]) // Default to a Red Zone

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border p-4 rounded-xl shadow-xl">
          <p className="font-bold text-foreground mb-1">{data.week}: {data.name}</p>
          <p className="text-sm text-muted-foreground">Difficulty: {data.difficulty}%</p>
          <p className="text-sm text-muted-foreground">Assignments: {data.assignments}</p>
          {data.redZone && (
            <div className="mt-2 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-md inline-block">
              🚨 High Burnout Risk
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 pt-safe font-inter">
      <div className="flex items-center gap-4 mb-8 border-b pb-6 border-border">
        <button onClick={() => router.back()} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
            <CalendarDays className="w-8 h-8 text-primary" />
            Syllabus Progress Tracker
          </h1>
          <p className="text-muted-foreground font-medium">AI-predicted difficulty and dynamic study distribution to prevent burnout.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel border-border shadow-premium-sm">
            <CardHeader>
              <CardTitle>Semester Difficulty Heatmap</CardTitle>
              <CardDescription>Predicted cognitive load based on syllabus analysis and historical student data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={MOCK_SYLLABUS_DATA}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    onClick={(data) => {
                      if (data && data.activePayload) {
                        setActiveWeek(data.activePayload[0].payload)
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 100]} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar 
                      dataKey="difficulty" 
                      radius={[6, 6, 6, 6]}
                      maxBarSize={50}
                    >
                      {MOCK_SYLLABUS_DATA.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.redZone ? '#ef4444' : '#3b82f6'} 
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 justify-center mt-4 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Normal Load</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-foreground font-bold">Red Zone (Burnout Risk)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-border shadow-premium-sm relative overflow-hidden">
            {activeWeek.redZone && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeWeek.redZone ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                )}
                {activeWeek.week} Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xl font-black">{activeWeek.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Assignments Due: <span className="font-bold text-foreground">{activeWeek.assignments}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">Predicted Difficulty</span>
                  <span className={activeWeek.redZone ? "text-red-500" : "text-blue-500"}>{activeWeek.difficulty}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${activeWeek.difficulty}%` }}
                    className={`h-full ${activeWeek.redZone ? 'bg-red-500' : 'bg-blue-500'}`}
                  />
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                <h4 className="flex items-center gap-2 font-bold text-primary mb-2 text-sm">
                  <Brain className="w-4 h-4" /> AI Study Strategy
                </h4>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {activeWeek.redZone 
                    ? `Warning: You have ${activeWeek.assignments} major assignments colliding with complex topics this week. The AI has automatically redistributed 4 hours of reading to the preceding weekend to prevent a late-night cram session.`
                    : "Manageable workload. Great week to get ahead on reading or start long-term projects early."
                  }
                </p>
              </div>

              {activeWeek.redZone && (
                <button className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold text-sm transition-all shadow-sm">
                  Apply AI Calendar Redistribute
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
