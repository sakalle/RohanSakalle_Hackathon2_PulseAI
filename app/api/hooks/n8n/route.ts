import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { SOURCE_IDS } from "@/lib/catalog.mjs";
import { acceptItem } from "@/lib/ingest";

function authorized(request: Request) {
  const expected = process.env.N8N_INGEST_SECRET ?? "";
  if (!expected) return true;
  const got = Buffer.from(request.headers.get("x-pulse-secret") ?? "");
  const want = Buffer.from(expected);
  if (got.length !== want.length) return false;
  return timingSafeEqual(got, want);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { provider: "n8n", url: null, cause: "secret does not match" },
      { status: 401 },
    );
  }

  let body: { sourceId?: string; title?: string; url?: string; text?: string; publishedAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ provider: "n8n", url: null, cause: "body must be JSON" }, { status: 400 });
  }

  const sourceId = String(body.sourceId ?? "");
  const title = String(body.title ?? "");
  const url = String(body.url ?? "");
  const text = String(body.text ?? "");
  if (!SOURCE_IDS.includes(sourceId)) {
    return NextResponse.json({ provider: "n8n", url: url || null, cause: "unknown sourceId" }, { status: 400 });
  }
  if (!title.trim() || !url) {
    return NextResponse.json(
      { provider: "n8n", url: url || null, cause: "title and url are required" },
      { status: 400 },
    );
  }

  const published = body.publishedAt ? new Date(body.publishedAt) : null;
  const result = await acceptItem({
    sourceId,
    title,
    url,
    text,
    publishedAt: published && !Number.isNaN(published.getTime()) ? published : null,
  });

  if (result.error) return NextResponse.json(result.error, { status: 422 });
  return NextResponse.json({
    duplicate: result.duplicate,
    url: result.item?.url ?? url,
    title: result.item?.title,
    category: result.item?.category,
    impactScore: result.item?.impactScore,
    summary: result.item?.summary,
    summaryKind: result.item?.summaryKind,
  });
}
