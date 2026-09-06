/**
 * Stateless signed session tokens. Uses Web Crypto only, so the same code
 * runs in the edge middleware and in Node server components.
 */

export type Role = 'agency' | 'client'

export interface SessionPayload {
  /** user id */
  uid: string
  role: Role
  /** organisation id (agency users; clients carry their agency's org) */
  oid: string
  name: string
  /** unix seconds */
  exp: number
}

export const SESSION_COOKIE = 'goldoak_session'
export const SESSION_DAYS = 7

const encoder = new TextEncoder()

function secret(): string {
  const value = process.env.AUTH_SECRET
  if (value && value.length >= 16) return value
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be set in production (at least 16 characters).')
  }
  return 'goldoak-development-secret-do-not-use-in-production'
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  const b64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary')
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

export async function signSession(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const full: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400 }
  const body = toBase64Url(encoder.encode(JSON.stringify(full)))
  const signature = await crypto.subtle.sign('HMAC', await key(), encoder.encode(body))
  return `${body}.${toBase64Url(new Uint8Array(signature))}`
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  try {
    const valid = await crypto.subtle.verify('HMAC', await key(), fromBase64Url(sig), encoder.encode(body))
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
    if (payload.role !== 'agency' && payload.role !== 'client') return null
    return payload
  } catch {
    return null
  }
}

export function homeFor(role: Role): string {
  return role === 'agency' ? '/agency/today' : '/portal'
}
