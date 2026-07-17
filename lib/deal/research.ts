import { DealError } from "@/lib/deal/errors";
import type { DealRequest, DealSource } from "@/lib/deal/schema";
import { researchCompany } from "@/lib/scan/research";
import { normalizeCompanyUrl } from "@/lib/scan/url";

const MAX_SOURCES = 16;
const MAX_SOURCE_CHARS = 5_000;

type ExaResult = { title?: string; url?: string; publishedDate?: string; highlights?: string[]; summary?: string };

function sourceFromCompany(
  source: Awaited<ReturnType<typeof researchCompany>>["sources"][number],
  purpose: "seller" | "target",
): DealSource {
  return {
    id: "",
    title: source.title,
    url: source.url,
    domain: new URL(source.url).hostname.replace(/^www\./, ""),
    purpose,
    publishedDate: source.publishedDate,
    excerpt: source.excerpt.slice(0, MAX_SOURCE_CHARS),
  };
}

async function exaSearch(query: string, startPublishedDate?: string) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new DealError("research_unconfigured", "Deal Intelligence is not connected to live account research yet.", 503);
  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    signal: AbortSignal.timeout(20_000),
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults: 5,
      ...(startPublishedDate ? { startPublishedDate } : {}),
      moderation: true,
      systemPrompt: "Prefer first-party company pages, filings, earnings materials, executive statements, official product announcements, hiring evidence, and credible direct reporting. Avoid SEO listicles, scraped profiles, and unsourced summaries.",
      contents: {
        highlights: { maxCharacters: 2_000 },
        summary: { query: "Extract the concrete company priority, investment, initiative, change, trigger event, date, stakeholder, and supporting evidence. Do not speculate." },
      },
    }),
  });
  if (!response.ok) {
    if ([401, 403].includes(response.status)) throw new DealError("research_unconfigured", "Deal Intelligence’s research connection needs attention.", 503);
    throw new DealError("research_failed", "Live account research could not complete just now. Please try again.", 502);
  }
  return ((await response.json()) as { results?: ExaResult[] }).results ?? [];
}

export async function researchDeal(request: DealRequest) {
  const sellerUrl = normalizeCompanyUrl(request.sellerUrl);
  const targetUrl = normalizeCompanyUrl(request.targetUrl);
  let sellerResearch: Awaited<ReturnType<typeof researchCompany>>;
  let targetResearch: Awaited<ReturnType<typeof researchCompany>>;
  try {
    [sellerResearch, targetResearch] = await Promise.all([researchCompany(sellerUrl), researchCompany(targetUrl)]);
  } catch {
    throw new DealError("company_research_failed", "We could not read one of those company websites. Check both URLs and try again.", 422);
  }

  const sellerDomain = sellerResearch.canonicalUrl.hostname.replace(/^www\./, "");
  const targetDomain = targetResearch.canonicalUrl.hostname.replace(/^www\./, "");
  const firstParty = [
    ...sellerResearch.sources.filter((source) => source.kind === "company").slice(0, 4).map((source) => sourceFromCompany(source, "seller")),
    ...targetResearch.sources.filter((source) => source.kind === "company").slice(0, 5).map((source) => sourceFromCompany(source, "target")),
  ];
  const start = new Date(Date.now() - 365 * 86_400_000).toISOString();
  const queries = [
    `site:${targetDomain} company strategy priorities products customers partnerships leadership`,
    `${targetDomain} recent product launch partnership investment expansion acquisition executive interview`,
    `${targetDomain} earnings strategy AI cloud data infrastructure developer priorities`,
    `${targetDomain} hiring engineering platform AI infrastructure security data jobs`,
    `${sellerDomain} ${targetDomain} use case integration alternative customer fit`,
  ];
  const resultSets = await Promise.all(queries.map((query, index) => exaSearch(query, index === 0 ? undefined : start)));
  const seen = new Set(firstParty.map((source) => source.url));
  const triggers: DealSource[] = [];
  for (const result of resultSets.flat()) {
    if (!result.title || !result.url) continue;
    let url: string;
    try {
      const parsed = new URL(result.url);
      if (!["http:", "https:"].includes(parsed.protocol)) continue;
      url = parsed.href.split("#")[0];
    } catch { continue; }
    const excerpt = [result.summary, ...(result.highlights ?? [])].filter(Boolean).join("\n").trim();
    if (seen.has(url) || excerpt.length < 80) continue;
    seen.add(url);
    const domain = new URL(url).hostname.replace(/^www\./, "");
    triggers.push({
      id: "",
      title: result.title,
      url,
      domain,
      purpose: domain === targetDomain ? "target" : "trigger",
      publishedDate: result.publishedDate,
      excerpt: excerpt.slice(0, MAX_SOURCE_CHARS),
    });
  }

  const sources = [...firstParty, ...triggers].slice(0, MAX_SOURCES).map((source, index) => ({ ...source, id: `S${index + 1}` }));
  const sellerCount = sources.filter((source) => source.purpose === "seller").length;
  const targetCount = sources.filter((source) => source.purpose === "target").length;
  const discoveredCount = triggers.filter((source) => sources.some((kept) => kept.url === source.url)).length;
  if (sellerCount < 1 || targetCount < 2 || discoveredCount < 3) {
    throw new DealError("insufficient_evidence", "We could not find enough credible public evidence for a trustworthy deal brief. Try a better-known target or more specific company URLs.", 422);
  }
  return { sellerUrl: sellerResearch.canonicalUrl, targetUrl: targetResearch.canonicalUrl, sources };
}
