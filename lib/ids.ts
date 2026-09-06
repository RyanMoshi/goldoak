import { randomBytes } from 'node:crypto'

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

/** Prefixed, URL-safe identifiers: usr_k3j9…, cli_… */
export function newId(prefix: string, length = 14): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return `${prefix}_${out}`
}

/** Human references: CLM-2026-00124 */
export function reference(prefix: string, sequence: number, year = new Date().getFullYear()): string {
  return `${prefix}-${year}-${String(sequence).padStart(5, '0')}`
}
