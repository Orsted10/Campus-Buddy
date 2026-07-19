'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bluetooth, MapPin, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function BleAttendanceBeacon() {
  const [status, setStatus] = useState<'idle' | 'broadcasting' | 'marked'>('idle')

  useEffect(() => {
    if (status === 'broadcasting') {
      const timer = setTimeout(() => {
        setStatus('marked')
        toast.success('Attendance marked via BLE in Lecture Hall 402!')
      }, 3000)
      return () => clearTimeout(timer)
    }
    
    if (status === 'marked') {
      const timer = setTimeout(() => {
        setStatus('idle')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  return (
    <div className="relative group cursor-pointer" onClick={() => {
      if (status === 'idle') {
        setStatus('broadcasting')
        toast.info('Simulating BLE Broadcast to Professor Terminal...')
      }
    }}>
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors"
          >
            <Bluetooth className="w-5 h-5" />
          </motion.div>
        )}
        
        {status === 'broadcasting' && (
          <motion.div
            key="broadcasting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 relative"
          >
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-blue-500/40"
            />
            <Bluetooth className="w-5 h-5 animate-pulse" />
          </motion.div>
        )}
        
        {status === 'marked' && (
          <motion.div
            key="marked"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"
          >
            <CheckCircle2 className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <div className="absolute right-0 top-12 w-48 p-3 rounded-xl bg-background border border-border shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-primary" /> Invisible Attendance
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {status === 'idle' && 'Click to simulate BLE handshake.'}
          {status === 'broadcasting' && 'Broadcasting presence...'}
          {status === 'marked' && 'Attendance securely logged.'}
        </p>
      </div>
    </div>
  )
}
