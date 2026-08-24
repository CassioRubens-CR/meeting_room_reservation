import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('utils/formatDate', () => {
  it('formats a date using the Brazilian long date format', () => {
    expect(formatDate('2026-08-25T12:00:00')).toMatch(/25 de agosto de 2026/)
  })
})
