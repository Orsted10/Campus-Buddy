// CampusBuddy Service Worker — Offline-First PWA
// Strategy: Network-first for API routes, Cache-first for static assets

const CACHE_NAME = 'campus-buddy-v1'
const STATIC_CACHE = 'campus-buddy-static-v1'
const API_CACHE = 'campus-buddy-api-v1'

// Static shell assets to pre-cache
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
]

// ─── Install Event: Pre-cache shell ───────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache failed for some assets (non-fatal):', err)
      })
    })
  )
  self.skipWaiting()
})

// ─── Activate Event: Clean up old caches ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch Event: Routing Strategy ───────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // ── Strategy 1: Next.js static assets → Cache-First ──
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/image/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // ── Strategy 2: API routes → Network-First with API cache fallback ──
  if (url.pathname.startsWith('/api/culko')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(API_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => {
          // Offline: serve from API cache
          return caches.match(request).then((cached) => {
            if (cached) return cached
            // Return a structured "offline" JSON response
            return new Response(
              JSON.stringify({ success: false, error: 'offline', isCached: true }),
              { headers: { 'Content-Type': 'application/json' } }
            )
          })
        })
    )
    return
  }

  // ── Strategy 3: Pages → Network-First ──
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
