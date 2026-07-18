import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { analyzeDeal } from "@/lib/deal/analyze";
import { DealError } from "@/lib/deal/errors";
import { researchDeal } from "@/lib/deal/research";
import { dealRequestSchema } from "@/lib/deal/schema";
import { checkDealRate, dealConfigured, dealRequestKey, getDealReport, getReportIdForRequest, previewDeal, storeDealReport } from "@/lib/deal/storage";

export const runtime = "nodejs";
export const maxDuration = 120;

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    if (!dealConfigured()) throw new DealError("deal_unconfigured", "Deal Intelligence is awaiting its secure report storage connection.", 503);
    const payload = dealRequestSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ error: "invalid_request", message: "Invalid request." }, { status: 400 });
    const key = dealRequestKey(payload);
    const existingId = await getReportIdForRequest(key);
    if (existingId) {
      const cached = await getDealReport(existingId);
      if (cached) return NextResponse.json({ ...previewDeal(existingId, cached), cached: true }, { headers: { "cache-control": "private, no-store" } });
    }

    const rate = await checkDealRate(clientIdentifier(request));
    if (!rate.allowed) throw new DealError("rate_limited", "You have reached the rolling 24-hour Deal Intelligence limit. Please try again later.", 429);
    const research = await researchDeal(payload);
    const report = await analyzeDeal(payload, research.sellerUrl, research.targetUrl, research.sources);
    const reportId = await storeDealReport(key, report);
    return NextResponse.json(previewDeal(reportId, report), { headers: { "cache-control": "private, no-store", "x-deal-rate-remaining": String(rate.remaining) } });
  } catch (error) {
    if (error instanceof DealError) return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
    if (error instanceof ZodError) return NextResponse.json({ error: "invalid_request", message: "Check both company URLs, your meeting goal, and the optional context, then try again." }, { status: 400 });
    if (process.env.NODE_ENV !== "production") console.error("Deal generation failed", error);
    return NextResponse.json({ error: "deal_failed", message: "Deal Intelligence could not complete this brief. Please try again." }, { status: 500 });
  }
}
