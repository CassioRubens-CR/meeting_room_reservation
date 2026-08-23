import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminReservation } from '../types/models'
import * as api from '../api'
import { useAuthStore, useReservationsStore, useRoomsStore } from '.'

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@email.com',
  role: 'USER' as const,
}

const mockRoom = {
  id: 'room-1',
  name: 'Room A',
  capacity: 10,
  location: 'Floor 1',
  createdAt: '2024-01-01T00:00:00.000Z',
}

const mockReservation = {
  id: 'res-1',
  roomId: 'room-1',
  userId: 'user-1',
  date: '2026-08-23',
  startTime: '2026-08-23T09:00:00.000Z',
  endTime: '2026-08-23T10:00:00.000Z',
  attendeesCount: 1,
  status: 'CONFIRMED' as const,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
}

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      hydrated: true,
    })
    vi.restoreAllMocks()
  })

  it('initializes with default state', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('logs in successfully and stores token and user', async () => {
    const loginSpy = vi.spyOn(api, 'login').mockResolvedValue({
      accessToken: 'auth-token-abc',
      user: mockUser,
    })

    const { login } = useAuthStore.getState()
    await login({ email: 'test@email.com', password: 'password123' })

    const state = useAuthStore.getState()
    expect(state.token).toBe('auth-token-abc')
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(loginSpy).toHaveBeenCalledWith({ email: 'test@email.com', password: 'password123' })
  })

  it('sets error on login failure', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(new Error('Invalid credentials'))

    const { login } = useAuthStore.getState()
    await expect(login({ email: 'test@email.com', password: 'wrong' })).rejects.toThrow()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.error).toBe('Invalid credentials')
    expect(state.loading).toBe(false)
  })

  it('registers successfully', async () => {
    const registerSpy = vi.spyOn(api, 'register').mockResolvedValue({
      accessToken: 'new-token-xyz',
      user: mockUser,
    })

    const { register } = useAuthStore.getState()
    await register({ name: 'Test User', email: 'test@email.com', password: 'password123' })

    const state = useAuthStore.getState()
    expect(state.token).toBe('new-token-xyz')
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(registerSpy).toHaveBeenCalledWith({ name: 'Test User', email: 'test@email.com', password: 'password123' })
  })

  it('changes password and clears loading state', async () => {
    useAuthStore.setState({
      token: 'token-abc',
      user: mockUser,
      isAuthenticated: true,
    })

    const changePasswordSpy = vi
      .spyOn(api, 'changePassword')
      .mockResolvedValue({ message: 'Password changed successfully' })

    const { changePassword } = useAuthStore.getState()
    await changePassword('oldpass', 'newpass')

    const state = useAuthStore.getState()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(changePasswordSpy).toHaveBeenCalledWith(
      { currentPassword: 'oldpass', newPassword: 'newpass' },
      'token-abc',
    )
  })

  it('logs out and clears auth state', () => {
    useAuthStore.setState({
      token: 'token-abc',
      user: mockUser,
      isAuthenticated: true,
    })

    const { logout } = useAuthStore.getState()
    logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBeNull()
  })

  it('clears error message', () => {
    useAuthStore.setState({ error: 'Some error' })

    const { clearError } = useAuthStore.getState()
    clearError()

    expect(useAuthStore.getState().error).toBeNull()
  })

  it('hydrates with no persisted auth', () => {
    localStorage.removeItem('meeting-room-auth')
    useAuthStore.setState({ hydrated: false })

    useAuthStore.getState().hydrate()

    expect(useAuthStore.getState().hydrated).toBe(true)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('hydrates with valid persisted auth', () => {
    localStorage.setItem(
      'meeting-room-auth',
      JSON.stringify({ accessToken: 'persisted-token', user: mockUser }),
    )
    useAuthStore.setState({ hydrated: false })

    useAuthStore.getState().hydrate()

    const state = useAuthStore.getState()
    expect(state.hydrated).toBe(true)
    expect(state.token).toBe('persisted-token')
    expect(state.isAuthenticated).toBe(true)
  })

  it('clears persisted auth on invalid JSON during hydrate', () => {
    localStorage.setItem('meeting-room-auth', 'not-json')
    useAuthStore.setState({ hydrated: false })

    useAuthStore.getState().hydrate()

    expect(useAuthStore.getState().hydrated).toBe(true)
    expect(localStorage.getItem('meeting-room-auth')).toBeNull()
  })

  it('does nothing when changing password without a token', async () => {
    const changePasswordSpy = vi.spyOn(api, 'changePassword')
    useAuthStore.setState({ token: null })

    await useAuthStore.getState().changePassword('old', 'new')

    expect(changePasswordSpy).not.toHaveBeenCalled()
  })

  it('sets a fallback error message when the rejection is not an Error', async () => {
    vi.spyOn(api, 'login').mockRejectedValue('unexpected failure')

    await expect(
      useAuthStore.getState().login({ email: 'test@email.com', password: 'wrong' }),
    ).rejects.toBe('unexpected failure')

    expect(useAuthStore.getState().error).toBe('Falha no login')
  })

  it('sets a fallback error message on register failure without an Error instance', async () => {
    vi.spyOn(api, 'register').mockRejectedValue('unexpected failure')

    await expect(
      useAuthStore
        .getState()
        .register({ name: 'Test', email: 'test@email.com', password: 'password123' }),
    ).rejects.toBe('unexpected failure')

    expect(useAuthStore.getState().error).toBe('Falha no cadastro')
  })

  it('sets an error message when changing the password fails', async () => {
    useAuthStore.setState({ token: 'token-abc' })
    vi.spyOn(api, 'changePassword').mockRejectedValue(new Error('Senha atual incorreta'))

    await expect(useAuthStore.getState().changePassword('wrong', 'newpass1')).rejects.toThrow()

    expect(useAuthStore.getState().error).toBe('Senha atual incorreta')
    expect(useAuthStore.getState().loading).toBe(false)
  })
})

