import { describe, expect, it } from 'vitest'
import * as store from './index'

describe('store/index.ts', () => {
  it('re-exports stores', () => {
    expect(typeof store.useAuthStore).toBe('function')
    expect(typeof store.useRoomsStore).toBe('function')
    expect(typeof store.useReservationsStore).toBe('function')
  })
})
