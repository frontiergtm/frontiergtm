import { z } from "zod";

export const meetingTypes = ["discovery", "executive", "technical", "renewal", "expansion", "partner", "other"] as const;

export const dealRequestSchema = z.object({
  sellerUrl: z.string().trim().min(4).max(500),
  targetUrl: z.string().trim().min(4).max(500),
  meetingType: z.enum(meetingTypes).default("discovery"),
  meetingGoal: z.string().trim().min(10).max(500),
  context: z.string().trim().max(1_500).optional(),
  knownContacts: z.string().trim().max(500).optional(),
  website: z.string().max(0).optional(),
});

export const dealSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  domain: z.string(),
  purpose: z.enum(["seller", "target", "trigger"]),
  publishedDate: z.string().optional(),
});

const cited = z.object({ sourceIds: z.array(z.string()) });

export const generatedDealSchema = z.object({
  identity: z.object({
    sellerName: z.string(),
    sellerOffer: z.string(),
    targetName: z.string(),
    targetBusiness: z.string(),
  }),
  title: z.string(),
  accountThesis: z.object({
    oneLine: z.string(),
    whyThem: z.string(),
    whyNow: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
  }),
  preview: z.object({
    strongestSignal: cited.extend({ headline: z.string(), detail: z.string() }),
    openingQuestion: z.string(),
  }),
  triggerEvents: z.array(cited.extend({
    headline: z.string(),
    whatHappened: z.string(),
    commercialImplication: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
  })).min(3).max(6),
  priorities: z.array(cited.extend({
    priority: z.string(),
    evidence: z.string(),
    relevance: z.string(),
    status: z.enum(["observed", "inferred"]),
  })).min(3).max(5),
  opportunity: z.object({
    problemHypothesis: z.string(),
    valueHypothesis: z.string(),
    fit: z.enum(["strong", "plausible", "unclear", "weak"]),
    fitRationale: z.string(),
    nonFitRisks: z.array(z.string()).min(2).max(4),
    proofToBring: z.array(z.string()).min(3).max(5),
    proofGaps: z.array(z.string()).min(2).max(4),
  }),
  buyingCommittee: z.array(z.object({
    role: z.string(),
    likelyConcern: z.string(),
    message: z.string(),
    status: z.enum(["named", "hypothesized"]),
  })).min(3).max(6),
  meetingPlan: z.object({
    openingPointOfView: z.string(),
    agenda: z.array(z.object({ minute: z.string(), objective: z.string(), move: z.string() })).min(4).max(6),
    desiredNextStep: z.string(),
    walkAwaySignal: z.string(),
  }),
  discoveryQuestions: z.array(z.object({
    question: z.string(),
    whyAsk: z.string(),
    listenFor: z.string(),
  })).min(6).max(10),
  objections: z.array(z.object({
    objection: z.string(),
    response: z.string(),
    proofNeeded: z.string(),
  })).min(3).max(5),
  followUpEmail: z.object({ subject: z.string(), body: z.string() }),
  unknowns: z.array(z.string()).min(3).max(6),
  evidenceCoverage: z.object({
    confidence: z.enum(["high", "medium", "low"]),
    summary: z.string(),
    limitations: z.array(z.string()).max(5),
  }),
});

export const dealReportSchema = generatedDealSchema.extend({
  request: dealRequestSchema.omit({ website: true }),
  generatedAt: z.string(),
  sources: z.array(dealSourceSchema),
});

export const dealPreviewSchema = z.object({
  reportId: z.string().uuid(),
  identity: generatedDealSchema.shape.identity,
  title: z.string(),
  accountThesis: generatedDealSchema.shape.accountThesis,
  preview: generatedDealSchema.shape.preview,
  triggerEvents: generatedDealSchema.shape.triggerEvents.max(3),
  evidenceCoverage: generatedDealSchema.shape.evidenceCoverage,
  sources: z.array(dealSourceSchema),
  generatedAt: z.string(),
});

export const dealCheckoutSchema = z.object({
  reportId: z.string().uuid(),
  email: z.string().trim().email().max(254),
  website: z.string().max(0).optional(),
});

export const dealUnlockSchema = z.object({
  reportId: z.string().uuid(),
  sessionId: z.string().trim().min(10).max(500),
});

export type DealRequest = z.infer<typeof dealRequestSchema>;
export type DealSource = z.infer<typeof dealSourceSchema> & { excerpt: string };
export type DealReport = z.infer<typeof dealReportSchema>;
export type DealPreview = z.infer<typeof dealPreviewSchema>;
