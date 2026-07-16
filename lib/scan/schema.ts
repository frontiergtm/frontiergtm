import { z } from "zod";

export const scanPriorities = [
  "general",
  "positioning",
  "launch",
  "conversion",
  "competitive",
  "market-entry",
] as const;

export const scanRequestSchema = z.object({
  url: z.string().trim().min(4).max(500),
  priority: z.enum(scanPriorities).default("general"),
  competitor: z.string().trim().max(200).optional(),
  website: z.string().max(0).optional(),
});

export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  kind: z.enum(["company", "external"]),
  publishedDate: z.string().optional(),
});

const findingSchema = z.object({
  title: z.string(),
  observation: z.string(),
  whyItMatters: z.string(),
  factOrInference: z.enum(["fact", "inference"]),
  confidence: z.enum(["high", "medium", "low"]),
  sourceIds: z.array(z.string()),
});

const actionSchema = z.object({
  title: z.string(),
  recommendation: z.string(),
  rationale: z.string(),
  example: z.string(),
  impact: z.enum(["high", "medium", "low"]),
  effort: z.enum(["high", "medium", "low"]),
  sourceIds: z.array(z.string()),
});

export const generatedScanSchema = z.object({
  company: z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    primaryBuyer: z.string(),
    targetFit: z.enum(["strong", "adjacent", "outside"]),
  }),
  snapshot: z.object({
    whatLandsClearly: z.string(),
    whatRemainsUnclear: z.string(),
    highestLeverageMove: z.string(),
  }),
  executiveReadout: z.string(),
  marketStory: z.object({
    category: z.string(),
    audience: z.string(),
    problem: z.string(),
    promise: z.string(),
    differentiation: z.string(),
    callToAction: z.string(),
  }),
  buyerClarity: z.object({
    likelyBuyer: z.string(),
    likelyUser: z.string(),
    trigger: z.string(),
    ambiguity: z.string(),
  }),
  strengths: z.array(findingSchema).min(2).max(4),
  gaps: z.array(findingSchema).min(2).max(4),
  proofAndConversion: z.array(findingSchema).min(2).max(4),
  actions: z.array(actionSchema).min(3).max(3),
  evidenceCoverage: z.object({
    confidence: z.enum(["high", "medium", "low"]),
    summary: z.string(),
    limitations: z.array(z.string()).max(4),
  }),
});

export const scanReportSchema = generatedScanSchema.extend({
  company: generatedScanSchema.shape.company.extend({ url: z.string().url() }),
  generatedAt: z.string(),
  sources: z.array(sourceSchema),
  cached: z.boolean().optional(),
});

export const unlockRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(["executive", "marketing", "product", "sales", "investor", "other"]),
  priority: z.enum(scanPriorities),
  companyUrl: z.string().url().max(500),
  companyName: z.string().trim().min(1).max(200),
  executiveReadout: z.string().trim().max(2000),
  website: z.string().max(0).optional(),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;
export type ScanSource = z.infer<typeof sourceSchema> & { excerpt: string };
export type GeneratedScan = z.infer<typeof generatedScanSchema>;
export type ScanReport = z.infer<typeof scanReportSchema>;
