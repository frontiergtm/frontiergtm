import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { signalUnlockSchema } from "@/lib/signal/schema";
import { checkSignalRate, storeSignalLead } from "@/lib/signal/storage";

export const runtime = "nodejs";

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
  return value.replace(/[&<>'"]/g, (character) => entities[character]);
}

async function sendWithResend(payload: ReturnType<typeof signalUnlockSchema.parse>) {
  if (!process.env.RESEND_API_KEY) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8_000),
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.SIGNAL_FROM_EMAIL || process.env.SCAN_FROM_EMAIL || "FrontierGTM Signal <signal@frontiergtm.ai>",
      to: [process.env.SIGNAL_LEAD_TO_EMAIL || process.env.SCAN_LEAD_TO_EMAIL || "ryan@frontiergtm.ai"],
      reply_to: payload.email,
      subject: `FrontierGTM Signal lead: ${payload.company}`,
      html: `<h2>New FrontierGTM Signal lead</h2><p><strong>Company:</strong> ${escapeHtml(payload.company)}</p><p><strong>Email:</strong> ${escapeHtml(payload.email)}</p><p><strong>Role:</strong> ${escapeHtml(payload.role)}</p><p><strong>Market:</strong> ${escapeHtml(payload.market)}</p><p><strong>Question:</strong> ${escapeHtml(payload.question)}</p><p><strong>Weekly interest:</strong> ${payload.weeklyInterest ? "Yes" : "No"}</p><h3>${escapeHtml(payload.reportTitle)}</h3><p>${escapeHtml(payload.executiveSummary)}</p>`,
    }),
  });
  if (!response.ok) throw new Error("Resend delivery failed");
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const payload = signalUnlockSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ error: "invalid_request", message: "Invalid request." }, { status: 400 });
    const rate = await checkSignalRate(clientIdentifier(request), 10, "unlock");
    if (!rate.allowed) return NextResponse.json({ error: "rate_limited", message: "Too many unlock attempts. Please try again later." }, { status: 429 });
    const captures = await Promise.allSettled([storeSignalLead(payload), sendWithResend(payload)]);
    const captured = captures.some((item) => item.status === "fulfilled" && item.value);
    if (!captured && process.env.NODE_ENV === "production") return NextResponse.json({ error: "lead_capture_failed", message: "We could not unlock the brief just now. Please try again." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "invalid_request", message: "Enter a valid work email and role." }, { status: 400 });
    return NextResponse.json({ error: "unlock_failed", message: "We could not unlock the brief. Please try again." }, { status: 500 });
  }
}
