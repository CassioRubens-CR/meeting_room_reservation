import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components'
import { useAuthStore, useRoomsStore } from '../store'

export function AdminRoomsPage() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const { rooms, loading, error, createRoom, clearError } = useRoomsStore()
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [location, setLocation] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage(null)
    clearError()

    if (!token) {
      return
    }

    try {
      await createRoom(
        {
          name: name.trim(),
          capacity: Number(capacity),
          location: location.trim() || undefined,
        },
        token,
      )
      setName('')
      setCapacity('')
      setLocation('')
      setSuccessMessage('Sala cadastrada com sucesso.')
    } catch {
      // Error is exposed by the rooms store.
    }
  }

  return (
    <Layout>
      {!isAdmin ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-lg font-semibold text-red-800">Acesso restrito</h1>
          <p className="mt-2 text-sm text-red-700">
            Apenas administradores podem cadastrar salas.
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
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
              Administração
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">
              Cadastrar sala
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Adicione uma sala para disponibilizá-la para reservas.
            </p>
          </div>

          <section className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {successMessage}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                  Nome da sala
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                  placeholder="Sala Ipê"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-stone-700">
                  Capacidade
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  required
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                  placeholder="10"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-stone-700">
                  Localização <span className="font-normal text-stone-500">(opcional)</span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  disabled={loading}
                  className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
                  placeholder="2º andar"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="min-h-11 w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {loading ? 'Cadastrando sala...' : 'Cadastrar sala'}
              </button>
            </form>
          </section>

          <section className="mt-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-stone-900">Salas cadastradas</h2>
              <span className="text-sm text-stone-500">{rooms.length}</span>
            </div>
            {rooms.length > 0 ? (
              <ul className="mt-4 divide-y divide-stone-100">
                {rooms.map((room) => (
                  <li key={room.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="font-medium text-stone-800">{room.name}</span>
                    <span className="text-stone-500">{room.capacity} lugares</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-stone-600">Nenhuma sala cadastrada nesta sessão.</p>
            )}
          </section>
        </div>
      )}
    </Layout>
  )
}
