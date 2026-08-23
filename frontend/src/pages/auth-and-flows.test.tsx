import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api'
import { useAuthStore, useReservationsStore, useRoomsStore } from '../store'
import { AdminReservationsPage, LoginPage, RegisterPage, RoomsPage } from './index'

const baseUser = {
  id: 'user-1',
  name: 'Usuário Teste',
  email: 'teste@email.com',
  role: 'USER' as const,
}

const adminUser = {
  ...baseUser,
  role: 'ADMIN' as const,
}

function resetStores() {
  useAuthStore.setState({
    token: null,
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    hydrated: true,
  })

  useRoomsStore.setState({
    rooms: [],
    loading: false,
    error: null,
  })

  useReservationsStore.setState({
    reservations: [],
    adminReservations: [],
    loading: false,
    error: null,
  })

  localStorage.clear()
}

describe('frontend auth and app flows', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStores()
  })

  it('logs in and redirects to dashboard', async () => {
    const loginSpy = vi.spyOn(api, 'login').mockResolvedValue({
      accessToken: 'token-123',
      user: baseUser,
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'teste@email.com' },
    })
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: '12345678' },
    })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        email: 'teste@email.com',
        password: '12345678',
      })
    })

    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('blocks registration when passwords do not match and accepts valid payloads', async () => {
    const registerSpy = vi.spyOn(api, 'register').mockResolvedValue({
      accessToken: 'token-456',
      user: baseUser,
    })

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Usuário Teste' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'teste@email.com' },
    })
    fireEvent.change(screen.getByLabelText(/^senha$/i), {
      target: { value: '12345678' },
    })
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: '87654321' },
    })

    expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: '12345678' },
    })
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }))

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalledWith({
        name: 'Usuário Teste',
        email: 'teste@email.com',
        password: '12345678',
      })
    })

    expect(await screen.findByText('Dashboard')).toBeInTheDocument()
  })

  it('lists rooms from the API on the rooms page', async () => {
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([
      {
        id: 'room-1',
        name: 'Sala Azul',
        capacity: 8,
        location: 'Andar 1',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'room-2',
        name: 'Sala Verde',
        capacity: 12,
        location: 'Andar 2',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ])

    useAuthStore.setState({
      token: 'token-abc',
      user: baseUser,
      isAuthenticated: true,
      hydrated: true,
    })

    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <Routes>
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Sala Azul')).toBeInTheDocument()
    expect(screen.getByText('Sala Verde')).toBeInTheDocument()
    expect(screen.getByText('8 lugares')).toBeInTheDocument()
    expect(api.fetchRooms).toHaveBeenCalledWith('token-abc')
  })

  it('renders admin reservations with filters and reservation rows', async () => {
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([
      {
        id: 'room-1',
        name: 'Sala Azul',
        capacity: 8,
        location: 'Andar 1',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ])

    vi.spyOn(api, 'fetchAllReservations').mockResolvedValue([
      {
        id: 'reservation-1',
        date: '2026-08-23',
        startTime: '2026-08-23T09:00:00.000Z',
        endTime: '2026-08-23T10:00:00.000Z',
        attendeesCount: 3,
        justification: 'Reunião semanal',
        status: 'CONFIRMED',
        userId: 'user-1',
        roomId: 'room-1',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
        room: {
          id: 'room-1',
          name: 'Sala Azul',
          capacity: 8,
          location: 'Andar 1',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        user: {
          id: 'user-1',
          name: 'Usuário Teste',
          email: 'teste@email.com',
          role: 'ADMIN',
        },
      },
    ])

    useAuthStore.setState({
      token: 'admin-token',
      user: adminUser,
      isAuthenticated: true,
      hydrated: true,
    })

    render(
      <MemoryRouter initialEntries={['/admin/reservations']}>
        <Routes>
          <Route path="/admin/reservations" element={<AdminReservationsPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Todas as reservas')).toBeInTheDocument()
    expect(screen.getAllByText('Sala Azul').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Usuário Teste').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sala/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/id do usuário/i)).toBeInTheDocument()
  })
})
