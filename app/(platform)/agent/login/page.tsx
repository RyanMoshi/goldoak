import { redirect } from 'next/navigation'

/**
 * Agency staff ("agents") sign in through the main door with the Agency tab
 * selected. This alias exists so the documented `/agent/login` address works.
 */
export default function AgentLoginAlias() {
  redirect('/signin?as=agency')
}
