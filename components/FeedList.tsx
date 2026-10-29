"use client";

import { useMemo, useState } from "react";
import { SourceGlyph } from "@/components/visuals";

const CATEGORIES = ["all", "model", "api", "pricing", "research", "general"] as const;
const CHIP: Record<string, string> = {
  all: "bg-white text-slate-950",
  model: "bg-fuchsia-400 text-slate-950",
  api: "bg-cyan-300 text-slate-950",
  pricing: "bg-amber-300 text-slate-950",
  research: "bg-rose-400 text-white",
  general: "bg-lime-300 text-slate-950",
};
const FLOORS = [0, 40, 70, 85];

export type FeedCard = {
  id: string;
  title: string;
  summary: string;
  category: string;
  impactScore: number;
  sourceId: string;
  sourceName: string;
  summaryKind: string;
  scoreKind: string;
  publishedLabel: string;
  fetchedLabel: string;
  url: string;
};

export function FeedList({
  items,
  initialCategory,
  initialFloor,
}: {
  items: FeedCard[];
  initialCategory: string;
  initialFloor: number;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [floor, setFloor] = useState(initialFloor);

  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          item.impactScore >= floor && (category === "all" || item.category === category),
      ),
    [items, category, floor],
  );

  function choose(nextCategory: string, nextFloor: number) {
    setCategory(nextCategory);
    setFloor(nextFloor);
    const url = `/?category=${nextCategory}&min=${nextFloor}`;
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => choose(name, floor)}
              className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition hover:-translate-y-0.5 ${
                name === category ? CHIP[name] : "glass"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FLOORS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => choose(category, value)}
              className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition hover:-translate-y-0.5 ${
                value === floor ? "bg-white text-slate-950" : "glass"
              }`}
            >
              {value === 0 ? "Any score" : `${value}+`}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <section className="glass rounded-3xl px-5 py-12">
          <h2 className="font-serif text-3xl">Nothing in this slice.</h2>
          <p className="mt-3 text-muted">Stored scores stay as they are. Widen the filter to see them.</p>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          {visible.map((item) => {
            const hot = item.impactScore >= 70;
            return (
              <article
                key={item.id}
                className={`glass rounded-3xl px-5 py-5 ${hot ? "shadow-[inset_5px_0_0_#c4f54a]" : "shadow-[inset_5px_0_0_#22d3ee]"}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex gap-3">
                    <SourceGlyph id={item.sourceId} />
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                        {item.sourceName} · {item.category} · {item.summaryKind} · {item.scoreKind}
                      </p>
                      <h2 className="mt-2 font-serif text-3xl leading-tight tracking-tight">{item.title}</h2>
                    </div>
                  </div>
                  <p
                    className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl font-serif text-3xl leading-none ${
                      hot
                        ? "bg-gradient-to-br from-lime-300 to-amber-300 text-slate-950"
                        : "bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950"
                    }`}
                  >
                    {item.impactScore}
                  </p>
                </div>
                <p className="mt-4 max-w-3xl text-lg leading-7">{item.summary}</p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted">
                  {item.publishedLabel} · fetched {item.fetchedLabel} ·{" "}
                  <a href={item.url} className="underline" target="_blank" rel="noreferrer">
                    Source
                  </a>
                </p>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
