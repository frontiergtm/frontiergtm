import { createHash } from "node:crypto";
import type { SignalReport } from "@/lib/signal/schema";

const memoryCounts = new Map<string, { count: number; resetAt: number }>();
const memoryCache = new Map<string, { report: SignalReport; expiresAt: number }>();

function redisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
async function redisCommand<T>(command: Array<string | number>) {
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
  return ((await response.json()) as { result?: T }).result ?? null;
}

function hash(value: string) {
  return createHash("sha256").update(`${process.env.SCAN_RATE_LIMIT_SALT ?? "frontiergtm-signal-dev"}:${value}`).digest("hex");
}

export function signalLaunchConfigured() {
  return process.env.NODE_ENV !== "production" || redisConfigured();
}

export async function checkSignalRate(identifier: string, limit = 3, scope = "brief") {
  const key = `frontiergtm:signal:rate:v1:${scope}:${hash(identifier)}`;
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

export function signalCacheKey(input: object) {
  return `frontiergtm:signal:cache:v2:${hash(JSON.stringify(input))}`;
}

export async function getCachedSignal(key: string) {
  if (redisConfigured()) {
    const value = await redisCommand<string>(["GET", key]);
    if (!value) return null;
    try { return JSON.parse(value) as SignalReport; } catch { return null; }
  }
  const cached = memoryCache.get(key);
  return cached && cached.expiresAt > Date.now() ? cached.report : null;
}

export async function setCachedSignal(key: string, report: SignalReport) {
  if (redisConfigured()) {
    await redisCommand(["SET", key, JSON.stringify(report), "EX", 21_600]);
    return;
  }
  memoryCache.set(key, { report, expiresAt: Date.now() + 21_600_000 });
}

export async function storeSignalLead(payload: Record<string, unknown>) {
  if (!redisConfigured()) return false;
  const value = JSON.stringify({ ...payload, source: "frontiergtm_signal", submittedAt: new Date().toISOString() });
  await redisCommand(["LPUSH", "frontiergtm:signal:leads:v1", value]);
  await redisCommand(["LTRIM", "frontiergtm:signal:leads:v1", 0, 4_999]);
  return true;
}
