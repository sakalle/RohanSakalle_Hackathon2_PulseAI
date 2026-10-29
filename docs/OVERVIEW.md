# PulseAI — Overview

Read this first.

PulseAI is a local-first desk that turns AI announcements into one deduplicated feed with a code-computed impact score. n8n can push items in later. Alerts queue in the app until a real channel exists.

## 1. How the documents are grouped

| Group | Files | Role |
|---|---|---|
| Why and what | Brief image, `docs/SUMMARY.md`, `docs/decision.md` | `decision.md` wins |
| Behavior | `docs/flow.md` | Happy, edge, failure |
| Process | `docs/cursor.md`, `docs/ACTION_PLAN.md` | How a session runs |
| Engineering reference | `components-and-math.md`, `research/Reverse-Engineering-Notes.md` | Borrow versus invent |
| External, read-only | `research/repos/**` | None cloned. No reference repo was named. |

No method deck was in the sources. `docs/slides-actions.md` is omitted on purpose.

## 2. MUST

| # | What | Anchor |
|---|---|---|
| 1 | Poll four verified sources | D4, F1, G2 |
| 2 | One row per URL | D5, G3 |
| 3 | Heuristic score and category, extract summary | D3, D6, G4 |
| 4 | Preference save and queued inbox alert | D5, D7, P1, P2 |
| 5 | n8n ingest hook, same engine | D1, N1 |
| 6 | Typed source errors, no invented headlines | D6, F0 |

## 3. Priority 2

- LLM summaries when a key exists (D9)
- Telegram and email delivery (D10)
- Daily and weekly digest sending
- Disable a source from the UI

## 4. SKIP

- Discord, Slack, WhatsApp, mobile push (brief future list)
- Interest learning from clicks
- Deal and pricing-offer tracking
- Login and billing
- Reddit (403 on 2026-10-28)

## 5. ADD

| Feature | Why it fits | Cost |
|---|---|---|
| Hacker News as a fourth source | Solution section names it, and the RSS returned 200 | Small |
| Inbox of queued alerts | Makes the threshold visible without a bot | Small |
| Secret header on the n8n hook | Needed before a public URL | Small |

## 6. Gaps that block a slice early

| Gap | Status | Where |
|---|---|---|
| Public host and database | Open | D8, phase 3 |
| Model vendor | Open, extract used | D9 |
| Telegram and SMTP | Open, status stays queued | D10 |
| Hook secret | Open, documented for deploy | D11 |
