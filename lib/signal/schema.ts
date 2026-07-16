import { z } from "zod";

export const signalHorizons = ["7d", "30d", "90d"] as const;

export const signalRequestSchema = z.object({
  company: z.string().trim().min(2).max(120),
  market: z.string().trim().min(2).max(160),
  question: z.string().trim().min(10).max(400),
  watchlist: z.array(z.string().trim().min(1).max(100)).max(3).default([]),
  horizon: z.enum(signalHorizons).default("30d"),
  website: z.string().max(0).optional(),
});

export const signalSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  publishedDate: z.string().optional(),
  domain: z.string(),
});

const sourcedItem = z.object({
  sourceIds: z.array(z.string()),
});

export const generatedSignalSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  marketRead: z.object({
    direction: z.string(),
    velocity: z.enum(["accelerating", "steady", "mixed", "unclear"]),
    confidence: z.enum(["high", "medium", "low"]),
  }),
  developments: z.array(sourcedItem.extend({
    headline: z.string(),
    whatChanged: z.string(),
    whyItMatters: z.string(),
    signalType: z.enum(["product", "positioning", "pricing", "partnership", "adoption", "funding", "regulatory", "other"]),
    confidence: z.enum(["high", "medium", "low"]),
  })).min(3).max(5),
  watchlistMoves: z.array(sourcedItem.extend({
    company: z.string(),
    move: z.string(),
    implication: z.string(),
  })).max(5),
  implications: z.array(z.object({
    title: z.string(),
    explanation: z.string(),
    urgency: z.enum(["now", "next", "watch"]),
  })).min(3).max(5),
  actions: z.array(sourcedItem.extend({
    title: z.string(),
    action: z.string(),
    rationale: z.string(),
    timing: z.enum(["this-week", "this-month", "monitor"]),
  })).min(3).max(3),
  evidenceCoverage: z.object({
    confidence: z.enum(["high", "medium", "low"]),
    summary: z.string(),
    limitations: z.array(z.string()).max(4),
  }),
});

export const signalReportSchema = generatedSignalSchema.extend({
  request: signalRequestSchema.omit({ website: true }),
  generatedAt: z.string(),
  periodStart: z.string(),
  sources: z.array(signalSourceSchema),
  cached: z.boolean().optional(),
});

export const signalUnlockSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(["executive", "marketing", "product", "sales", "strategy", "investor", "other"]),
  company: z.string().trim().min(2).max(120),
  market: z.string().trim().min(2).max(160),
  question: z.string().trim().min(10).max(400),
  reportTitle: z.string().trim().min(2).max(300),
  executiveSummary: z.string().trim().max(2500),
  watchlist: z.array(z.string().trim().max(100)).max(3),
  horizon: z.enum(signalHorizons),
  weeklyInterest: z.boolean().default(false),
  website: z.string().max(0).optional(),
});

export type SignalRequest = z.infer<typeof signalRequestSchema>;
export type SignalSource = z.infer<typeof signalSourceSchema> & { excerpt: string };
export type SignalReport = z.infer<typeof signalReportSchema>;
