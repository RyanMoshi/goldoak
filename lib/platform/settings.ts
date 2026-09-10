import { getSql, hasDatabase } from '@/lib/db/client'
import { ensureSchema } from '@/lib/db/migrate'

/**
 * Platform-wide values that change while the app is running, so they cannot
 * live in the build's environment.
 *
 * The gateway's address is the reason this exists. A tunnel hands out a new
 * address every time it restarts, and rebuilding the deployment six times a
 * day to follow it would be absurd. The gateway publishes its address here
 * instead, and the platform reads it.
 *
 * Reads are cached briefly per server instance: this sits in the path of every
 * outbound WhatsApp message, and a database round trip per message would be
 * paid for nothing.
 */

const TTL_MS = 30_000
const cache = new Map<string, { value: string | null; at: number }>()

export async function getSetting(key: string): Promise<string | null> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value
  if (!hasDatabase()) return null
  try {
    await ensureSchema()
    const sql = getSql()
    const rows = await sql`SELECT value FROM platform_settings WHERE key = ${key} LIMIT 1`
    const value = rows[0]?.value ? String(rows[0].value) : null
    cache.set(key, { value, at: Date.now() })
    return value
  } catch (error) {
    console.error('setting read failed', key, error instanceof Error ? error.message : error)
    // A stale value beats no value when the database is briefly unreachable.
    return hit?.value ?? null
  }
}

export async function setSetting(key: string, value: string | null): Promise<void> {
  if (!hasDatabase()) return
  await ensureSchema()
  const sql = getSql()
  await sql`INSERT INTO platform_settings (key, value, updated_at) VALUES (${key}, ${value}, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`
  cache.set(key, { value, at: Date.now() })
}

/** Where the WhatsApp gateway is answering right now. */
export const GATEWAY_URL_KEY = 'waha_base_url'
