import { SOURCE_IDS } from "./catalog.mjs";

const FREQUENCIES = new Set(["instant", "daily", "weekly"]);

export function validatePrefs(input) {
  const email = String(input.email ?? "").trim().toLowerCase();
  const providers = [...new Set((input.providers ?? []).map(String))];
  const frequency = String(input.frequency ?? "");
  const paused = Boolean(input.paused);
  const minImpact = Number(input.minImpact);
  const known = new Set(SOURCE_IDS);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, cause: "Enter an email address." };
  }
  if (providers.length === 0 || providers.some((id) => !known.has(id))) {
    return { ok: false, cause: "Pick at least one known provider." };
  }
  if (!FREQUENCIES.has(frequency)) {
    return { ok: false, cause: "Frequency must be instant, daily, or weekly." };
  }
  if (!Number.isInteger(minImpact) || minImpact < 0 || minImpact > 100) {
    return { ok: false, cause: "Minimum impact must be a whole number from 0 to 100." };
  }
  return { ok: true, value: { email, providers, frequency, paused, minImpact } };
}
