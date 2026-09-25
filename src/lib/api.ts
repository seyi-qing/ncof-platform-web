const BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://ncof-api.vercel.app/api/v1').replace(/\/$/, '')

export type Session = {
  access_token: string
  refresh_token?: string | null
  token_type?: string
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('ncof_session')
  try {
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function setSession(session: Session) {
  localStorage.setItem('ncof_session', JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem('ncof_session')
}

function formatError(body: unknown, status: number): string {
  if (body == null || body === '') return `Request failed (${status})`
  if (typeof body === 'string') return body
  if (typeof body === 'object') {
    const detail = (body as { detail?: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object' && 'msg' in item) {
            const loc = Array.isArray((item as { loc?: unknown }).loc)
              ? (item as { loc: unknown[] }).loc.join('.')
              : ''
            return loc ? `${loc}: ${(item as { msg: string }).msg}` : String((item as { msg: string }).msg)
          }
          return JSON.stringify(item)
        })
        .join('; ')
    }
    if (typeof (body as { message?: unknown }).message === 'string') {
      return (body as { message: string }).message
    }
  }
  return `Request failed (${status})`
}

async function refreshSession(): Promise<Session | null> {
  const current = getSession()
  if (!current?.refresh_token) return null
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: current.refresh_token }),
  })
  if (!res.ok) return null
  const next = (await res.json()) as Session
  setSession(next)
  return next
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const session = getSession()
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const isAuthPath = path.startsWith('/auth/login') || path.startsWith('/auth/refresh')
  if (session?.access_token && !isAuthPath) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  const res = await fetch(`${BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (res.status === 401 && retry && !isAuthPath && session?.refresh_token) {
    const next = await refreshSession()
    if (next) return api<T>(path, options, false)
    clearSession()
    if (typeof window !== 'undefined') window.location.href = '/login'
  }

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) throw new Error(formatError(body, res.status))
  return body as T
}

export { BASE as API_BASE }
