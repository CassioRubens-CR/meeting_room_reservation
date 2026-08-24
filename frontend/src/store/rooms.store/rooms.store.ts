import { create } from 'zustand'
import { createRoom, deleteRoom, fetchRooms, updateRoom } from '../../api'
import type { Room } from '../../types/models'

interface CreateRoomPayload {
  name: string
  capacity: number
  location?: string
}

interface UpdateRoomPayload {
  name?: string
  capacity?: number
  location?: string
}

interface RoomsStore {
  rooms: Room[]
  loading: boolean
  error: string | null
  fetchRooms: (token: string) => Promise<void>
  createRoom: (payload: CreateRoomPayload, token: string) => Promise<Room>
  deleteRoom: (roomId: string, token: string) => Promise<Room>
  updateRoom: (
    roomId: string,
    payload: UpdateRoomPayload,
    token: string,
  ) => Promise<Room>
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

  deleteRoom: async (roomId, token) => {
    set({ loading: true, error: null })

    try {
      const room = await deleteRoom(roomId, token)
      set((state) => ({
        rooms: state.rooms.filter((item) => item.id !== roomId),
        loading: false,
      }))
      return room
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao excluir sala'
      set({ error: message, loading: false })
      throw error
    }
  },

  updateRoom: async (roomId, payload, token) => {
    set({ loading: true, error: null })

    try {
      const room = await updateRoom(roomId, payload, token)
      set((state) => ({
        rooms: state.rooms.map((item) => (item.id === room.id ? room : item)),
        loading: false,
      }))
      return room
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao atualizar sala'
      set({ error: message, loading: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
