# Flows — PulseAI

Screens come after these flows. One role: the visitor, who is also the subscriber. Copy language: English.

## F0. Open the desk (G1)

**Happy.** `/` loads. If the database has no items, the largest line is “No signals yet” and the poll control is usable.

**Edge.** Returning visitor with rows. Newest fetched item is first. Score, category, source, and summary are visible without opening a page.

**Failure.** Database file missing. The page shows the error string. It does not invent sample headlines.

**Sees.** Empty, loading on the poll button, error banner. The rest of the chrome stays.

## F1. Poll the horizon (G2, G3)

**Happy.**
1. Visitor presses Poll.
2. Code reads each enabled source.
3. Each entry becomes the internal item shape. The engine sets category and impact. Summary is an extract.
4. New URLs are inserted. Matching URLs are skipped.
5. Instant subscribers who match get one queued inbox alert.
6. The feed reloads.

**Edge.** One source fails. Its `lastError` shows on the source strip. Other sources still land. Anthropic page without a title uses the slug, not a blank score of 0.

**Failure.** Title and text both empty: that entry is counted as an error and not inserted. Network down: the poll returns the typed error and previously saved items stay.

**Sees.** Button pending, then new cards. A skipped duplicate does not flash as new. High scores (≥ 70) use the signal color.

## F2. Read and filter (G4)

**Happy.** Chips for All, model, api, pricing, research, general. A minimum-score control hides lower cards in the browser only. The stored score does not change.

**Edge.** A category with no rows shows an empty line for that chip, not a fake card.

**Failure.** None beyond F0.

**Sees.** Score is the largest number on the card. “extract” and “heuristic” sit in the meta line.

## F3. Preferences (P1)

**Happy.**
1. Open `/preferences`.
2. Enter email, tick providers, pick instant / daily / weekly, set minimum impact, leave pause off.
3. Save. The row is upserted on email.
4. The next new instant match queues an alert.

**Edge.** Same email saved twice updates the row. Daily or weekly stores the choice and creates no alert. Copy says digests are not sent yet.

**Failure.** Bad email or zero providers: the form keeps the values and shows the cause. Nothing is written.

**Sees.** The saved line, and a link to `/inbox`.

## F4. Inbox (P2)

**Happy.** `/inbox` lists queued alerts for all subscribers: headline, score, email, time. Status stays `queued`.

**Edge.** No alerts yet. Empty copy, no sample alert.

**Failure.** Same as F0.

**Sees.** Status pill `queued`, never `sent`.

## F5. n8n pushes one item (N1)

**Happy.** `POST /api/hooks/n8n` with `{ sourceId, title, url, publishedAt, text }`. Same engine and dedupe as F1. Response is the stored item JSON.

**Edge.** URL already stored. Response says `duplicate: true` and does not create an alert.

**Failure.** Missing url or title, unknown sourceId, or wrong `x-pulse-secret` when the secret is set. HTTP 4xx and `{ provider: "n8n", url, cause }`. No row.

**Sees.** The new card on the next load of `/`.

## Engine — not a screen

| Step | Who | Why |
|---|---|---|
| Parse | Code | RSS or sitemap or n8n JSON into title, url, date, text. No score. |
| Compute | Code | `impact` and `category` from `components-and-math.md`. |
| Explain | Extract, or a model later | Shortens text. Does not choose the number. |
| Decide alert | Code | Threshold, provider list, pause, frequency. |
