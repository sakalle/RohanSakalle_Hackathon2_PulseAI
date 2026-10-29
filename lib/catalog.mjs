export const SOURCES = [
  {
    id: "openai",
    name: "OpenAI",
    kind: "rss",
    url: "https://openai.com/news/rss.xml",
    weight: 42,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "sitemap",
    url: "https://www.anthropic.com/sitemap.xml",
    weight: 42,
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    kind: "rss",
    url: "https://huggingface.co/blog/feed.xml",
    weight: 28,
  },
  {
    id: "hackernews",
    name: "Hacker News",
    kind: "rss",
    url: "https://hnrss.org/newest?q=AI&points=80",
    weight: 18,
  },
];

export const SOURCE_IDS = SOURCES.map((source) => source.id);
