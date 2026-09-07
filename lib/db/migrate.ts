import { getSql } from '@/lib/db/client'
import { SCHEMA_SQL } from '@/lib/db/schema'

let ensured: Promise<void> | null = null

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

/**
 * Applies the embedded schema (every statement is IF NOT EXISTS). Runs once per server
 * instance, on first use, so a fresh database works without a manual step.
 */
export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      const sql = getSql()
      for (const statement of schemaStatements(SCHEMA_SQL)) {
        await sql.unsafe(statement)
      }
    })().catch((error) => {
      ensured = null
      throw error
    })
  }
  return ensured
}
