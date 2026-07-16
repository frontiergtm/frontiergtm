import { SignalError } from "@/lib/signal/errors";
import type { SignalRequest, SignalSource } from "@/lib/signal/schema";
import { researchCompany } from "@/lib/scan/research";

const MAX_SOURCE_CHARS = 4_500;
const MAX_SOURCES = 14;

type ExaResult = {
  title?: string;
  url?: string;
  publishedDate?: string;
  highlights?: string[];
  summary?: string;
};

type SearchPlan = {
  query: string;
  purpose: "company-context" | "market-signal";
  numResults: number;
  startPublishedDate?: string;
  includeDomains?: string[];
};

function isPublicHttpUrl(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}
function periodStart(horizon: SignalRequest["horizon"]) {
  const days = horizon === "7d" ? 7 : horizon === "90d" ? 90 : 30;
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function companyDomain(value: string) {
  const candidate = value.trim().replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./i, "");
  return candidate.includes(".") && /^[a-z0-9.-]+$/i.test(candidate) ? candidate : undefined;
}

function searchPlans(request: SignalRequest): SearchPlan[] {
  const watched = request.watchlist.length ? ` Companies to watch: ${request.watchlist.join(", ")}.` : "";
  const domain = companyDomain(request.company);
  return [
    ...(!domain ? [{ query: `${request.company} official website products services customers positioning`, purpose: "company-context" as const, numResults: 4 }] : []),
    { query: `${request.market} recent product launches pricing partnerships customer adoption and market changes.${watched}`, purpose: "market-signal" as const, numResults: 5, startPublishedDate: periodStart(request.horizon) },
    { query: `${request.company} ${request.market} competitive moves positioning announcements.${watched}`, purpose: "market-signal" as const, numResults: 5, startPublishedDate: periodStart(request.horizon) },
    { query: `${request.market}: ${request.question}${watched}`, purpose: "market-signal" as const, numResults: 5, startPublishedDate: periodStart(request.horizon) },
  ];
}

async function firstPartyCompanyContext(domain?: string): Promise<SignalSource[]> {
  if (!domain) return [];
  try {
    const research = await researchCompany(new URL(`https://${domain}`));
    return research.sources.filter((source) => source.kind === "company").slice(0, 4).map((source, index) => ({
      id: `C${index + 1}`,
      title: source.title,
      url: source.url,
      domain: new URL(source.url).hostname.replace(/^www\./, ""),
      publishedDate: source.publishedDate,
      purpose: "company-context",
      excerpt: source.excerpt,
    }));
  } catch {
    return [];
  }
}

async function exaSearch(plan: SearchPlan) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new SignalError(
      "research_unconfigured",
      "FrontierGTM Signal is awaiting its live research connection. Join the beta below and we’ll let you know when briefs are available.",
      503,
    );
  }

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    signal: AbortSignal.timeout(18_000),
    headers: { "content-type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({
      query: plan.query,
      type: "auto",
      numResults: plan.numResults,
      ...(plan.startPublishedDate ? { startPublishedDate: plan.startPublishedDate } : {}),
      ...(plan.includeDomains ? { includeDomains: plan.includeDomains } : {}),
      moderation: true,
      systemPrompt: "Prefer first-party company announcements, official documentation, major business or technology publications, and direct reporting. Avoid SEO listicles, content farms, and unsourced market summaries when stronger sources exist. Collapse duplicate coverage.",
      contents: {
        highlights: { maxCharacters: 1_800 },
        summary: { query: "Summarize the concrete market change, announcement, evidence, date, and strategic relevance. Do not speculate." },
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new SignalError("research_unconfigured", "FrontierGTM Signal’s research connection needs attention. Please try again later.", 503);
    }
    throw new SignalError("research_failed", "Live market research could not complete just now. Please try again.", 502);
  }

  const payload = (await response.json()) as { results?: ExaResult[] };
  return (payload.results ?? []).map((result) => ({ ...result, purpose: plan.purpose }));
}

export async function researchMarket(request: SignalRequest) {
  const start = periodStart(request.horizon);
  const domain = companyDomain(request.company);
  const [firstParty, resultSets] = await Promise.all([
    firstPartyCompanyContext(domain),
    Promise.all(searchPlans(request).map(exaSearch)),
  ]);
  const unique = new Map<string, ExaResult & { purpose: "company-context" | "market-signal" }>();

  resultSets.flat().forEach((result) => {
    if (!result.title || !isPublicHttpUrl(result.url)) return;
    const excerpt = [result.summary, ...(result.highlights ?? [])].filter(Boolean).join("\n").trim();
    if (excerpt.length < 80) return;
    const normalized = new URL(result.url!).href.split("#")[0];
    if (!unique.has(normalized)) unique.set(normalized, { ...result, url: normalized });
  });

  const exaSources: SignalSource[] = Array.from(unique.values()).map((result, index) => ({
    id: `E${index + 1}`,
    title: result.title!,
    url: result.url!,
    domain: new URL(result.url!).hostname.replace(/^www\./, ""),
    publishedDate: result.publishedDate,
    purpose: result.purpose,
    excerpt: [result.summary, ...(result.highlights ?? [])].filter(Boolean).join("\n").slice(0, MAX_SOURCE_CHARS),
  }));
  const sourceUrls = new Set(firstParty.map((source) => source.url));
  const sources = [...firstParty, ...exaSources.filter((source) => !sourceUrls.has(source.url))]
    .slice(0, MAX_SOURCES)
    .map((source, index) => ({ ...source, id: `S${index + 1}` }));

  if (sources.length < 4) {
    throw new SignalError(
      "insufficient_evidence",
      "We did not find enough recent, credible public evidence for a trustworthy brief. Try a broader market, a 90-day window, or fewer companies.",
      422,
    );
  }

  return { periodStart: start, sources };
}
