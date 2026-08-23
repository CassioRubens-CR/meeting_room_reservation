import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api'
import { useAuthStore, useReservationsStore, useRoomsStore } from '../store'
import { AdminRoomsPage, HomePage, MyReservationsPage, ProfilePage } from './index'

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

const mockReservation = {
  id: 'res-1',
  roomId: 'room-1',
  userId: 'user-1',
  date: '2026-08-23',
  startTime: '2026-08-23T09:00:00.000Z',
  endTime: '2026-08-23T10:00:00.000Z',
  attendeesCount: 2,
  justification: 'Reunião semanal',
  status: 'CONFIRMED' as const,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
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

describe('HomePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStores()
  })

  it('greets the user and fetches rooms and reservations', async () => {
    const fetchRoomsSpy = vi.spyOn(api, 'fetchRooms').mockResolvedValue([mockRoom])
    const fetchReservationsSpy = vi
      .spyOn(api, 'fetchMyReservations')
      .mockResolvedValue([mockReservation])

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Bem-vindo, Usuário!/)).toBeInTheDocument()

    await waitFor(() => {
      expect(fetchRoomsSpy).toHaveBeenCalledWith('token-abc')
      expect(fetchReservationsSpy).toHaveBeenCalledWith('token-abc')
    })

    expect(await screen.findByText('1 sala(s) disponível(is) para reserva.')).toBeInTheDocument()
  })

  it('shows admin messaging and management link for admins', () => {
    useAuthStore.setState({ user: adminUser })
    useRoomsStore.setState({ rooms: [mockRoom] })
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([mockRoom])
    vi.spyOn(api, 'fetchMyReservations').mockResolvedValue([])

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Sistema liberado! Você já pode gerenciar salas de reunião e criar reservas.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Gerenciar Salas')).toBeInTheDocument()
  })
})

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStores()
  })

  it('displays the user data', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Usuário Teste').length).toBeGreaterThan(0)
    expect(screen.getByText('teste@email.com')).toBeInTheDocument()
  })

  it('blocks submission when passwords do not match', async () => {
    const changePasswordSpy = vi.spyOn(api, 'changePassword')

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'oldpass1' } })
    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'newpass1' } })
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'different1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }))

    expect(changePasswordSpy).not.toHaveBeenCalled()
  })

  it('changes the password successfully', async () => {
    const changePasswordSpy = vi
      .spyOn(api, 'changePassword')
      .mockResolvedValue({ message: 'Password changed' })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'oldpass1' } })
    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'newpass1' } })
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'newpass1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }))

    await waitFor(() => {
      expect(changePasswordSpy).toHaveBeenCalledWith(
        { currentPassword: 'oldpass1', newPassword: 'newpass1' },
        'token-abc',
      )
    })

    expect(await screen.findByText('Senha alterada com sucesso.')).toBeInTheDocument()
  })

  it('navigates back to dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /voltar ao dashboard/i }))
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})

describe('MyReservationsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStores()
  })

  it('shows an empty state and links to rooms', async () => {
    vi.spyOn(api, 'fetchMyReservations').mockResolvedValue([])
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/reservations']}>
        <Routes>
          <Route path="/reservations" element={<MyReservationsPage />} />
          <Route path="/rooms" element={<div>Rooms Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Nenhuma reserva encontrada')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ver salas' }))
    expect(screen.getByText('Rooms Page')).toBeInTheDocument()
  })

  it('lists reservations and cancels one', async () => {
    vi.spyOn(api, 'fetchMyReservations').mockResolvedValue([mockReservation])
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([mockRoom])
    const cancelSpy = vi
      .spyOn(api, 'cancelReservation')
      .mockResolvedValue({ ...mockReservation, status: 'CANCELLED' })

    render(
      <MemoryRouter>
        <MyReservationsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Sala Azul')).toBeInTheDocument()
    expect(screen.getByText('Confirmada')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar reserva' }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar reserva' }))

    await waitFor(() => {
      expect(cancelSpy).toHaveBeenCalledWith('res-1', 'token-abc')
    })
  })
})

describe('AdminRoomsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStores()
  })

  it('blocks access for non-admin users', () => {
    render(
      <MemoryRouter>
        <AdminRoomsPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Acesso restrito')).toBeInTheDocument()
  })

  it('lets admins create a room', async () => {
    useAuthStore.setState({ user: adminUser })
    const createRoomSpy = vi.spyOn(api, 'createRoom').mockResolvedValue(mockRoom)

    render(
      <MemoryRouter>
        <AdminRoomsPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Nome da sala'), { target: { value: 'Sala Azul' } })
    fireEvent.change(screen.getByLabelText('Capacidade'), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar sala' }))

    await waitFor(() => {
      expect(createRoomSpy).toHaveBeenCalledWith(
        { name: 'Sala Azul', capacity: 8, location: undefined },
        'token-abc',
      )
    })

    expect(await screen.findByText('Sala cadastrada com sucesso.')).toBeInTheDocument()
  })

  it('lets admins edit and delete an existing room', async () => {
    useAuthStore.setState({ user: adminUser })
    useRoomsStore.setState({ rooms: [mockRoom] })
    const updateRoomSpy = vi
      .spyOn(api, 'updateRoom')
      .mockResolvedValue({ ...mockRoom, name: 'Sala Verde' })
    const deleteRoomSpy = vi.spyOn(api, 'deleteRoom').mockResolvedValue(mockRoom)

    render(
      <MemoryRouter>
        <AdminRoomsPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Editar sala' }))
    fireEvent.change(screen.getByLabelText('Nome da sala'), { target: { value: 'Sala Verde' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => {
      expect(updateRoomSpy).toHaveBeenCalledWith(
        'room-1',
        { name: 'Sala Verde', capacity: 8, location: 'Andar 1' },
        'token-abc',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Excluir sala' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir sala' }))

    await waitFor(() => {
      expect(deleteRoomSpy).toHaveBeenCalledWith('room-1', 'token-abc')
    })
  })
})
