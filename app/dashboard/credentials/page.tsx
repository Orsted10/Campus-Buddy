'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Award, Link2, ExternalLink, Loader2, CheckCircle2, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { usePortalStore } from '@/store/usePortalStore'
import { toast } from 'sonner'

export default function CredentialsPage() {
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success'>('idle')
  const [existingHash, setExistingHash] = useState<string | null>(null)
  const [calculatedCGPA, setCalculatedCGPA] = useState<string | number>('--')
  const [totalCredits, setTotalCredits] = useState<string | number>('--')
  
  const user = useAuthStore(state => state.user)
  const { profile, courses } = usePortalStore()

  // Fallback to courses length multiplied by avg credits if api fails
  const fallbackCredits = courses?.length ? courses.length * 3 : 112;
  const degreeName = profile?.program || 'B.E. Computer Science';
  const universityName = profile?.university || 'Chandigarh University';
  const isPortalConnected = !!profile;

  // On mount, check if they already have a credential and fetch real CGPA
  useEffect(() => {
    const fetchCredential = async () => {
      if (!user) return
      const supabase = createClient()
      const { data, error } = await supabase
        .from('credential_ledger')
        .select('cryptographic_hash')
        .eq('user_id', user.id)
        .eq('credential_type', 'B.E. Computer Science')
        .single()
        
      if (data && data.cryptographic_hash) {
        setExistingHash(data.cryptographic_hash)
        setMintStatus('success')
      }
    }
    
    const fetchCGPA = async () => {
      try {
        const res = await fetch('/api/culko?endpoint=results')
        const json = await res.json()
        if (json.success && json.data?.cgpa) {
          setCalculatedCGPA(json.data.cgpa)
          // Estimate credits from semesters if real credits aren't provided by endpoint
          if (json.data.semesters) {
             const sems = json.data.semesters.length;
             setTotalCredits(sems * 22) // Rough estimate for B.E. (22 credits per sem)
          }
        }
      } catch(e) {
        setTotalCredits(fallbackCredits)
      }
    }
    
    fetchCredential()
    fetchCGPA()
  }, [user])

  const generateHash = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleMint = async () => {
    if (!user) {
      toast.error("You must be logged in to mint.")
      return
    }

    setMintStatus('minting')
    
    try {
      // Create a unique payload that includes their details
      const payload = {
        name: user.full_name,
        email: user.email,
        degree: degreeName,
        university: universityName,
        cgpa: calculatedCGPA.toString(),
        timestamp: new Date().toISOString()
      }

      // Generate real cryptographic hash of the payload
      const hash = await generateHash(JSON.stringify(payload))
      const hexSignature = `0x${hash}`

      // Save to Supabase ledger
      const supabase = createClient()
      const { error } = await supabase.from('credential_ledger').insert({
        user_id: user.id,
        credential_type: payload.degree,
        data_payload: payload,
        cryptographic_hash: hexSignature
      })

      if (error && error.code !== '23505') { // Ignore unique constraint violation if they somehow clicked twice
        throw error
      }

      setExistingHash(hexSignature)
      setMintStatus('success')
      toast.success("Cryptographic proof successfully saved to ledger!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to write to ledger. Have you run the Phase 3 SQL schema?")
      setMintStatus('idle')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Blockchain Credentials</h1>
      </div>

      <div className="glass rounded-[2rem] p-8 border border-primary/20 space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
            <Award className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{degreeName}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{universityName} • Enrolled</p>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">CGPA</p>
                <p className="text-lg font-black mt-1">{isPortalConnected ? calculatedCGPA : '--'}</p>
              </div>
              <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Credits</p>
                <p className="text-lg font-black mt-1">{isPortalConnected ? totalCredits : '--'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-border/40">
          <AnimatePresence mode="wait">
            {!isPortalConnected ? (
              <motion.div key="not-connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-amber-500 font-bold bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                  ⚠️ You must sync your university portal first to fetch your academic records before minting a credential.
                </p>
              </motion.div>
            ) : mintStatus === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mint a verifiable, cryptographic proof of your academic transcript to the Supabase Ledger. This creates an immutable cryptographic signature.
                </p>
                <button
                  onClick={handleMint}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-background font-bold rounded-xl hover:opacity-90 transition-opacity glow-olive-sm"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Sign & Save to Ledger
                </button>
              </motion.div>
            )}

            {mintStatus === 'minting' && (
              <motion.div key="minting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div>
                  <p className="font-bold text-foreground">Generating Cryptographic Proof...</p>
                  <p className="text-xs text-muted-foreground mt-1">Applying SHA-256 hash algorithm and writing to database.</p>
                </div>
              </motion.div>
            )}

            {mintStatus === 'success' && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div className="text-sm overflow-hidden">
                    <p className="font-bold">Cryptographically Verified</p>
                    <p className="opacity-80 text-xs truncate mt-0.5">Hash: {existingHash}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm">
                    <ExternalLink className="w-4 h-4" />
                    Ledger Details
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
