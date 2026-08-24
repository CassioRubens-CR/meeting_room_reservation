import { describe, expect, it } from 'vitest'
import { ProfilePage } from './ProfilePage'

describe('pages/ProfilePage/ProfilePage.tsx', () => {
  it('exports ProfilePage component', () => {
    expect(typeof ProfilePage).toBe('function')
  })
})
