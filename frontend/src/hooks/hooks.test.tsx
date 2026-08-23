import { render, screen, fireEvent } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useClickOutside } from './useClickOutside'
import { useEscapeKey } from './useEscapeKey'

function ClickOutsideHarness({ onOutsideClick, enabled }: { onOutsideClick: () => void; enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, onOutsideClick, enabled)

  return (
    <div>
      <div data-testid="inside" ref={ref}>
        Inside
      </div>
      <div data-testid="outside">Outside</div>
    </div>
  )
}

function EscapeKeyHarness({ onEscape, enabled }: { onEscape: () => void; enabled: boolean }) {
  useEscapeKey(onEscape, enabled)
  return <div>content</div>
}

describe('useClickOutside', () => {
  it('calls the handler when clicking outside the ref element', () => {
    const onOutsideClick = vi.fn()
    render(<ClickOutsideHarness onOutsideClick={onOutsideClick} enabled />)

    fireEvent.pointerDown(screen.getByTestId('outside'))

    expect(onOutsideClick).toHaveBeenCalledTimes(1)
  })

  it('does not call the handler when clicking inside the ref element', () => {
    const onOutsideClick = vi.fn()
    render(<ClickOutsideHarness onOutsideClick={onOutsideClick} enabled />)

    fireEvent.pointerDown(screen.getByTestId('inside'))

    expect(onOutsideClick).not.toHaveBeenCalled()
  })

  it('does nothing when disabled', () => {
    const onOutsideClick = vi.fn()
    render(<ClickOutsideHarness onOutsideClick={onOutsideClick} enabled={false} />)

    fireEvent.pointerDown(screen.getByTestId('outside'))

    expect(onOutsideClick).not.toHaveBeenCalled()
  })
})

describe('useEscapeKey', () => {
  it('calls the handler when Escape is pressed', () => {
    const onEscape = vi.fn()
    render(<EscapeKeyHarness onEscape={onEscape} enabled />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('ignores other keys', () => {
    const onEscape = vi.fn()
    render(<EscapeKeyHarness onEscape={onEscape} enabled />)

    fireEvent.keyDown(document, { key: 'Enter' })

    expect(onEscape).not.toHaveBeenCalled()
  })

  it('does nothing when disabled', () => {
    const onEscape = vi.fn()
    render(<EscapeKeyHarness onEscape={onEscape} enabled={false} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onEscape).not.toHaveBeenCalled()
  })
})
