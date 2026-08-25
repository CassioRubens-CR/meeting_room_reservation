import { describe, expect, it } from 'vitest'
import { toTimeInputValue } from './toTimeInputValue'

describe('utils/toTimeInputValue', () => {
  it('returns an already formatted time unchanged', () => {
    expect(toTimeInputValue('09:30')).toBe('09:30')
  })

  it('converts an ISO datetime to the local time input format', () => {
    expect(toTimeInputValue('2026-08-25T09:30:00')).toBe('09:30')
  })
})