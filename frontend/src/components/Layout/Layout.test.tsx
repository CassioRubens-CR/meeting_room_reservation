import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../store'
import { Layout } from '../Layout/Layout'

const baseUser = {
  id: 'user-1',
  name: 'Usuário Teste',
  email: 'teste@email.com',
  role: 'USER' as const,
}

function resetAuthStore() {
  useAuthStore.setState({
    token: 'token-abc',
    user: baseUser,
    loading: false,
    error: null,
    isAuthenticated: true,
    hydrated: true,
  })
}

describe('Layout', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  it('renders navigation links without admin links for regular users', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.queryByText('Administração')).not.toBeInTheDocument()
  })

  it('renders admin links for admin users', () => {
    useAuthStore.setState({ user: { ...baseUser, role: 'ADMIN' } })

    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Administração').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reservas ADMIN').length).toBeGreaterThan(0)
  })

  it('toggles the mobile menu', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    const toggle = screen.getByLabelText('Abrir menu')
    fireEvent.click(toggle)
    expect(screen.getByLabelText('Fechar menu')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Fechar menu'))
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })

  it('closes the mobile menu on outside click', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('Abrir menu'))
    expect(screen.getByLabelText('Fechar menu')).toBeInTheDocument()

    fireEvent.pointerDown(screen.getByText('Content'))
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })

  it('toggles the user menu and logs out', () => {
    const logoutSpy = vi.fn()
    useAuthStore.setState({ logout: logoutSpy })

    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('Abrir menu do usuário'))
    expect(screen.getByText('Meu perfil')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(logoutSpy).toHaveBeenCalledTimes(1)
  })

  it('closes the user menu when clicking "Meu perfil"', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('Abrir menu do usuário'))
    expect(screen.getByLabelText('Abrir menu do usuário')).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByText('Meu perfil'))
    expect(screen.getByLabelText('Abrir menu do usuário')).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes menus when pressing Escape', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('Abrir menu do usuário'))
    expect(screen.getByText('Meu perfil')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(screen.getByLabelText('Abrir menu do usuário'))
    expect(screen.getByLabelText('Abrir menu do usuário')).toBeInTheDocument()
  })

  it('shows admin links in the mobile menu and closes it on navigation', () => {
    useAuthStore.setState({ user: { ...baseUser, role: 'ADMIN' } })

    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('Abrir menu'))
    const mobileNav = screen.getByLabelText('Navegação mobile')
    expect(mobileNav).toBeInTheDocument()

    fireEvent.click(within(mobileNav).getByText('Administração'))
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })

  it('closes the mobile menu when clicking "Reservas ADMIN"', () => {
    useAuthStore.setState({ user: { ...baseUser, role: 'ADMIN' } })

    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('Abrir menu'))
    const mobileNav = screen.getByLabelText('Navegação mobile')

    fireEvent.click(within(mobileNav).getByText('Reservas ADMIN'))
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })

  it('closes the mobile menu when clicking a regular nav link', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('Abrir menu'))
    let mobileNav = screen.getByLabelText('Navegação mobile')
    fireEvent.click(within(mobileNav).getByText('Dashboard'))
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Abrir menu'))
    mobileNav = screen.getByLabelText('Navegação mobile')
    fireEvent.click(within(mobileNav).getByText('Salas'))
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Abrir menu'))
    mobileNav = screen.getByLabelText('Navegação mobile')
    fireEvent.click(within(mobileNav).getByText('Reservas'))
    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument()
  })
})
