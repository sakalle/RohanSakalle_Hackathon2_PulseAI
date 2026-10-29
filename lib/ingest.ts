import { Prisma } from "@prisma/client";
import { canonicalUrl, excerpt, scoreItem, shouldAlert } from "./engine.mjs";
import { htmlFields, parseRss, parseSitemapNews } from "./parse.mjs";
import { prisma, ready } from "./db";

export type ItemError = { provider: string; url: string; cause: string };

type Entry = {
  title: string;
  url: string;
  text: string;
  publishedAt: Date | null;
};

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "PulseAI/0.1 (hackathon horizon tracker)",
      accept: "text/html, application/rss+xml, application/xml, text/xml, */*",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function mapPool<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await task(current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
}

async function entriesFor(source: { id: string; kind: string; url: string }) {
  const xml = await fetchText(source.url);
  const errors: ItemError[] = [];
  if (source.kind === "sitemap") {
    const entries: Entry[] = [];
    await mapPool(parseSitemapNews(xml), 4, async (loc) => {
      try {
        const html = await fetchText(loc.url);
        const fields = htmlFields(html, loc.url);
        entries.push({
          title: fields.title,
          url: loc.url,
          text: fields.text,
          publishedAt: loc.publishedAt,
        });
      } catch (error) {
        errors.push({
          provider: source.id,
          url: loc.url,
          cause: error instanceof Error ? error.message : String(error),
        });
      }
    });
    return { entries, errors };
  }

  const entries = (parseRss(xml, 30) as Entry[])
    .filter((entry) => entry.url.startsWith("http"))
    .map((entry) => ({
      title: entry.title,
      url: entry.url,
      text:
        source.id === "hackernews" && /Comments URL:/i.test(entry.text)
          ? ""
          : entry.text.slice(0, 1200),
      publishedAt: entry.publishedAt,
    }));
  return { entries, errors };
}

export async function acceptItem(input: Entry & { sourceId: string }) {
  await ready();
  let url = input.url;
  try {
    url = canonicalUrl(input.url);
  } catch {
    return {
      duplicate: false,
      error: { provider: input.sourceId, url: input.url, cause: "url is not usable" } satisfies ItemError,
    };
  }

  const existing = await prisma.item.findUnique({ where: { url } });
  if (existing) return { duplicate: true as const, error: undefined, item: existing };

  let scored: ReturnType<typeof scoreItem>;
  try {
    scored = scoreItem({
      sourceId: input.sourceId,
      title: input.title,
      text: input.text,
      publishedAt: input.publishedAt,
    });
  } catch (error) {
    return {
      duplicate: false as const,
      error: {
        provider: input.sourceId,
        url,
        cause: error instanceof Error ? error.message : String(error),
      } satisfies ItemError,
    };
  }

  try {
    const item = await prisma.item.create({
      data: {
        sourceId: input.sourceId,
        url,
        title: input.title.trim(),
        text: excerpt(input.text, 1200),
        summary: excerpt(input.text) || excerpt(input.title),
        summaryKind: "extract",
        category: scored.category,
        impactScore: scored.impactScore,
        scoreKind: scored.scoreKind,
        publishedAt: input.publishedAt,
      },
    });
    const subscribers = await prisma.subscriber.findMany();
    for (const subscriber of subscribers) {
      const providers = JSON.parse(subscriber.providers) as string[];
      if (
        shouldAlert(
          {
            providers,
            frequency: subscriber.frequency,
            paused: subscriber.paused,
            minImpact: subscriber.minImpact,
          },
          item,
        )
      ) {
        await prisma.alert.create({
          data: {
            itemId: item.id,
            subscriberId: subscriber.id,
            channel: "inbox",
            status: "queued",
          },
        });
      }
    }
    return { duplicate: false as const, error: undefined, item };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { duplicate: true as const, error: undefined, item: existing };
    }
    throw error;
  }
}

export async function pollAll() {
  await ready();
  const sources = await prisma.source.findMany({ where: { enabled: true } });
  let inserted = 0;
  let duplicates = 0;
  const errors: ItemError[] = [];

  for (const source of sources) {
    const mine: ItemError[] = [];
    try {
      const loaded = await entriesFor(source);
      mine.push(...loaded.errors);
      for (const entry of loaded.entries) {
        const result = await acceptItem({ sourceId: source.id, ...entry });
        if (result.error) mine.push(result.error);
        else if (result.duplicate) duplicates += 1;
        else inserted += 1;
      }
      await prisma.source.update({
        where: { id: source.id },
        data: {
          lastPolledAt: new Date(),
          lastError: mine.length ? mine.slice(0, 2).map((error) => error.cause).join(" · ") : null,
        },
      });
    } catch (error) {
      const cause = error instanceof Error ? error.message : String(error);
      mine.push({ provider: source.id, url: source.url, cause });
      await prisma.source.update({
        where: { id: source.id },
        data: { lastPolledAt: new Date(), lastError: cause },
      });
    }
    errors.push(...mine);
  }

  return { inserted, duplicates, errors };
}
