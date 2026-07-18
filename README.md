# FrontierGTM Marketing Site

A responsive marketing and product website built with Next.js, TypeScript, Tailwind CSS, and Phosphor icons.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The cinematic motion experience is the default homepage.

The homepage adds progressive-enhancement effects without a third-party animation library:

- layered hero parallax and a subtle pointer-responsive glow
- a scroll-progress trail and waypoint-style section reveals
- restrained depth and highlight effects on service and engagement cards
- responsive mobile behavior and a full `prefers-reduced-motion` fallback

## Production checks

```bash
npm run lint
npm run build
```

The site deploys as a standard Next.js application on Vercel. This allows the public
FrontierGTM Scan to use server-side routes without exposing provider credentials.

## FrontierGTM Scan

The public `/scan` product analyzes a company website and returns a source-backed,
outside-in GTM report. Local development requires the variables documented in
`.env.example`. Production secrets belong in Vercel project settings and must never
use the `NEXT_PUBLIC_` prefix.

Public launch requires the Upstash variables in `.env.example` for durable rate
limiting, report caching, and lead capture. Resend or a webhook is optional for
immediate lead notifications; local development uses in-memory fallbacks.

## FrontierGTM Signal

The public `/signal` product researches recent market and company moves, then uses
Together AI to turn that evidence into an executive brief with linked sources,
strategic implications, and three concrete GTM actions. Exa is required for live
Signal research; the Together, Upstash, and optional Resend settings are shared
with Scan. `TOGETHER_SIGNAL_MODEL` can override the analysis model independently.

## FrontierGTM Launch

The public `/launch` product combines first-party company and product evidence with
live Exa market research, then uses Together AI structured output to pressure-test
launch readiness and produce a buyer frame, narrative, claim stack, activation plan,
launch assets, and 14-day sequence. It reuses Upstash for caching, safeguards, and
lead capture. `TOGETHER_LAUNCH_MODEL` can override its strategy model independently.

## FrontierGTM Deal Intelligence

The public `/deal` product researches a seller and target account, builds an
evidence-grounded opportunity thesis and free preview, then uses Stripe Checkout
to unlock the complete meeting brief. Exa, Together AI, and Upstash power the
research and report lifecycle; Stripe payment verification happens server-side
before the full report is returned. See `.env.example` for the Deal-specific
model, rate-limit, pricing, site URL, and Stripe settings.

## FrontierGTM Open Skills

The public `/skills` page presents the installable FrontierGTM skill collection and
links to its separate public source repository:
[frontiergtm/frontiergtm-skills](https://github.com/frontiergtm/frontiergtm-skills).
The private website repository contains only the product presentation and skill
metadata; the portable Agent Skills, plugin manifests, references, license, and
installation documentation live in the public repository.

## Editing content

- Main page entry point: `app/page.tsx`
- Homepage composition: `app/motion/page.tsx`
- Motion behavior: `components/motion-effects.tsx`
- Repeated services, audiences, engagements, proof points, and navigation: `content/site.ts`
- Brand tokens and responsive styles: `app/globals.css`
- Header/mobile navigation: `components/header.tsx`
- Active hero image: `public/frontier-hero-headlands-view-v8.png`
- Founder headshot: `public/ryan-pollock-headshot.png`
- Employer marks: `public/logos/`

Replace placeholder `mailto:` and `#contact` links with a calendar or contact destination when ready.
