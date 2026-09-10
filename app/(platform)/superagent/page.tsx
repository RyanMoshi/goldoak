import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/**
 * The assistant's pages moved into the one Super Admin console. Anything
 * pointing at the old address, including bookmarks and the sign-in redirect,
 * still lands in the right place.
 */
export default function SuperAgentMoved() {
  redirect('/super-admin/superagent')
}
