'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Nfc, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react'
import { useWalletStore } from '@/store/useWalletStore'
import { toast } from 'sonner'

export function NfcSimulator() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle')
  const { addTransaction } = useWalletStore()

  const handleSimulateTap = () => {
    setStatus('scanning')
    
    // Simulate network delay
    setTimeout(() => {
      // 80% chance of success
      if (Math.random() > 0.2) {
        setStatus('success')
        const amount = Math.floor(Math.random() * 50) + 10
        addTransaction({
          title: 'Campus Cafe - Tap to Pay',
          amount,
          type: 'debit',
          icon: 'coffee'
        })
        toast.success(`Payment of ₹${amount} successful via NFC!`)
        setTimeout(() => {
          setIsOpen(false)
          setStatus('idle')
        }, 2000)
      } else {
        setStatus('error')
        toast.error('NFC Tap failed. Please try again.')
        setTimeout(() => setStatus('idle'), 2000)
      }
    }, 1500)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-background font-bold rounded-2xl hover:opacity-90 transition-opacity glow-olive-sm"
      >
        <Nfc className="w-5 h-5" />
        Hold to Campus Reader
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-background border border-primary/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <AnimatePresence mode="wait">
                    {status === 'idle' && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 rounded-full border border-primary/30"
                        />
                        <Smartphone className="w-10 h-10 text-primary" />
                      </motion.div>
                    )}
                    {status === 'scanning' && (
                      <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center"
                      >
                        <Nfc className="w-10 h-10 text-primary animate-pulse" />
                      </motion.div>
                    )}
                    {status === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"
                      >
                        <CheckCircle2 className="w-10 h-10" />
                      </motion.div>
                    )}
                    {status === 'error' && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center text-destructive"
                      >
                        <AlertCircle className="w-10 h-10" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    {status === 'idle' && 'Ready to Scan'}
                    {status === 'scanning' && 'Hold Near Reader...'}
                    {status === 'success' && 'Done!'}
                    {status === 'error' && 'Try Again'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {status === 'idle' && 'This is a web simulator for the NFC plugin.'}
                    {status === 'scanning' && 'Simulating NFC handshake...'}
                    {status === 'success' && 'Transaction complete.'}
                    {status === 'error' && 'Simulation failed randomly.'}
                  </p>
                </div>

                {status === 'idle' && (
                  <div className="flex w-full gap-3 mt-4">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-3 rounded-xl font-semibold bg-muted hover:bg-muted/80 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSimulateTap}
                      className="flex-1 py-3 rounded-xl font-semibold bg-primary text-background transition-opacity hover:opacity-90 text-sm"
                    >
                      Simulate Tap
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
