"use client";

import { useState, type ReactNode } from "react";
import { Mark } from "@/components/visuals";

const TABS = [
  ["desk", "Desk"],
  ["preferences", "Preferences"],
  ["inbox", "Inbox"],
] as const;

type Tab = (typeof TABS)[number][0];

export function AppShell({
  initial,
  desk,
  preferences,
  inbox,
  hookLocked,
}: {
  initial: Tab;
  desk: ReactNode;
  preferences: ReactNode;
  inbox: ReactNode;
  hookLocked: boolean;
}) {
  const [view, setView] = useState<Tab>(initial);
  const panels: Record<Tab, ReactNode> = { desk, preferences, inbox };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-mast backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <button type="button" onClick={() => setView("desk")} className="flex items-center gap-3 text-left">
            <Mark />
            <span>
              <span className="block font-serif text-3xl leading-none tracking-tight">Pulse</span>
              <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300">
                AI horizon
              </span>
            </span>
          </button>
          <nav className="flex gap-2 font-mono text-xs uppercase tracking-[0.16em]">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`rounded-full border px-4 py-2 transition hover:-translate-y-0.5 ${
                  view === id
                    ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                    : "border-white/15 bg-white/5 hover:border-cyan-300 hover:text-cyan-200"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        {(Object.keys(panels) as Tab[]).map((id) => (
          <div key={id} className={view === id ? "" : "hidden"}>
            {panels[id]}
          </div>
        ))}
      </main>
      <footer className="mx-auto max-w-6xl px-5 pb-10 font-mono text-[11px] leading-5 uppercase tracking-wide text-muted">
        Scores are a heuristic. Summaries are extracts until an LLM key is set. Inbox alerts stay queued.
        Items scoring 70 or more are posted to Discord when the n8n webhook is set.
        {hookLocked ? " The n8n hook checks x-pulse-secret." : " The n8n hook is open until N8N_INGEST_SECRET is set."}
      </footer>
    </>
  );
}
