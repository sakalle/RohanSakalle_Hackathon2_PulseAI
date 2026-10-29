import { getAlerts } from "@/lib/desk";

export const dynamic = "force-dynamic";

function stamp(value: Date | null) {
  if (!value) return "date unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function Inbox() {
  let alerts: Awaited<ReturnType<typeof getAlerts>> = [];
  let failure = "";
  try {
    alerts = await getAlerts();
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Queue</p>
      <h1 className="mt-2 font-serif text-5xl leading-none tracking-tight">Not sent. Ready.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Telegram and email wait for a real channel. Every row here stays queued.
      </p>
      {failure ? <p className="mt-6 border border-rust bg-card px-4 py-3 text-rust">{failure}</p> : null}
      {!failure && alerts.length === 0 ? (
        <p className="mt-8 border border-dashed border-line px-5 py-10 text-muted">No alerts yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="grid gap-3 border border-line bg-card px-5 py-4 sm:grid-cols-[auto_1fr_auto]">
              <p className="bg-signal px-2 py-1 font-serif text-3xl leading-none">{alert.item.impactScore}</p>
              <div>
                <h2 className="font-serif text-2xl leading-tight">{alert.item.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {alert.subscriber.email} · {alert.item.source.name} · {stamp(alert.createdAt)}
                </p>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-widest">{alert.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
