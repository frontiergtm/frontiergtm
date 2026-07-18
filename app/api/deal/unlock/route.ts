import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ZodError } from "zod";
import { dealUnlockSchema } from "@/lib/deal/schema";
import { checkDealRate, getDealReport, storeDealPurchase } from "@/lib/deal/storage";

export const runtime = "nodejs";

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "checkout_unconfigured", message: "Secure report unlock is not configured yet." }, { status: 503 });
    const payload = dealUnlockSchema.parse(await request.json());
    const rate = await checkDealRate(clientIdentifier(request), 12, "unlock");
    if (!rate.allowed) return NextResponse.json({ error: "rate_limited", message: "Too many unlock attempts. Please try again later." }, { status: 429 });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(payload.sessionId);
    if (session.mode !== "payment" || session.payment_status !== "paid" || session.metadata?.reportId !== payload.reportId || session.client_reference_id !== payload.reportId) {
      return NextResponse.json({ error: "payment_required", message: "We could not verify payment for this report." }, { status: 402 });
    }
    const report = await getDealReport(payload.reportId);
    if (!report) return NextResponse.json({ error: "report_expired", message: "The paid brief has expired from temporary storage. Contact Ryan and we will restore it." }, { status: 410 });
    await storeDealPurchase({
      reportId: payload.reportId,
      checkoutSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      email: session.customer_details?.email || session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      targetName: report.identity.targetName,
      sellerName: report.identity.sellerName,
    }).catch(() => false);
    return NextResponse.json(report, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "invalid_request", message: "The report or payment reference is invalid." }, { status: 400 });
    if (process.env.NODE_ENV !== "production") console.error("Deal unlock failed", error);
    return NextResponse.json({ error: "unlock_failed", message: "We could not verify and unlock this brief. Please try again." }, { status: 500 });
  }
}
