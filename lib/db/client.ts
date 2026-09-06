import postgres from 'postgres'

export type Sql = postgres.Sql

let cached: Sql | null = null

/**
 * Connection string precedence:
 *   1. DATABASE_URL (set by hand; the pooled Supabase URL is recommended on Vercel)
 *   2. POSTGRES_URL / POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING (Supabase Vercel integration)
 *   3. Built from POSTGRES_HOST / USER / PASSWORD / DATABASE when the URLs are empty
 * Empty strings count as unset, which is how the Supabase integration ships them
 * for projects whose password it does not know.
 */
export function connectionString(): string | undefined {
  const direct = [process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL, process.env.POSTGRES_URL_NON_POOLING].find(
    (v) => v && v.trim().length > 0,
  )
  if (direct) return direct.trim()

  const host = process.env.POSTGRES_HOST?.trim()
  const user = process.env.POSTGRES_USER?.trim()
  const password = process.env.POSTGRES_PASSWORD
  const database = process.env.POSTGRES_DATABASE?.trim() || 'postgres'
  if (host && user && password) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database}`
  }
  return undefined
}

/** True when a database is configured. Pages degrade gracefully when it is not. */
export function hasDatabase(): boolean {
  return Boolean(connectionString())
}

/**
 * Lazily creates the Postgres client so `next build` never needs a connection.
 * Supabase's pooler runs in transaction mode, so prepared statements are off.
 */
export function getSql(): Sql {
  if (cached) return cached
  const url = connectionString()
  if (!url) throw new DatabaseNotConfiguredError()
  cached = postgres(url, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? false : 'require',
  })
  return cached
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('The database is not connected yet. Set DATABASE_URL (pooled Supabase URL) in the environment.')
    this.name = 'DatabaseNotConfiguredError'
  }
}
