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

const WORDS = ['Mango', 'Baobab', 'Safari', 'Zebra', 'Acacia', 'Kilima', 'Savanna', 'Jambo', 'Coral', 'Cedar', 'Lotus', 'Maple', 'Nomad', 'Onyx', 'Pearl', 'Quartz', 'Rhino', 'Solar', 'Tembo', 'Amber', 'Bantu', 'Delta', 'Ember', 'Falcon', 'Gazelle', 'Harbor', 'Indigo', 'Jade', 'Karibu', 'Lemon', 'Meadow', 'Nyota', 'Orbit', 'Pepper', 'Raven', 'Simba', 'Topaz', 'Umoja', 'Velvet', 'Willow']

/**
 * A temporary password a person can type from a phone screen: a familiar word
 * plus four digits, no ambiguous characters (no 0/O, 1/l/I). ~1.3 million
 * combinations, rate-limited sign-in, and it must be changed on first login.
 */
export function generateTempPassword(): string {
  const bytes = randomBytes(4)
  const word = WORDS[bytes[0] % WORDS.length]
  const digits = String(((bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) % 7000 + 2000)
  return `${word}${digits.replace(/[01]/g, (d) => (d === '0' ? '3' : '7'))}`
}
