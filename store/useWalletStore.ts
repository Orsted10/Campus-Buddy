import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WalletTransaction {
  id: string
  title: string
  amount: number
  date: string
  type: 'debit' | 'credit'
  icon: string
}

interface WalletState {
  balance: number
  transactions: WalletTransaction[]
  nfcActive: boolean
  setNfcActive: (active: boolean) => void
  addTransaction: (tx: Omit<WalletTransaction, 'id' | 'date'>) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      balance: 1450.00, // Initial mock balance
      transactions: [
        {
          id: 'tx-1',
          title: 'Campus Canteen - Lunch',
          amount: 120.00,
          date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          type: 'debit',
          icon: 'utensils'
        },
        {
          id: 'tx-2',
          title: 'Library - Late Fee',
          amount: 15.00,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          type: 'debit',
          icon: 'book'
        },
        {
          id: 'tx-3',
          title: 'Hostel Mess Rebate',
          amount: 350.00,
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          type: 'credit',
          icon: 'arrow-down'
        }
      ],
      nfcActive: false,
      setNfcActive: (active) => set({ nfcActive: active }),
      addTransaction: (tx) => set((state) => {
        const newBalance = tx.type === 'debit' 
          ? state.balance - tx.amount 
          : state.balance + tx.amount;
          
        return {
          balance: newBalance,
          transactions: [
            {
              ...tx,
              id: `tx-${Date.now()}`,
              date: new Date().toISOString()
            },
            ...state.transactions
          ]
        }
      })
    }),
    {
      name: 'campus-buddy-wallet-store',
    }
  )
)
