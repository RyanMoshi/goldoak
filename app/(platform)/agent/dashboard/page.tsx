import { redirect } from 'next/navigation'

/** The agent workspace lives at `/agency/today`; this is the documented alias. */
export default function AgentDashboardAlias() {
  redirect('/agency/today')
}
