import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { analyzeLaunch } from "@/lib/launch/analyze";
import { LaunchError } from "@/lib/launch/errors";
import { researchLaunch } from "@/lib/launch/research";
import { launchRequestSchema } from "@/lib/launch/schema";
import { checkLaunchRate, getCachedLaunch, launchCacheKey, launchConfigured, setCachedLaunch } from "@/lib/launch/storage";

export const runtime = "nodejs";
export const maxDuration = 120;

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    if (!launchConfigured()) throw new LaunchError("launch_unconfigured", "FrontierGTM Launch is awaiting its public launch configuration.", 503);
    const payload = launchRequestSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ error: "invalid_request", message: "Invalid request." }, { status: 400 });
    const key = launchCacheKey(payload);
    const cached = await getCachedLaunch(key);
    if (cached) return NextResponse.json({ ...cached, cached: true }, { headers: { "cache-control": "private, no-store" } });

    const research = await researchLaunch(payload);
    const rate = await checkLaunchRate(clientIdentifier(request));
    if (!rate.allowed) throw new LaunchError("rate_limited", "You have reached the rolling 24-hour Launch limit. Please try again later.", 429);
    const report = await analyzeLaunch(payload, research.canonicalUrl, research.sources);
    await setCachedLaunch(key, report);
    return NextResponse.json(report, { headers: { "cache-control": "private, no-store", "x-launch-rate-remaining": String(rate.remaining) } });
  } catch (error) {
    if (error instanceof LaunchError) return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
    if (error instanceof ZodError) return NextResponse.json({ error: "invalid_request", message: "Check the company, launch, buyer, and launch options, then try again." }, { status: 400 });
    return NextResponse.json({ error: "launch_failed", message: "FrontierGTM Launch could not complete this brief. Please try again." }, { status: 500 });
  }
}
