import { waitUntil } from '@vercel/functions'

/**
 * Runs work after the HTTP response has been sent. On Vercel the platform
 * keeps the function alive until the promise settles; elsewhere (local dev)
 * the promise simply runs detached. Returns false when scheduling is
 * impossible so the caller can fall back to a durable job.
 */
export function runInBackground(task: () => Promise<void>): boolean {
  try {
    const promise = task()
    try {
      waitUntil(promise)
    } catch {
      // Not on Vercel: let it run detached.
      promise.catch((error) => console.error('background task failed', error instanceof Error ? error.message : error))
    }
    return true
  } catch (error) {
    console.error('background scheduling failed', error instanceof Error ? error.message : error)
    return false
  }
}
