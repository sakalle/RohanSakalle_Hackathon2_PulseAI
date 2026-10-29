export function discordPayload(item) {
  const title = String(item.title ?? "").replace(/\s+/g, " ").trim();
  const summary = String(item.summary ?? "").replace(/\s+/g, " ").trim();
  const subject = `${item.impactScore} · ${item.sourceId} · ${item.category} — ${title}`.slice(0, 200);
  const text = `${summary}\n${item.url}`.trim().slice(0, 1800);
  return { subject, text };
}

export async function postDiscord(item) {
  const hook = process.env.N8N_ALERT_WEBHOOK?.trim();
  if (!hook) return { sent: false, cause: "unset" };
  const response = await fetch(hook, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(discordPayload(item)),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    return { sent: false, cause: `HTTP ${response.status}` };
  }
  return { sent: true, cause: "" };
}
