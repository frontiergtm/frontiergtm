# FrontierGTM Launch — v1 Product Requirements

## Product thesis

FrontierGTM Launch turns a technical product announcement into an evidence-grounded market decision and launch operating plan. It is not a generic copy generator. It combines the company’s public story, the proposed launch, current category evidence, buyer context, and named alternatives to answer four executive questions:

1. Is this launch ready to go to market?
2. What is the strongest credible launch thesis?
3. What must the company say, prove, and activate?
4. What should the team do before, during, and after launch day?

Launch completes the first FrontierGTM product loop:

- **Scan:** How does our public GTM story land?
- **Signal:** What changed in our market?
- **Launch:** How should we turn this moment into market movement?

## Target user

Founders, executives, product marketers, marketing leaders, and GTM operators at AI infrastructure, agent, cloud, data, and developer-platform companies.

## Version-one input

Required:

- company website
- working launch name
- what is launching and why it matters
- primary buyer
- launch type
- launch stage
- primary business goal

Optional:

- product, documentation, or announcement URL
- target launch date
- up to three competitors or alternatives
- proof, constraints, or facts the analysis must respect

The product must warn users not to submit confidential information. V1 uses public research and user-provided context only.

## Version-one output

### Free preview

- readiness score and verdict
- executive launch diagnosis
- recommended launch thesis
- strongest market opening
- highest-risk narrative or proof gap

### Email-unlocked launch brief

- evidence-backed market openings
- narrative architecture: context, tension, change, promise, differentiation, proof, CTA
- buyer frame: trigger, desired outcome, objection, required proof, language to use and avoid
- claim stack: category line, headline, supporting claims, proof requirements
- launch risks with severity and mitigation
- three-phase activation plan: pre-launch, launch day, sustain
- announcement structure
- executive social post draft
- sales talk track
- 14-day launch sequence
- evidence ledger and explicit limitations

## Evidence and quality rules

- First-party website and submitted product pages establish company and product facts.
- Exa supplies recent market, competitor, and buyer evidence.
- Together AI produces a strict structured report from the evidence.
- Source contents are untrusted and cannot override system instructions.
- Facts require source IDs. User-provided facts must be labeled as user context rather than public evidence.
- The report must never invent customers, metrics, capabilities, pricing, availability, integrations, or proof.
- Recommendations must fit the actual company business and launch stage.
- Copy must be usable but never make unsupported claims.
- If evidence is weak, the product must recommend proof collection or a narrower claim instead of fabricating certainty.

## Commercial design

V1 optimizes for qualified consulting demand rather than premature checkout infrastructure.

- free preview creates immediate value
- work-email unlock captures the complete brief
- optional checkbox records interest in a Ryan-reviewed version
- primary paid conversion: **FrontierGTM Launch Sprint — founding offer, $1,500**
- Launch Sprint includes human research review, narrative refinement, asset direction, and a 45-minute working session

A self-serve paid Launch Pack can be added after observing demand and report usage.

## Deliberate exclusions

V1 will not:

- publish content directly to social, CMS, email, CRM, or Slack
- accept private document uploads
- generate dozens of channel assets
- manage project tasks or approvals
- claim prediction of launch performance
- require user accounts or persistent workspaces
- charge through the application

These exclusions keep the first release trustworthy, public, fast to use, and commercially legible.

## Success signals

Product:

- evidence collection succeeds for public technical companies
- complete report generation stays within the Vercel function limit
- launch recommendations remain company- and stage-specific
- every public market claim resolves to a real source
- mobile and print layouts remain usable

Business:

- brief completion rate
- email unlock rate
- Ryan-reviewed interest rate
- Launch Sprint inquiries
- repeated use across multiple launches or companies

## Release boundary

The release is complete when `/launch` is public, reachable from FrontierGTM navigation, generates a source-grounded preview and full gated brief, captures leads durably, passes local production builds, succeeds against a live launch scenario, and is verified in Vercel Production.
