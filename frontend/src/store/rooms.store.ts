import { create } from 'zustand'
import { createRoom, fetchRooms } from '../api'
import type { Room } from '../types/models'

interface CreateRoomPayload {
  name: string
  capacity: number
  location?: string
}

interface RoomsStore {
  rooms: Room[]
  loading: boolean
  error: string | null
  fetchRooms: (token: string) => Promise<void>
  createRoom: (payload: CreateRoomPayload, token: string) => Promise<Room>
  clearError: () => void
}

export const useRoomsStore = create<RoomsStore>((set) => ({
  rooms: [],
  loading: false,
  error: null,

  fetchRooms: async (token) => {
    set({ loading: true, error: null })

    try {
      const rooms = await fetchRooms(token)
      set({ rooms, loading: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao buscar salas'
      set({ error: message, loading: false })
      throw error
    }
  },

  createRoom: async (payload, token) => {
    set({ loading: true, error: null })

    try {
      const room = await createRoom(payload, token)
      set((state) => ({
        rooms: [...state.rooms, room],
        loading: false,
      }))
      return room
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao criar sala'
      set({ error: message, loading: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
