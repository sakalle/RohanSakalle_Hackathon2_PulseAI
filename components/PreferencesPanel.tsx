import { saveSubscriber } from "@/app/actions";
import { SOURCES } from "@/lib/catalog.mjs";

type Person = {
  id: string;
  email: string;
  frequency: string;
  minImpact: number;
  paused: boolean;
  providers: string;
};

export function PreferencesPanel({
  people,
  error,
  saved,
  failure,
}: {
  people: Person[];
  error: string;
  saved: boolean;
  failure: string;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-200">Subscriber</p>
        <h1 className="hero-title mt-2 font-serif text-6xl leading-none tracking-tight">Who gets the next one.</h1>
        <p className="mt-4 max-w-xl text-lg leading-7 text-muted">
          Instant matches at or above the minimum become a queued inbox alert. Daily and weekly are saved.
          Digests are not sent yet.
        </p>

        {error ? <p className="mt-4 border border-rust bg-card px-4 py-3 text-rust">{error}</p> : null}
        {saved ? <p className="mt-4 border border-ink bg-signal px-4 py-3">Saved. Alerts start with the next new item.</p> : null}
        {failure ? <p className="mt-4 border border-rust bg-card px-4 py-3 text-rust">{failure}</p> : null}

        <form action={saveSubscriber} className="glass mt-6 flex max-w-xl flex-col gap-5 rounded-3xl px-5 py-5">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest">Email</span>
            <input
              name="email"
              type="email"
              required
              className="border border-line bg-paper px-3 py-2 outline-none"
              placeholder="ada@lab.ai"
            />
          </label>
          <fieldset className="flex flex-col gap-2">
            <legend className="font-mono text-[11px] uppercase tracking-widest">Providers</legend>
            {SOURCES.map((source) => (
              <label key={source.id} className="flex items-center gap-2">
                <input type="checkbox" name="providers" value={source.id} defaultChecked />
                <span>{source.name}</span>
              </label>
            ))}
          </fieldset>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest">Frequency</span>
            <select name="frequency" defaultValue="instant" className="border border-line bg-paper px-3 py-2">
              <option value="instant">Instant</option>
              <option value="daily">Daily digest</option>
              <option value="weekly">Weekly digest</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest">Minimum impact</span>
            <input
              name="minImpact"
              type="number"
              min={0}
              max={100}
              defaultValue={70}
              className="border border-line bg-paper px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="paused" />
            <span>Pause alerts</span>
          </label>
          <button type="submit" className="rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 px-4 py-3 text-sm font-black text-slate-950">
            Save preference
          </button>
        </form>
      </section>

      <aside className="flex flex-col gap-6">
        <section className="glass rounded-3xl px-5 py-5">
          <h2 className="font-serif text-2xl">Saved</h2>
          {people.length === 0 ? (
            <p className="mt-3 text-muted">No subscribers yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {people.map((person) => (
                <li key={person.id} className="border-t border-line pt-3">
                  <p className="font-semibold">{person.email}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted">
                    {person.frequency} · min {person.minImpact}
                    {person.paused ? " · paused" : ""} · {JSON.parse(person.providers).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="glass rounded-3xl bg-gradient-to-br from-fuchsia-500/30 to-cyan-400/20 px-5 py-5">
          <h2 className="font-serif text-2xl">Discord</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            A new item scoring 70 or more is posted to the Discord workflow. Inbox rows stay queued.
          </p>
          <pre className="mt-4 overflow-x-auto font-mono text-xs leading-5">{`POST /api/hooks/n8n
{
  "sourceId": "openai",
  "title": "New model API",
  "url": "https://openai.com/news/example",
  "publishedAt": "2026-10-28T00:00:00.000Z",
  "text": "A release with pricing."
}`}</pre>
        </section>
      </aside>
    </div>
  );
}
