import assert from "node:assert/strict";
import test from "node:test";
import { validatePrefs } from "../lib/prefs.mjs";

test("prefs reject a bad email and an empty provider list", () => {
  assert.equal(validatePrefs({ email: "ada", providers: ["openai"], frequency: "instant", minImpact: 70 }).ok, false);
  assert.equal(validatePrefs({ email: "ada@lab.ai", providers: [], frequency: "instant", minImpact: 70 }).ok, false);
});

test("prefs keep a valid instant subscriber", () => {
  const result = validatePrefs({
    email: "Ada@Lab.ai",
    providers: ["openai", "openai"],
    frequency: "instant",
    paused: false,
    minImpact: 70,
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    email: "ada@lab.ai",
    providers: ["openai"],
    frequency: "instant",
    paused: false,
    minImpact: 70,
  });
});
