'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const CACHE_KEY = 'campus-buddy-query-cache'
const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes — no refetch during that window
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 24 hours
        gcTime: MAX_AGE,
        // On reconnect / window focus, silently revalidate stale data
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        // Don't retry aggressively — portal scraping can legitimately fail
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()

    // Restore cached data from localStorage on first load
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const { data, timestamp } = JSON.parse(raw)
        if (Date.now() - timestamp < MAX_AGE) {
          // Hydrate query client with persisted cache
          browserQueryClient.setQueryData = browserQueryClient.setQueryData.bind(browserQueryClient)
          Object.entries(data || {}).forEach(([key, value]) => {
            try {
              browserQueryClient!.setQueryData(JSON.parse(key), value)
            } catch {}
          })
        }
      }
    } catch (e) {
      console.warn('[QueryProvider] Could not restore cache from localStorage:', e)
    }

    // Persist cache to localStorage on every mutation/update
    browserQueryClient.getQueryCache().subscribe(() => {
      try {
        const allQueries = browserQueryClient!.getQueryCache().getAll()
        const data: Record<string, unknown> = {}
        allQueries.forEach((q) => {
          if (q.state.data !== undefined) {
            data[JSON.stringify(q.queryKey)] = q.state.data
          }
        })
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
      } catch (e) {
        // localStorage quota exceeded or unavailable — silently fail
      }
    })
  }

  return browserQueryClient
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

