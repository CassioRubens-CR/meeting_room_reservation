import { describe, expect, it } from 'vitest'
import { useRoomsStore } from './rooms.store'

describe('store/rooms.store/rooms.store.ts', () => {
  it('provides rooms store actions', () => {
    const state = useRoomsStore.getState()
    expect(typeof state.fetchRooms).toBe('function')
    expect(typeof state.createRoom).toBe('function')
    expect(typeof state.updateRoom).toBe('function')
    expect(typeof state.deleteRoom).toBe('function')
  })
})
