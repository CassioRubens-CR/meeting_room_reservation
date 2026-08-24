import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { useClickOutside, useEscapeKey } from '../../hooks'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    [mobileMenuRef, mobileMenuButtonRef],
    () => setMenuOpen(false),
    menuOpen,
  )
  useClickOutside(userMenuRef, () => setUserMenuOpen(false), userMenuOpen)
  useEscapeKey(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, menuOpen || userMenuOpen)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'font-semibold text-brand-700' : 'hover:text-brand-700'

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-3 hover:bg-brand-50 hover:text-brand-700 ${
      isActive ? 'bg-brand-50 font-semibold text-brand-700' : ''
    }`

  return (
    <div className="app-shell flex flex-col bg-stone-50">
      <header className="border-b border-stone-200 bg-brand-50 shadow-sm">
        <div className="mx-auto max-w-7xl bg-brand-50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="hidden text-center sm:block">
            <Link
              to="/dashboard"
              aria-label="Ir para o dashboard"
              className="text-xs font-bold uppercase tracking-wider text-brand-700 sm:text-sm"
            >
              Meeting Room Reservation
            </Link>
          </div>

          <div className="relative mt-0 flex items-center justify-between gap-3 sm:mt-4">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((isOpen) => !isOpen)}
              className="order-first min-h-11 min-w-11 rounded-lg border-2 border-brand-200 bg-brand-50 px-3 py-2 text-xl leading-none text-stone-700 transition-colors hover:border-brand-400 hover:bg-brand-100 sm:hidden"
            >
              {menuOpen ? '×' : '☰'}
            </button>

            <Link
              to="/dashboard"
              aria-label="Ir para o dashboard"
              className="absolute inset-x-14 truncate whitespace-nowrap text-center text-[10px] font-semibold uppercase tracking-wider text-brand-700 sm:hidden"
            >
              Meeting Room Reservation
            </Link>

            <nav
              className="hidden flex-1 justify-center gap-3 text-xs font-medium text-stone-600 sm:flex sm:gap-4 sm:text-sm"
              aria-label="Navegação principal"
            >
              <NavLink to="/dashboard" className={desktopLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/rooms" className={desktopLinkClass}>
                Salas
              </NavLink>
              <NavLink to="/reservations" className={desktopLinkClass}>
                Reservas
              </NavLink>
              {user?.role === 'ADMIN' && (
                <>
                  <NavLink to="/admin/rooms" className={desktopLinkClass}>
                    Administração
                  </NavLink>
                  <NavLink to="/admin/reservations" className={desktopLinkClass}>
                    Reservas ADMIN
                  </NavLink>
                </>
              )}
            </nav>

            <div ref={userMenuRef} className="group relative ml-auto">
              <button
                type="button"
                aria-label="Abrir menu do usuário"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((isOpen) => !isOpen)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 text-xl leading-none transition-colors hover:border-brand-400 hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <span aria-hidden="true">👤</span>
              </button>
              <div
                className={`invisible absolute right-0 top-full z-40 mt-2 w-56 origin-top-right rounded-xl border border-stone-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${
                  userMenuOpen ? 'visible opacity-100' : ''
                }`}
              >
                <div className="border-b border-stone-100 px-3 py-2">
                  <p className="text-xs text-stone-500">Nome</p>
                  <p className="mt-1 truncate text-sm font-medium text-stone-900">
                    {user?.name}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="mt-1 block rounded-lg px-3 py-3 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  Meu perfil
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false)
                    handleLogout()
                  }}
                  className="block min-h-11 w-full rounded-lg px-3 py-3 text-left text-sm text-red-700 hover:bg-red-50"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        {menuOpen && (
          <nav
            ref={mobileMenuRef}
            id="mobile-navigation"
            className="border-t border-stone-200 px-4 py-3 sm:hidden"
            aria-label="Navegação mobile"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 text-sm font-medium text-stone-700">
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/rooms" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                Salas
              </NavLink>
              <NavLink to="/reservations" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                Reservas
              </NavLink>
              {user?.role === 'ADMIN' && (
                <>
                  <NavLink to="/admin/rooms" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                    Administração
                  </NavLink>
                  <NavLink to="/admin/reservations" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
                    Reservas ADMIN
                  </NavLink>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
