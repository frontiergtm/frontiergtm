import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { analyzeSignals } from "@/lib/signal/analyze";
import { SignalError } from "@/lib/signal/errors";
import { researchMarket } from "@/lib/signal/research";
import { signalRequestSchema } from "@/lib/signal/schema";
import { checkSignalRate, getCachedSignal, setCachedSignal, signalCacheKey, signalLaunchConfigured } from "@/lib/signal/storage";

export const runtime = "nodejs";
export const maxDuration = 120;

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
export async function POST(request: NextRequest) {
  try {
    if (!signalLaunchConfigured()) throw new SignalError("signal_unconfigured", "FrontierGTM Signal is awaiting its public launch configuration.", 503);
    const payload = signalRequestSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ error: "invalid_request", message: "Invalid request." }, { status: 400 });

    const key = signalCacheKey(payload);
    const cached = await getCachedSignal(key);
    if (cached) return NextResponse.json({ ...cached, cached: true }, { headers: { "cache-control": "private, no-store" } });

    const research = await researchMarket(payload);
    const rate = await checkSignalRate(clientIdentifier(request));
    if (!rate.allowed) throw new SignalError("rate_limited", "You have reached the rolling 24-hour Signal limit. Please try again later.", 429);

    const report = await analyzeSignals(payload, research.periodStart, research.sources);
    await setCachedSignal(key, report);
    return NextResponse.json(report, { headers: { "cache-control": "private, no-store", "x-signal-rate-remaining": String(rate.remaining) } });
  } catch (error) {
    if (error instanceof SignalError) return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
    if (error instanceof ZodError) return NextResponse.json({ error: "invalid_request", message: "Check the company, market, question, and watchlist, then try again." }, { status: 400 });
    return NextResponse.json({ error: "signal_failed", message: "FrontierGTM Signal could not complete this brief. Please try again." }, { status: 500 });
  }
}
