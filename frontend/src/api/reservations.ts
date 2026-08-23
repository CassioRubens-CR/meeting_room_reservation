import type { AdminReservation, Reservation } from '../types/models'
import { request } from './http'

export interface CreateReservationInput {
  roomId: string
  date: string
  startTime: string
  endTime: string
  attendeesCount: number
  justification?: string
}

export interface UpdateReservationInput {
  roomId?: string
  date?: string
  startTime?: string
  endTime?: string
  attendeesCount?: number
  justification?: string
}

export interface ReservationFilters {
  date?: string
  roomId?: string
  userId?: string
}

export function fetchMyReservations(token: string) {
  return request<Reservation[]>('/reservations/me', {
    method: 'GET',
    token,
  })
}

export function fetchAllReservations(
  filters: ReservationFilters,
  token: string,
) {
  const params = new URLSearchParams()

  if (filters.date) {
    params.set('date', filters.date)
  }
  if (filters.roomId) {
    params.set('roomId', filters.roomId)
  }
  if (filters.userId) {
    params.set('userId', filters.userId)
  }

  const query = params.toString()
  return request<AdminReservation[]>(`/reservations${query ? `?${query}` : ''}`, {
    method: 'GET',
    token,
  })
}

export function createReservation(payload: CreateReservationInput, token: string) {
  return request<Reservation>('/reservations', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function updateReservation(
  reservationId: string,
  payload: UpdateReservationInput,
  token: string,
) {
  return request<Reservation>(`/reservations/${reservationId}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
}

export function cancelReservation(reservationId: string, token: string) {
  return request<Reservation>(`/reservations/${reservationId}`, {
    method: 'DELETE',
    token,
  })
}
