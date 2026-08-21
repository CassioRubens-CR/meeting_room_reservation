import type { Reservation } from '../types/models'
import { request } from './http'

export interface CreateReservationInput {
  roomId: string
  date: string
  startTime: string
  endTime: string
}

export interface UpdateReservationInput {
  roomId?: string
  date?: string
  startTime?: string
  endTime?: string
}

export function fetchMyReservations(token: string) {
  return request<Reservation[]>('/reservations/me', {
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
