# PulseAI — Source Summary

**Date:** 2026-10-28
**Sources:** Hackathon brief image in chat, “PulseAI: The Ultimate AI Horizon Tracker” (technical brief and reference specification). No other file was in the workspace.

Decisions live in `decision.md`. Journeys live in `flow.md`. How to build lives in `cursor.md`. Ordered work lives in `ACTION_PLAN.md`.

## 1. What each source forces

| Source | What it is | What it forces the product to do |
|---|---|---|
| Brief, problem | Scattered AI news, jargon, generic alerts | One place that watches several official channels and keeps only what is new |
| Brief, solution | Event engine: watch, summarise, score, deliver by preference | Ingest, dedupe, short summary, category, impact score, per-person filters |
| Brief, MVP | At least Anthropic, OpenAI, Hugging Face; seen-items registry; JSON score; Telegram; email digests; subscriber commands | Those three sources, a seen registry, a score with a threshold, a queue for alerts, saved preferences |
| Brief, future | Discord, Slack, learning interests, deals, trend dashboard | Not the first ship |
| User update, 2026-10-28 | Full stack now. n8n later. Then deploy | A real UI, API, and database. n8n calls in. Deploy is a later phase, not a second app |

## 2. The worked case

A visitor opens PulseAI with no API keys. They poll the horizon. New posts from the verified feeds appear once each, with a plain-language extract, a category, and an impact score from 0 to 100. They save an email, pick providers, set a minimum score, and choose instant or a later digest. A new item at or above their line creates a queued alert. Polling again does not create a second copy or a second alert. Pausing them creates none.

## 3. Invariants

1. The same canonical URL is one item.
2. Impact is an integer 0–100 computed by code. The browser cannot submit a score.
3. An empty title and empty body is an error. It is not stored as impact 0.
4. A paused subscriber, a provider they did not pick, or a score under their minimum creates no alert.
5. A summary made without a model is labelled `extract`. A live feed item is labelled with the time it was fetched.
6. A failed provider returns a typed error. The other sources still save.
