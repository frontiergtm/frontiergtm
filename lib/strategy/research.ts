import { researchCompany } from "@/lib/scan/research";
import { normalizeCompanyUrl } from "@/lib/scan/url";
import { StrategyError } from "@/lib/strategy/errors";
import type { StrategyRequest, StrategySource } from "@/lib/strategy/schema";

type ExaResult = { title?: string; url?: string; publishedDate?: string; highlights?: string[]; summary?: string };
const MAX_SOURCE_CHARS = 5_000;
function validUrl(value?: string) { try { return Boolean(value && ["http:", "https:"].includes(new URL(value).protocol)); } catch { return false; } }
async function exaSearch(query: string) { const key = process.env.EXA_API_KEY; if (!key) throw new StrategyError("research_unconfigured", "FrontierGTM Strategy is not connected to live market research.", 503); const response = await fetch("https://api.exa.ai/search", { method: "POST", signal: AbortSignal.timeout(18_000), headers: { "content-type": "application/json", "x-api-key": key }, body: JSON.stringify({ query, type: "auto", numResults: 5, startPublishedDate: new Date(Date.now() - 365 * 86_400_000).toISOString(), moderation: true, systemPrompt: "Prefer official sources, primary research, credible business and technology reporting, buyer research, and direct evidence. Avoid SEO listicles, content farms, unsupported comparisons, and duplicate coverage.", contents: { highlights: { maxCharacters: 1_800 }, summary: { query: "Extract the concrete market fact, buyer condition, competitive pattern, adoption barrier, trigger, and strategic relevance. Do not speculate." } } }) }); if (!response.ok) { if ([401, 403].includes(response.status)) throw new StrategyError("research_unconfigured", "FrontierGTM Strategy’s research connection needs attention.", 503); throw new StrategyError("research_failed", "Live strategy research could not complete just now. Please try again.", 502); } return ((await response.json()) as { results?: ExaResult[] }).results ?? []; }

export async function researchStrategy(request: StrategyRequest) {
  const company = await researchCompany(normalizeCompanyUrl(request.companyUrl));
  const companySources: StrategySource[] = company.sources.filter((source) => source.kind === "company").slice(0, 5).map((source) => ({ id: "", title: source.title, url: source.url, domain: new URL(source.url).hostname.replace(/^www\./, ""), purpose: "company", publishedDate: source.publishedDate, excerpt: source.excerpt.slice(0, MAX_SOURCE_CHARS) }));
  const hostname = company.canonicalUrl.hostname.replace(/^www\./, "");
  const competitors = request.competitors.join(" ") || "alternatives competitors";
  const queries: Array<{ purpose: StrategySource["purpose"]; query: string }> = [
    { purpose: "market", query: `${hostname} ${request.offer.slice(0, 220)} market category trends adoption competition` },
    { purpose: "buyer", query: `${request.buyer} priorities buying triggers barriers ${request.offer.slice(0, 180)}` },
    { purpose: "competitor", query: `${competitors} ${request.offer.slice(0, 180)} positioning pricing product strategy` },
    { purpose: "market", query: `${request.objective.replace(/-/g, " ")} strategy ${request.offer.slice(0, 180)} AI infrastructure agents developer platform` },
  ];
  const sets = await Promise.all(queries.map(async (plan) => ({ plan, results: await exaSearch(plan.query) })));
  const seen = new Set(companySources.map((source) => source.url));
  const external: StrategySource[] = [];
  for (const { plan, results } of sets) for (const result of results) { if (!result.title || !validUrl(result.url)) continue; const url = new URL(result.url!).href.split("#")[0]; const excerpt = [result.summary, ...(result.highlights ?? [])].filter(Boolean).join("\n").trim(); if (seen.has(url) || excerpt.length < 80) continue; seen.add(url); external.push({ id: "", title: result.title, url, domain: new URL(url).hostname.replace(/^www\./, ""), purpose: plan.purpose, publishedDate: result.publishedDate, excerpt: excerpt.slice(0, MAX_SOURCE_CHARS) }); }
  const sources = [...companySources, ...external].slice(0, 18).map((source, index) => ({ ...source, id: `S${index + 1}` }));
  const chars = sources.reduce((sum, source) => sum + source.excerpt.length, 0);
  if (!companySources.length || external.length < 3 || chars < 1_500) throw new StrategyError("insufficient_evidence", "We could not find enough credible public evidence for a trustworthy strategy brief. Try a public company site and add more specific buyer or market context.", 422);
  return { canonicalUrl: company.canonicalUrl, sources };
}
