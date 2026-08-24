import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmModal } from '../ConfirmModal/ConfirmModal'

describe('ConfirmModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmModal
        open={false}
        title="Excluir"
        message="Tem certeza?"
        confirmLabel="Excluir"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders title, message and error when open', () => {
    render(
      <ConfirmModal
        open
        title="Excluir sala"
        message="Deseja excluir?"
        confirmLabel="Excluir"
        error="Algo deu errado"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Excluir sala')).toBeInTheDocument()
    expect(screen.getByText('Deseja excluir?')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado')
  })

  it('calls onConfirm and onClose when buttons are clicked', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmModal
        open
        title="Excluir sala"
        message="Deseja excluir?"
        confirmLabel="Excluir"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('shows loading label and disables buttons when loading', () => {
    render(
      <ConfirmModal
        open
        title="Excluir sala"
        message="Deseja excluir?"
        confirmLabel="Excluir"
        loading
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Processando...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('closes when clicking the overlay but not the dialog', () => {
    const onClose = vi.fn()

    render(
      <ConfirmModal
        open
        title="Excluir sala"
        message="Deseja excluir?"
        confirmLabel="Excluir"
        onConfirm={vi.fn()}
        onClose={onClose}
      />,
    )

    fireEvent.mouseDown(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)

    onClose.mockClear()
    fireEvent.mouseDown(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close on overlay click when loading', () => {
    const onClose = vi.fn()

    render(
      <ConfirmModal
        open
        title="Excluir sala"
        message="Deseja excluir?"
        confirmLabel="Excluir"
        loading
        onConfirm={vi.fn()}
        onClose={onClose}
      />,
    )

    fireEvent.mouseDown(screen.getByRole('presentation'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when pressing Escape', () => {
    const onClose = vi.fn()

    render(
      <ConfirmModal
        open
        title="Excluir sala"
        message="Deseja excluir?"
        confirmLabel="Excluir"
        onConfirm={vi.fn()}
        onClose={onClose}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