describe('rooms store', () => {
  beforeEach(() => {
    useRoomsStore.setState({
      rooms: [],
      loading: false,
      error: null,
    })
    vi.restoreAllMocks()
  })

  it('initializes with empty rooms list', () => {
    const state = useRoomsStore.getState()
    expect(state.rooms).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('fetches rooms and updates state', async () => {
    const fetchRoomsSpy = vi
      .spyOn(api, 'fetchRooms')
      .mockResolvedValue([mockRoom, { ...mockRoom, id: 'room-2', name: 'Room B' }])

    const { fetchRooms } = useRoomsStore.getState()
    await fetchRooms('token-abc')

    const state = useRoomsStore.getState()
    expect(state.rooms).toHaveLength(2)
    expect(state.rooms[0]).toEqual(mockRoom)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(fetchRoomsSpy).toHaveBeenCalledWith('token-abc')
  })

  it('sets error on fetch failure', async () => {
    vi.spyOn(api, 'fetchRooms').mockRejectedValue(new Error('Network error'))

    const { fetchRooms } = useRoomsStore.getState()
    await expect(fetchRooms('token-abc')).rejects.toThrow()

    const state = useRoomsStore.getState()
    expect(state.error).toBe('Network error')
    expect(state.loading).toBe(false)
    expect(state.rooms).toEqual([])
  })

  it('creates a new room and adds it to the list', async () => {
    useRoomsStore.setState({ rooms: [mockRoom] })

    vi.spyOn(api, 'createRoom').mockResolvedValue({
      ...mockRoom,
      id: 'room-2',
      name: 'Room B',
    })

    const { createRoom } = useRoomsStore.getState()
    await createRoom(
      { name: 'Room B', capacity: 10, location: 'Floor 1' },
      'token-abc',
    )

    const state = useRoomsStore.getState()
    expect(state.rooms).toHaveLength(2)
    expect(state.rooms[1].name).toBe('Room B')
    expect(state.loading).toBe(false)
  })

  it('updates a room in the list', async () => {
    useRoomsStore.setState({ rooms: [mockRoom] })

    const updatedRoom: typeof mockRoom = {
      ...mockRoom,
      name: 'Updated Room',
    }
    vi.spyOn(api, 'updateRoom').mockResolvedValue(updatedRoom)

    const { updateRoom } = useRoomsStore.getState()
    await updateRoom('room-1', { name: 'Updated Room' }, 'token-abc')

    const state = useRoomsStore.getState()
    expect(state.rooms[0].name).toBe('Updated Room')
  })

  it('deletes a room from the list', async () => {
    useRoomsStore.setState({
      rooms: [mockRoom, { ...mockRoom, id: 'room-2', name: 'Room B' }],
    })

    vi.spyOn(api, 'deleteRoom').mockResolvedValue(mockRoom)

    const { deleteRoom } = useRoomsStore.getState()
    await deleteRoom('room-1', 'token-abc')

    const state = useRoomsStore.getState()
    expect(state.rooms).toHaveLength(1)
    expect(state.rooms[0].id).toBe('room-2')
  })

  it('sets an error message when creating a room fails', async () => {
    vi.spyOn(api, 'createRoom').mockRejectedValue(new Error('Nome já utilizado'))

    await expect(
      useRoomsStore.getState().createRoom({ name: 'Sala A', capacity: 5 }, 'token-abc'),
    ).rejects.toThrow()

    expect(useRoomsStore.getState().error).toBe('Nome já utilizado')
  })

  it('sets a fallback error message when updating a room fails without an Error instance', async () => {
    vi.spyOn(api, 'updateRoom').mockRejectedValue('unexpected failure')

    await expect(
      useRoomsStore.getState().updateRoom('room-1', { name: 'Sala B' }, 'token-abc'),
    ).rejects.toBe('unexpected failure')

    expect(useRoomsStore.getState().error).toBe('Falha ao atualizar sala')
  })

  it('sets an error message when deleting a room fails', async () => {
    vi.spyOn(api, 'deleteRoom').mockRejectedValue(new Error('Sala possui reservas ativas'))

    await expect(useRoomsStore.getState().deleteRoom('room-1', 'token-abc')).rejects.toThrow()

    expect(useRoomsStore.getState().error).toBe('Sala possui reservas ativas')
  })
})

describe('reservations store', () => {
  beforeEach(() => {
    useReservationsStore.setState({
      reservations: [],
      adminReservations: [],
      loading: false,
      error: null,
    })
    vi.restoreAllMocks()
  })

  it('initializes with empty reservations', () => {
    const state = useReservationsStore.getState()
    expect(state.reservations).toEqual([])
    expect(state.adminReservations).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('fetches user reservations', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchMyReservations').mockResolvedValue([mockReservation])

    const { fetchMyReservations } = useReservationsStore.getState()
    await fetchMyReservations('token-abc')

    const state = useReservationsStore.getState()
    expect(state.reservations).toHaveLength(1)
    expect(state.reservations[0]).toEqual(mockReservation)
    expect(state.loading).toBe(false)
    expect(fetchSpy).toHaveBeenCalledWith('token-abc')
  })

  it('fetches all reservations with filters', async () => {
    const adminRes: AdminReservation = {
      ...mockReservation,
      user: mockUser,
      room: mockRoom,
    }
    vi.spyOn(api, 'fetchAllReservations').mockResolvedValue([adminRes])

    const { fetchAllReservations } = useReservationsStore.getState()
    await fetchAllReservations({ date: '2026-08-23', roomId: 'room-1' }, 'token-abc')

    const state = useReservationsStore.getState()
    expect(state.adminReservations).toHaveLength(1)
    expect(state.adminReservations[0].user.name).toBe('Test User')
    expect(state.adminReservations[0].room.name).toBe('Room A')
  })

  it('creates a reservation and adds to list', async () => {
    vi.spyOn(api, 'createReservation').mockResolvedValue(mockReservation)

    const { createReservation } = useReservationsStore.getState()
    await createReservation(
      {
        roomId: 'room-1',
        date: '2026-08-23',
        startTime: '09:00',
        endTime: '10:00',
        attendeesCount: 1,
      },
      'token-abc',
    )

    const state = useReservationsStore.getState()
    expect(state.reservations).toHaveLength(1)
    expect(state.reservations[0]).toEqual(mockReservation)
    expect(state.loading).toBe(false)
  })

  it('updates a reservation in the list', async () => {
    useReservationsStore.setState({ reservations: [mockReservation] })

    const updatedRes = { ...mockReservation, attendeesCount: 2 }
    const updateSpy = vi.spyOn(api, 'updateReservation').mockResolvedValue(updatedRes)

    const { updateReservation } = useReservationsStore.getState()
    await updateReservation(
      'res-1',
      { attendeesCount: 2 },
      'token-abc',
    )

    const state = useReservationsStore.getState()
    expect(state.reservations[0].attendeesCount).toBe(2)
    expect(updateSpy).toHaveBeenCalledWith('res-1', { attendeesCount: 2 }, 'token-abc')
  })

  it('cancels a reservation', async () => {
    const cancelledRes = { ...mockReservation, status: 'CANCELLED' as const }
    useReservationsStore.setState({ reservations: [mockReservation] })

    const cancelSpy = vi.spyOn(api, 'cancelReservation').mockResolvedValue(cancelledRes)

    const { cancelReservation } = useReservationsStore.getState()
    await cancelReservation('res-1', 'token-abc')

    const state = useReservationsStore.getState()
    expect(state.reservations[0].status).toBe('CANCELLED')
    expect(cancelSpy).toHaveBeenCalledWith('res-1', 'token-abc')
  })

  it('clears error message', () => {
    useReservationsStore.setState({ error: 'Failed to create' })

    const { clearError } = useReservationsStore.getState()
    clearError()

    expect(useReservationsStore.getState().error).toBeNull()
  })

  it('sets an error message when fetching my reservations fails', async () => {
    vi.spyOn(api, 'fetchMyReservations').mockRejectedValue(new Error('Falha de rede'))

    await expect(useReservationsStore.getState().fetchMyReservations('token-abc')).rejects.toThrow()

    expect(useReservationsStore.getState().error).toBe('Falha de rede')
  })

  it('sets a fallback error message when fetching all reservations fails without an Error instance', async () => {
    vi.spyOn(api, 'fetchAllReservations').mockRejectedValue('unexpected failure')

    await expect(
      useReservationsStore.getState().fetchAllReservations({}, 'token-abc'),
    ).rejects.toBe('unexpected failure')

    expect(useReservationsStore.getState().error).toBe('Falha ao buscar todas as reservas')
  })

  it('sets an error message when creating a reservation fails', async () => {
    vi.spyOn(api, 'createReservation').mockRejectedValue(new Error('Sala indisponível'))

    await expect(
      useReservationsStore.getState().createReservation(
        {
          roomId: 'room-1',
          date: '2026-08-23',
          startTime: '09:00',
          endTime: '10:00',
          attendeesCount: 1,
        },
        'token-abc',
      ),
    ).rejects.toThrow()

    expect(useReservationsStore.getState().error).toBe('Sala indisponível')
  })

  it('sets an error message when updating a reservation fails', async () => {
    vi.spyOn(api, 'updateReservation').mockRejectedValue(new Error('Conflito de horário'))

    await expect(
      useReservationsStore.getState().updateReservation('res-1', { attendeesCount: 2 }, 'token-abc'),
    ).rejects.toThrow()

    expect(useReservationsStore.getState().error).toBe('Conflito de horário')
  })

  it('sets a fallback error message when cancelling a reservation fails without an Error instance', async () => {
    vi.spyOn(api, 'cancelReservation').mockRejectedValue('unexpected failure')

    await expect(
      useReservationsStore.getState().cancelReservation('res-1', 'token-abc'),
    ).rejects.toBe('unexpected failure')

    expect(useReservationsStore.getState().error).toBe('Falha ao cancelar reserva')
  })
})
