import { researchCompany } from "@/lib/scan/research";
import { normalizeCompanyUrl } from "@/lib/scan/url";
import { LaunchError } from "@/lib/launch/errors";
import type { LaunchRequest, LaunchSource } from "@/lib/launch/schema";

const MAX_SOURCE_CHARS = 5_000;
const MAX_SOURCES = 15;

type ExaResult = { title?: string; url?: string; publishedDate?: string; highlights?: string[]; summary?: string };

function isHttpUrl(value?: string) {
  if (!value) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

function toSource(source: Awaited<ReturnType<typeof researchCompany>>["sources"][number], purpose: "company" | "launch"): LaunchSource {
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

async function researchFirstParty(request: LaunchRequest) {
  const companyUrl = normalizeCompanyUrl(request.companyUrl);
  const companyResearch = await researchCompany(companyUrl);
  const sources = companyResearch.sources.filter((source) => source.kind === "company").slice(0, 4).map((source) => toSource(source, "company"));

  if (request.launchUrl) {
    try {
      const launchResearch = await researchCompany(normalizeCompanyUrl(request.launchUrl));
      sources.push(...launchResearch.sources.filter((source) => source.kind === "company").slice(0, 3).map((source) => toSource(source, "launch")));
    } catch {
      // The company website plus user launch context can still support a useful brief.
    }
  }
  return { canonicalUrl: companyResearch.canonicalUrl, sources };
}

async function exaSearch(query: string, startPublishedDate: string) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new LaunchError("research_unconfigured", "FrontierGTM Launch is not connected to live market research.", 503);
  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    signal: AbortSignal.timeout(18_000),
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults: 5,
      startPublishedDate,
      moderation: true,
      systemPrompt: "Prefer first-party announcements, official documentation, credible business and technology reporting, buyer research, and direct evidence. Avoid SEO listicles, content farms, and duplicate coverage.",
      contents: {
        highlights: { maxCharacters: 1_800 },
        summary: { query: "Extract the concrete market fact, buyer need, competitive move, claim, proof, and launch relevance. Do not speculate." },
      },
    }),
  });
  if (!response.ok) {
    if ([401, 403].includes(response.status)) throw new LaunchError("research_unconfigured", "FrontierGTM Launch’s research connection needs attention.", 503);
    throw new LaunchError("research_failed", "Live launch research could not complete just now. Please try again.", 502);
  }
  return ((await response.json()) as { results?: ExaResult[] }).results ?? [];
}

export async function researchLaunch(request: LaunchRequest) {
  const firstParty = await researchFirstParty(request);
  const company = firstParty.canonicalUrl.hostname.replace(/^www\./, "");
  const competitorText = request.competitors.length ? ` Alternatives to compare: ${request.competitors.join(", ")}.` : "";
  const description = request.description.slice(0, 320);
  const start = new Date(Date.now() - 180 * 86_400_000).toISOString();
  const queries = [
    `${company} ${request.launchName} ${description} market competitors alternatives${competitorText}`,
    `${request.primaryBuyer} current priorities pain points adoption barriers ${request.launchName} ${description}`,
    `${request.competitors.join(" ")} recent product launches positioning pricing partnerships ${description}`,
  ];
  const resultSets = await Promise.all(queries.map((query) => exaSearch(query, start)));
  const firstPartyUrls = new Set(firstParty.sources.map((source) => source.url));
  const seen = new Set(firstPartyUrls);
  const market: LaunchSource[] = [];
  resultSets.flat().forEach((result) => {
    if (!result.title || !isHttpUrl(result.url)) return;
    const url = new URL(result.url!).href.split("#")[0];
    const excerpt = [result.summary, ...(result.highlights ?? [])].filter(Boolean).join("\n").trim();
    if (seen.has(url) || excerpt.length < 80) return;
    seen.add(url);
    market.push({
      id: "",
      title: result.title,
      url,
      domain: new URL(url).hostname.replace(/^www\./, ""),
      purpose: "market",
      publishedDate: result.publishedDate,
      excerpt: excerpt.slice(0, MAX_SOURCE_CHARS),
    });
  });

  const sources = [...firstParty.sources, ...market].slice(0, MAX_SOURCES).map((source, index) => ({ ...source, id: `S${index + 1}` }));
  const evidenceChars = sources.reduce((sum, source) => sum + source.excerpt.length, 0);
  if (firstParty.sources.length < 1 || market.length < 3 || evidenceChars < 1_200) {
    throw new LaunchError("insufficient_evidence", "We could not find enough credible company and market evidence for a trustworthy launch brief. Try a public product page or broader launch description.", 422);
  }
  return { canonicalUrl: firstParty.canonicalUrl, sources };
}
