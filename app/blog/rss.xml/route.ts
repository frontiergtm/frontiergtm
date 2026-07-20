import { getPublishedBlogPostsFresh } from "@/lib/sanity/posts";

const siteUrl = "https://www.frontiergtm.ai";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = await getPublishedBlogPostsFresh();
  const latestDate = posts[0]?.updatedAt || posts[0]?.publishedAt || new Date().toISOString();
  const items = posts.map((post) => {
    const url = `${siteUrl}/blog/${post.slug}`;
    const categories = (post.tags || []).map((tag) => `<category>${escapeXml(tag)}</category>`).join("");
    return [
      "<item>",
      `<title>${escapeXml(post.title)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
      `<dc:creator>${escapeXml(post.author?.name || "Ryan Pollock")}</dc:creator>`,
      `<description>${escapeXml(post.excerpt)}</description>`,
      categories,
      "</item>",
    ].join("");
  }).join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    "<title>FrontierGTM Blog</title>",
    `<link>${siteUrl}/blog</link>`,
    "<description>Ideas, arguments, and field notes on taking frontier AI, infrastructure, cloud, and developer technology to market.</description>",
    "<language>en-us</language>",
    `<lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>`,
    `<atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
