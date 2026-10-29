const feeds = [
  ["openai-rss", "https://openai.com/news/rss.xml"],
  ["anthropic-rss", "https://www.anthropic.com/news/rss.xml"],
  ["anthropic-sitemap", "https://www.anthropic.com/sitemap.xml"],
  ["huggingface-rss", "https://huggingface.co/blog/feed.xml"],
  ["hackernews-rss", "https://hnrss.org/newest?q=AI&points=80"],
];

for (const [name, url] of feeds) {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "PulseAI/0.1 feed-smoke" },
      redirect: "follow",
    });
    const text = await response.text();
    const head = text.slice(0, 80).replace(/\s+/g, " ");
    console.log(`${response.ok ? "PASS" : "FAIL"} ${response.status} ${name} ${head}`);
  } catch (error) {
    console.log(`FAIL ${name} ${error instanceof Error ? error.message : String(error)}`);
  }
}
