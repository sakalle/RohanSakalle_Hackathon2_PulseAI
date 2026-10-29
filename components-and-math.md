# Components and math we do not invent

## 1. Already proven

No formula was borrowed. No reference repo was named.

## 2. The one thing we invent

Impact is an integer from 0 to 100.

```
hits = unique keyword matches in title + text
impact = clamp(0, 100, sourceWeight + min(32, 8 * hits) + recency)

recency = 12 if publishedAt is within 48 hours
        = 6  if publishedAt is within 7 days
        = 0  if older, or if publishedAt is null
```

Source weights (D4): OpenAI 42, Anthropic 42, Hugging Face 28, Hacker News 18.

Keywords, case-insensitive: launch, release, announce, api, model, pricing, price, deprecat, benchmark, open-weight, open source, gpt, claude, gemini, llama, agent, fine-tun, safety.

Category, first match on the same text:

The title is the first line. A pricing word in the title wins. An API word in the title wins next, even if the body says “model”.

| If the text matches | Category |
|---|---|
| price, pricing, billing, cost, revenue, repricing | pricing |
| api, sdk, endpoint | api |
| model, gpt, claude, gemini, llama, weights | model |
| paper, benchmark, eval, research | research |
| otherwise | general |

Alert when `frequency == instant` and `paused == false` and `impact >= minImpact` and `sourceId` is in the subscriber’s list. One alert per item per subscriber.

Default `minImpact` is 70.

## 3. Datasets and APIs we do not build

| Need | Source | Cost / terms |
|---|---|---|
| OpenAI posts | `https://openai.com/news/rss.xml` | Public RSS. Seen 200 on 2026-10-28. |
| Hugging Face posts | `https://huggingface.co/blog/feed.xml` | Public RSS. Seen 200 on 2026-10-28. |
| Anthropic posts | `https://www.anthropic.com/sitemap.xml` | Public sitemap. RSS was down. Seen 200 on 2026-10-28. |
| Community posts | `https://hnrss.org/newest?q=AI&points=80` | Public RSS. Seen 200 on 2026-10-28. |

## 4. Utilities we port

| Function | Repo | License |
|---|---|---|
| None | — | — |

## 5. What remains ours

1. The impact formula and category order above.
2. The preference rule that turns a new item into a queued inbox alert.
3. The n8n body mapped onto the same item shape.
