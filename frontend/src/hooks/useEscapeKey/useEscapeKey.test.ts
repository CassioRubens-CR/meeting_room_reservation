import { describe, expect, it } from 'vitest'
import { useEscapeKey } from './useEscapeKey'

describe('hooks/useEscapeKey/useEscapeKey.ts', () => {
  it('exports useEscapeKey hook', () => {
    expect(typeof useEscapeKey).toBe('function')
  })
})
