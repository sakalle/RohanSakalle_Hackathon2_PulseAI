# PulseAI

A desk for new AI announcements. It polls OpenAI, Anthropic, Hugging Face, and Hacker News, keeps one row per link, and scores impact in code. n8n can post the same item shape later.

```bash
npm install
npx prisma db push
npm run dev
```

Open http://localhost:3000 and press **Poll horizon**.

Tests: `npm test`.

Secrets stay in `.env`. Copy `.env.example`. Do not prefix a secret with `NEXT_PUBLIC_`.

The map of the product is `docs/OVERVIEW.md`.
