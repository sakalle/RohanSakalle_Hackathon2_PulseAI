import { SOURCES } from "./catalog.mjs";

const WEIGHTS = Object.fromEntries(SOURCES.map((source) => [source.id, source.weight]));

const KEYWORDS = [
  "launch",
  "release",
  "announce",
  "api",
  "model",
  "pricing",
  "price",
  "deprecat",
  "benchmark",
  "open-weight",
  "open source",
  "gpt",
  "claude",
  "gemini",
  "llama",
  "agent",
  "fine-tun",
  "safety",
];

export function canonicalUrl(input) {
  const url = new URL(input);
  url.hash = "";
  const path = url.pathname.replace(/\/+$/, "");
  const search = url.search;
  return `${url.protocol}//${url.hostname}${path}${search}`;
}

const PRICING = /\b(price|pricing|billing|cost|revenue|repric)/;
const API = /\b(api|sdk|endpoint)s?\b/;
const MODEL = /\b(model|gpt|claude|gemini|llama|weights)\b/;
const RESEARCH = /\b(paper|benchmark|eval|research)\b/;

export function categorize(text) {
  const hay = text.toLowerCase();
  const title = hay.split("\n")[0];
  if (PRICING.test(title)) return "pricing";
  if (API.test(title)) return "api";
  if (PRICING.test(hay)) return "pricing";
  if (MODEL.test(hay)) return "model";
  if (API.test(hay)) return "api";
  if (RESEARCH.test(hay)) return "research";
  return "general";
}

function keywordHits(text) {
  const hay = text.toLowerCase();
  return KEYWORDS.filter((word) => hay.includes(word)).length;
}

export function scoreItem({ sourceId, title, text, publishedAt }) {
  const cleanTitle = (title ?? "").trim();
  const cleanText = (text ?? "").trim();
  if (!cleanTitle && !cleanText) {
    throw new Error(`empty title and text for ${sourceId}`);
  }
  const weight = WEIGHTS[sourceId];
  if (weight == null) {
    throw new Error(`unknown source ${sourceId}`);
  }

  let recency = 0;
  if (publishedAt instanceof Date && !Number.isNaN(publishedAt.getTime())) {
    const hours = (Date.now() - publishedAt.getTime()) / 36e5;
    if (hours >= 0 && hours <= 48) recency = 12;
    else if (hours > 48 && hours <= 24 * 7) recency = 6;
  }

  const blob = `${cleanTitle}\n${cleanText}`;
  const impactScore = Math.min(100, weight + Math.min(32, 8 * keywordHits(blob)) + recency);
  return {
    impactScore,
    category: categorize(blob),
    scoreKind: "heuristic",
  };
}

export function shouldAlert(subscriber, item) {
  return (
    subscriber.frequency === "instant" &&
    subscriber.paused === false &&
    item.impactScore >= subscriber.minImpact &&
    subscriber.providers.includes(item.sourceId)
  );
}

export function excerpt(text, limit = 320) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).trim()}…`;
}
