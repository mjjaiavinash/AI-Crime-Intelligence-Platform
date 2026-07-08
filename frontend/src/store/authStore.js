import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  user:      null,
  token:     localStorage.getItem('token') || null,
  isLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    set({ user: null, token: null })
  },

  setLoading: (isLoading) => set({ isLoading }),

  isAuthenticated: () => !!get().token,
}))

export default useAuthStore
