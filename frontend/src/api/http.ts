const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export interface ApiErrorPayload {
  statusCode?: number
  message?: string | string[]
  error?: string
  path?: string
  timestamp?: string
}

export class ApiError extends Error {
  status: number
  payload: ApiErrorPayload | null

  constructor(status: number, message: string, payload: ApiErrorPayload | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function getErrorMessage(payload: ApiErrorPayload | null, fallback: string): string {
  if (!payload?.message) {
    return fallback
  }

  return Array.isArray(payload.message)
    ? payload.message.join(' | ')
    : payload.message
}

export async function request<T, TBody = unknown>(
  path: string,
  init?: Omit<RequestInit, 'body' | 'headers'> & {
    body?: TBody
    token?: string
    headers?: HeadersInit
  },
): Promise<T> {
  const { body, token, headers, ...rest } = init ?? {}

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const hasJson = response.headers
    .get('content-type')
    ?.includes('application/json')

  const data = hasJson ? ((await response.json()) as unknown) : null

  if (!response.ok) {
    const payload = (data as ApiErrorPayload | null) ?? null
    throw new ApiError(
      response.status,
      getErrorMessage(payload, 'Falha na requisicao'),
      payload,
    )
  }

  return data as T
}
