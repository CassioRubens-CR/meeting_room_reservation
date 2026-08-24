import { describe, expect, it } from 'vitest'
import { getToday } from './getToday'

describe('utils/getToday', () => {
  it('returns the current date in ISO date format', () => {
    expect(getToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
