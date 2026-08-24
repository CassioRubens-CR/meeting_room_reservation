import { describe, expect, it } from 'vitest'
import routes from './index'

describe('routes/index.tsx', () => {
  it('exports a non-empty routes array', () => {
    expect(Array.isArray(routes)).toBe(true)
    expect(routes.length).toBeGreaterThan(0)
  })
})
