import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { Layout } from '../components'
import { useReservationsStore, useRoomsStore } from '../store'

export function HomePage() {
  const { token, user } = useAuthStore()
  const { rooms, fetchRooms } = useRoomsStore()
  const { reservations, fetchMyReservations } = useReservationsStore()

  useEffect(() => {
    if (token) {
      if (rooms.length === 0) {
        void fetchRooms(token)
      }
      if (reservations.length === 0) {
        void fetchMyReservations(token)
      }
    }
  }, [fetchMyReservations, fetchRooms, reservations.length, rooms.length, token])

  return (
    <Layout>
      {/* Welcome Section */}
      <section className="mb-6 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
          Bem-vindo, {user?.name?.split(' ')[0]}!
          </h2>
        <p className="mt-2 text-xs text-stone-600 sm:text-sm">
          {rooms.length > 0 && user?.role !== "ADMIN"
            ? 'Sistema liberado! Você já pode acessar as salas e criar suas reservas.'
            : user?.role === "ADMIN"
            ? 'Sistema liberado! Você já pode gerenciar salas de reunião e criar reservas.'
            : 'Você está autenticado no sistema. Em breve você poderá acessar salas de reunião e criar reservas.'
          }
        </p>
      </section>

      {/* Features Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Rooms Feature */}
        <Link to="/rooms" className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-brand-100 p-2 sm:p-3">
            <span className="text-lg sm:text-2xl">🏢</span>
          </div>
          <h3 className="font-medium text-stone-900 sm:text-lg">Salas Disponíveis</h3>
          <p className="mt-2 text-xs text-stone-600 sm:text-sm">
            Veja todas as salas de reunião disponíveis no sistema.
          </p>
        </Link>

        {/* Reservations Feature */}
        <Link to="/reservations" className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-blue-100 p-2 sm:p-3">
            <span className="text-lg sm:text-2xl">📅</span>
          </div>
          <h3 className="font-medium text-stone-900 sm:text-lg">Minhas Reservas</h3>
          <p className="mt-2 text-xs text-stone-600 sm:text-sm">
            {reservations.length} reserva(s) cadastrada(s).
          </p>
        </Link>

        {/* Profile Feature */}
        <Link
          to="/profile"
          className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6"
        >
          <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-accent-100 p-2 sm:p-3">
            <span className="text-lg sm:text-2xl">👤</span>
          </div>
          <h3 className="font-medium text-stone-900 sm:text-lg">Seu Perfil</h3>
          <p className="mt-2 text-xs text-stone-600 sm:text-sm">
            {rooms.length} sala(s) disponível(is) para reserva.
          </p>
        </Link>

        {user?.role === 'ADMIN' && (
          <Link
            to="/admin/rooms"
            className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6"
          >
            <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-brand-100 p-2 sm:p-3">
              <span className="text-lg sm:text-2xl">⚙️</span>
            </div>
            <h3 className="font-medium text-stone-900 sm:text-lg">Gerenciar Salas</h3>
            <p className="mt-2 text-xs text-stone-600 sm:text-sm">
              Cadastrar, editar e excluir salas de reunião.
            </p>
          </Link>
        )}
      </div>
    </Layout>
  )
}
