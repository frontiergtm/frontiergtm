import { NextRequest, NextResponse } from "next/server";
import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { sanityClient } from "@/lib/sanity/client";
import { hasSanityConfig } from "@/lib/sanity/env";

const { GET: enableDraftMode } = defineEnableDraftMode({
  client: sanityClient.withConfig({ token: process.env.SANITY_API_READ_TOKEN || "" }),
});

export async function GET(request: NextRequest) {
  if (!hasSanityConfig || !process.env.SANITY_API_READ_TOKEN) {
    return NextResponse.json({ error: "draft_preview_not_configured" }, { status: 503 });
  }
  return enableDraftMode(request);
}
