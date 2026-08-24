import { describe, expect, it } from 'vitest'
import * as hooks from './index'

describe('hooks/index.ts', () => {
  it('re-exports hooks', () => {
    expect(typeof hooks.useClickOutside).toBe('function')
    expect(typeof hooks.useEscapeKey).toBe('function')
  })
})
