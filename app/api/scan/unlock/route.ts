import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { unlockRequestSchema } from "@/lib/scan/schema";
import { checkRateLimit, storeScanLead } from "@/lib/scan/storage";

export const runtime = "nodejs";

function clientIdentifier(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
    return entities[character];
  });
}

async function sendToWebhook(payload: ReturnType<typeof unlockRequestSchema.parse>) {
  const url = process.env.SCAN_LEAD_WEBHOOK_URL;
  if (!url) return false;
  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(8_000),
    headers: {
      "content-type": "application/json",
      ...(process.env.SCAN_LEAD_WEBHOOK_TOKEN
        ? { authorization: `Bearer ${process.env.SCAN_LEAD_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ ...payload, source: "frontiergtm_scan", submittedAt: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error("Lead webhook failed");
  return true;
}

async function sendWithResend(payload: ReturnType<typeof unlockRequestSchema.parse>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(8_000),
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.SCAN_FROM_EMAIL || "FrontierGTM Scan <scan@frontiergtm.ai>",
      to: [process.env.SCAN_LEAD_TO_EMAIL || "ryan@frontiergtm.ai"],
      reply_to: payload.email,
      subject: `FrontierGTM Scan lead: ${payload.companyName}`,
      html: `<h2>New FrontierGTM Scan lead</h2>
        <p><strong>Company:</strong> ${escapeHtml(payload.companyName)} — <a href="${escapeHtml(payload.companyUrl)}">${escapeHtml(payload.companyUrl)}</a></p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Role:</strong> ${escapeHtml(payload.role)}</p>
        <p><strong>Priority:</strong> ${escapeHtml(payload.priority)}</p>
        <h3>Executive readout</h3><p>${escapeHtml(payload.executiveReadout)}</p>`,
    }),
  });
  if (!response.ok) throw new Error("Resend delivery failed");
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const payload = unlockRequestSchema.parse(await request.json());
    if (payload.website) return NextResponse.json({ error: "invalid_request", message: "Invalid request." }, { status: 400 });

    const rate = await checkRateLimit(clientIdentifier(request), 10, "unlock");
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "rate_limited", message: "Too many unlock attempts. Please try again tomorrow." },
        { status: 429 },
      );
    }

    const captureAttempts = await Promise.allSettled([
      storeScanLead(payload),
      sendToWebhook(payload),
      sendWithResend(payload),
    ]);
    const captured = captureAttempts.some((attempt) => attempt.status === "fulfilled" && attempt.value);

    if (!captured && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "lead_capture_failed", message: "We could not unlock the full report just now. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "invalid_request", message: "Enter a valid work email and role." }, { status: 400 });
    }
    return NextResponse.json({ error: "unlock_failed", message: "We could not unlock the report. Please try again." }, { status: 500 });
  }
}
