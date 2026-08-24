import type { ReservationStatus } from '../types/models'

export function getReservationStatus(status: ReservationStatus) {
  return status === 'CANCELLED' ? 'Cancelada' : 'Confirmada'
}