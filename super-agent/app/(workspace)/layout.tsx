import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { currentAgent, currentOrganization } from "@/data/organization";
import { formatLongDate } from "@/lib/format";

/** Today's date and greeting are request-time values; never freeze them at build. */
export const dynamic = "force-dynamic";

/**
 * Every workspace route shares the shell. The date is formatted here, on the
 * server, in the organisation's timezone so the client never guesses.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const dateLabel = formatLongDate(new Date());
  return (
    <AppShell organization={currentOrganization} agent={currentAgent} dateLabel={dateLabel}>
      {children}
    </AppShell>
  );
}
