import assert from "node:assert/strict";
import test from "node:test";
import { htmlFields, parseRss, parseSitemapNews, plainText } from "../lib/parse.mjs";

test("rss keeps title, link, date, and stripped text", () => {
  const [item] = parseRss(`
    <rss><channel><item>
      <title><![CDATA[A model release]]></title>
      <link>https://openai.com/news/example/</link>
      <pubDate>Wed, 01 Oct 2025 12:00:00 GMT</pubDate>
      <description><![CDATA[<p>Hello&amp;nbsp;desk</p>]]></description>
    </item></channel></rss>
  `);
  assert.equal(item.title, "A model release");
  assert.equal(item.url, "https://openai.com/news/example/");
  assert.equal(item.publishedAt.toISOString(), "2025-10-01T12:00:00.000Z");
  assert.match(item.text, /Hello/);
  assert.doesNotMatch(item.text, /<p>/);
});

test("sitemap keeps anthropic news and research only, newest first", () => {
  const rows = parseSitemapNews(`
    <urlset>
      <url><loc>https://www.anthropic.com/</loc><lastmod>2026-10-20</lastmod></url>
      <url><loc>https://www.anthropic.com/news/older</loc><lastmod>2026-01-01</lastmod></url>
      <url><loc>https://www.anthropic.com/research/newer</loc><lastmod>2026-10-02</lastmod></url>
    </urlset>
  `);
  assert.deepEqual(
    rows.map((row) => row.url),
    ["https://www.anthropic.com/research/newer", "https://www.anthropic.com/news/older"],
  );
});

test("plain text decodes hex and decimal apostrophes", () => {
  assert.equal(plainText("We&#x27;re here &#39;now&#39;"), "We're here 'now'");
});

test("html title drops the site suffix and falls back to the slug", () => {
  assert.equal(
    htmlFields(`<html><title>Claude update | Anthropic</title></html>`, "https://www.anthropic.com/news/claude-update").title,
    "Claude update",
  );
  assert.equal(htmlFields("<html></html>", "https://www.anthropic.com/news/claude-update").title, "claude update");
});
