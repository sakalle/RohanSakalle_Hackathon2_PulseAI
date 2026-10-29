import assert from "node:assert/strict";
import test from "node:test";
import { discordPayload } from "../lib/discord.mjs";

test("discord payload keeps subject and text for the n8n body", () => {
  const payload = discordPayload({
    impactScore: 86,
    sourceId: "openai",
    category: "pricing",
    title: "Retell revenue",
    summary: "A pricing note.",
    url: "https://openai.com/index/retell-ai",
  });
  assert.equal(payload.subject, "86 · openai · pricing — Retell revenue");
  assert.match(payload.text, /A pricing note\./);
  assert.match(payload.text, /https:\/\/openai.com\/index\/retell-ai/);
});
