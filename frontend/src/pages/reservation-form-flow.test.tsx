import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api'
import { useAuthStore, useReservationsStore, useRoomsStore } from '../store'
import { CreateReservationPage, EditReservationPage } from './index'

const room = {
  id: 'room-1',
  name: 'Sala Azul',
  capacity: 8,
  location: 'Andar 1',
  createdAt: '2024-01-01T00:00:00.000Z',
}

const existingReservation = {
  id: 'reservation-1',
  date: '2026-08-23',
  startTime: '2026-08-23T09:00:00.000Z',
  endTime: '2026-08-23T10:00:00.000Z',
  attendeesCount: 2,
  justification: 'Reunião interna',
  status: 'CONFIRMED' as const,
  userId: 'user-1',
  roomId: 'room-1',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
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
}

describe('reservation form flows', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStores()
  })

  it('blocks short reservations and submits a valid reservation payload', async () => {
    const createSpy = vi.spyOn(api, 'createReservation').mockResolvedValue({
      ...existingReservation,
      id: 'new-reservation',
      attendeesCount: 1,
      justification: undefined,
    })

    useAuthStore.setState({
      token: 'token-abc',
      user: { id: 'user-1', name: 'Usuário Teste', email: 'teste@email.com', role: 'USER' },
      isAuthenticated: true,
      hydrated: true,
    })

    useRoomsStore.setState({
      rooms: [room],
      loading: false,
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/rooms/room-1/reserve']}>
        <Routes>
          <Route path="/rooms/:roomId/reserve" element={<CreateReservationPage />} />
          <Route path="/rooms" element={<div>Lista de salas</div>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText(/data/i), {
      target: { value: '2026-08-24' },
    })
    fireEvent.change(screen.getByLabelText(/início/i), {
      target: { value: '09:00' },
    })
    fireEvent.change(screen.getByLabelText(/término/i), {
      target: { value: '09:30' },
    })

    fireEvent.click(screen.getByRole('button', { name: /confirmar reserva/i }))

    expect(screen.getByText('A reserva deve ter duração mínima de 1 hora.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/término/i), {
      target: { value: '10:30' },
    })
    fireEvent.click(screen.getByRole('button', { name: /confirmar reserva/i }))

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        {
          roomId: 'room-1',
          date: '2026-08-24',
          startTime: '09:00',
          endTime: '10:30',
          attendeesCount: 1,
          justification: undefined,
        },
        'token-abc',
      )
    })
  })

  it('prefills and updates an existing reservation', async () => {
    const updateSpy = vi.spyOn(api, 'updateReservation').mockResolvedValue({
      ...existingReservation,
      startTime: '2026-08-23T10:00:00.000Z',
      endTime: '2026-08-23T11:30:00.000Z',
      attendeesCount: 3,
      justification: 'Reunião ajustada',
    })

    useAuthStore.setState({
      token: 'token-xyz',
      user: { id: 'user-1', name: 'Usuário Teste', email: 'teste@email.com', role: 'ADMIN' },
      isAuthenticated: true,
      hydrated: true,
    })

    useRoomsStore.setState({
      rooms: [room],
      loading: false,
      error: null,
    })

    useReservationsStore.setState({
      reservations: [existingReservation],
      adminReservations: [],
      loading: false,
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/reservations/reservation-1/edit']}>
        <Routes>
          <Route path="/reservations/:reservationId/edit" element={<EditReservationPage />} />
          <Route path="/reservations" element={<div>Minhas reservas</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByDisplayValue('2026-08-23')).toBeInTheDocument()

    const startTimeInput = screen.getByLabelText(/início/i) as HTMLInputElement
    expect(startTimeInput.value).toMatch(/^\d{2}:\d{2}$/)

    fireEvent.change(screen.getByLabelText(/término/i), {
      target: { value: '11:30' },
    })
    fireEvent.change(screen.getByLabelText(/participantes/i), {
      target: { value: '3' },
    })
    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'reservation-1',
        {
          roomId: 'room-1',
          date: '2026-08-23',
          startTime: startTimeInput.value,
          endTime: '11:30',
          attendeesCount: 3,
          justification: 'Reunião interna',
        },
        'token-xyz',
      )
    })
  })
})
