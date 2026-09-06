import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getSql } from '@/lib/db/client'

let ensured: Promise<void> | null = null

/**
 * Applies schema.sql (all statements are IF NOT EXISTS). Runs once per server
 * instance, on first use, so a fresh database works without a manual step.
 */
export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      const sql = getSql()
      const file = readFileSync(join(process.cwd(), 'lib', 'db', 'schema.sql'), 'utf8')
      const statements = file
        .split(/;\s*\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'))
      for (const statement of statements) {
        await sql.query(statement)
      }
    })().catch((error) => {
      ensured = null
      throw error
    })
  }
  return ensured
}
