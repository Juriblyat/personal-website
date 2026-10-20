# Personal Website — Master Build Plan

Oct 19, 2026 · @Joeri

## North star

The site is a running system, and the visitor can see it run. An immersive WebGL scene, **the Mesh**, renders a living network of services with requests flowing between them, and it is driven by the site's own real backend telemetry. Every visit fires a real particle through it. That one idea says "senior backend engineer", "reliable" and "with the times" at the same time, instead of a generic shader blob.

What a visitor should feel:

- **In 3 seconds:** this person builds serious systems and has real taste.
- **In 10 seconds:** they are playing with it: the cursor bends request paths, nodes pulse, the scene reacts to scroll.
- **In 60 seconds:** they are reading a case study, and the architecture diagrams, live widgets and metrics prove the depth.
- **On the way out:** they open /status and see real uptime, latency and an error budget. Reliability shown, not claimed.

The site has four jobs: position you as a senior, AI-augmented backend engineer; showcase projects as deep case studies; let you document work as you go with near-zero friction (MDX in the repo); and be a showpiece in its own right, with its own build documented as a case study.

## Stack and architecture

Astro, Svelte islands and one persistent Three.js canvas, deployed as a single Cloudflare Worker that serves both the static site and the API. Every page ships as static HTML first; JavaScript loads only where something moves or responds, so the site stays snappy even as widgets pile up.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro 6 (latest stable), static output | Zero JS by default; content collections built for MDX; island architecture keeps each widget's cost local |
| Interactive islands | Svelte 5 | Smallest runtime of the mainstream options, compiled reactivity; ideal for many small widgets |
| 3D | Three.js with `WebGPURenderer` + TSL shaders | WebGPU where available, automatic WebGL 2 fallback, one shader codebase |
| Persistent scene | Astro `ClientRouter` + `transition:persist` | One canvas survives page navigation, so the Mesh never reloads or flashes |
| Motion | GSAP ScrollTrigger, View Transitions API, CSS scroll-driven animations | CSS first; GSAP only for choreography the scene needs |
| Shared state | nanostores | Tiny, framework-agnostic; lets Svelte islands and the 3D scene talk |
| Styling | Hand-written CSS: custom-property tokens, cascade layers, Astro scoped styles | Full control over a distinctive look, no utility-class sameness |
| Content | MDX in content collections, Zod schemas, Shiki code blocks | Write in your editor, commit, it deploys; bad frontmatter fails the build |
| Backend | Cloudflare Worker + Hono; D1, KV, Durable Objects, Analytics Engine | Live data (pulse, status, contact) next to the site, at the edge |
| Hosting | Cloudflare Workers with static assets | Cloudflare's recommended path for new projects; front and back in one deploy |
| Quality | TypeScript strict, Biome, Vitest, Playwright (+ screenshots), Lighthouse CI | Budgets in section 4 enforced on every PR |
| CI/CD | GitHub Actions; preview deploy per PR, production on `main` | Every piece is reviewable on a live URL |

