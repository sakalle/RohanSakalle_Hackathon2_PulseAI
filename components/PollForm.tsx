"use client";

import { useActionState } from "react";
import { pollNow } from "@/app/actions";

export function PollForm() {
  const [state, formAction, pending] = useActionState(pollNow, null);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="submit"
        disabled={pending}
        className="bg-signal px-4 py-2 text-sm font-semibold tracking-wide text-ink disabled:opacity-60"
      >
        {pending ? "Reading sources…" : "Poll horizon"}
      </button>
      {state ? (
        <p className="max-w-sm text-sm text-muted">
          {state.inserted} new · {state.duplicates} already seen
          {state.errors.length ? ` · ${state.errors.length} skipped` : ""}
        </p>
      ) : (
        <p className="max-w-sm text-sm text-muted">Reads the four live sources. A second poll does not duplicate.</p>
      )}
    </form>
  );
}
