import { describe, expect, it } from 'vitest'
import * as reservations from './reservations'

describe('api/reservations/reservations.ts', () => {
  it('exports reservation api functions', () => {
    expect(typeof reservations.fetchMyReservations).toBe('function')
    expect(typeof reservations.fetchAllReservations).toBe('function')
    expect(typeof reservations.createReservation).toBe('function')
    expect(typeof reservations.updateReservation).toBe('function')
    expect(typeof reservations.cancelReservation).toBe('function')
  })
})
