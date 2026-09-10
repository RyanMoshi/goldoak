import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/** Every old Super Agent address follows the pages into the console. */
export default function SuperAgentMovedDeep({ params }: { params: { rest?: string[] } }) {
  const path = (params.rest ?? []).map(encodeURIComponent).join('/')
  redirect(path ? `/super-admin/superagent/${path}` : '/super-admin/superagent')
}
