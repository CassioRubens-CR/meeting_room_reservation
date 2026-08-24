import { describe, expect, it } from 'vitest'
import { getReservationStatus } from './getReservationStatus'

describe('utils/getReservationStatus', () => {
  it('returns the confirmed label', () => {
    expect(getReservationStatus('CONFIRMED')).toBe('Confirmada')
  })

  it('returns the cancelled label', () => {
    expect(getReservationStatus('CANCELLED')).toBe('Cancelada')
  })
})
