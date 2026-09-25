import { getSession } from './api'

export type Role = 'admin' | 'executive' | 'treasurer' | 'secretary' | 'auditor' | 'member'

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getRole(): Role | 'unknown' {
  const s = getSession()
  if (!s?.access_token) return 'unknown'
  const p = decodeJwtPayload(s.access_token)
  const role = p?.role
  return typeof role === 'string' ? (role as Role) : 'unknown'
}

export function getUserId(): string | null {
  const s = getSession()
  if (!s?.access_token) return null
  const p = decodeJwtPayload(s.access_token)
  return typeof p?.sub === 'string' ? p.sub : null
}
