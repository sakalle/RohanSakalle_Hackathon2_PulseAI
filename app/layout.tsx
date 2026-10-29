import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Fraunces, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseAI",
  description: "A desk for new AI announcements, scored and deduplicated.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const hookLocked = Boolean(process.env.N8N_INGEST_SECRET);

  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <header className="bg-mast text-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-5 py-5">
            <Link href="/" className="block">
              <span className="font-serif text-4xl leading-none tracking-tight">Pulse</span>
              <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.28em] text-signal">
                AI horizon
              </span>
            </Link>
            <nav className="flex gap-5 font-mono text-xs uppercase tracking-[0.18em]">
              <Link href="/" className="hover:text-signal">
                Desk
              </Link>
              <Link href="/preferences" className="hover:text-signal">
                Preferences
              </Link>
              <Link href="/inbox" className="hover:text-signal">
                Inbox
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 pb-10 font-mono text-[11px] leading-5 uppercase tracking-wide text-muted">
          Scores are a heuristic. Summaries are extracts until an LLM key is set. Alerts stay queued.
          {hookLocked ? " The n8n hook checks x-pulse-secret." : " The n8n hook is open until N8N_INGEST_SECRET is set."}
        </footer>
      </body>
    </html>
  );
}
