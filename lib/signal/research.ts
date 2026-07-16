import { SignalError } from "@/lib/signal/errors";
import type { SignalRequest, SignalSource } from "@/lib/signal/schema";

const MAX_SOURCE_CHARS = 4_500;
const MAX_SOURCES = 14;

type ExaResult = {
  title?: string;
  url?: string;
  publishedDate?: string;
  highlights?: string[];
  summary?: string;
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

function searchQueries(request: SignalRequest) {
  const watched = request.watchlist.length ? ` Companies to watch: ${request.watchlist.join(", ")}.` : "";
  return [
    `${request.market} recent product launches pricing partnerships customer adoption and market changes.${watched}`,
    `${request.company} ${request.market} competitive moves positioning announcements.${watched}`,
    `${request.market}: ${request.question}${watched}`,
  ];
}

async function exaSearch(query: string, startPublishedDate: string) {
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
      query,
      type: "auto",
      numResults: 6,
      startPublishedDate,
      moderation: true,
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
  return payload.results ?? [];
}

export async function researchMarket(request: SignalRequest) {
  const start = periodStart(request.horizon);
  const resultSets = await Promise.all(searchQueries(request).map((query) => exaSearch(query, start)));
  const unique = new Map<string, ExaResult>();

  resultSets.flat().forEach((result) => {
    if (!result.title || !isPublicHttpUrl(result.url)) return;
    const excerpt = [result.summary, ...(result.highlights ?? [])].filter(Boolean).join("\n").trim();
    if (excerpt.length < 80) return;
    const normalized = new URL(result.url!).href.split("#")[0];
    if (!unique.has(normalized)) unique.set(normalized, { ...result, url: normalized });
  });

  const sources: SignalSource[] = Array.from(unique.values()).slice(0, MAX_SOURCES).map((result, index) => ({
    id: `S${index + 1}`,
    title: result.title!,
    url: result.url!,
    domain: new URL(result.url!).hostname.replace(/^www\./, ""),
    publishedDate: result.publishedDate,
    excerpt: [result.summary, ...(result.highlights ?? [])].filter(Boolean).join("\n").slice(0, MAX_SOURCE_CHARS),
  }));

  if (sources.length < 4) {
    throw new SignalError(
      "insufficient_evidence",
      "We did not find enough recent, credible public evidence for a trustworthy brief. Try a broader market, a 90-day window, or fewer companies.",
      422,
    );
  }

  return { periodStart: start, sources };
}
