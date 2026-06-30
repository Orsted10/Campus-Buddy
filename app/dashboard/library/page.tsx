'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Book, Search, Download, ExternalLink, Loader2, BookOpen, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePortalStore } from '@/store/usePortalStore'
import { toast } from 'sonner'
import { getApiUrl } from '@/lib/api-config'
import { motion, AnimatePresence } from 'framer-motion'

export default function LibraryPage() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [books, setBooks] = useState<any[]>([])
  
  const { attendance } = usePortalStore()
  const [isRecommending, setIsRecommending] = useState(true)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [aiQueries, setAiQueries] = useState<string[]>([])

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const subjects = attendance.map(a => a.subject)
        const res = await fetch(getApiUrl('/api/library/recommend'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjects })
        })
        const data = await res.json()
        if (data.success && data.queries) {
          setAiQueries(data.queries)
          // Fetch books for the first query as initial recommendations
          if (data.queries.length > 0) {
            await fetchBooks(data.queries[0], true)
          }
        }
      } catch (e) {
        console.error('Failed to load AI recommendations', e)
      } finally {
        setIsRecommending(false)
      }
    }
    loadRecommendations()
  }, [])

  const fetchBooks = async (searchQuery: string, isRec = false) => {
    if (!searchQuery) return
    if (!isRec) setIsSearching(true)
    try {
      const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (isRec) {
        setRecommendations(data.results.slice(0, 8)) // Get top 8
      } else {
        setBooks(data.results)
      }
    } catch (e) {
      if (!isRec) toast.error('Failed to fetch books')
    } finally {
      if (!isRec) setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooks(query)
  }

  const displayBooks = books.length > 0 ? books : recommendations

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Background glow */}
      <div className="absolute top-0 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter flex items-center gap-3">
            <Library className="w-8 h-8 text-primary" />
            Digital Library
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Powered by Project Gutenberg. Free access to thousands of books.
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <Card className="glass-panel border-black/5 dark:border-white/5 shadow-premium-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <CardContent className="p-2 sm:p-4">
          <form onSubmit={handleSearch} className="flex gap-2 sm:gap-4 relative">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by title, author, or topic..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-14 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-lg font-medium shadow-inner placeholder:text-muted-foreground/70 focus-visible:ring-primary/30"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSearching || !query}
              className="h-14 px-8 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-primary/20"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Recommendations Badges */}
      {aiQueries.length > 0 && books.length === 0 && (
        <div className="flex flex-col space-y-3 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> AI Subject Recommendations
          </div>
          <div className="flex flex-wrap gap-2">
            {aiQueries.map((aq, i) => (
              <button 
                key={i}
                onClick={() => { setQuery(aq); fetchBooks(aq) }}
                className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm hover:bg-primary/20 transition-all glow-primary-sm"
              >
                {aq}
              </button>
            ))}
          </div>
        </div>
      )}

      {isRecommending && books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-bold tracking-widest uppercase text-xs">AI analyzing your subjects for recommendations...</p>
        </div>
      )}

      {/* Book Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-8">
        <AnimatePresence mode="popLayout">
          {displayBooks.map((book: any, idx: number) => {
            const coverUrl = book.formats['image/jpeg'] || ''
            const readUrl = book.formats['text/html'] || book.formats['text/plain; charset=utf-8']
            const downloadUrl = book.formats['application/epub+zip'] || book.formats['application/x-mobipocket-ebook']

            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div className="glass-panel border-black/5 dark:border-white/5 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Book Cover */}
                  <div className="aspect-[2/3] w-full bg-muted relative overflow-hidden">
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={coverUrl} 
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/5 dark:bg-white/5">
                        <Book className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-sm">
                      {readUrl && (
                        <a 
                          href={readUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full bg-primary text-background font-black py-2.5 rounded-xl text-xs uppercase tracking-widest text-center hover:scale-105 transition-transform flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" /> Read Online
                        </a>
                      )}
                      {downloadUrl && (
                        <a 
                          href={downloadUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full bg-white/20 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest text-center hover:scale-105 transition-transform flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download EPUB
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground line-clamp-1 mt-auto">
                      {book.authors?.[0]?.name || 'Unknown Author'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {!isSearching && !isRecommending && displayBooks.length === 0 && (
        <div className="text-center py-20">
          <Book className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No books found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}
