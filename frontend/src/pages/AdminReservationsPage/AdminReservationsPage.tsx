import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components'
import { useAuthStore, useReservationsStore, useRoomsStore } from '../../store'
import { formatDate, formatTime, getReservationStatus } from '../../utils'

export function AdminReservationsPage() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const { rooms, fetchRooms } = useRoomsStore()
  const {
    adminReservations,
    loading,
    error,
    fetchAllReservations,
    clearError,
  } = useReservationsStore()
  const [date, setDate] = useState('')
  const [roomId, setRoomId] = useState('')
  const [userId, setUserId] = useState('')
  const [appliedUserId, setAppliedUserId] = useState('')

  const isAdmin = user?.role === 'ADMIN'
  const users = Array.from(
    new Map(
      adminReservations.map((reservation) => [reservation.user.id, reservation.user]),
    ).values(),
  )
  const visibleReservations = appliedUserId
    ? adminReservations.filter((reservation) => reservation.user.id === appliedUserId)
    : adminReservations

  const loadReservations = (filters = { date, roomId }) => {
    if (token) {
      fetchAllReservations(
        {
          date: filters.date || undefined,
          roomId: filters.roomId || undefined,
        },
        token,
      ).catch(() => {
        // Error is exposed by the reservations store.
      })
    }
  }

  useEffect(() => {
    if (token && isAdmin) {
      if (rooms.length === 0) {
        fetchRooms(token).catch(() => {
          // Error is exposed by the rooms store.
        })
      }
      fetchAllReservations(
        { date: undefined, roomId: undefined, userId: undefined },
        token,
      ).catch(() => {
        // Error is exposed by the reservations store.
      })
    }
  }, [fetchAllReservations, fetchRooms, isAdmin, rooms.length, token])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()
    setAppliedUserId(userId)
    loadReservations()
  }

  const handleClear = () => {
    setDate('')
    setRoomId('')
    setUserId('')
    setAppliedUserId('')
    clearError()
    loadReservations({ date: '', roomId: '' })
  }

  return (
    <Layout>
      {!isAdmin ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-lg font-semibold text-red-800">Acesso restrito</h1>
          <p className="mt-2 text-sm text-red-700">
            Apenas administradores podem consultar todas as reservas.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-5 min-h-11 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Voltar ao dashboard
          </button>
        </section>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
                Administração
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">
                Todas as reservas
              </h1>
              <p className="mt-2 text-sm text-stone-600">
                Consulte reservas por data ou sala.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="min-h-11 rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
            >
              Voltar ao dashboard
            </button>
          </div>

          <section className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm sm:p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-stone-700">
                  Data
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-stone-700">
                  Sala
                </label>
                <select
                  id="roomId"
                  value={roomId}
                  onChange={(event) => setRoomId(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Todas as salas</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-stone-700">
                  Usuário
                </label>
                <select
                  id="userId"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Todos os usuários</option>
                  {users.map((reservationUser) => (
                    <option key={reservationUser.id} value={reservationUser.id}>
                      {reservationUser.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-11 flex-1 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  Filtrar
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="min-h-11 rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-400"
                >
                  Limpar
                </button>
              </div>
            </form>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600 shadow-sm">
              Carregando reservas...
            </div>
          )}

          {!loading && !error && visibleReservations.length === 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
              <h2 className="text-lg font-semibold text-stone-900">Nenhuma reserva encontrada</h2>
              <p className="mt-2 text-sm text-stone-600">
                Tente remover os filtros ou aguarde novas reservas.
              </p>
            </div>
          )}

          {!loading && visibleReservations.length > 0 && (
            <div className="grid items-stretch gap-4 lg:grid-cols-2">
              {visibleReservations.map((reservation) => {
                const isCancelled = reservation.status === 'CANCELLED'

                return (
                  <article
                    key={reservation.id}
                    className={`flex h-full min-w-0 max-w-full flex-col rounded-xl border bg-white p-4 shadow-sm sm:p-5 ${
                      isCancelled ? 'border-stone-200 opacity-75' : 'border-brand-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-stone-900">
                          {reservation.room.name}
                        </h2>
                        <p className="mt-1 text-sm text-stone-600">
                          {reservation.room.location || 'Localização não informada'}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${isCancelled
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-accent-100 text-accent-900'
                        }`}>
                        {getReservationStatus(reservation.status)}
                      </span>
                    </div>

                    <div className="mt-5 grid min-w-0 gap-3 border-y border-stone-100 py-4 text-sm sm:grid-cols-2">
                      <div className="min-w-0">
                        <p className="text-xs text-stone-500">Responsável</p>
                        <p className="mt-1 truncate font-medium text-stone-800">
                          {reservation.user.name}
                        </p>
                        <p className="truncate text-xs text-stone-500">{reservation.user.email}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-stone-500">Data</p>
                        <p className="mt-1 font-medium text-stone-800">{formatDate(reservation.date)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-stone-500">Horário</p>
                        <p className="mt-1 font-medium text-stone-800">
                          {formatTime(reservation.startTime)} às {formatTime(reservation.endTime)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-stone-500">Participantes</p>
                        <p className="mt-1 font-medium text-stone-800">
                          {reservation.attendeesCount}
                        </p>
                      </div>
                    </div>

                    {reservation.justification && (
                      <p className="mt-4 text-sm text-stone-600">
                        <span className="font-medium text-stone-800">Justificativa:</span>{' '}
                        {reservation.justification}
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
