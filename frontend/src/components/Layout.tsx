import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((isOpen) => !isOpen)}
              className="order-first min-h-11 min-w-11 rounded-lg border border-stone-300 px-3 py-2 text-xl leading-none text-stone-700 transition-colors hover:bg-stone-100 sm:hidden"
            >
              {menuOpen ? '×' : '☰'}
            </button>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
              Meeting Room Reservation
            </p>
            <nav className="hidden gap-3 text-xs font-medium text-stone-600 sm:ml-6 sm:flex sm:gap-4 sm:text-sm">
              <Link to="/dashboard" className="hover:text-brand-700">
                Dashboard
              </Link>
              <Link to="/rooms" className="hover:text-brand-700">
                Salas
              </Link>
              <Link to="/reservations" className="hover:text-brand-700">
                Reservas
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin/rooms" className="hover:text-brand-700">
                  Admin
                </Link>
              )}
            </nav>
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
        {menuOpen && (
          <nav className="border-t border-stone-200 px-4 py-3 sm:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 text-sm font-medium text-stone-700">
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-brand-50 hover:text-brand-700"
              >
                Dashboard
              </Link>
              <Link
                to="/rooms"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-brand-50 hover:text-brand-700"
              >
                Salas
              </Link>
              <Link
                to="/reservations"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-brand-50 hover:text-brand-700"
              >
                Reservas
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/rooms"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 hover:bg-brand-50 hover:text-brand-700"
                >
                  Administração
                </Link>
              )}
            </div>
          </nav>
        )}
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
