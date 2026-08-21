import { create } from 'zustand'
import {
  cancelReservation,
  createReservation,
  fetchMyReservations,
  updateReservation,
} from '../api'
import type { Reservation } from '../types/models'

interface CreateReservationPayload {
  roomId: string
  date: string
  startTime: string
  endTime: string
}

interface UpdateReservationPayload {
  roomId?: string
  date?: string
  startTime?: string
  endTime?: string
}

interface ReservationsStore {
  reservations: Reservation[]
  loading: boolean
  error: string | null
  fetchMyReservations: (token: string) => Promise<void>
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
  loading: false,
  error: null,

  fetchMyReservations: async (token) => {
    set({ loading: true, error: null })

    try {
      const reservations = await fetchMyReservations(token)
      set({ reservations, loading: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Falha ao buscar reservas'
      set({ error: message, loading: false })
      throw error
    }
  },

  createReservation: async (payload, token) => {
    set({ loading: true, error: null })

    try {
      const reservation = await createReservation(payload, token)
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
      const updated = await updateReservation(reservationId, payload, token)
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
      const cancelled = await cancelReservation(reservationId, token)
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
