import { describe, expect, it } from 'vitest'
import * as api from './index'

describe('api/index.ts', () => {
  it('re-exports core api functions', () => {
    expect(typeof api.login).toBe('function')
    expect(typeof api.request).toBe('function')
    expect(typeof api.fetchRooms).toBe('function')
    expect(typeof api.fetchMyReservations).toBe('function')
  })
})
