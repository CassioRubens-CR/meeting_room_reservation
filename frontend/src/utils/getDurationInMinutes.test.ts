import { describe, expect, it } from 'vitest'
import { getDurationInMinutes } from './getDurationInMinutes'

describe('utils/getDurationInMinutes', () => {
  it('calculates the duration between two times', () => {
    expect(getDurationInMinutes('09:15', '10:45')).toBe(90)
  })

  it('returns a negative duration when the end is before the start', () => {
    expect(getDurationInMinutes('13:00', '10:00')).toBe(-180)
  })
})