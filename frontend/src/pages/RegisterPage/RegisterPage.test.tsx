import { describe, expect, it } from 'vitest'
import { RegisterPage } from './RegisterPage'

describe('pages/RegisterPage/RegisterPage.tsx', () => {
  it('exports RegisterPage component', () => {
    expect(typeof RegisterPage).toBe('function')
  })
})
