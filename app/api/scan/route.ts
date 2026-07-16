import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { analyzeCompany } from "@/lib/scan/analyze";
import { ScanError } from "@/lib/scan/errors";
import { researchCompany } from "@/lib/scan/research";
import { scanRequestSchema } from "@/lib/scan/schema";
import {
  checkRateLimit,
  getCachedReport,
  publicLaunchConfigured,
  scanCacheKey,
  setCachedReport,
} from "@/lib/scan/storage";
import { assertPublicUrl, normalizeCompanyUrl } from "@/lib/scan/url";

export const runtime = "nodejs";
export const maxDuration = 60;

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    if (!publicLaunchConfigured()) {
      throw new ScanError(
        "scan_unconfigured",
        "FrontierGTM Scan is awaiting its public rate-limit configuration.",
        503,
      );
    }

    const payload = scanRequestSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ error: "invalid_request", message: "Invalid request." }, { status: 400 });

    const rate = await checkRateLimit(clientIdentifier(request));
    if (!rate.allowed) {
      throw new ScanError("rate_limited", "You have reached today’s scan limit. Try again tomorrow.", 429);
    }

    const companyUrl = normalizeCompanyUrl(payload.url);
    await assertPublicUrl(companyUrl);
    const cacheKey = scanCacheKey(companyUrl.hostname, payload.priority, payload.competitor);
    const cached = await getCachedReport(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true }, { headers: { "cache-control": "private, no-store" } });
    }

    const research = await researchCompany(companyUrl);
    const report = await analyzeCompany(payload, research.canonicalUrl, research.sources);
    await setCachedReport(cacheKey, report);

    return NextResponse.json(report, {
      headers: {
        "cache-control": "private, no-store",
        "x-scan-rate-remaining": String(rate.remaining),
      },
    });
  } catch (error) {
    if (error instanceof ScanError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "invalid_request", message: "Check the website and scan options, then try again." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "scan_failed", message: "FrontierGTM Scan could not complete this request. Please try again." },
      { status: 500 },
    );
  }
}
