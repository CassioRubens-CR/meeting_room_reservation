import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

export function HomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <main className="flex min-h-screen flex-col bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 sm:py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
              Meeting Room Reservation
            </p>
            <h1 className="mt-1 text-lg font-semibold text-stone-900 sm:text-xl">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs text-stone-600 sm:text-sm">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 sm:px-4 sm:py-2 sm:text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          {/* Welcome Section */}
          <section className="mb-6 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
              Bem-vindo, {user?.name?.split(' ')[0]}!
            </h2>
            <p className="mt-2 text-xs text-stone-600 sm:text-sm">
              Você está autenticado no sistema. Em breve você poderá acessar salas de reunião e criar reservas.
            </p>
          </section>

          {/* Features Grid */}
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Rooms Feature */}
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-brand-100 p-2 sm:p-3">
                <span className="text-lg sm:text-2xl">🏢</span>
              </div>
              <h3 className="font-medium text-stone-900 sm:text-lg">Salas Disponíveis</h3>
              <p className="mt-2 text-xs text-stone-600 sm:text-sm">
                Veja todas as salas de reunião disponíveis no sistema.
              </p>
            </div>

            {/* Reservations Feature */}
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-blue-100 p-2 sm:p-3">
                <span className="text-lg sm:text-2xl">📅</span>
              </div>
              <h3 className="font-medium text-stone-900 sm:text-lg">Minhas Reservas</h3>
              <p className="mt-2 text-xs text-stone-600 sm:text-sm">
                Gerenciar suas reservas e agendamentos.
              </p>
            </div>

            {/* Profile Feature */}
            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-green-100 p-2 sm:p-3">
                <span className="text-lg sm:text-2xl">👤</span>
              </div>
              <h3 className="font-medium text-stone-900 sm:text-lg">Seu Perfil</h3>
              <p className="mt-2 text-xs text-stone-600 sm:text-sm">
                Visualizar e editar suas informações pessoais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
