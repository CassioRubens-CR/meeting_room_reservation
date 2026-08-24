import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as auth from '../auth/auth'
import * as rooms from '../rooms/rooms'
import * as reservations from '../reservations/reservations'

function mockFetchJson(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

describe('auth api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('registers a user', async () => {
    const fetchMock = mockFetchJson({ accessToken: 'token', user: { id: '1' } })

    await auth.register({ name: 'Test', email: 'test@email.com', password: 'password123' })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/register',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('logs in a user', async () => {
    const fetchMock = mockFetchJson({ accessToken: 'token', user: { id: '1' } })

    await auth.login({ email: 'test@email.com', password: 'password123' })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/login',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('changes the password with a bearer token', async () => {
    const fetchMock = mockFetchJson({ message: 'ok' })

    await auth.changePassword({ currentPassword: 'old', newPassword: 'newpass1' }, 'token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/change-password',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token-abc' }),
      }),
    )
  })
})

describe('rooms api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches rooms', async () => {
    const fetchMock = mockFetchJson([])

    await rooms.fetchRooms('token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/rooms',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('creates a room', async () => {
    const fetchMock = mockFetchJson({ id: 'room-1' })

    await rooms.createRoom({ name: 'Sala A', capacity: 5 }, 'token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/rooms',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('updates a room', async () => {
    const fetchMock = mockFetchJson({ id: 'room-1' })

    await rooms.updateRoom('room-1', { name: 'Sala B' }, 'token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/rooms/room-1',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('deletes a room', async () => {
    const fetchMock = mockFetchJson({ id: 'room-1' })

    await rooms.deleteRoom('room-1', 'token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/rooms/room-1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('reservations api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches the current user reservations', async () => {
    const fetchMock = mockFetchJson([])

    await reservations.fetchMyReservations('token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/reservations/me',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('fetches all reservations without filters', async () => {
    const fetchMock = mockFetchJson([])

    await reservations.fetchAllReservations({}, 'token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/reservations',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('fetches all reservations with filters applied as query params', async () => {
    const fetchMock = mockFetchJson([])

    await reservations.fetchAllReservations(
      { date: '2026-08-23', roomId: 'room-1', userId: 'user-1' },
      'token-abc',
    )

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('/reservations?')
    expect(url).toContain('date=2026-08-23')
    expect(url).toContain('roomId=room-1')
    expect(url).toContain('userId=user-1')
  })

  it('creates a reservation', async () => {
    const fetchMock = mockFetchJson({ id: 'res-1' })

    await reservations.createReservation(
      {
        roomId: 'room-1',
        date: '2026-08-23',
        startTime: '09:00',
        endTime: '10:00',
        attendeesCount: 1,
      },
      'token-abc',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/reservations',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('updates a reservation', async () => {
    const fetchMock = mockFetchJson({ id: 'res-1' })

    await reservations.updateReservation('res-1', { attendeesCount: 2 }, 'token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/reservations/res-1',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('cancels a reservation', async () => {
    const fetchMock = mockFetchJson({ id: 'res-1' })

    await reservations.cancelReservation('res-1', 'token-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/reservations/res-1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
