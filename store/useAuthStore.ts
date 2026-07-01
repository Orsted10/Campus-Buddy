import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types/database'

interface AuthState {
  user: Profile | null
  _hasHydrated: boolean
  isLoading: boolean
  setUser: (user: Profile | null) => void
  clearUser: () => void
  reset: () => void
  setHasHydrated: (state: boolean) => void
  setIsLoading: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      clearUser: () => set({ user: null, isLoading: false }),
      reset: () => set({ user: null, _hasHydrated: false, isLoading: false }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setIsLoading: (state) => set({ isLoading: state })
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true)
      }
    }
  )
)
