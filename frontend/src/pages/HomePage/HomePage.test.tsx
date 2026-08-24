import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

describe('pages/HomePage/HomePage.tsx', () => {
  it('exports HomePage component', () => {
    expect(typeof HomePage).toBe('function')
  })
})
