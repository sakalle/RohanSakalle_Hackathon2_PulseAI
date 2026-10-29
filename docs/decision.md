# Decisions — PulseAI

When a row changes, edit it here and leave the old line under it.

## Settled

### D1. The app is the product

**Choice.** Next.js UI, route handlers, and a database. n8n is an optional caller of `POST /api/hooks/n8n`.

**Why.** The brief specified n8n. The user update on 2026-10-28 requires a full stack first and n8n later.

**Rejected shape.** An n8n-only workflow. It cannot be the frontend, and it cannot be demoed before the organizer’s n8n host exists.

### D2. One Node app

**Choice.** TypeScript, Next.js App Router, Tailwind, Prisma, SQLite file `prisma/dev.db` for the local demo.

**Why.** One language, one process, no second deploy. The schema is ordinary relational tables and can move to Postgres by changing the Prisma provider when a `DATABASE_URL` exists.

**Rejected shape.** A Python worker beside Next, or Supabase as a hard dependency before an account exists. Remote Postgres stays the deploy step, not the first run.

### D3. Score in code, words in an adapter

**Choice.** Category and impact are deterministic functions in `lib/engine.mjs`. A model may later replace the summary only. Until `LLM_API_KEY` is set, `summaryKind` is `extract`.

**Why.** The demo must run with no paid key. The brief’s JSON shape (summary, category, impact, threshold) still holds.

**Rejected shape.** Calling Gemini or OpenAI on the happy path. No key was provided, and a missing model must not blank the feed.

### D4. Feeds we actually saw

**Choice.** Seed only sources checked on 2026-10-28.

| Source id | Kind | URL | Result |
|---|---|---|---|
| openai | rss | `https://openai.com/news/rss.xml` | HTTP 200, RSS |
| huggingface | rss | `https://huggingface.co/blog/feed.xml` | HTTP 200, RSS |
| hackernews | rss | `https://hnrss.org/newest?q=AI&points=80` | HTTP 200, RSS |
| anthropic | sitemap | `https://www.anthropic.com/sitemap.xml` | HTTP 200, XML urlset. RSS URLs closed or redirected |

Anthropic items are `https://www.anthropic.com/news/…` and `/research/…` locs, newest `lastmod` first, capped at 12 per poll. Title comes from the slug until the page `<title>` is read. A failed page is skipped with a typed error on that item and does not fail the poll.

**Why.** Phase 0 evidence from this machine. The brief named Anthropic, OpenAI, and Hugging Face. Hacker News is the community feed the solution section also names, and its RSS responded.

**Rejected shape.** Inventing Anthropic headlines. Reddit returned 403 and is not seeded.

### D5. Dedupe and alerts

**Choice.** Unique key is the canonical URL (lowercase host, no hash, no trailing slash). A second sight updates nothing and alerts nobody. An instant subscriber gets one `queued` alert when the score is at least their `minImpact`, the source is selected, and they are not paused. Daily and weekly save the preference and do not send. Default minimum is 70, stored so it can change without a rewrite.

**Why.** Brief: seen-items registry, threshold, `/frequency`, `/pause`, provider choice.

**Rejected shape.** Marking queued rows as sent. Nothing is sent until a bot token or SMTP URL exists.

### D6. Honest labels

**Choice.** Each item stores `summaryKind` (`extract` or `llm`), `scoreKind` (`heuristic`), and `fetchedAt`. The UI says so. A missing published date does not count as “just now”; recency points stay 0 and the row shows “date unknown”.

**Why.** No paid key, and sitemap rows can lack a precise time.

### D7. No login on the spine

**Choice.** The desk is open on the demo. A subscriber is the email they submit. One email is one row.

**Why.** The brief’s subscriber is a preference record, not an auth product. Login would block the demo.

**Rejected shape.** Supabase Auth before the feed works.

## Open — do not invent these

| ID | Question | What we do while it is open | Who closes it |
|---|---|---|---|
| D8 | Which host, and SQLite versus hosted Postgres? | Local `npm run dev` with the SQLite file. Do not claim a live URL. | User, at deploy |
| D9 | Gemini or OpenAI for summaries? | `extract` until `LLM_API_KEY` and `LLM_BASE_URL` are both set | User, when a key exists |
| D10 | Telegram bot and SMTP? | Alerts stay `queued`. The inbox page shows them. | User, or n8n later |
| D11 | Shared secret for the n8n hook? | If `N8N_INGEST_SECRET` is empty, the hook is open on localhost and the UI says so. If set, require header `x-pulse-secret`. | User, before any public deploy |

## Provider stance

One internal item shape: `title`, `url`, `sourceId`, `publishedAt` (or null), `text`, `summary`, `summaryKind`, `category`, `impactScore`, `scoreKind`.

Typed error: `{ provider, url, cause }`. A bad source does not wipe items already saved in that poll. Never store a failure as impact 0. Never drop the error string.

## Data we store

| Record | Fields that matter | We do not store |
|---|---|---|
| Source | id, name, kind, url, weight, enabled, lastPolledAt, lastError | Credentials |
| Item | url, title, text excerpt, summary, summaryKind, category, impactScore, scoreKind, publishedAt, fetchedAt | Full HTML pages, API keys |
| Subscriber | email, provider ids, frequency, paused, minImpact | Passwords, chat ids |
| Alert | item, subscriber, channel `inbox`, status `queued`, reason | A fake “sent” receipt |
| Setting | `defaultMinImpact` | Secrets |

## Admin settings

`Setting.defaultMinImpact` (70). Source rows can be disabled. `N8N_INGEST_SECRET`, `LLM_API_KEY`, `LLM_BASE_URL` are env keys, not rows.

## Decision log

| When | Change |
|---|---|
| 2026-10-28 | Initial set. D8–D11 left open on purpose. Feed checks recorded under D4. Anthropic RSS failed (connection closed / 308). Sitemap passed. Reddit 403, not seeded. |
| 2026-10-28 | Category rule widened. A title that names an API stays `api`. `cost`, `revenue`, and a dollar amount count as `pricing`. The first 12 posts had not used the words “price” or “api”, so those chips were empty. No model API is called: `LLM_API_KEY` is still empty. |
