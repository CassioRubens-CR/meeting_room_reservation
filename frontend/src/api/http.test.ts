import { beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from './http'

describe('HTTP client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends JSON and the bearer token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      request<{ ok: boolean }, { name: string }>('/rooms', {
        method: 'POST',
        token: 'token-123',
        body: { name: 'Sala A' },
      }),
    ).resolves.toEqual({ ok: true })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({ name: 'Sala A' }),
    })
  })

  it('converts API error payloads into ApiError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ message: ['E-mail inválido', 'Senha obrigatória'] }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(request('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'E-mail inválido | Senha obrigatória',
    })
  })

  it('returns null when the response has no JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    await expect(request('/rooms/room-1', { method: 'DELETE' })).resolves.toBeNull()
  })

  it('falls back to a default message when the error payload has no message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(request('/rooms', { method: 'GET' })).rejects.toMatchObject({
      status: 500,
      message: 'Falha na requisicao',
    })
  })
})
