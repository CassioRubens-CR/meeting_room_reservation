import { describe, expect, it } from 'vitest'
import route from './index'

describe('routes/MyReservations/index.tsx', () => {
  it('exports route definition', () => {
    expect(typeof route.path).toBe('string')
    expect(route.path.length).toBeGreaterThan(0)
    expect(typeof route.componentName).toBe('string')
    expect(typeof route.isProtected).toBe('boolean')
  })
})
