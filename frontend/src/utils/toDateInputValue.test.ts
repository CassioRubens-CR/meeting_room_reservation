import { describe, expect, it } from 'vitest'
import { toDateInputValue } from './toDateInputValue'

describe('utils/toDateInputValue', () => {
  it('returns an already formatted date unchanged', () => {
    expect(toDateInputValue('2026-08-25')).toBe('2026-08-25')
  })

  it('converts an ISO datetime to the local date input format', () => {
    expect(toDateInputValue('2026-08-25T12:00:00')).toBe('2026-08-25')
  })
})