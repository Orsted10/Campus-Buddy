'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isNativeApp } from '@/lib/api-config'
import { useAuth } from '@/hooks/useAuth'
import { QueryProvider } from '@/components/providers/QueryProvider'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  useAuth()

  useEffect(() => {
    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] Registered:', reg.scope))
        .catch((err) => console.warn('[SW] Registration failed:', err))
    }

    // Handle Deep Linking for Auth (Session Injection)
    const handleUrlOpen = async (event: any) => {
      const url = new URL(event.url)
      
      if (url.host === 'callback') {
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')

        if (accessToken && refreshToken) {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            if (error) throw error
            router.push('/dashboard')
          } catch (err) {
            console.error('Deep link session injection failed:', err)
          }
        }
      }
    }

    App.addListener('appUrlOpen', handleUrlOpen)

    return () => {
      App.removeAllListeners()
    }
  }, [router, supabase])

  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  )
}

