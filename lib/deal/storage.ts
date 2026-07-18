import { createHash, randomUUID } from "node:crypto";
import type { DealPreview, DealReport } from "@/lib/deal/schema";

const memoryCounts = new Map<string, { count: number; resetAt: number }>();
const memoryReports = new Map<string, { report: DealReport; expiresAt: number }>();
const memoryRequestIds = new Map<string, { reportId: string; expiresAt: number }>();
const REPORT_TTL = 7 * 86_400;

function redisConfigured() { return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN); }

async function redisCommand<T>(command: Array<string | number>) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(command), signal: AbortSignal.timeout(4_000) });
  if (!response.ok) throw new Error("Redis request failed");
  return ((await response.json()) as { result?: T }).result ?? null;
}

function hash(value: string) { return createHash("sha256").update(`${process.env.SCAN_RATE_LIMIT_SALT ?? "frontiergtm-deal-dev"}:${value}`).digest("hex"); }
function reportKey(reportId: string) { return `frontiergtm:deal:report:v1:${reportId}`; }

export function dealConfigured() { return process.env.NODE_ENV !== "production" || redisConfigured(); }
export function dealCheckoutConfigured() { return Boolean(process.env.STRIPE_SECRET_KEY); }
export function dealPriceCents() {
  const configured = Number(process.env.DEAL_PRICE_CENTS || 3900);
  return Number.isInteger(configured) && configured >= 500 && configured <= 100_000 ? configured : 3900;
}

export async function checkDealRate(identifier: string, limit = 3, scope = "brief") {
  const epoch = process.env.DEAL_RATE_LIMIT_EPOCH?.trim() || "v1";
  const key = `frontiergtm:deal:rate:${epoch}:${scope}:${hash(identifier)}`;
  if (redisConfigured()) {
    const count = Number((await redisCommand<number>(["INCR", key])) ?? 0);
    if (count === 1) await redisCommand(["EXPIRE", key, 86_400]);
    return { allowed: count <= limit, remaining: Math.max(limit - count, 0) };
  }
  const now = Date.now();
  const current = memoryCounts.get(key);
  const entry = !current || current.resetAt < now ? { count: 1, resetAt: now + 86_400_000 } : { ...current, count: current.count + 1 };
  memoryCounts.set(key, entry);
  return { allowed: entry.count <= limit, remaining: Math.max(limit - entry.count, 0) };
}

export function dealRequestKey(input: object) { return `frontiergtm:deal:request:v1:${hash(JSON.stringify(input))}`; }

export async function getDealReport(reportId: string) {
  if (redisConfigured()) {
    const value = await redisCommand<string>(["GET", reportKey(reportId)]);
    if (!value) return null;
    try { return JSON.parse(value) as DealReport; } catch { return null; }
  }
  const stored = memoryReports.get(reportId);
  return stored && stored.expiresAt > Date.now() ? stored.report : null;
}

export async function getReportIdForRequest(key: string) {
  if (redisConfigured()) return redisCommand<string>(["GET", key]);
  const stored = memoryRequestIds.get(key);
  return stored && stored.expiresAt > Date.now() ? stored.reportId : null;
}

export async function storeDealReport(requestKey: string, report: DealReport) {
  const reportId = randomUUID();
  if (redisConfigured()) {
    await Promise.all([
      redisCommand(["SET", reportKey(reportId), JSON.stringify(report), "EX", REPORT_TTL]),
      redisCommand(["SET", requestKey, reportId, "EX", REPORT_TTL]),
    ]);
  } else {
    const expiresAt = Date.now() + REPORT_TTL * 1_000;
    memoryReports.set(reportId, { report, expiresAt });
    memoryRequestIds.set(requestKey, { reportId, expiresAt });
  }
  return reportId;
}

export function previewDeal(reportId: string, report: DealReport): DealPreview {
  return {
    reportId,
    identity: report.identity,
    title: report.title,
    accountThesis: report.accountThesis,
    preview: report.preview,
    triggerEvents: report.triggerEvents.slice(0, 3),
    evidenceCoverage: report.evidenceCoverage,
    sources: report.sources,
    generatedAt: report.generatedAt,
  };
}

export async function storeDealPurchase(payload: Record<string, unknown>) {
  if (!redisConfigured()) return false;
  const value = JSON.stringify({ ...payload, source: "frontiergtm_deal", recordedAt: new Date().toISOString() });
  await redisCommand(["LPUSH", "frontiergtm:deal:purchases:v1", value]);
  await redisCommand(["LTRIM", "frontiergtm:deal:purchases:v1", 0, 4_999]);
  return true;
}
