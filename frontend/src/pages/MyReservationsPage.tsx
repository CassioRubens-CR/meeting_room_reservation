import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components'
import { useAuthStore, useReservationsStore, useRoomsStore } from '../store'
import type { Reservation } from '../types/models'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
  }).format(new Date(value))
}

function formatTime(value: string) {
  return value.includes('T') ? value.slice(11, 16) : value
}

function getReservationStatus(reservation: Reservation) {
  return reservation.status === 'CANCELLED' ? 'Cancelada' : 'Confirmada'
}

export function MyReservationsPage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { rooms, fetchRooms } = useRoomsStore()
  const {
    reservations,
    loading,
    error,
    fetchMyReservations,
    cancelReservation,
    clearError,
  } = useReservationsStore()

  useEffect(() => {
    if (token) {
      void fetchMyReservations(token)
      if (rooms.length === 0) {
        void fetchRooms(token)
      }
    }
  }, [fetchMyReservations, fetchRooms, rooms.length, token])

  const handleCancel = async (reservation: Reservation) => {
    if (!token || reservation.status === 'CANCELLED') {
      return
    }

    const confirmed = window.confirm('Deseja cancelar esta reserva?')
    if (!confirmed) {
      return
    }

    clearError()
    try {
      await cancelReservation(reservation.id, token)
    } catch {
      // Error is exposed by the reservations store.
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
              Agenda
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">
              Minhas reservas
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Consulte e gerencie seus horários reservados.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            className="min-h-11 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Nova reserva
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="min-h-11 rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
          >
            Voltar ao dashboard
          </button>
        </div>

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

        {!loading && reservations.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-stone-900">Nenhuma reserva encontrada</h2>
            <p className="mt-2 text-sm text-stone-600">
              Escolha uma sala para criar sua primeira reserva.
            </p>
            <button
              type="button"
              onClick={() => navigate('/rooms')}
              className="mt-5 min-h-11 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700"
            >
              Ver salas
            </button>
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {reservations.map((reservation) => {
              const room = rooms.find((availableRoom) => availableRoom.id === reservation.roomId)
              const isCancelled = reservation.status === 'CANCELLED'

              return (
                <article
                  key={reservation.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm sm:p-5 ${
                    isCancelled ? 'border-stone-200 opacity-75' : 'border-brand-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-stone-900">
                        {room?.name || 'Sala não encontrada'}
                      </h2>
                      <p className="mt-1 text-sm text-stone-600">
                        {room?.location || 'Localização não informada'}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                        isCancelled
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-accent-100 text-accent-900'
                      }`}
                    >
                      {getReservationStatus(reservation)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 border-y border-stone-100 py-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-stone-500">Data</p>
                      <p className="mt-1 font-medium text-stone-800">{formatDate(reservation.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Horário</p>
                      <p className="mt-1 font-medium text-stone-800">
                        {formatTime(reservation.startTime)} às {formatTime(reservation.endTime)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/reservations/${reservation.id}/edit`)}
                    disabled={loading || isCancelled}
                    className="min-h-11 w-full rounded-lg border border-brand-200 px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                  >
                    {isCancelled ? 'Reserva cancelada' : 'Editar reserva'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCancel(reservation)}
                    disabled={loading || isCancelled}
                    className="min-h-11 w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                  >
                    {isCancelled ? 'Reserva cancelada' : 'Cancelar reserva'}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
