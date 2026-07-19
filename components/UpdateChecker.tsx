'use client'

import { useEffect, useState } from 'react'
import { App } from '@capacitor/app'
import { isNativeApp } from '@/lib/api-config'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

// Replace this with the actual repo
const GITHUB_REPO = 'Orsted10/Campus-Buddy-Final-Frontend'

interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  html_url: string
  assets: Array<{
    name: string
    browser_download_url: string
  }>
}

export function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState<GitHubRelease | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only check for updates if we are running as a native app
    if (!isNativeApp()) return

    const checkForUpdates = async () => {
      try {
        const appInfo = await App.getInfo()
        const currentVersion = appInfo.version // e.g., '1.0' or '1.0.0'
        
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
        if (!response.ok) return
        
        const release: GitHubRelease = await response.json()
        const latestVersion = release.tag_name.replace(/^v/, '') // Remove 'v' if present (e.g., 'v1.0.1' -> '1.0.1')
        
        if (isVersionGreater(latestVersion, currentVersion)) {
          setUpdateAvailable(release)
        }
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }

    // Delay the check slightly so it doesn't block initial render
    const timer = setTimeout(() => {
      checkForUpdates()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Helper to compare semantic versions (e.g. '1.0.1' > '1.0.0')
  const isVersionGreater = (latest: string, current: string) => {
    const lParts = latest.split('.').map(Number)
    const cParts = current.split('.').map(Number)
    
    for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
      const l = lParts[i] || 0
      const c = cParts[i] || 0
      if (l > c) return true
      if (l < c) return false
    }
    return false
  }

  if (!mounted || !updateAvailable || isDismissed) return null

  // Try to find the APK asset directly
  const apkAsset = updateAvailable.assets.find(a => a.name.endsWith('.apk'))
  const downloadUrl = apkAsset ? apkAsset.browser_download_url : updateAvailable.html_url

  const handleDownload = () => {
    // Open in external browser so Android can download and install the APK
    window.open(downloadUrl, '_blank')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />

          {/* Close button (Optional update) */}
          <button 
            onClick={() => setIsDismissed(true)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 border border-primary/20 glow-olive-sm">
              <Download className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight mb-2">
              Update Available!
            </h2>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              A new version of Campus Buddy 
              <span className="text-white font-bold mx-1">({updateAvailable.tag_name})</span> 
              is available. Download the latest APK to get the newest features and bug fixes.
            </p>

            <div className="w-full space-y-3">
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-4 bg-primary text-background font-black rounded-xl flex items-center justify-center gap-2 glow-olive-sm hover:opacity-90 transition-all uppercase tracking-widest text-sm"
              >
                <Download className="w-4 h-4" /> Download Update
              </motion.button>
              
              <button 
                onClick={() => setIsDismissed(true)}
                className="w-full py-3 px-4 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
