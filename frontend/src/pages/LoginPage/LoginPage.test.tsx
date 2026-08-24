import { describe, expect, it } from 'vitest'
import { LoginPage } from './LoginPage'

describe('pages/LoginPage/LoginPage.tsx', () => {
  it('exports LoginPage component', () => {
    expect(typeof LoginPage).toBe('function')
  })
})
