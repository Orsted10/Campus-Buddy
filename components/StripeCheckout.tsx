'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { Loader2, ShieldCheck, AlertCircle, CreditCard, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { useWalletStore } from '@/store/useWalletStore'

// Initialize Stripe with the publishable key
// Replace with the user's actual key later. Fallback to mock key so it doesn't crash.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock')

function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { addFunds } = useWalletStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    // Using confirmPayment to submit the payment to Stripe
    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Prevent automatic redirect so we can handle success state locally
    })

    if (submitError) {
      setError(submitError.message || 'An error occurred during payment.')
      setIsProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded on Stripe!
      // In a production app, the backend webhook would fund the wallet.
      // For this test integration, we call our addFunds RPC securely.
      const success = await addFunds(amount)
      if (success) {
        onSuccess()
      } else {
        setError('Payment succeeded but wallet funding failed. Please contact support.')
      }
      setIsProcessing(false)
    } else {
      setError('Unexpected payment status.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-background border border-border rounded-2xl">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: 'Test Student',
              }
            }
          }} 
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-start gap-2">
           <AlertCircle className="w-5 h-5 shrink-0" />
           <p>{error}</p>
        </div>
      )}

      <button
        disabled={!stripe || isProcessing}
        type="submit"
        className="w-full py-4 rounded-2xl font-black text-lg bg-primary text-background glow-olive hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${amount}`}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span>Secured by Stripe (Test Mode)</span>
      </div>
    </form>
  )
}

export function StripeCheckoutWrapper({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [mockMode, setMockMode] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card')

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    fetch('/api/stripe/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mockMode) {
           setMockMode(true)
        } else {
           setClientSecret(data.clientSecret)
        }
      })
      .catch((err) => {
        toast.error('Failed to initialize payment gateway.')
      })
  }, [amount])

  if (mockMode) {
     return (
        <div className="space-y-6">
          <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-center space-y-4">
             <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
             <h3 className="font-bold text-lg text-amber-500">Real Banking Unavailable (Invite Only)</h3>
             <p className="text-sm text-muted-foreground">
               Because Stripe is invite-only in your region, we have fallen back to the <strong className="text-foreground">Simulated Payment Gateway</strong>.
             </p>
          </div>
          
          <div className="p-6 bg-background border border-border rounded-2xl space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Simulated Checkout</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-muted-foreground'}`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="font-bold text-sm">Credit/Debit</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-muted-foreground'}`}
              >
                <Smartphone className="w-6 h-6" />
                <span className="font-bold text-sm">UPI</span>
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethod === 'card' ? (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-black text-white p-6 shadow-xl mb-6 aspect-[1.8]">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                   <div className="flex justify-between items-center mb-6 relative z-10">
                      <div className="w-10 h-7 bg-yellow-400/80 rounded-md" />
                   </div>
                   <div className="space-y-1 relative z-10">
                      <p className="font-mono text-lg tracking-[0.2em]">4242 4242 4242 4242</p>
                      <div className="flex justify-between text-xs opacity-70 font-mono mt-2">
                         <span>SIMULATED CARD</span>
                         <span>12/30</span>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="p-8 border border-border rounded-xl text-center space-y-4 mb-6 bg-background">
                  <div className="mx-auto w-32 h-32 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20 border-dashed">
                    <span className="text-primary font-black opacity-50">QR CODE</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Scan with PhonePe, GPay, or Paytm</p>
                  <p className="text-xs text-muted-foreground/70 italic">Or click Simulate below</p>
                </div>
              )}

              <button
                type="button"
                onClick={async () => {
                  toast.loading('Processing Simulated Payment...', { id: 'sim' })
                  await new Promise(r => setTimeout(r, 2000))
                  const { useWalletStore } = await import('@/store/useWalletStore')
                  const success = await useWalletStore.getState().addFunds(amount)
                  if (success) {
                    toast.success('Simulated Payment Successful!', { id: 'sim' })
                    onSuccess()
                  } else {
                    toast.error('Wallet funding failed', { id: 'sim' })
                  }
                }}
                className="w-full py-4 rounded-xl font-black text-lg bg-primary text-background glow-olive-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Simulate Payment of ₹{amount}
              </button>
            </div>
          </div>
        </div>
     )
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#A0D250',
      colorBackground: '#1A1C22',
      colorText: '#ffffff',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  };

  return (
    <div className="w-full">
      {clientSecret ? (
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <CheckoutForm amount={amount} onSuccess={onSuccess} />
        </Elements>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Loading Gateway...</p>
        </div>
      )}
    </div>
  )
}
