import { redirect } from 'next/navigation'

/** `/super-admin/dashboard` is the documented address; the console itself lives at `/super-admin`. */
export default function SuperAdminDashboardAlias() {
  redirect('/super-admin')
}
