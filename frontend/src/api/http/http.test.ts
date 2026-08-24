import { describe, expect, it } from 'vitest'
import { ApiError, request } from './http'

describe('api/http/http.ts', () => {
  it('exports request and ApiError', () => {
    expect(typeof request).toBe('function')
    expect(typeof ApiError).toBe('function')
  })
})
