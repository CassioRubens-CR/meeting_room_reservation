import { describe, expect, it } from 'vitest'
import { RoomsPage } from './RoomsPage'

describe('pages/RoomsPage/RoomsPage.tsx', () => {
  it('exports RoomsPage component', () => {
    expect(typeof RoomsPage).toBe('function')
  })
})
