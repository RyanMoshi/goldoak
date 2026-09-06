import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64
const COST = 16384

function derive(password: string, salt: Buffer, length: number, cost: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, length, { N: cost }, (error, key) => {
      if (error) reject(error)
      else resolve(key)
    })
  })
}

/** Format: scrypt$N$salt$hash (base64). Same format as scripts/seed.mjs. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt, KEY_LENGTH, COST)
  return `scrypt$${COST}$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, cost, saltB64, hashB64] = stored.split('$')
  if (scheme !== 'scrypt' || !cost || !saltB64 || !hashB64) return false
  const salt = Buffer.from(saltB64, 'base64')
  const expected = Buffer.from(hashB64, 'base64')
  const key = await derive(password, salt, expected.length, Number(cost))
  return key.length === expected.length && timingSafeEqual(key, expected)
}
