import { z } from "zod";

export const launchTypes = ["product", "feature", "platform", "pricing", "partnership", "availability", "company", "other"] as const;
export const launchStages = ["exploring", "planning", "ready", "announced"] as const;
export const launchGoals = ["awareness", "pipeline", "adoption", "expansion", "category"] as const;

export const launchRequestSchema = z.object({
  companyUrl: z.string().trim().min(4).max(500),
  launchName: z.string().trim().min(2).max(160),
  description: z.string().trim().min(30).max(1_200),
  primaryBuyer: z.string().trim().min(2).max(200),
  launchType: z.enum(launchTypes),
  stage: z.enum(launchStages),
  goal: z.enum(launchGoals),
  launchUrl: z.string().trim().max(500).optional(),
  launchDate: z.string().trim().max(40).optional(),
  competitors: z.array(z.string().trim().min(1).max(100)).max(3).default([]),
  proofAndConstraints: z.string().trim().max(1_200).optional(),
  website: z.string().max(0).optional(),
});

export const launchSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  domain: z.string(),
  purpose: z.enum(["company", "launch", "market"]),
  publishedDate: z.string().optional(),
});

const cited = z.object({ sourceIds: z.array(z.string()) });

const activationActionSchema = z.object({
  title: z.string(),
  owner: z.enum(["executive", "marketing", "product", "sales", "partnerships", "cross-functional"]),
  timing: z.string(),
  deliverable: z.string(),
  rationale: z.string(),
});

export const generatedLaunchSchema = z.object({
  identity: z.object({
    companyName: z.string(),
    category: z.string(),
    launchName: z.string(),
    targetBuyer: z.string(),
  }),
  readiness: z.object({
    score: z.number().int().min(0).max(100),
    verdict: z.enum(["ready", "conditional", "not-ready"]),
    rationale: z.string(),
    blockers: z.array(z.string()).max(4),
  }),
  executiveDiagnosis: z.string(),
  launchThesis: z.object({
    oneLine: z.string(),
    whyNow: z.string(),
    transformation: z.string(),
    differentiation: z.string(),
    proofAnchor: z.string(),
  }),
  preview: z.object({
    marketOpening: z.string(),
    criticalRisk: z.string(),
  }),
  marketOpenings: z.array(cited.extend({
    title: z.string(),
    evidence: z.string(),
    implication: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
  })).min(2).max(4),
  narrative: z.object({
    context: z.string(),
    tension: z.string(),
    change: z.string(),
    promise: z.string(),
    differentiation: z.string(),
    proof: z.string(),
    callToAction: z.string(),
  }),
  buyerFrame: z.object({
    buyer: z.string(),
    trigger: z.string(),
    desiredOutcome: z.string(),
    primaryObjection: z.string(),
    requiredProof: z.string(),
    languageToUse: z.array(z.string()).min(3).max(5),
    languageToAvoid: z.array(z.string()).min(2).max(4),
  }),
  claimStack: z.object({
    categoryLine: z.string(),
    headline: z.string(),
    supportingClaims: z.array(cited.extend({
      claim: z.string(),
      evidenceStatus: z.enum(["supported", "user-context", "needs-proof"]),
      proofNeeded: z.string(),
    })).min(3).max(3),
  }),
  risks: z.array(cited.extend({
    title: z.string(),
    severity: z.enum(["high", "medium", "low"]),
    why: z.string(),
    mitigation: z.string(),
  })).min(3).max(5),
  activationPlan: z.object({
    preLaunch: z.array(activationActionSchema).min(3).max(5),
    launchDay: z.array(activationActionSchema).min(3).max(5),
    sustain: z.array(activationActionSchema).min(3).max(5),
  }),
  assets: z.object({
    announcement: z.object({
      title: z.string(),
      subhead: z.string(),
      outline: z.array(z.object({ section: z.string(), brief: z.string() })).min(4).max(7),
    }),
    executivePost: z.string(),
    salesTalkTrack: z.object({
      opening: z.string(),
      discoveryQuestion: z.string(),
      valueFrame: z.string(),
      proofPoint: z.string(),
      objectionResponse: z.string(),
      callToAction: z.string(),
    }),
  }),
  calendar: z.array(z.object({
    day: z.string(),
    moment: z.string(),
    channel: z.string(),
    action: z.string(),
    goal: z.string(),
  })).min(6).max(10),
  evidenceCoverage: z.object({
    confidence: z.enum(["high", "medium", "low"]),
    summary: z.string(),
    limitations: z.array(z.string()).max(4),
  }),
});

export const launchReportSchema = generatedLaunchSchema.extend({
  request: launchRequestSchema.omit({ website: true }),
  generatedAt: z.string(),
  sources: z.array(launchSourceSchema),
  cached: z.boolean().optional(),
});

export const launchUnlockSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(["executive", "marketing", "product", "sales", "strategy", "investor", "other"]),
  companyName: z.string().trim().min(1).max(200),
  companyUrl: z.string().url().max(500),
  launchName: z.string().trim().min(2).max(160),
  launchType: z.enum(launchTypes),
  stage: z.enum(launchStages),
  goal: z.enum(launchGoals),
  readinessScore: z.number().int().min(0).max(100),
  executiveDiagnosis: z.string().trim().max(3_000),
  reviewedInterest: z.boolean().default(false),
  website: z.string().max(0).optional(),
});

export type LaunchRequest = z.infer<typeof launchRequestSchema>;
export type LaunchSource = z.infer<typeof launchSourceSchema> & { excerpt: string };
export type LaunchReport = z.infer<typeof launchReportSchema>;
