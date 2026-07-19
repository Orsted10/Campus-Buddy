import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface WalletTransaction {
  id: string
  sender_id?: string
  receiver_id?: string
  amount: number
  title: string
  type: 'debit' | 'credit' | 'transfer'
  created_at: string
}

interface WalletState {
  balance: number
  transactions: WalletTransaction[]
  nfcActive: boolean
  isLoading: boolean
  setNfcActive: (active: boolean) => void
  fetchWallet: () => Promise<void>
  transferCoins: (receiverEmail: string, amount: number, title: string) => Promise<boolean>
  addFunds: (amount: number) => Promise<boolean>
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0.00,
  transactions: [],
  nfcActive: false,
  isLoading: false,

  setNfcActive: (active) => set({ nfcActive: active }),

  fetchWallet: async () => {
    set({ isLoading: true })
    const supabase = createClient()
    
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        set({ isLoading: false })
        return
      }

      const uid = userData.user.id

      // Fetch real balance from our new wallet_balances table
      const { data: balanceData, error: balanceError } = await supabase
        .from('wallet_balances')
        .select('balance')
        .eq('user_id', uid)
        .single()
        
      if (!balanceError && balanceData) {
        set({ balance: Number(balanceData.balance) })
      } else if (balanceError?.code === 'PGRST116') {
         // Auto-create for missing users if the trigger failed
         await supabase.from('wallet_balances').insert({ user_id: uid, balance: 1000.00 })
         set({ balance: 1000.00 })
      }

      // Fetch real transactions from wallet_transactions
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
        .order('created_at', { ascending: false })
        
      if (!txError && txData) {
        const parsedTx = txData.map(tx => ({
           id: tx.id,
           amount: Number(tx.amount),
           title: tx.title,
           type: tx.sender_id === uid ? (tx.type === 'transfer' ? 'debit' : tx.type) : 'credit',
           created_at: tx.created_at,
           sender_id: tx.sender_id,
           receiver_id: tx.receiver_id
        })) as WalletTransaction[]
        set({ transactions: parsedTx })
      }
    } catch (err) {
      console.error('Error fetching real wallet data:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  transferCoins: async (receiverEmail: string, amount: number, title: string) => {
    const supabase = createClient()
    try {
      // Call the secure RPC function to perform the transfer
      const { data, error } = await supabase.rpc('transfer_campus_coins', {
        receiver_email: receiverEmail,
        transfer_amount: amount,
        transfer_title: title
      })

      if (error) {
         toast.error(error.message)
         return false
      }

      if (data && !data.success) {
         toast.error(data.error || 'Transfer failed')
         return false
      }

      toast.success(`Successfully sent ₹${amount} to ${receiverEmail}`)
      // Refetch the wallet to update local state dynamically
      await get().fetchWallet()
      return true
    } catch (err: any) {
      toast.error('An unexpected error occurred during transfer')
      return false
    }
  },

  addFunds: async (amount: number) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.rpc('add_funds_from_bank', {
        deposit_amount: amount
      })

      if (error) {
         toast.error(error.message)
         return false
      }

      if (data && !data.success) {
         toast.error(data.error || 'Deposit failed')
         return false
      }

      toast.success(`Successfully added ₹${amount} to your wallet!`)
      await get().fetchWallet()
      return true
    } catch (err: any) {
      toast.error('An unexpected error occurred during deposit')
      return false
    }
  }
}))
