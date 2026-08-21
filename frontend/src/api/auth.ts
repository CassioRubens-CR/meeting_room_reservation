import type { AuthResponse } from '../types/models'
import { request } from './http'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export function register(payload: RegisterInput) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload: LoginInput) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}
