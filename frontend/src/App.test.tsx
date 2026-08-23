import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import * as api from './api'
import { useAuthStore } from './store'

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'fetchRooms').mockResolvedValue([])
    vi.spyOn(api, 'fetchMyReservations').mockResolvedValue([])
    window.history.pushState({}, '', '/')
    useAuthStore.setState({
      token: null,
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      hydrated: true,
    })
  })

  it('redirects unauthenticated users to the login page', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument()
  })

  it('renders the home page for authenticated users', async () => {
    useAuthStore.setState({
      token: 'token-abc',
      user: {
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'teste@email.com',
        role: 'USER',
      },
      isAuthenticated: true,
      hydrated: true,
    })

    render(<App />)

    expect(await screen.findByText(/Bem-vindo, Usuário!/)).toBeInTheDocument()
  })

  it('redirects unknown routes to the home route', async () => {
    window.history.pushState({}, '', '/unknown-route')
    useAuthStore.setState({
      token: 'token-abc',
      user: {
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'teste@email.com',
        role: 'USER',
      },
      isAuthenticated: true,
      hydrated: true,
    })

    render(<App />)

    expect(await screen.findByText(/Bem-vindo, Usuário!/)).toBeInTheDocument()
  })
})
