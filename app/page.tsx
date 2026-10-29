import { AppShell } from "@/components/AppShell";
import { FeedList } from "@/components/FeedList";
import { InboxPanel } from "@/components/InboxPanel";
import { PollForm } from "@/components/PollForm";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import { SourceGlyph, SourceRail } from "@/components/visuals";
import { getAlerts, getFeed, getSubscribers } from "@/lib/desk";

export const dynamic = "force-dynamic";

const CATEGORIES = ["all", "model", "api", "pricing", "research", "general"] as const;
const FLOORS = [0, 40, 70, 85];
const WASH: Record<string, string> = {
  openai: "from-emerald-400/50",
  anthropic: "from-rose-400/50",
  huggingface: "from-amber-300/50",
  hackernews: "from-orange-400/50",
};

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
  searchParams: Promise<{ category?: string; min?: string; error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const category = CATEGORIES.includes(params.category as (typeof CATEGORIES)[number])
    ? (params.category as (typeof CATEGORIES)[number])
    : "all";
  const requested = Number(params.min ?? 0);
  const floor = FLOORS.includes(requested) ? requested : 0;

  let desk: Awaited<ReturnType<typeof getFeed>> | null = null;
  let failure = "";
  let people: Awaited<ReturnType<typeof getSubscribers>> = [];
  let peopleFailure = "";
  let alerts: Awaited<ReturnType<typeof getAlerts>> = [];
  let alertsFailure = "";
  const [deskResult, peopleResult, alertsResult] = await Promise.allSettled([
    getFeed(),
    getSubscribers(),
    getAlerts(),
  ]);
  if (deskResult.status === "fulfilled") desk = deskResult.value;
  else failure = deskResult.reason instanceof Error ? deskResult.reason.message : String(deskResult.reason);
  if (peopleResult.status === "fulfilled") people = peopleResult.value;
  else peopleFailure = peopleResult.reason instanceof Error ? peopleResult.reason.message : String(peopleResult.reason);
  if (alertsResult.status === "fulfilled") alerts = alertsResult.value;
  else alertsFailure = alertsResult.reason instanceof Error ? alertsResult.reason.message : String(alertsResult.reason);

  const deskView = (
    <div className="flex flex-col gap-8">
      <section className="glass rise relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-300 via-fuchsia-500 to-amber-300 opacity-80 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-200">Today’s desk</p>
            <h1 className="hero-title mt-2 max-w-xl font-serif text-6xl leading-[0.92] tracking-tight">
              What moved, once.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted">
              Live AI sources, one score, and Discord when the score clears 70.
            </p>
          </div>
          <PollForm />
        </div>
      </section>

      <SourceRail />

      {failure ? (
        <p className="border border-rust bg-card px-4 py-3 text-rust">{failure}</p>
      ) : desk ? (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {desk.sources.map((source) => (
              <li key={source.id} className="glass rise relative flex items-start gap-3 overflow-hidden rounded-3xl px-4 py-4">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${WASH[source.id] ?? "from-cyan-300/40"} to-transparent`} />
                <SourceGlyph id={source.id} />
                <div className="relative">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{source.name}</p>
                <p className="mt-2 text-sm">{source.lastPolledAt ? stamp(source.lastPolledAt) : "Not polled yet"}</p>
                <p className={`mt-1 text-sm ${source.lastError ? "text-rust" : "text-muted"}`}>
                  {source.lastError ?? (source.lastPolledAt ? "Last read succeeded" : "Waiting")}
                </p>
                </div>
              </li>
            ))}
          </ul>

          {desk.total === 0 ? (
            <section className="glass rounded-3xl px-5 py-12">
              <h2 className="font-serif text-3xl">No signals yet.</h2>
              <p className="mt-3 max-w-lg text-muted">
                Poll reads OpenAI, Anthropic, Hugging Face, and Hacker News. Nothing is invented before that.
              </p>
            </section>
          ) : (
            <FeedList
              initialCategory={category}
              initialFloor={floor}
              items={desk.items.map((item) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                category: item.category,
                impactScore: item.impactScore,
                sourceId: item.sourceId,
                sourceName: item.source.name,
                summaryKind: item.summaryKind,
                scoreKind: item.scoreKind,
                publishedLabel: stamp(item.publishedAt),
                fetchedLabel: stamp(item.fetchedAt),
                url: item.url,
              }))}
            />
          )}
        </>
      ) : null}
    </div>
  );

  return (
    <AppShell
      initial={params.saved || params.error ? "preferences" : "desk"}
      hookLocked={Boolean(process.env.N8N_INGEST_SECRET)}
      desk={deskView}
      preferences={
        <PreferencesPanel
          people={people}
          error={params.error ?? ""}
          saved={Boolean(params.saved)}
          failure={peopleFailure}
        />
      }
      inbox={
        <InboxPanel
          failure={alertsFailure}
          alerts={alerts.map((alert) => ({
            id: alert.id,
            status: alert.status,
            score: alert.item.impactScore,
            title: alert.item.title,
            email: alert.subscriber.email,
            sourceName: alert.item.source.name,
            when: stamp(alert.createdAt),
          }))}
        />
      }
    />
  );
}
