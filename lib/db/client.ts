import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

export type Sql = NeonQueryFunction<false, false>

let cached: Sql | null = null

/** True when a database is configured. Pages degrade gracefully when it is not. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/**
 * Lazily creates the Neon HTTP client so that `next build` never needs a
 * connection string. Throws a clear error at request time if it is missing.
 */
export function getSql(): Sql {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new DatabaseNotConfiguredError()
  }
  cached = neon(url)
  return cached
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('The database is not connected yet. Set DATABASE_URL (Neon via the Vercel Marketplace).')
    this.name = 'DatabaseNotConfiguredError'
  }
}
