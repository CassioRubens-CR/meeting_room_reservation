import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch {
      // Error is handled by store
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-start justify-center overflow-y-auto bg-stone-100 p-4 sm:items-center sm:py-6">
      <div className="w-full max-w-md rounded-2xl border border-brand-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-semibold text-stone-900 sm:text-2xl">Login</h1>
          <p className="mt-1 text-xs text-stone-600 sm:text-sm">
            Entre com suas credenciais
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-stone-700 sm:text-sm"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-stone-700 sm:text-sm"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 placeholder-stone-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:bg-stone-300 disabled:cursor-not-allowed sm:mt-6"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-stone-600 sm:mt-4 sm:text-sm">
          Não tem conta?{' '}
          <a href="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Cadastre-se
          </a>
        </p>
      </div>
    </main>
  )
}
