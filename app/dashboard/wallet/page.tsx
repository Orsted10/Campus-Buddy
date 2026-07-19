'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, History, ArrowUpRight, ArrowDownLeft, Utensils, Book, QrCode, Send, RefreshCw, Plus } from 'lucide-react'
import { useWalletStore } from '@/store/useWalletStore'
import { NfcSimulator } from '@/components/NfcSimulator'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'

const getIcon = (type: string) => {
  switch (type) {
    case 'debit': return <ArrowUpRight className="w-4 h-4" />
    case 'credit': return <ArrowDownLeft className="w-4 h-4" />
    default: return <Wallet className="w-4 h-4" />
  }
}

export default function WalletPage() {
  const router = useRouter()
  const { balance, transactions, fetchWallet, isLoading, transferCoins } = useWalletStore()
  const user = useAuthStore(state => state.user)
  
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferEmail, setTransferEmail] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferTitle, setTransferTitle] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferEmail || !transferAmount || !transferTitle) return

    setIsTransferring(true)
    const success = await transferCoins(transferEmail, Number(transferAmount), transferTitle)
    setIsTransferring(false)
    
    if (success) {
      setShowTransfer(false)
      setTransferEmail('')
      setTransferAmount('')
      setTransferTitle('')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 lg:pb-0 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Smart Wallet</h1>
        <button 
          onClick={() => fetchWallet()} 
          className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Digital ID / Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 shadow-2xl shadow-primary/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-widest">Campus Balance</p>
              <h2 className="text-5xl font-black mt-2 tracking-tight">₹{balance.toFixed(2)}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors shadow-lg">
              <QrCode className="w-6 h-6" />
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-primary-foreground/80">{user?.full_name || 'Student'}</p>
              <p className="text-xs text-primary-foreground/60 font-mono mt-1">NFC & P2P ENABLED</p>
            </div>
            <div className="w-16 h-10 rounded-md border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white opacity-80"><path d="M4 12c0-3.866 2.686-7 6-7m-6 7c0 3.866 2.686 7 6 7m-6-7h6m-6 0c0-1.5 1-3 2-3m-2 3c0 1.5 1 3 2 3m4-3c0-3.866-2.686-7-6-7m6 7c0 3.866-2.686 7-6 7m-6-7h-6m6 0c0-1.5-1-3-2-3m2 3c0 1.5-1 3-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => router.push('/dashboard/wallet/add-money')}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500/10 text-green-500 font-bold rounded-2xl hover:bg-green-500/20 transition-colors border border-green-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Money
        </button>
        <button
          onClick={() => setShowTransfer(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-500/10 text-blue-500 font-bold rounded-2xl hover:bg-blue-500/20 transition-colors border border-blue-500/20"
        >
          <Send className="w-5 h-5" />
          Send Coins
        </button>
      </div>

      <AnimatePresence>
        {showTransfer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleTransfer} className="p-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[2rem] space-y-4">
              <h3 className="font-bold text-lg">Transfer Campus Coins</h3>
              
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Recipient's Email"
                  required
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
                
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      required
                      min="1"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="What's it for?"
                    required
                    value={transferTitle}
                    onChange={(e) => setTransferTitle(e.target.value)}
                    className="w-full flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransfer(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="flex-1 py-3 rounded-xl font-bold bg-primary text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isTransferring ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Transaction History
          </h2>
        </div>

        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'debit' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                }`}>
                  {getIcon(tx.type)}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{tx.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(tx.created_at), 'MMM dd, h:mm a')}</p>
                </div>
              </div>
              <div className={`font-bold flex items-center gap-1 ${
                tx.type === 'debit' ? 'text-destructive' : 'text-green-500'
              }`}>
                {tx.type === 'debit' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                ₹{tx.amount.toFixed(2)}
              </div>
            </motion.div>
          ))}
          {transactions.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No recent transactions
            </div>
          )}
          {isLoading && transactions.length === 0 && (
             <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">
                Loading secure wallet...
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