On hosting: Cloudflare Pages still works but new features ship to Workers first, and Workers now serves static assets natively, so the whole site and its API live in one deploy ([Cloudflare compatibility matrix](https://developers.cloudflare.com/workers/static-assets/compatibility-matrix/), [Pages vs Workers in 2026](https://mecanik.dev/en/posts/cloudflare-pages-vs-workers-which-to-use-in-2026/)). On 3D: `WebGPURenderer` is Three.js's recommended renderer and falls back to WebGL 2 on its own ([Utsubo, April 2026](https://www.utsubo.com/blog/frontier-web-apis-2026-production-ready)).

&#91;embedded content: architecture · browser, Worker, edge data\]

The browser gets plain HTML first; islands and the Mesh share state through one small store, and everything live goes through a single API inside the same Worker.

## Design and WebGL direction

"Signal in the dark": a near-black field, one electric accent, razor-sharp type, and the Mesh glowing behind everything. The 3D carries the wow; the typography and spacing carry the credibility.

### Visual language

- **Colour:** dark and light themes (see `docs/decisions/0005`). Dark is near-black with a faint blue cast; light is pastel pink. Three greys for text hierarchy, a primary accent plus two secondary signals (phosphor green, cyan and magenta in dark; deepened equivalents in light), and one warm "incident" colour used only for errors and alerts on /status.
- **Type:** Geist for display and body, Geist Mono for data, labels and code (both free and variable). Large, tightly tracked display sizes; fluid scale with `clamp()`.
- **Texture and effects:** fine grain overlay, hairline 1px rules, subtle grid hints, plus blur, glow, shadow, shimmer and animated geometric shapes that react to the pointer. Effects are tokens and obey the motion rules: only `transform` and `opacity` animate.

### The Mesh, scene by scene

| Context | What the scene does |
| --- | --- |
| Home hero | Dense, bright network; requests stream along edges; the cursor pulls paths toward it and hovered nodes pulse |
| Work index | Camera glides; nodes regroup into one cluster per project; hovering a project card lights its cluster |
| Case study and notes | Scene dims to slow ambient drift behind text; reading always wins |
| /status | Scene is driven by real telemetry: request rate, p95 latency, live visitors |
| Any page | A real visit anywhere fires a particle for everyone online (P6.3) |

### Motion rules

1. Text is always real DOM, never drawn in the canvas (SEO, accessibility, selection).
2. Animate only `transform` and `opacity` in the DOM; target 60 fps everywhere, 120 where the display allows.
3. Shared easing and duration tokens; nothing slower than 600 ms except scene camera moves.
4. The canvas is decoration: every page is complete and readable with WebGL off, JS off, or `prefers-reduced-motion`.
5. Quality tiers: **high** (WebGPU, compute-driven particles), **mid** (WebGL 2, fewer particles, cheaper bloom), **low** (pre-rendered poster image). Render loop pauses when the tab is hidden or the canvas is off-screen.

### Interaction signatures

Command palette on ⌘K, magnetic buttons, headings that resolve from scrambled glyphs, page transitions via View Transitions, and a hidden "ops overlay" (FPS, frame time, render tier, live request count) for the curious engineer who finds it.

## Budgets (non-negotiable)

The WebGL must never cost the content: the 3D loads after the page is already fast, and CI fails any PR that breaks a budget. These are targets set by this plan; Lighthouse CI and bundle checks enforce them from P0.2 onward.

| Area | Metric | Budget |
| --- | --- | --- |
| Speed | Lighthouse mobile, every page | Performance ≥ 95; Accessibility, Best Practices, SEO = 100 |
| Speed | Largest Contentful Paint | ≤ 1.2 s desktop, ≤ 2.0 s mobile (simulated 4G) |
| Speed | Interaction to Next Paint | ≤ 100 ms |
| Speed | Cumulative Layout Shift | ≤ 0.02 |
| Weight | Initial JS on content pages (excl. 3D) | ≤ 40 KB gzip |
| Weight | 3D bundle (lazy, after LCP) | ≤ 250 KB gzip |
| Weight | Fonts | ≤ 2 preloaded files, ≤ 80 KB total |
| Weight | Home page, excluding lazy 3D | ≤ 600 KB transferred |
| 3D | Frame time | ≤ 8 ms on an M1-class laptop, ≤ 16 ms on a mid-range phone (mid tier) |
| Access | Standard | WCAG 2.2 AA; full keyboard use; reduced-motion honoured everywhere |
| Resilience | No-JS / no-WebGL | Every page fully readable and navigable |
| Reliability | Uptime SLO, published on /status | 99.9% monthly |
| Reliability | API p95 latency | ≤ 150 ms |

## Puzzle map

Nine phases, built top to bottom. Once the design system lands, the content engine and the WebGL engine run side by side, and the backend can start any time after the foundation.

&#91;embedded content: build order · 9 phases and their dependencies\]

Suggested order for a single builder: P0 → P1 → P4.1–P4.3 (de-risk the Mesh early) → P2 → P3 → rest of P4 → P5 → P6 → P7 → P8. A site with P0–P3 done is already launchable; everything after makes it unforgettable.

## Build pieces

46 pieces in 9 phases; each is one Sonnet session, one branch, one PR. Each piece's "Done when" is what you review the PR against. Change the Status as you go.

### Phase 0 — Foundation

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P0.1 | Repo and tooling | Astro + TS strict + Svelte + Biome + pnpm, folder layout, `CLAUDE.md` with conventions | `pnpm dev` runs, lint and typecheck pass, conventions committed | Done |
| P0.2 | CI pipeline | GitHub Actions: typecheck, lint, test, build, Lighthouse CI and bundle-size checks with section 4 budgets | A deliberately oversized bundle fails the PR | Done |
| P0.3 | Deploy | Cloudflare Worker with static assets via Wrangler; preview per PR, production on `main`, custom domain | Hello-world live on `workers.dev` (custom domain deferred, see `docs/decisions/0003`); PRs get a preview URL | Done |
| P0.4 | Test harness | Vitest, Playwright smoke test, screenshot comparison at 360 and 1440 px | One test of each kind runs green in CI | Done |

### Phase 1 — Design system

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P1.1 | Tokens | Colour, spacing, radius, z-index, easing and duration tokens as CSS custom properties; cascade layers; accent decided | `/lab/tokens` shows every token (`/lab` = dev-only playground, excluded from prod) | Done |
| P1.2 | Typography | Self-hosted, subsetted Geist + Geist Mono (via Astro's Fonts API); fluid type scale; preload | Type specimen on `/lab`; zero layout shift on font load | Done |
| P1.3 | Layout primitives | Container, grid, stack, section rhythm; breakpoints | `/lab/layout` correct at 360, 768, 1440 px | Done |
| P1.4 | Core components | Button (magnetic), Link (animated underline), Tag, Card, Callout, Kbd, icon set | All on `/lab` with focus, hover and reduced-motion states | Done |
| P1.5 | Site chrome and transitions | Header, nav, footer, skip link; `ClientRouter` view transitions between pages | Navigation animates with JS on and works plainly with JS off | In review |

### Phase 2 — Content engine

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P2.1 | Collections and schemas | `projects` and `notes` collections; Zod schemas (title, summary, dates, status, stack, role, links, cover, featured, metrics) | Invalid frontmatter fails the build with a clear message | Not started |
| P2.2 | MDX pipeline | Shiki code blocks, heading anchors, TOC extraction, reading time, `astro:assets` images | A sample post renders every element correctly | Not started |
| P2.3 | MDX component kit | Callout, Figure, Diagram (SVG), Metric, Timeline, BeforeAfter, a slot for live widgets | A "kitchen sink" note demonstrates each one | Not started |
| P2.4 | Authoring workflow | `pnpm new:project <slug>` and `pnpm new:note`; draft flag; notes can link to a project as its devlog | One command creates a valid stub that builds | Not started |
| P2.5 | Feeds and SEO | RSS, sitemap, JSON-LD, per-post Open Graph images generated at build | Validators pass; every post has its own OG image | Not started |

### Phase 3 — Pages (static-first, beautiful without WebGL)

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P3.1 | Home | Positioning statement, hero copy area, featured work, latest notes, call to action | Meets every section 4 budget with WebGL off | Not started |
| P3.2 | Work index | Project grid with a Svelte filter island (stack, type, year) | Filters work by keyboard; URL reflects filters | Not started |
| P3.3 | Case study template | Hero, problem, approach, architecture, outcome, metrics, sticky TOC, next project | A real project renders end to end | Not started |
| P3.4 | Notes (devlog) | Index with tags and series; post template | Notes link back to their project and vice versa | Not started |
| P3.5 | About, Now, Uses | Your story, how you work with AI, current focus, toolbox | Content in place; reviewed by you | Not started |
| P3.6 | Contact and 404 | Contact page (form UI; endpoint in P6.5), a playful 404 | 404 is on-brand; form validates client-side | Not started |

### Phase 4 — WebGL engine (the Mesh)

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P4.1 | Canvas host | One fixed, persistent canvas (`transition:persist`); 3D code lazy-loaded after LCP; render loop that pauses when hidden or off-screen; device-pixel-ratio cap | Canvas survives navigation; LCP unchanged versus WebGL off | Not started |
| P4.2 | Capability tiers | Detects WebGPU / WebGL 2, GPU class, reduced motion, Save-Data → high / mid / low; `?tier=` override for testing | Each tier can be forced and looks intentional | Not started |
| P4.3 | The Mesh scene | Node graph, edges, flowing request particles, TSL shaders, bloom | Hits section 4 frame-time budgets per tier | Not started |
| P4.4 | Pointer interaction | Requests bend toward the cursor or touch, hovered nodes pulse, click sends a burst | Feels instant; INP stays ≤ 100 ms | Not started |
| P4.5 | Scroll and page choreography | Scene states per page (hero, work, reading, status); camera paths; GSAP ScrollTrigger timelines driven from a state store | Each page sets its state; moves blend smoothly across navigation | Not started |
| P4.6 | Fallback poster | Pre-rendered AVIF of the scene for low tier and reduced motion | Low tier is visually coherent, not broken | Not started |
| P4.7 | Project clusters | Hovering a Work card lights its project's cluster via the shared store | Card and cluster respond in the same frame | Not started |

### Phase 5 — Widgets and interactions

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P5.1 | Shared state bus | Typed nanostores for scene state, pointer, tier, motion preference | Islands and scene read and write through it only | Not started |
| P5.2 | Command palette | ⌘K / Ctrl+K: jump to pages, projects, notes; toggle motion; copy email | Fully keyboard-driven, screen-reader labelled | Not started |
| P5.3 | Micro-interactions | Magnetic buttons, desktop cursor follower, heading glyph-scramble, scroll reveals (CSS scroll-driven first) | All off under reduced motion; no INP regressions | Not started |
| P5.4 | Backend explainer widgets | Embeddable MDX widgets that show backend skill, e.g. a rate-limiter playground, a consistent-hashing ring, a retry/backoff simulator; plus a template for new ones | One widget live inside a case study | Not started |
| P5.5 | Ops overlay | Hidden overlay (key combo) showing FPS, frame time, render tier, live request count | Toggles cleanly; zero cost while hidden | Not started |

### Phase 6 — Backend and live data

> **Preview isolation:** PR previews from `versions upload` share production bindings (same D1, KV, Durable Objects). Before P6.1, either keep previews read-only or evaluate isolated preview resources. See `docs/decisions/0004`.

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P6.1 | API Worker | Hono routes under `/api`, typed responses, rate limiting, structured logs | `/api/health` returns build SHA and edge location | Not started |
| P6.2 | Telemetry ingest | Cookie-free page-view and Web Vitals beacons into Analytics Engine | Real-user LCP and INP queryable per page | Not started |
| P6.3 | Live pulse | Durable Object broadcasting visit events over WebSocket; each one fires a particle in everyone's Mesh | Two browsers see each other's visits in under 1 s | Not started |
| P6.4 | Status page | `/status`: uptime from a cron-triggered probe, p50/p95 latency, error budget, recent deploys | Shows real numbers; the Mesh is in status mode | Not started |
| P6.5 | Contact endpoint | Form → Worker → email, Turnstile spam protection | A test message lands in your inbox; bots are blocked | Not started |
| P6.6 | "Currently building" | Cron Worker caches recent GitHub activity into KV; small widget on Home and Now | Updates without slowing any page | Not started |

### Phase 7 — AI layer (optional, high wow)

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P7.1 | Content index | MDX content embedded into a vector index on each deploy | Re-indexes automatically when content changes | Not started |
| P7.2 | "Ask my work" | Chat island that answers questions about your projects with links to the case studies; streaming, rate-limited | Answers cite real pages; refuses off-topic | Not started |
| P7.3 | Meta case study | "How this site was built": the AI-augmented workflow, this plan, the numbers | Published as a project | Not started |

### Phase 8 — Polish and launch

| ID | Piece | Delivers | Done when | Status |
| --- | --- | --- | --- | --- |
| P8.1 | Performance pass | Bundle analysis, image and font audit, prefetch strategy, real-device runs | All section 4 budgets green on real devices | Not started |
| P8.2 | Accessibility audit | axe, keyboard and screen-reader passes, focus handling across view transitions | WCAG 2.2 AA with no known issues | Not started |
| P8.3 | Cross-browser and device QA | Safari, Firefox, Chrome; iOS low-power mode; mid-range Android | Each tier verified on real hardware | Not started |
| P8.4 | Sharing and discoverability | Metadata, OG previews, structured data, canonicals, `llms.txt` | Link previews look right on LinkedIn, X, Slack | Not started |
| P8.5 | Launch | Error alerting, rollback runbook, launch note as the first devlog entry | Live, monitored, announced | Not started |

## Running each piece with Sonnet

One piece per session, one branch, one PR, reviewed against its "Done when". Sonnet gets the whole plan as context but touches only its own piece.

### Setup, once

1. Export this doc as Markdown into the repo at `docs/PLAN.md`; it is the shared contract every session reads.
2. P0.1 writes `CLAUDE.md`: stack, folder layout, naming, the section 4 budgets, the motion rules, and "never add a dependency without saying why".
3. Keep a `docs/decisions/` folder: one short note per real decision (accent colour, tier thresholds), so later sessions don't relitigate.

### Prompt template per piece

```markdown
Read docs/PLAN.md and CLAUDE.md first.

You are building piece <ID> — <Piece name>.
Delivers: <copy from the table>
Done when: <copy from the table>
Already built: <IDs marked Done>

Rules:
- Stay inside this piece. If you need something from a later piece,
  stub it behind an interface and note it in the PR.
- Respect every budget in section 4 and the motion rules in section 3.
- Propose any new dependency with its gzip size before adding it.
- Finish with: tests passing, lint and typecheck clean, a PR description
  listing what changed, how to verify it, and anything left open.
```

### Definition of done, every piece

- [ ] Builds; lint, typecheck and tests pass in CI
- [ ] Lighthouse CI and bundle budgets green
- [ ] Readable with JS off; correct under reduced motion
- [ ] Checked at 360 px and 1440 px on the preview URL
- [ ] Keyboard path works; focus is visible
- [ ] PR describes what, why, and how to verify

Use a stronger model for review and for the riskiest pieces (P4.3, P4.5, P6.3): ask it to check the PR against "Done when" and the budgets before you merge.

## Open decisions and what you supply

Nothing here blocks Phase 0; each item is needed by the piece in brackets.

- [ ] Domain name (P0.3)
- [x] Accent colour: decided, see `docs/decisions/0005` (still open: 3–5 reference sites, optional)
- [x] Dark and light modes (P1.1)
- [ ] Positioning line and short bio (P3.1, P3.5)
- [ ] The first 3–5 projects to feature, with whatever raw material you have: notes, diagrams, numbers (P3.3)
- [ ] API language: TypeScript on Workers (default) or Rust compiled to WebAssembly as a backend flex (P6.1)
- [ ] Email provider for the contact form (P6.5)
- [ ] Include Phase 7, the AI layer, at launch or after (P7)

## Sources

- [Workers vs. Pages compatibility matrix — Cloudflare Docs](https://developers.cloudflare.com/workers/static-assets/compatibility-matrix/)
- [Cloudflare Pages vs Workers: which to use in 2026 — Mecanik](https://mecanik.dev/en/posts/cloudflare-pages-vs-workers-which-to-use-in-2026/)
- [Frontier Web APIs in 2026 — Utsubo](https://www.utsubo.com/blog/frontier-web-apis-2026-production-ready)
- [What's new in Astro, June 2026](https://astro.build/blog/whats-new-june-2026/)
