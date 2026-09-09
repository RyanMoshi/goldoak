import { redirect } from 'next/navigation'

/** The platform console moved to /super-admin; old links and bookmarks still land. */
export default function LegacyAdminRedirect() {
  redirect('/super-admin')
}
