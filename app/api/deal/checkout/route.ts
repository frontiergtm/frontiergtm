import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ZodError } from "zod";
import { dealCheckoutSchema } from "@/lib/deal/schema";
import { checkDealRate, dealCheckoutConfigured, dealPriceCents, getDealReport } from "@/lib/deal/storage";

export const runtime = "nodejs";

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function safeOrigin(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const origin = request.nextUrl.origin;
  return origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") ? origin : "https://www.frontiergtm.ai";
}

export async function POST(request: NextRequest) {
  try {
    if (!dealCheckoutConfigured()) return NextResponse.json({ error: "checkout_unconfigured", message: "Paid briefs are not open yet. Email Ryan for founding access." }, { status: 503 });
    const payload = dealCheckoutSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ error: "invalid_request", message: "Invalid request." }, { status: 400 });
    const rate = await checkDealRate(clientIdentifier(request), 8, "checkout");
    if (!rate.allowed) return NextResponse.json({ error: "rate_limited", message: "Too many checkout attempts. Please try again later." }, { status: 429 });
    const report = await getDealReport(payload.reportId);
    if (!report) return NextResponse.json({ error: "report_expired", message: "This brief has expired. Generate a fresh preview to continue." }, { status: 404 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const origin = safeOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      customer_email: payload.email,
      client_reference_id: payload.reportId,
      metadata: { reportId: payload.reportId, product: "frontiergtm_deal_intelligence" },
      payment_intent_data: {
        description: `FrontierGTM Deal Intelligence — ${report.identity.targetName}`,
        metadata: { reportId: payload.reportId, product: "frontiergtm_deal_intelligence" },
      },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: dealPriceCents(),
          product_data: {
            name: "FrontierGTM Deal Intelligence Brief",
            description: `Complete account and meeting brief for ${report.identity.targetName}`,
          },
        },
      }],
      success_url: `${origin}/deal?report=${encodeURIComponent(payload.reportId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/deal?report=${encodeURIComponent(payload.reportId)}&checkout=cancelled`,
    });
    if (!session.url) throw new Error("Stripe Checkout returned no URL");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "invalid_request", message: "Enter a valid work email and try again." }, { status: 400 });
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Deal checkout failed", { type: error.type, code: error.code, param: error.param, message: error.message });
    } else {
      console.error("Deal checkout failed", { message: error instanceof Error ? error.message : "Unknown checkout error" });
    }
    return NextResponse.json({ error: "checkout_failed", message: "Checkout could not start just now. Please try again." }, { status: 500 });
  }
}
