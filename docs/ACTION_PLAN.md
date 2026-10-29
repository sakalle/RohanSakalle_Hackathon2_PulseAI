# Action plan — PulseAI

## Outcome

A stranger runs the app locally, polls OpenAI, Hugging Face, Anthropic, and Hacker News, sees each new post once with an extract and a heuristic score, saves preferences, and sees a queued alert when the score qualifies. n8n can post the same item shape later. No key is required.

## Order of attack

| Phase | Goal | Cases closed | Exit |
|---|---|---|---|
| 0. Coverage | Confirm which feeds answer | D4 | Dated pass/fail in `decision.md`. Done 2026-10-28. |
| 1. Spine | F0–F5 on localhost | G1–G4, P1, P2, N1 | Poll, dedupe, preferences, inbox, and the hook work |
| 2. Rules | Invariants as tests | engine cases | `node --test` green |
| 3. Deploy | D8 | live URL | A public URL runs the same poll. Drop this first if time slips. |

If the deadline slips, drop phase 3 first. The spine stays.

## Phase 0

- [x] OpenAI news RSS. 200. 2026-10-28.
- [x] Hugging Face blog RSS. 200. 2026-10-28.
- [x] Anthropic RSS. Failed. Sitemap 200. 2026-10-28.
- [x] Hacker News RSS via hnrss.org. 200. 2026-10-28.
- [x] Reddit RSS. 403. Not seeded.

## Phase 1

- [x] Schema and seed of the four verified sources only
- [x] Engine tests, then poll, feed, preferences, inbox, and the hook
- [x] UI for those flows

## Later

- LLM summary adapter when D9 closes
- Telegram and email send when D10 closes
- Discord, Slack, interest learning, deal tracking
- Trend charts
