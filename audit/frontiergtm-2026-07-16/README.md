# FrontierGTM website review — 2026-07-16

## Scope

- Local Next.js source in `/Users/ryanpollock/Code/frontiergtm`
- Live homepage at `https://www.frontiergtm.ai/`
- Live alternate route at `https://www.frontiergtm.ai/early-startups`
- Desktop viewport: 1280 × 720
- Mobile viewport: 390 × 844

## Overall verdict

FrontierGTM has a distinctive, credible visual identity and a clear consultant-led story. The strongest conversion improvements are to replace the email-based “Book a Call” action with a real scheduling flow, make the service/engagement sections easier to scan, and add a concrete proof artifact or outcome. The source is healthy and builds cleanly, but the page ships unusually large above-the-fold images, references a missing background image, and lacks several basic search/social metadata files.

## Flow health

1. Homepage hero — **Strong**. Distinctive brand, clear audience, visible primary and secondary actions.
2. Services — **Needs refinement**. The breadth is useful, but six equal cards create density and use 12px body text on desktop.
3. Engagements — **Needs refinement**. The offer shapes are clear, but four equal-weight choices plus the full-time note compete for attention.
4. Founder proof — **Strong**. Ryan’s photo, named employers, and specific experience make the consultancy feel real and credible.
5. Final CTA — **Needs attention**. The ask is prominent, but “Book a Call” is a mailto link and “Send a Note” uses a different domain.
6. Mobile hero — **Strong**. Reflow is clean, readable, and free of horizontal overflow.
7. Mobile navigation — **Mostly strong**. Large targets and clear labels; keyboard focus is not trapped and Escape is not handled.
8. Mobile services — **Healthy**. Cards become readable, though the section becomes a long scroll.
9. Early-startups route — **Healthy but strategically unresolved**. The copy is more specific, but the route is not linked and has no canonical metadata.

## Highest-impact recommendations

1. Send “Book a Call” to a dedicated scheduler or short qualification form. Keep email as the secondary option.
2. Add one proof module with a named outcome, mini case study, testimonial, or before/after artifact.
3. Reduce desktop card density: group capabilities into 3–4 outcome-led pillars or use a 3 × 2 grid with larger type.
4. Make the engagement path directional: recommend a starting offer and explain what a prospect should choose based on their situation.
5. Optimize the raw 3 MB hero and 1.4 MB header logo; use modern image formats and the existing SVG logo where possible.
6. Replace or remove the missing `/frontier-hero.png` CSS background reference.
7. Add canonical URLs, Open Graph/Twitter metadata, `robots.txt`, `sitemap.xml`, and professional-service structured data.
8. Improve the mobile menu’s keyboard behavior with Escape-to-close, focus management, and focus containment while open.

## Confirmed strengths

- Clean semantic structure with one main landmark, a single H1, meaningful section headings, labelled navigation, and a skip link.
- Visible focus styling, 44px mobile menu control, descriptive founder-image alt text, decorative images hidden from assistive technology, and a reduced-motion fallback.
- Mobile menu correctly prevents page scrolling and closes after selecting a section.
- TypeScript check and production build both pass.

## Evidence limits

The review used visual captures, DOM inspection, source inspection, and build checks. It did not include a screen-reader session, automated WCAG scanner, real-user analytics, Core Web Vitals field data, email-client behavior, or form/scheduler completion because the live site does not provide a form or scheduler.

## Accepted screenshots

- `01-home-hero-desktop.png`
- `02-services-desktop.png`
- `03-engagements-desktop.png`
- `04-about-desktop.png`
- `05-cta-desktop.png`
- `06-home-mobile.png`
- `07-mobile-menu.png`
- `08-services-mobile.png`
- `09-early-startups-desktop.png`
