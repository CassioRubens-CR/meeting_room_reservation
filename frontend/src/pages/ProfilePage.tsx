import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components'
import { useAuthStore } from '../store'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, loading, error, changePassword, clearError } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()
    setSuccessMessage(null)

    if (newPassword !== confirmPassword) {
      return
    }

    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccessMessage('Senha alterada com sucesso.')
    } catch {
      // Error is exposed by the auth store.
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-700 sm:text-sm">
              Conta
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-900 sm:text-3xl">
              Seu perfil
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Seus dados de acesso e alteração de senha.
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

        <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 border-b border-stone-200 pb-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-stone-500">Nome</p>
              <p className="mt-1 text-sm font-medium text-stone-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">E-mail</p>
              <p className="mt-1 break-all text-sm font-medium text-stone-900">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 pt-5">
            {(error || successMessage) && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  error
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-accent-200 bg-accent-50 text-accent-900'
                }`}
              >
                {error || successMessage}
              </div>
            )}

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-stone-700">
                Senha atual
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                disabled={loading}
                className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-stone-700">
                Nova senha
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                disabled={loading}
                className={`mt-1 min-h-11 w-full rounded-lg border px-3 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 disabled:bg-stone-50 ${
                  passwordMismatch
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-stone-300 focus:border-brand-500 focus:ring-brand-500/20'
                }`}
              />
              {passwordMismatch && (
                <p className="mt-1 text-xs text-red-600">As senhas não coincidem.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="min-h-11 w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {loading ? 'Alterando senha...' : 'Alterar senha'}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  )
}
