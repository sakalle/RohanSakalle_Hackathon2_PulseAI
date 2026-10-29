import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalUrl,
  categorize,
  scoreItem,
  shouldAlert,
} from "../lib/engine.mjs";

test("canonical url ignores case, hash, and trailing slash", () => {
  assert.equal(
    canonicalUrl("HTTPS://OpenAI.com/news/gpt/#top"),
    "https://openai.com/news/gpt",
  );
});

test("empty title and text is an error, not a zero score", () => {
  assert.throws(() => scoreItem({ sourceId: "openai", title: "  ", text: "" }), /empty/);
});

test("official launch in the last day scores at least the default threshold", () => {
  const scored = scoreItem({
    sourceId: "openai",
    title: "We announce a new model API",
    text: "The release includes pricing details.",
    publishedAt: new Date(),
  });
  assert.equal(scored.category, "api");
  assert.equal(scored.scoreKind, "heuristic");
  assert.ok(scored.impactScore >= 70);
  assert.ok(scored.impactScore <= 100);
});

test("missing date does not pretend the post is fresh", () => {
  const scored = scoreItem({
    sourceId: "hackernews",
    title: "A note",
    text: "Nothing special here.",
    publishedAt: null,
  });
  assert.equal(scored.impactScore, 18);
});

test("paused, daily, wrong source, and low score do not alert", () => {
  const item = { sourceId: "openai", impactScore: 80 };
  assert.equal(
    shouldAlert({ providers: ["openai"], frequency: "instant", paused: false, minImpact: 70 }, item),
    true,
  );
  assert.equal(
    shouldAlert({ providers: ["openai"], frequency: "instant", paused: true, minImpact: 70 }, item),
    false,
  );
  assert.equal(
    shouldAlert({ providers: ["openai"], frequency: "daily", paused: false, minImpact: 70 }, item),
    false,
  );
  assert.equal(
    shouldAlert({ providers: ["huggingface"], frequency: "instant", paused: false, minImpact: 70 }, item),
    false,
  );
  assert.equal(
    shouldAlert({ providers: ["openai"], frequency: "instant", paused: false, minImpact: 90 }, item),
    false,
  );
});

test("category order prefers a pricing title, then an api title, then model", () => {
  assert.equal(categorize("pricing for the new model"), "pricing");
  assert.equal(categorize("Cut inference cost by 77%"), "pricing");
  assert.equal(categorize("Build apps with the Decisions API\nUses our latest model"), "api");
  assert.equal(categorize("Menu repricing cut the time"), "pricing");
  assert.equal(categorize("Agents found $4.6 million of bugs\nOn a benchmark of contracts"), "research");
  assert.equal(categorize("claude weights"), "model");
  assert.equal(categorize("new sdk endpoint"), "api");
  assert.equal(categorize("benchmark paper"), "research");
  assert.equal(categorize("hello desk"), "general");
});
