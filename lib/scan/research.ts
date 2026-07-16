import { ScanError } from "@/lib/scan/errors";
import type { ScanSource } from "@/lib/scan/schema";
import { assertPublicUrl } from "@/lib/scan/url";

const MAX_PAGE_BYTES = 1_500_000;
const MAX_SOURCE_CHARS = 6_000;
const USER_AGENT = "FrontierGTM-Scan/0.1 (+https://www.frontiergtm.ai/scan)";

function decodeEntities(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
  };
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match);
}

function stripHtml(html: string) {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|svg|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>|<\/div>|<\/section>|<\/article>|<\/li>|<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function matchContent(html: string, pattern: RegExp) {
  return decodeEntities(html.match(pattern)?.[1]?.replace(/<[^>]+>/g, " ").trim() ?? "");
}

function extractPage(html: string, url: URL) {
  const title =
    matchContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
    matchContent(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    url.hostname;
  const description =
    matchContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    matchContent(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i);
  const headings = Array.from(html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi))
    .slice(0, 24)
    .map((match) => decodeEntities(match[1].replace(/<[^>]+>/g, " ").trim()))
    .filter(Boolean);
  const body = stripHtml(html);
  const excerpt = [`Page title: ${title}`, description && `Description: ${description}`, headings.length && `Headings: ${headings.join(" | ")}`, body]
    .filter(Boolean)
    .join("\n")
    .slice(0, MAX_SOURCE_CHARS);

  return { title, excerpt };
}

async function readLimitedText(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_PAGE_BYTES) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0));
  let offset = 0;
  chunks.forEach((chunk) => {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return new TextDecoder().decode(bytes);
}

async function safeFetchHtml(initialUrl: URL) {
  let url = initialUrl;
  for (let redirect = 0; redirect < 4; redirect += 1) {
    await assertPublicUrl(url);
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(9_000),
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new ScanError("unreachable_url", "The website returned an invalid redirect.", 422);
      url = new URL(location, url);
      continue;
    }

    if (!response.ok) throw new ScanError("unreachable_url", `The website returned ${response.status}.`, 422);
    if (!(response.headers.get("content-type") ?? "").toLowerCase().includes("text/html")) {
      throw new ScanError("unsupported_page", "The submitted address is not an HTML website.", 422);
    }
    return { html: await readLimitedText(response), finalUrl: url };
  }
  throw new ScanError("unreachable_url", "The website redirected too many times.", 422);
}

function extractInternalLinks(html: string, baseUrl: URL) {
  const candidates = Array.from(html.matchAll(/href=["']([^"'#]+)["']/gi))
    .map((match) => {
      try {
        return new URL(match[1], baseUrl);
      } catch {
        return null;
      }
    })
    .filter((url): url is URL => Boolean(url && url.hostname === baseUrl.hostname && ["http:", "https:"].includes(url.protocol)));

  const preferred = /(about|product|platform|solution|customer|pricing|docs|developer|agent|infrastructure)/i;
  return Array.from(new Map(candidates.map((url) => [url.href.split("#")[0], url])).values())
    .filter((url) => url.pathname !== baseUrl.pathname)
    .sort((a, b) => Number(preferred.test(b.pathname)) - Number(preferred.test(a.pathname)))
    .slice(0, 3);
}

function isHttpUrl(value?: string) {
  if (!value) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

async function researchWithExa(companyUrl: URL, companyTitle: string): Promise<ScanSource[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return [];

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    signal: AbortSignal.timeout(12_000),
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      query: `${companyTitle} ${companyUrl.hostname} product positioning competitors recent announcements`,
      type: "auto",
      numResults: 5,
      excludeDomains: [companyUrl.hostname],
      contents: { highlights: { maxCharacters: 1800 }, summary: { query: "What does this source reveal about the company, product, market, or competitive position?" } },
    }),
  });
  if (!response.ok) return [];

  const payload = (await response.json()) as {
    results?: Array<{ title?: string; url?: string; publishedDate?: string; highlights?: string[]; summary?: string }>;
  };
  return (payload.results ?? [])
    .filter((result) => isHttpUrl(result.url) && result.title)
    .map((result, index) => ({
      id: `S${index + 20}`,
      title: result.title!,
      url: result.url!,
      kind: "external" as const,
      publishedDate: result.publishedDate,
      excerpt: [result.summary, ...(result.highlights ?? [])].filter(Boolean).join("\n").slice(0, MAX_SOURCE_CHARS),
    }))
    .filter((source) => source.excerpt.length > 80);
}

export async function researchCompany(companyUrl: URL): Promise<{ canonicalUrl: URL; sources: ScanSource[] }> {
  const homepage = await safeFetchHtml(companyUrl);
  const homepagePage = extractPage(homepage.html, homepage.finalUrl);
  const sources: ScanSource[] = [
    { id: "S1", title: homepagePage.title, url: homepage.finalUrl.href, kind: "company", excerpt: homepagePage.excerpt },
  ];

  const internalPages = extractInternalLinks(homepage.html, homepage.finalUrl);
  const internalResults = await Promise.allSettled(
    internalPages.map(async (url, index) => {
      const result = await safeFetchHtml(url);
      const page = extractPage(result.html, result.finalUrl);
      return { id: `S${index + 2}`, title: page.title, url: result.finalUrl.href, kind: "company" as const, excerpt: page.excerpt };
    }),
  );
  internalResults.forEach((result) => {
    if (result.status === "fulfilled" && result.value.excerpt.length > 100) sources.push(result.value);
  });

  try {
    sources.push(...(await researchWithExa(homepage.finalUrl, homepagePage.title)));
  } catch {
    // External research improves the scan but must not make first-party analysis fail.
  }

  const unique = Array.from(new Map(sources.map((source) => [source.url, source])).values()).slice(0, 9);
  if (unique.reduce((sum, source) => sum + source.excerpt.length, 0) < 600) {
    throw new ScanError("insufficient_evidence", "We could not find enough public evidence to produce a trustworthy scan.", 422);
  }
  return { canonicalUrl: homepage.finalUrl, sources: unique };
}
