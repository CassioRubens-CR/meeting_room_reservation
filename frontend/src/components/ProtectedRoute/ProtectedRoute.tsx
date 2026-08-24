import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { hydrated, isAuthenticated } = useAuthStore()

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4 text-sm text-stone-600">
        Carregando sessão...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
