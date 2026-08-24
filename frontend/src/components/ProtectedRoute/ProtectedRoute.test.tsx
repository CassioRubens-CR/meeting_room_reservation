import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from '../ProtectedRoute/ProtectedRoute'
import { useAuthStore } from '../../store'

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <p>Conteúdo protegido</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      hydrated: false,
    })
  })

  it('shows a loading state before hydration', () => {
    renderRoute()

    expect(screen.getByText('Carregando sessão...')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to login after hydration', () => {
    useAuthStore.setState({ hydrated: true })
    renderRoute()

    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('renders protected content for authenticated users', () => {
    useAuthStore.setState({
      hydrated: true,
      isAuthenticated: true,
      token: 'token-123',
    })
    renderRoute()

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })
})
