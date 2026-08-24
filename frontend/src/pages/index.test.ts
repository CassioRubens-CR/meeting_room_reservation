import { describe, expect, it } from 'vitest'
import * as pages from './index'

describe('pages/index.ts', () => {
  it('re-exports page components', () => {
    expect(typeof pages.HomePage).toBe('function')
    expect(typeof pages.LoginPage).toBe('function')
    expect(typeof pages.RegisterPage).toBe('function')
    expect(typeof pages.RoomsPage).toBe('function')
    expect(typeof pages.CreateReservationPage).toBe('function')
    expect(typeof pages.MyReservationsPage).toBe('function')
    expect(typeof pages.EditReservationPage).toBe('function')
    expect(typeof pages.AdminRoomsPage).toBe('function')
    expect(typeof pages.ProfilePage).toBe('function')
    expect(typeof pages.AdminReservationsPage).toBe('function')
  })
})
