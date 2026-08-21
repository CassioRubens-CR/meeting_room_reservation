import { useAuthStore } from '../store'
import { Layout } from '../components'

export function HomePage() {
  const { user } = useAuthStore()

  return (
    <Layout>
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
    </Layout>
  )
}
