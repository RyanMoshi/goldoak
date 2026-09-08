import { createHash } from 'crypto'
import { getSql } from '@/lib/db/client'
import { SCHEMA_SQL } from '@/lib/db/schema'

let ensured: Promise<void> | null = null

/** Fingerprint of the embedded schema; stored in the database once that exact text has been applied. */
export const SCHEMA_VERSION = createHash('sha1').update(SCHEMA_SQL).digest('hex').slice(0, 16)

/** Splits schema.sql into statements, dropping comment lines first so a leading comment never swallows a statement. */
export function schemaStatements(file: string): string[] {
  return file
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

const META_TABLE = `CREATE TABLE IF NOT EXISTS schema_meta (id int PRIMARY KEY, version text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now());`

async function apply(): Promise<void> {
  const sql = getSql()
  // Fast path: a single round trip when this exact schema is already in place.
  // Every serverless instance runs this once, so it has to be cheap.
  try {
    const rows = await sql`SELECT version FROM schema_meta WHERE id = 1`
    if (rows[0]?.version === SCHEMA_VERSION) return
  } catch {
    // schema_meta does not exist yet: first run on this database.
  }
  try {
    // Whole file in one simple-protocol request (no parameters, so multi-statement is allowed).
    await sql.unsafe(`${META_TABLE}\n${SCHEMA_SQL}`)
  } catch (error) {
    console.warn('schema: single-request apply failed, falling back to statements', error instanceof Error ? error.message : error)
    await sql.unsafe(META_TABLE)
    for (const statement of schemaStatements(SCHEMA_SQL)) {
      await sql.unsafe(statement)
    }
  }
  await sql`INSERT INTO schema_meta (id, version) VALUES (1, ${SCHEMA_VERSION})
    ON CONFLICT (id) DO UPDATE SET version = EXCLUDED.version, applied_at = now()`
}

/**
 * Applies the embedded schema (every statement is IF NOT EXISTS / additive).
 * Runs once per server instance, on first use, so a fresh database works
 * without a manual step, and costs one query when nothing has changed.
 */
export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = apply().catch((error) => {
      ensured = null
      throw error
    })
  }
  return ensured
}
