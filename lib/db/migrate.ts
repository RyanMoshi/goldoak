import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getSql } from '@/lib/db/client'

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
 * Applies schema.sql (every statement is IF NOT EXISTS). Runs once per server
 * instance, on first use, so a fresh database works without a manual step.
 */
export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      const sql = getSql()
      const file = readFileSync(join(process.cwd(), 'lib', 'db', 'schema.sql'), 'utf8')
      for (const statement of schemaStatements(file)) {
        await sql.unsafe(statement)
      }
    })().catch((error) => {
      ensured = null
      throw error
    })
  }
  return ensured
}
