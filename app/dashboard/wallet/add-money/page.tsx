'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CreditCard, Smartphone, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useWalletStore } from '@/store/useWalletStore'

export default function AddMoneyPage() {
  const router = useRouter()
  const { addFunds } = useWalletStore()
  
  const [amount, setAmount] = useState('500')
  const [method, setMethod] = useState<'card' | 'upi'>('card')
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle')

  // Card details state
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status !== 'idle' || !amount) return

    setStatus('processing')
    
    // Simulate network delay for banking gateway
    await new Promise(resolve => setTimeout(resolve, 2500))

    const success = await addFunds(Number(amount))
    
    if (success) {
      setStatus('success')
      setTimeout(() => {
        router.push('/dashboard/wallet')
      }, 2000)
    } else {
      setStatus('idle')
    }
  }

  // Format card number with spaces
  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val
    if (formatted.length <= 19) setCardNumber(formatted)
  }

  // Format expiry (MM/YY)
  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4)
    }
    if (val.length <= 5) setExpiry(val)
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
        ) : status === 'processing' ? (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Processing Payment</h2>
              <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Securely communicating with bank...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handlePayment}
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
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Payment Method</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                    method === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <CreditCard className="w-8 h-8" />
                  <span className="font-bold">Credit/Debit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                    method === 'upi' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Smartphone className="w-8 h-8" />
                  <span className="font-bold">UPI</span>
                </button>
              </div>
            </div>

            {/* Dynamic Payment Details */}
            {method === 'card' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-black text-white p-6 shadow-2xl mb-6 aspect-[1.6]">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                   <div className="flex justify-between items-center mb-10 relative z-10">
                      <div className="w-12 h-8 bg-yellow-400/80 rounded-md" />
                      <span className="font-bold italic opacity-50">BANK</span>
                   </div>
                   <div className="space-y-1 relative z-10">
                      <p className="font-mono text-xl tracking-[0.2em]">{cardNumber || '•••• •••• •••• ••••'}</p>
                      <div className="flex justify-between text-xs opacity-70 font-mono mt-4">
                         <span>{name || 'CARDHOLDER NAME'}</span>
                         <span>{expiry || 'MM/YY'}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    required
                    value={cardNumber}
                    onChange={handleCardNumber}
                    className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono focus:outline-none focus:border-primary"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      value={expiry}
                      onChange={handleExpiry}
                      className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono focus:outline-none focus:border-primary"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      required
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-4 font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:outline-none focus:border-primary uppercase"
                  />
                </div>
              </motion.div>
            )}

            {method === 'upi' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                 <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. name@bank)"
                    required
                    className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground text-center">A payment request will be sent to your UPI app.</p>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-black text-lg bg-primary text-background glow-olive hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Pay ₹{amount || '0'}
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Simulated Payment Gateway (No real money is charged)</span>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
