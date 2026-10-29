import Link from "next/link";
import { PollForm } from "@/components/PollForm";
import { getFeed } from "@/lib/desk";

export const dynamic = "force-dynamic";

const CATEGORIES = ["all", "model", "api", "pricing", "research", "general"] as const;
const FLOORS = [0, 40, 70, 85];

function stamp(value: Date | null) {
  if (!value) return "date unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; min?: string }>;
}) {
  const params = await searchParams;
  const category = CATEGORIES.includes(params.category as (typeof CATEGORIES)[number])
    ? (params.category as (typeof CATEGORIES)[number])
    : "all";
  const requested = Number(params.min ?? 0);
  const floor = FLOORS.includes(requested) ? requested : 0;

  let desk: Awaited<ReturnType<typeof getFeed>> | null = null;
  let failure = "";
  try {
    desk = await getFeed(category, floor);
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Today’s desk</p>
          <h1 className="mt-2 max-w-xl font-serif text-5xl leading-[0.95] tracking-tight">
            What moved, once.
          </h1>
        </div>
        <PollForm />
      </div>

      {failure ? (
        <p className="border border-rust bg-card px-4 py-3 text-rust">{failure}</p>
      ) : desk ? (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {desk.sources.map((source) => (
              <li key={source.id} className="border border-line bg-card px-3 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{source.name}</p>
                <p className="mt-2 text-sm">{source.lastPolledAt ? stamp(source.lastPolledAt) : "Not polled yet"}</p>
                <p className={`mt-1 text-sm ${source.lastError ? "text-rust" : "text-muted"}`}>
                  {source.lastError ?? (source.lastPolledAt ? "Last read succeeded" : "Waiting")}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((name) => (
                <Link
                  key={name}
                  href={`/?category=${name}&min=${floor}`}
                  className={`border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${
                    name === category ? "border-ink bg-ink text-paper" : "border-line bg-card"
                  }`}
                >
                  {name}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {FLOORS.map((value) => (
                <Link
                  key={value}
                  href={`/?category=${category}&min=${value}`}
                  className={`border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${
                    value === floor ? "border-ink bg-ink text-paper" : "border-line bg-card"
                  }`}
                >
                  {value === 0 ? "Any score" : `${value}+`}
                </Link>
              ))}
            </div>
          </div>

          {desk.total === 0 ? (
            <section className="border border-dashed border-line px-5 py-12">
              <h2 className="font-serif text-3xl">No signals yet.</h2>
              <p className="mt-3 max-w-lg text-muted">
                Poll reads OpenAI, Anthropic, Hugging Face, and Hacker News. Nothing is invented before that.
              </p>
            </section>
          ) : desk.items.length === 0 ? (
            <section className="border border-dashed border-line px-5 py-12">
              <h2 className="font-serif text-3xl">Nothing in this slice.</h2>
              <p className="mt-3 text-muted">Stored scores stay as they are. Widen the filter to see them.</p>
            </section>
          ) : (
            <section className="flex flex-col gap-4">
              {desk.items.map((item) => {
                const hot = item.impactScore >= 70;
                return (
                  <article
                    key={item.id}
                    className={`border border-line bg-card px-5 py-5 ${hot ? "shadow-[inset_4px_0_0_#16180f]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                          {item.source.name} · {item.category} · {item.summaryKind} · {item.scoreKind}
                        </p>
                        <h2 className="mt-2 font-serif text-3xl leading-tight tracking-tight">{item.title}</h2>
                      </div>
                      <p className={`shrink-0 px-2 py-1 font-serif text-4xl leading-none ${hot ? "bg-signal" : "text-muted"}`}>
                        {item.impactScore}
                      </p>
                    </div>
                    <p className="mt-4 max-w-3xl text-lg leading-7">{item.summary}</p>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted">
                      {stamp(item.publishedAt)} · fetched {stamp(item.fetchedAt)} ·{" "}
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
      ) : null}
    </div>
  );
}
