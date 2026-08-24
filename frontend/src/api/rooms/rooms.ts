import type { Room } from '../../types/models'
import { request } from '../http/http'

export interface CreateRoomInput {
  name: string
  capacity: number
  location?: string
}

export interface UpdateRoomInput {
  name?: string
  capacity?: number
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

export function deleteRoom(roomId: string, token: string) {
  return request<Room>(`/rooms/${roomId}`, {
    method: 'DELETE',
    token,
  })
}

export function updateRoom(
  roomId: string,
  payload: UpdateRoomInput,
  token: string,
) {
  return request<Room>(`/rooms/${roomId}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
}
