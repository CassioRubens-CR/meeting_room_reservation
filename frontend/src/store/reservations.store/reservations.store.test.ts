import { describe, expect, it } from 'vitest'
import { useReservationsStore } from './reservations.store'

describe('store/reservations.store/reservations.store.ts', () => {
  it('provides reservations store actions', () => {
    const state = useReservationsStore.getState()
    expect(typeof state.fetchMyReservations).toBe('function')
    expect(typeof state.fetchAllReservations).toBe('function')
    expect(typeof state.createReservation).toBe('function')
    expect(typeof state.updateReservation).toBe('function')
    expect(typeof state.cancelReservation).toBe('function')
  })
})
