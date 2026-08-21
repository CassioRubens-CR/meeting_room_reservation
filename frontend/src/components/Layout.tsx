import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 sm:py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
              Meeting Room Reservation
            </p>
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

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
