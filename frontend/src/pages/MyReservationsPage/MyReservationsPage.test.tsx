import { describe, expect, it } from 'vitest'
import { MyReservationsPage } from './MyReservationsPage'

describe('pages/MyReservationsPage/MyReservationsPage.tsx', () => {
  it('exports MyReservationsPage component', () => {
    expect(typeof MyReservationsPage).toBe('function')
  })
})
