'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Award, Link2, ExternalLink, Loader2, CheckCircle2, QrCode } from 'lucide-react'

export default function CredentialsPage() {
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success'>('idle')

  const handleMint = () => {
    setMintStatus('minting')
    setTimeout(() => {
      setMintStatus('success')
    }, 2500)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Blockchain Credentials</h1>
      </div>

      <div className="glass rounded-[2rem] p-8 border border-primary/20 space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
            <Award className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">B.E. Computer Science</h2>
            <p className="text-muted-foreground mt-1 text-sm">Chandigarh University • Fall 2024</p>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">CGPA</p>
                <p className="text-lg font-black mt-1">9.2</p>
              </div>
              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Credits</p>
                <p className="text-lg font-black mt-1">112</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-border/40">
          <AnimatePresence mode="wait">
            {mintStatus === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mint a verifiable, cryptographic proof of your academic transcript to the Polygon blockchain. This creates a non-transferable Soulbound NFT.
                </p>
                <button
                  onClick={handleMint}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-background font-bold rounded-xl hover:opacity-90 transition-opacity glow-olive-sm"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Mint to Ledger (Polygon)
                </button>
              </motion.div>
            )}

            {mintStatus === 'minting' && (
              <motion.div key="minting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div>
                  <p className="font-bold text-foreground">Minting Credential...</p>
                  <p className="text-xs text-muted-foreground mt-1">Generating cryptographic hash and waiting for network confirmation.</p>
                </div>
              </motion.div>
            )}

            {mintStatus === 'success' && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold">Successfully Minted</p>
                    <p className="opacity-80">Hash: 0x8f...3b9a (Simulated)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm">
                    <ExternalLink className="w-4 h-4" />
                    View on Etherscan
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-background font-bold rounded-xl hover:opacity-90 transition-opacity text-sm glow-olive-sm">
                    <QrCode className="w-4 h-4" />
                    Share Proof
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
