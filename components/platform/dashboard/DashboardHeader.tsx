export function DashboardHeader({ greeting, firstName, organizationName }: { greeting: string; firstName: string; organizationName: string }) {
  return (
    <div className="animate-fade-up">
      <p className="label-caps flex items-center gap-2 text-gold-700">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
        Operational briefing · {organizationName}
      </p>
      <h2 className="mt-2 font-serif text-[28px] font-medium leading-9 tracking-[-0.01em] text-forest sm:text-[34px] sm:leading-[2.75rem]">
        {greeting}, {firstName}.
      </h2>
      <p className="mt-1 text-[15px] text-ink-muted">Here&apos;s what needs your attention today.</p>
    </div>
  )
}
