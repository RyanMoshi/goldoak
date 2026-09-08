import { Eye } from 'lucide-react'
import { stopImpersonationAction } from '@/lib/admin/actions'

/** Shown while the super admin is acting as someone else. Every action is logged against the admin. */
export function ImpersonationBanner({ adminName, userName }: { adminName: string; userName: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-gold px-4 py-2 text-[13px] font-semibold text-forest">
      <span className="inline-flex items-center gap-2">
        <Eye className="size-4" aria-hidden="true" /> {adminName} is viewing as {userName}. Everything done here is recorded in the audit log.
      </span>
      <form action={stopImpersonationAction}>
        <button type="submit" className="h-8 rounded-control bg-forest px-3 text-[12.5px] font-bold text-white hover:bg-forest-700 focus-ring">
          Return to admin
        </button>
      </form>
    </div>
  )
}
