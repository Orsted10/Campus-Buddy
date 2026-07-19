'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CreditCard, Smartphone, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StripeCheckoutWrapper } from '@/components/StripeCheckout'

export default function AddMoneyPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('500')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const handleSuccess = () => {
    setStatus('success')
    setTimeout(() => {
      router.push('/dashboard/wallet')
    }, 2000)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-foreground">Add Money</h1>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-black">Payment Successful</h2>
            <p className="text-muted-foreground text-lg">₹{amount} has been added to your Campus Wallet.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Amount Selection */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Select Amount</p>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-muted-foreground">₹</span>
                <input 
                  type="number" 
                  min="1"
                  max="100000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-4xl font-black bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl pl-16 pr-6 py-6 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {['500', '1000', '2000', '5000'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-3 rounded-2xl font-bold text-sm transition-all border ${
                      amount === val 
                        ? 'bg-primary text-primary-foreground border-primary glow-olive-sm' 
                        : 'bg-background hover:bg-muted border-border text-foreground'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Payment Details</p>
              
              <StripeCheckoutWrapper amount={Number(amount) || 0} onSuccess={handleSuccess} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
