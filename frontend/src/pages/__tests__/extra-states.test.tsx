import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../api'
import { useAuthStore, useReservationsStore, useRoomsStore } from '../../store'
import { AdminReservationsPage, RoomsPage } from '../index'

const baseUser = {
  id: 'user-1',
  name: 'Usuário Teste',
  email: 'teste@email.com',
  role: 'USER' as const,
}

const adminUser = { ...baseUser, role: 'ADMIN' as const }

const mockRoom = {
  id: 'room-1',
  name: 'Sala Azul',
  capacity: 8,
  location: 'Andar 1',
  createdAt: '2024-01-01T00:00:00.000Z',
}

function resetStores() {
  useAuthStore.setState({
    token: 'token-abc',
    user: baseUser,
    loading: false,
    error: null,
    isAuthenticated: true,
    hydrated: true,
  })

  useRoomsStore.setState({ rooms: [], loading: false, error: null })
  useReservationsStore.setState({
    reservations: [],
    adminReservations: [],
    loading: false,
    error: null,
  })
}

describe('RoomsPage extra states', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStores()
  })

  it('shows an empty state when there are no rooms', async () => {
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([])

    render(
      <MemoryRouter>
        <RoomsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Nenhuma sala cadastrada')).toBeInTheDocument()
  })

  it('shows an error state and retries on demand', async () => {
    const fetchRoomsSpy = vi
      .spyOn(api, 'fetchRooms')
      .mockRejectedValueOnce(new Error('Falha ao buscar salas'))
      .mockResolvedValueOnce([mockRoom])

    render(
      <MemoryRouter>
        <RoomsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Não foi possível carregar as salas.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    await waitFor(() => {
      expect(fetchRoomsSpy).toHaveBeenCalledTimes(2)
    })

    expect(await screen.findByText('Sala Azul')).toBeInTheDocument()
  })

  it('navigates to the reservation flow when a room is selected', async () => {
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([mockRoom])

    render(
      <MemoryRouter initialEntries={['/rooms']}>
        <Routes>
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId/reserve" element={<div>Reserve Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Reservar sala' }))
    expect(screen.getByText('Reserve Page')).toBeInTheDocument()
  })
})

describe('AdminReservationsPage extra states', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStores()
  })

  it('blocks access for non-admin users', () => {
    render(
      <MemoryRouter>
        <AdminReservationsPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Acesso restrito')).toBeInTheDocument()
  })

  it('shows an empty state when there are no reservations', async () => {
    useAuthStore.setState({ user: adminUser })
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([])
    vi.spyOn(api, 'fetchAllReservations').mockResolvedValue([])

    render(
      <MemoryRouter>
        <AdminReservationsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Nenhuma reserva encontrada')).toBeInTheDocument()
  })

  it('shows an error state when the request fails', async () => {
    useAuthStore.setState({ user: adminUser })
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([])
    vi.spyOn(api, 'fetchAllReservations').mockRejectedValue(new Error('Falha ao buscar todas as reservas'))

    render(
      <MemoryRouter>
        <AdminReservationsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Falha ao buscar todas as reservas')).toBeInTheDocument()
  })

  it('filters reservations by date and room, then clears the filters', async () => {
    useAuthStore.setState({ user: adminUser })
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([mockRoom])
    const fetchAllSpy = vi.spyOn(api, 'fetchAllReservations').mockResolvedValue([])

    render(
      <MemoryRouter>
        <AdminReservationsPage />
      </MemoryRouter>,
    )

    await waitFor(() => expect(fetchAllSpy).toHaveBeenCalledTimes(1))

    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-08-23' } })
    fireEvent.change(screen.getByLabelText('Sala'), { target: { value: 'room-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }))

    await waitFor(() => {
      expect(fetchAllSpy).toHaveBeenLastCalledWith(
        { date: '2026-08-23', roomId: 'room-1' },
        'token-abc',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }))

    await waitFor(() => {
      expect(fetchAllSpy).toHaveBeenLastCalledWith(
        { date: undefined, roomId: undefined },
        'token-abc',
      )
    })
  })

  it('renders reservation cards with cancelled styling', async () => {
    useAuthStore.setState({ user: adminUser })
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([mockRoom])
    vi.spyOn(api, 'fetchAllReservations').mockResolvedValue([
      {
        id: 'reservation-1',
        date: '2026-08-23',
        startTime: '2026-08-23T09:00:00.000Z',
        endTime: '2026-08-23T10:00:00.000Z',
        attendeesCount: 3,
        status: 'CANCELLED',
        userId: 'user-1',
        roomId: 'room-1',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
        room: mockRoom,
        user: baseUser,
      },
    ])

    render(
      <MemoryRouter>
        <AdminReservationsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Cancelada')).toBeInTheDocument()
  })

  it('filters loaded reservations by user and clears the selection', async () => {
    useAuthStore.setState({ user: adminUser })
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([mockRoom])
    const reservationAdminUser = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN' as const,
    }
    const reservations = [
      {
        id: 'reservation-admin',
        date: '2026-08-25',
        startTime: '2026-08-25T09:00:00.000Z',
        endTime: '2026-08-25T10:00:00.000Z',
        attendeesCount: 1,
        status: 'CONFIRMED' as const,
        userId: 'admin-1',
        roomId: 'room-1',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
        room: mockRoom,
        user: reservationAdminUser,
      },
      {
        id: 'reservation-user',
        date: '2026-08-26',
        startTime: '2026-08-25T10:00:00.000Z',
        endTime: '2026-08-25T11:00:00.000Z',
        attendeesCount: 1,
        status: 'CONFIRMED' as const,
        userId: 'user-1',
        roomId: 'room-1',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
        room: mockRoom,
        user: baseUser,
      },
    ]
    const fetchAllSpy = vi.spyOn(api, 'fetchAllReservations').mockResolvedValue(reservations)

    render(
      <MemoryRouter>
        <AdminReservationsPage />
      </MemoryRouter>,
    )

    await waitFor(() => expect(fetchAllSpy).toHaveBeenCalledTimes(1))
    expect(await screen.findByRole('option', { name: 'Admin User' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Usuário Teste' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)

    fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: 'admin-1' } })

    expect(screen.getAllByRole('article')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }))

    await waitFor(() => {
      const filteredCards = screen.getAllByRole('article')
      expect(filteredCards).toHaveLength(1)
      expect(within(filteredCards[0]).getByText('Admin User')).toBeInTheDocument()
      expect(within(filteredCards[0]).queryByText('Usuário Teste')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Usuário')).toHaveValue('')
      expect(screen.getAllByRole('article')).toHaveLength(2)
    })
  })
})
