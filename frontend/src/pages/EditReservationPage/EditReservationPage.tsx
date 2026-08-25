import { startTransition, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../../components'
import { useAuthStore, useReservationsStore, useRoomsStore } from '../../store'
import {
  getDurationInMinutes,
  getToday,
  toDateInputValue,
  toTimeInputValue,
} from '../../utils'

export function EditReservationPage() {
  const navigate = useNavigate()
  const { reservationId } = useParams<{ reservationId: string }>()
  const { token, user } = useAuthStore()
  const { rooms, fetchRooms } = useRoomsStore()
  const {
    reservations,
    loading,
    error,
    fetchMyReservations,
    updateReservation,
    clearError,
  } = useReservationsStore()

  const reservation = reservations.find((item) => item.id === reservationId)
  const isAdmin = user?.role === 'ADMIN'

  const [roomId, setRoomId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [attendeesCount, setAttendeesCount] = useState(1)
  const [justification, setJustification] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      if (reservations.length === 0) {
        fetchMyReservations(token).catch(() => {
          // Error is exposed by the reservations store.
        })
      }
      if (rooms.length === 0) {
        fetchRooms(token).catch(() => {
          // Error is exposed by the rooms store.
        })
      }
    }
  }, [fetchMyReservations, fetchRooms, reservations.length, rooms.length, token])

  useEffect(() => {
    if (reservation) {
      startTransition(() => {
        setRoomId(reservation.roomId)
        setDate(toDateInputValue(reservation.date))
        setStartTime(toTimeInputValue(reservation.startTime))
        setEndTime(toTimeInputValue(reservation.endTime))
        setAttendeesCount(reservation.attendeesCount ?? 1)
        setJustification(reservation.justification ?? '')
      })
    }
  }, [reservation])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError(null)
    clearError()

    if (!reservationId || !token) {
      return
    }

    if (!date) {
      setValidationError('Informe uma data para a reserva')
      return
    }

    if (!startTime || !endTime) {
      setValidationError('Informe os horários de início e término')
      return
    }

    if (date < getToday()) {
      setValidationError('Não é possível reservar uma data no passado')
      return
    }

    if (startTime >= endTime) {
      setValidationError('Horário de término deve ser após o início')
      return
    }

    if (getDurationInMinutes(startTime, endTime) < 60) {
      setValidationError('A reserva deve ter duração mínima de 1 hora.')
      return
    }

    try {
      await updateReservation(
        reservationId,
        {
          roomId,
          date,
          startTime,
          endTime,
          attendeesCount,
          justification: justification.trim() || undefined,
        },
        token,
      )
      navigate('/reservations')
    } catch {
      // Error is exposed by the reservations store.
    }
  }

  if (loading && !reservation) {
    return (
      <Layout>
        <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600 shadow-sm">
          Carregando reserva...
        </div>
      </Layout>
    )
  }

  if (!reservation) {
    return (
      <Layout>
        <div className="rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-lg font-semibold text-stone-900">Reserva não encontrada</h1>
          <p className="mt-2 text-sm text-stone-600">
            Volte para sua agenda e escolha uma reserva válida.
          </p>
          <button
            type="button"
            onClick={() => navigate('/reservations')}
            className="mt-5 min-h-11 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Ver reservas
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate('/reservations')}
          className="mb-5 min-h-11 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          ← Voltar para reservas
        </button>

        <section className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="border-b border-stone-200 pb-5">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
              Editar reserva
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900">Atualizar horário</h1>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5 pt-5">
            {(validationError || error) && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {validationError || error}
              </div>
            )}

            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-stone-700">
                Sala
              </label>
              <select
                id="roomId"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                required
                disabled={loading}
                className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} · {room.capacity} lugares
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-stone-700">
                Data
              </label>
              <input
                id="date"
                type="date"
                min={getToday()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                disabled={loading}
                className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-stone-700">
                  Início
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-stone-700">
                  Término
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                />
              </div>
            </div>

            {isAdmin && (
              <div>
                <label htmlFor="attendeesCount" className="block text-sm font-medium text-stone-700">
                  Participantes
                </label>
                <input
                  id="attendeesCount"
                  type="number"
                  min="1"
                  max={rooms.find((room) => room.id === roomId)?.capacity}
                  value={attendeesCount}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    const capacity = rooms.find((room) => room.id === roomId)?.capacity
                    setAttendeesCount(
                      Number.isNaN(value) ? 1 : Math.min(value, capacity ?? value),
                    )
                  }}
                  required
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                />
                <p className="mt-1 text-xs text-stone-500">
                  Capacidade da sala: {rooms.find((room) => room.id === roomId)?.capacity ?? '-'} lugares
                </p>
              </div>
            )}

            {isAdmin && (
              <div>
                <label htmlFor="justification" className="block text-sm font-medium text-stone-700">
                  Justificativa {attendeesCount > 1 && '(obrigatória)'}
                </label>
                <textarea
                  id="justification"
                  value={justification}
                  onChange={(event) => setJustification(event.target.value)}
                  required={attendeesCount > 1}
                  disabled={loading}
                  rows={3}
                  placeholder="Informe a finalidade da reserva, se necessário."
                  className="mt-1 w-full resize-y rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {loading ? 'Salvando alterações...' : 'Salvar alterações'}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  )
}
