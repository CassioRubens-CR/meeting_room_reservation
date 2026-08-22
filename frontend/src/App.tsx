import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store'
import {
  LoginPage,
  RegisterPage,
  HomePage,
  RoomsPage,
  CreateReservationPage,
} from './pages'
import { ProtectedRoute } from './components'

export function App() {
  const { hydrate } = useAuthStore()

  // Hydrate auth state from localStorage on app start
  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/:roomId/reserve"
          element={
            <ProtectedRoute>
              <CreateReservationPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
