import { create } from 'zustand'
import * as api from '../../api'
import type { AdminReservation, Reservation } from '../../types/models'

interface CreateReservationPayload {
  roomId: string
  date: string
  startTime: string
  endTime: string
  attendeesCount: number
  justification?: string
}

interface UpdateReservationPayload {
  roomId?: string
  date?: string
  startTime?: string
  endTime?: string
  attendeesCount?: number
  justification?: string
}

interface ReservationFilters {
  date?: string
  roomId?: string
  userId?: string
}

interface ReservationsStore {
  reservations: Reservation[]
  adminReservations: AdminReservation[]
  loading: boolean
  error: string | null
  fetchMyReservations: (token: string) => Promise<void>
  fetchAllReservations: (
    filters: ReservationFilters,
    token: string,
  ) => Promise<void>
  createReservation: (
    payload: CreateReservationPayload,
    token: string,
  ) => Promise<Reservation>
  updateReservation: (
    reservationId: string,
    payload: UpdateReservationPayload,
    token: string,
  ) => Promise<Reservation>
  cancelReservation: (reservationId: string, token: string) => Promise<Reservation>
  clearError: () => void
}

export const useReservationsStore = create<ReservationsStore>((set) => ({
  reservations: [],
  adminReservations: [],
  loading: false,
  error: null,

  fetchMyReservations: async (token) => {
    set({ loading: true, error: null })

    try {
      const reservations = await api.fetchMyReservations(token)
      set({ reservations, loading: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao buscar reservas'
      set({ error: message, loading: false })
      throw error
    }
  },

  fetchAllReservations: async (filters, token) => {
    set({ loading: true, error: null })

    try {
      const adminReservations = await api.fetchAllReservations(filters, token)
      set({ adminReservations, loading: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao buscar todas as reservas'
      set({ error: message, loading: false })
      throw error
    }
  },

  createReservation: async (payload, token) => {
    set({ loading: true, error: null })

    try {
      const reservation = await api.createReservation(payload, token)
      set((state) => ({
        reservations: [...state.reservations, reservation],
        loading: false,
      }))
      return reservation
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao criar reserva'
      set({ error: message, loading: false })
      throw error
    }
  },

  updateReservation: async (reservationId, payload, token) => {
    set({ loading: true, error: null })

    try {
      const updated = await api.updateReservation(reservationId, payload, token)
      set((state) => ({
        reservations: state.reservations.map((reservation) =>
          reservation.id === updated.id ? updated : reservation,
        ),
        loading: false,
      }))
      return updated
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao atualizar reserva'
      set({ error: message, loading: false })
      throw error
    }
  },

  cancelReservation: async (reservationId, token) => {
    set({ loading: true, error: null })

    try {
      const cancelled = await api.cancelReservation(reservationId, token)
      set((state) => ({
        reservations: state.reservations.map((reservation) =>
          reservation.id === cancelled.id ? cancelled : reservation,
        ),
        loading: false,
      }))
      return cancelled
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao cancelar reserva'
      set({ error: message, loading: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
