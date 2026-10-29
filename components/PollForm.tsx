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
        className="rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 px-5 py-3 text-sm font-black tracking-wide text-slate-950 shadow-lg shadow-fuchsia-500/30 transition hover:scale-105 disabled:opacity-60"
      >
        {pending ? "Reading sources…" : "Poll horizon"}
      </button>
      {state ? (
        <p className="max-w-sm text-sm text-muted">
          {state.inserted} new · {state.duplicates} already seen
          {state.discord ? ` · ${state.discord} sent to Discord` : ""}
          {state.errors.length ? ` · ${state.errors.length} skipped` : ""}
        </p>
      ) : (
        <p className="max-w-sm text-sm text-muted">Reads the four live sources. A second poll does not duplicate.</p>
      )}
    </form>
  );
}
