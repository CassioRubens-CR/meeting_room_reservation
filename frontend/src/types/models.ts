export type Role = 'USER' | 'ADMIN'

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Room {
  id: string
  name: string
  capacity: number
  location?: string | null
  createdAt: string
}

export interface Reservation {
  id: string
  date: string
  startTime: string
  endTime: string
  status: ReservationStatus
  userId: string
  roomId: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}
