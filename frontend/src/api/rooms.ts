import type { Room } from '../types/models'
import { request } from './http'

export interface CreateRoomInput {
  name: string
  capacity: number
  location?: string
}

export function fetchRooms(token: string) {
  return request<Room[]>('/rooms', {
    method: 'GET',
    token,
  })
}

export function createRoom(payload: CreateRoomInput, token: string) {
  return request<Room>('/rooms', {
    method: 'POST',
    token,
    body: payload,
  })
}
