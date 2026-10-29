function decode(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

export function plainText(value) {
  if (!value) return "";
  return decode(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inner(block, name) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? match[1] : "";
}

function linkOf(block) {
  const text = plainText(inner(block, "link"));
  if (text.startsWith("http")) return text;
  const href = block.match(/<link[^>]+href=["']([^"']+)["']/i);
  if (href) return plainText(href[1]);
  const guid = plainText(inner(block, "guid"));
  return guid.startsWith("http") ? guid : text;
}

function dateOf(value) {
  const text = plainText(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseRss(xml, limit = 12) {
  const blocks =
    xml.match(/<item\b[\s\S]*?<\/item>/gi) ||
    xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ||
    [];
  return blocks.slice(0, limit).map((block) => ({
    title: plainText(inner(block, "title")),
    url: linkOf(block),
    publishedAt: dateOf(
      inner(block, "pubDate") ||
        inner(block, "published") ||
        inner(block, "updated") ||
        inner(block, "dc:date"),
    ),
    text: plainText(inner(block, "description") || inner(block, "content:encoded") || inner(block, "summary")),
  }));
}

export function parseSitemapNews(xml, limit = 12) {
  const blocks = xml.match(/<url\b[\s\S]*?<\/url>/gi) || [];
  const rows = [];
  for (const block of blocks) {
    const url = plainText(inner(block, "loc"));
    if (!/^https:\/\/www\.anthropic\.com\/(news|research)\//.test(url)) continue;
    rows.push({ url, publishedAt: dateOf(inner(block, "lastmod")) });
  }
  rows.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  return rows.slice(0, limit);
}

function metaContent(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return plainText(match[1]);
  }
  return "";
}

export function slugTitle(url) {
  const path = url.split("/").filter(Boolean).pop() || "untitled";
  return decodeURIComponent(path).replace(/[-_]+/g, " ");
}

export function htmlFields(html, url) {
  const rawTitle = metaContent(html, "og:title") || plainText((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const title = rawTitle.replace(/\s+[|\\].*$/, "").trim() || slugTitle(url);
  const text = metaContent(html, "og:description");
  return { title, text };
}
