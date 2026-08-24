import { describe, expect, it } from 'vitest'
import { useClickOutside } from './useClickOutside'

describe('hooks/useClickOutside/useClickOutside.ts', () => {
  it('exports useClickOutside hook', () => {
    expect(typeof useClickOutside).toBe('function')
  })
})
