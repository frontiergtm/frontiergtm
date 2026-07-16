import { createHash } from "node:crypto";
import type { ScanReport } from "@/lib/scan/schema";

const memoryCounts = new Map<string, { count: number; resetAt: number }>();
const memoryCache = new Map<string, { report: ScanReport; expiresAt: number }>();

function redisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisCommand<T>(command: Array<string | number>): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(4_000),
  });
  if (!response.ok) throw new Error("Redis request failed");
  const payload = (await response.json()) as { result?: T };
  return payload.result ?? null;
}

export function hashValue(value: string) {
  return createHash("sha256")
    .update(`${process.env.SCAN_RATE_LIMIT_SALT ?? "frontiergtm-scan-dev"}:${value}`)
    .digest("hex");
}

export function publicLaunchConfigured() {
  return process.env.NODE_ENV !== "production" || redisConfigured();
}

export async function checkRateLimit(identifier: string, limit = 3, scope = "scan") {
  const key = `frontiergtm:scan:rate:${scope}:${hashValue(identifier)}`;
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

export function scanCacheKey(domain: string, priority: string, competitor?: string) {
  return `frontiergtm:scan:cache:v1:${hashValue(`${domain}:${priority}:${competitor ?? ""}`)}`;
}

export async function getCachedReport(key: string) {
  if (redisConfigured()) {
    const value = await redisCommand<string>(["GET", key]);
    if (!value) return null;
    try {
      return JSON.parse(value) as ScanReport;
    } catch {
      return null;
    }
  }

  const cached = memoryCache.get(key);
  if (!cached || cached.expiresAt < Date.now()) return null;
  return cached.report;
}

export async function setCachedReport(key: string, report: ScanReport) {
  if (redisConfigured()) {
    await redisCommand(["SET", key, JSON.stringify(report), "EX", 86_400]);
    return;
  }
  memoryCache.set(key, { report, expiresAt: Date.now() + 86_400_000 });
}

export async function storeScanLead(payload: Record<string, unknown>) {
  if (!redisConfigured()) return false;
  const value = JSON.stringify({
    ...payload,
    source: "frontiergtm_scan",
    submittedAt: new Date().toISOString(),
  });
  await redisCommand(["LPUSH", "frontiergtm:scan:leads:v1", value]);
  await redisCommand(["LTRIM", "frontiergtm:scan:leads:v1", 0, 4_999]);
  return true;
}
