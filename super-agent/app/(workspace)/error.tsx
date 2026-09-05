"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to the error tracker once one is configured. Never log client data.
    console.error("Workspace error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-12">
      <Card>
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-error/8 text-error">
            <AlertTriangle className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-serif text-[18px] font-bold text-forest">This view didn&apos;t load</h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              Nothing was changed. Try again; if it keeps happening, note the reference below and let support know.
            </p>
            {error.digest ? (
              <p className="mt-2 font-mono text-[11.5px] text-ink-faint">Ref {error.digest}</p>
            ) : null}
            <Button variant="forest" className="mt-4" onClick={reset}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
