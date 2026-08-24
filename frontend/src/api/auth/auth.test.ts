import { describe, expect, it } from 'vitest'
import * as auth from './auth'

describe('api/auth/auth.ts', () => {
  it('exports auth api functions', () => {
    expect(typeof auth.register).toBe('function')
    expect(typeof auth.login).toBe('function')
    expect(typeof auth.changePassword).toBe('function')
  })
})
