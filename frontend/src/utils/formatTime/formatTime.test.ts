import { describe, expect, it } from 'vitest'
import { formatTime } from './formatTime'

describe('utils/formatTime', () => {
  it('returns an already formatted time unchanged', () => {
    expect(formatTime('09:30')).toBe('09:30')
  })

  it('extracts the local time from an ISO datetime', () => {
    expect(formatTime('2026-08-25T09:30:00')).toBe('09:30')
  })
})
