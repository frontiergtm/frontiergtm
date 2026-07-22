import { z } from "zod";

export const strategyStages = ["exploring", "early-revenue", "scaling", "established", "transformation"] as const;
export const strategyObjectives = ["find-focus", "create-category", "enter-market", "grow-pipeline", "accelerate-adoption", "move-enterprise", "retain-expand"] as const;

export const strategyRequestSchema = z.object({
  companyUrl: z.string().trim().min(4).max(500),
  stage: z.enum(strategyStages),
  objective: z.enum(strategyObjectives),
  objectiveDetail: z.string().trim().min(20).max(900),
  offer: z.string().trim().min(10).max(900),
  buyer: z.string().trim().min(2).max(300),
  constraint: z.string().trim().min(10).max(700),
  currentMotion: z.string().trim().max(700).optional(),
  competitors: z.array(z.string().trim().min(1).max(120)).max(3).default([]),
  learnings: z.string().trim().max(1_200).optional(),
  proof: z.string().trim().max(1_200).optional(),
  decision: z.string().trim().max(700).optional(),
  website: z.string().max(0).optional(),
});

export const strategySourceSchema = z.object({
  id: z.string(), title: z.string(), url: z.string().url(), domain: z.string(),
  purpose: z.enum(["company", "market", "buyer", "competitor"]), publishedDate: z.string().optional(),
});

const sourceIds = z.array(z.string());
const status = z.enum(["observed", "user-context", "inferred", "unknown"]);
const insight = z.object({ title: z.string(), analysis: z.string(), implication: z.string(), status, sourceIds });
const choice = z.object({ choice: z.string(), rationale: z.string(), status, sourceIds });

export const generatedStrategySchema = z.object({
  identity: z.object({ companyName: z.string(), category: z.string(), stage: z.string(), objective: z.string() }),
  verdict: z.object({ focusScore: z.number().int().min(0).max(100), verdict: z.enum(["focused", "promising-but-diffuse", "underdetermined", "conflicted"]), confidence: z.enum(["high", "medium", "low"]), rationale: z.string() }),
  preview: z.object({ centralChoice: z.string(), consequentialTension: z.string(), publicSignals: z.array(insight).min(3).max(3) }),
  executiveStrategy: z.object({ oneLine: z.string(), governingDiagnosis: z.string(), whyNow: z.string() }),
  situation: z.object({ companyReality: insight, marketReality: insight, buyerReality: insight, constraintReality: insight }),
  whereToPlay: z.object({ priorityMarket: choice, priorityBuyer: choice, buyingSituation: choice, highValueProblem: choice, initialWedge: choice }),
  howToWin: z.object({ categoryFrame: choice, differentiatedValue: choice, credibleAdvantage: choice, proofStrategy: choice, gtmMotion: choice }),
  commitments: z.array(choice).min(3).max(3),
  nonPriorities: z.array(choice).min(3).max(3),
  assumptions: z.array(z.object({ assumption: z.string(), currentEvidence: z.string(), confidence: z.enum(["high", "medium", "low"]), test: z.string(), sourceIds })).min(4).max(7),
  risks: z.array(z.object({ risk: z.string(), severity: z.enum(["high", "medium", "low"]), why: z.string(), mitigation: z.string(), sourceIds })).min(3).max(5),
  agenda: z.array(z.object({ phase: z.string(), timing: z.string(), objective: z.string(), actions: z.array(z.object({ action: z.string(), owner: z.string(), outcome: z.string(), checkpoint: z.string() })).min(3).max(5) })).min(3).max(3),
  measurement: z.object({ leadingIndicators: z.array(z.string()).min(3).max(6), businessOutcomes: z.array(z.string()).min(2).max(5), changeConditions: z.array(z.string()).min(3).max(5) }),
  agentRouting: z.array(z.object({ agent: z.enum(["Scan", "Signal", "Launch", "Deal"]), priority: z.enum(["now", "next", "later"]), why: z.string(), question: z.string(), expectedDecision: z.string() })).min(2).max(4),
  evidenceCoverage: z.object({ confidence: z.enum(["high", "medium", "low"]), summary: z.string(), limitations: z.array(z.string()).max(5) }),
});

export const strategyReportSchema = generatedStrategySchema.extend({ request: strategyRequestSchema.omit({ website: true }), generatedAt: z.string(), sources: z.array(strategySourceSchema) });
export const strategyPreviewSchema = z.object({ reportId: z.string().uuid(), priceCents: z.number().int(), identity: generatedStrategySchema.shape.identity, verdict: generatedStrategySchema.shape.verdict, preview: generatedStrategySchema.shape.preview, executiveStrategy: generatedStrategySchema.shape.executiveStrategy, evidenceCoverage: generatedStrategySchema.shape.evidenceCoverage, sources: z.array(strategySourceSchema), generatedAt: z.string() });
export const strategyCheckoutSchema = z.object({ reportId: z.string().uuid(), email: z.string().trim().email().max(254), website: z.string().max(0).optional() });
export const strategyUnlockSchema = z.object({ reportId: z.string().uuid(), sessionId: z.string().trim().min(10).max(500) });

export type StrategyRequest = z.infer<typeof strategyRequestSchema>;
export type StrategySource = z.infer<typeof strategySourceSchema> & { excerpt: string };
export type StrategyReport = z.infer<typeof strategyReportSchema>;
export type StrategyPreview = z.infer<typeof strategyPreviewSchema>;
