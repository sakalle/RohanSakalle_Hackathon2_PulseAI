type AlertRow = {
  id: string;
  status: string;
  score: number;
  title: string;
  email: string;
  sourceName: string;
  when: string;
};

export function InboxPanel({ alerts, failure }: { alerts: AlertRow[]; failure: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-200">Queue</p>
      <h1 className="hero-title mt-2 font-serif text-6xl leading-none tracking-tight">Not sent. Ready.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Discord gets a new item at 70 or above. Every row here stays queued in the inbox.
      </p>
      {failure ? <p className="mt-6 border border-rust bg-card px-4 py-3 text-rust">{failure}</p> : null}
      {!failure && alerts.length === 0 ? (
        <p className="glass mt-8 rounded-3xl px-5 py-10 text-muted">No alerts yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="glass grid gap-3 rounded-3xl px-5 py-4 sm:grid-cols-[auto_1fr_auto]">
              <p className="grid h-14 w-14 place-items-center rounded-2xl bg-signal font-serif text-2xl leading-none text-slate-950">
                {alert.score}
              </p>
              <div>
                <h2 className="font-serif text-2xl leading-tight">{alert.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {alert.email} · {alert.sourceName} · {alert.when}
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
