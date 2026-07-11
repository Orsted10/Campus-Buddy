'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, AlertCircle, RefreshCw, BookOpen, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { usePortalStore } from '@/store/usePortalStore'

export default function CoursesPage() {
  const { courses, isSyncing: loading, portalStatus } = usePortalStore()
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (course: any) => {
    if (!course.eventTarget) {
      alert("Download link not available for this course.");
      return;
    }

    try {
      setDownloading(course.code)
      const res = await fetch('/api/culko/download-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventTarget: course.eventTarget })
      })

      if (!res.ok) {
        throw new Error('Download failed');
      }

      // Convert response to blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LecturePlan_${course.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Error downloading file", err);
      alert("Error downloading file. Please try again.");
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Fetching your courses...</p>
      </div>
    )
  }

  if (portalStatus === 'error') {
    return (
      <div className="p-6">
        <Card className="border-destructive bg-destructive/5 shadow-none">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load courses</h3>
            <p className="text-sm text-destructive/80 mb-6">There was an issue fetching your courses from the portal.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">View your enrolled courses and download lecture plans</p>
        </div>
        <Card className="bg-secondary border-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-background p-2 rounded-full border">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80">Total Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground w-32 whitespace-nowrap">Code</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground w-24">Section</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground w-24">Type</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">No courses found.</td>
                </tr>
              )}
              {courses.map((course: any, idx: number) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 font-semibold text-primary whitespace-nowrap">{course.code}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{course.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{course.section}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    <span className="bg-secondary px-2 py-1 rounded-md text-xs font-medium">
                      {course.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {course.eventTarget ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownload(course)}
                        disabled={downloading === course.code}
                      >
                        {downloading === course.code ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        {downloading === course.code ? 'Downloading' : 'Lecture Plan'}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
