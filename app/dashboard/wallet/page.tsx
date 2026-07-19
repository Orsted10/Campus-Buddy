'use client'

import { motion } from 'framer-motion'
import { Wallet, History, ArrowUpRight, ArrowDownLeft, Utensils, Book, QrCode } from 'lucide-react'
import { useWalletStore } from '@/store/useWalletStore'
import { NfcSimulator } from '@/components/NfcSimulator'
import { format } from 'date-fns'

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'utensils': return <Utensils className="w-4 h-4" />
    case 'book': return <Book className="w-4 h-4" />
    case 'arrow-down': return <ArrowDownLeft className="w-4 h-4" />
    default: return <Wallet className="w-4 h-4" />
  }
}

export default function WalletPage() {
  const { balance, transactions } = useWalletStore()

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Smart Wallet</h1>
      </div>

      {/* Digital ID / Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 shadow-2xl shadow-primary/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-widest">Campus Balance</p>
              <h2 className="text-5xl font-black mt-2 tracking-tight">₹{balance.toFixed(2)}</h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-primary-foreground/80">Ankan Bhattacharya</p>
              <p className="text-xs text-primary-foreground/60 font-mono mt-1">NFC ENABLED</p>
            </div>
            <div className="w-16 h-10 rounded-md border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white opacity-80"><path d="M4 12c0-3.866 2.686-7 6-7m-6 7c0 3.866 2.686 7 6 7m-6-7h6m-6 0c0-1.5 1-3 2-3m-2 3c0 1.5 1 3 2 3m4-3c0-3.866-2.686-7-6-7m6 7c0 3.866-2.686 7-6 7m-6-7h-6m6 0c0-1.5-1-3-2-3m2 3c0 1.5-1 3-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6">
        <NfcSimulator />
      </div>

      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Recent Transactions
          </h2>
        </div>

        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'debit' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                }`}>
                  {getIcon(tx.icon)}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{tx.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(tx.date), 'MMM dd, h:mm a')}</p>
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
          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
