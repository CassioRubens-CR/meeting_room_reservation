import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components'
import { useAuthStore, useRoomsStore } from '../store'

export function RoomsPage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { rooms, loading, error, fetchRooms, clearError } = useRoomsStore()

  useEffect(() => {
    if (token) {
      void fetchRooms(token)
    }
  }, [fetchRooms, token])

  const handleRetry = () => {
    clearError()
    if (token) {
      void fetchRooms(token)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
              Catálogo
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">
              Salas disponíveis
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Escolha uma sala para consultar horários e criar uma reserva.
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

        {loading && (
          <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-600 shadow-sm">
            Carregando salas...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm sm:p-6">
            <p className="text-sm font-medium">Não foi possível carregar as salas.</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 min-h-11 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && rooms.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-stone-900">Nenhuma sala cadastrada</h2>
            <p className="mt-2 text-sm text-stone-600">
              Ainda não existem salas disponíveis para reserva.
            </p>
          </div>
        )}

        {!loading && !error && rooms.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-stone-900">{room.name}</h2>
                    <span className="shrink-0 rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-800">
                      {room.capacity} lugares
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-stone-600">
                    {room.location || 'Localização não informada'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/rooms/${room.id}/reserve`)}
                  className="mt-5 min-h-11 w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                >
                  Reservar sala
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
