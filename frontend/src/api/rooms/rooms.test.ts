import { describe, expect, it } from 'vitest'
import * as rooms from './rooms'

describe('api/rooms/rooms.ts', () => {
  it('exports room api functions', () => {
    expect(typeof rooms.fetchRooms).toBe('function')
    expect(typeof rooms.createRoom).toBe('function')
    expect(typeof rooms.updateRoom).toBe('function')
    expect(typeof rooms.deleteRoom).toBe('function')
  })
})
