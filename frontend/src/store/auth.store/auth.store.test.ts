import { describe, expect, it } from 'vitest'
import { useAuthStore } from './auth.store'

describe('store/auth.store/auth.store.ts', () => {
  it('provides auth store actions', () => {
    const state = useAuthStore.getState()
    expect(typeof state.hydrate).toBe('function')
    expect(typeof state.login).toBe('function')
    expect(typeof state.register).toBe('function')
    expect(typeof state.logout).toBe('function')
  })
})
