import { create } from 'zustand'
import { login, register } from '../api'
import type { AuthResponse, User } from '../types/models'

const AUTH_STORAGE_KEY = 'meeting-room-auth'

interface Credentials {
  email: string
  password: string
}

interface RegisterPayload extends Credentials {
  name: string
}

interface AuthStore {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  hydrated: boolean
  hydrate: () => void
  login: (payload: Credentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  clearError: () => void
}

function persistAuth(data: AuthResponse) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
}

function clearPersistedAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  hydrated: false,

  hydrate: () => {
    const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!rawAuth) {
      set({ hydrated: true })
      return
    }

    try {
      const parsed = JSON.parse(rawAuth) as AuthResponse

      set({
        token: parsed.accessToken,
        user: parsed.user,
        isAuthenticated: true,
        hydrated: true,
      })
    } catch {
      clearPersistedAuth()
      set({ hydrated: true })
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null })

    try {
      const auth = await login(payload)
      persistAuth(auth)

      set({
        token: auth.accessToken,
        user: auth.user,
        isAuthenticated: true,
        loading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha no login'
      set({ error: message, loading: false })
      throw error
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null })

    try {
      const auth = await register(payload)
      persistAuth(auth)

      set({
        token: auth.accessToken,
        user: auth.user,
        isAuthenticated: true,
        loading: false,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha no cadastro'
      set({ error: message, loading: false })
      throw error
    }
  },

  logout: () => {
    clearPersistedAuth()
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
      loading: false,
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))
