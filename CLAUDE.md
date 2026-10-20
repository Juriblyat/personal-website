# Personal website — conventions

Read `docs/PLAN.md` first. It is the shared contract: north star, stack, budgets, and the 46 build pieces.
Work on **one piece per session, one branch, one PR**. Stay inside your piece; if you need something from a
later one, stub it behind an interface and note it in the PR. Record real decisions as short notes in
`docs/decisions/` (e.g. `0001-accent-colour.md`) so later sessions don't relitigate them.

## Stack

Astro (static output) · Svelte 5 islands · one persistent Three.js canvas (`WebGPURenderer` + TSL) ·
GSAP ScrollTrigger · nanostores · hand-written CSS (custom-property tokens, cascade layers, scoped styles) ·
MDX content collections + Zod + Shiki · Cloudflare Worker (Hono, D1, KV, Durable Objects, Analytics Engine) ·
TypeScript strict · Biome · Vitest · Playwright · Lighthouse CI · pnpm.

No Tailwind, no UI kits. Astro AGENTS.md notes (dev server in background mode, docs links) live in `AGENTS.md`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server (`astro dev --background` for agents; see `AGENTS.md`) |
| `pnpm check` | Astro + TypeScript typecheck |
| `pnpm lint` | Biome lint + format check |
| `pnpm format` | Biome auto-fix |
| `pnpm build` | Production build |
| `pnpm budget` | Fails if JS exceeds the weight budgets in `budgets.json` (run after build) |
| `pnpm lighthouse` | Lighthouse CI against `dist/` using `lighthouserc.json` (needs Chrome; reports go to `.lighthouseci/`) |
| `pnpm verify` | check + lint + test + build + budget: everything CI runs except Lighthouse |

Before finishing any piece: `pnpm verify` must be clean. Budgets live in `budgets.json` and `lighthouserc.json`; change them only by changing the plan.

## Folder layout

```
src/pages/        routes (static HTML first)
src/layouts/      page shells
src/components/   Astro components; Svelte islands live alongside, named *.svelte
src/styles/       tokens, layers, global CSS
src/content/      MDX collections (projects, notes)
src/lib/          framework-agnostic helpers
src/stores/       nanostores (the only channel between islands and the scene)
src/scene/        Three.js / the Mesh (lazy-loaded, never imported by content pages)
worker/           Cloudflare Worker + API (from P0.3 / P6.1)
docs/             PLAN.md, decisions/
```

## Naming

Files: `kebab-case` for routes/lib, `PascalCase` for components. Stores `camelCase`. CSS custom properties
`--kebab-case`, grouped by token family (`--color-*`, `--space-*`, `--ease-*`, `--dur-*`).

## Budgets (non-negotiable; CI enforces from P0.2)

- Lighthouse mobile, every page: Performance ≥ 95; Accessibility, Best Practices, SEO = 100
- LCP ≤ 1.2 s desktop / ≤ 2.0 s mobile (simulated 4G) · INP ≤ 100 ms · CLS ≤ 0.02
- Initial JS on content pages (excl. 3D) ≤ 40 KB gzip · 3D bundle (lazy, after LCP) ≤ 250 KB gzip
- Fonts: ≤ 2 preloaded files, ≤ 80 KB total · Home excluding lazy 3D ≤ 600 KB transferred
- Frame time ≤ 8 ms on M1-class laptop, ≤ 16 ms on mid-range phone (mid tier)
- WCAG 2.2 AA, full keyboard use, reduced-motion honoured everywhere
- Every page fully readable and navigable with JS off and WebGL off
- API p95 ≤ 150 ms; uptime SLO 99.9% (published on /status)

## Motion rules

1. Text is always real DOM, never drawn in the canvas.
2. Animate only `transform` and `opacity` in the DOM; 60 fps everywhere, 120 where possible.
3. Shared easing and duration tokens; nothing slower than 600 ms except scene camera moves.
4. The canvas is decoration: every page is complete with WebGL off, JS off, or `prefers-reduced-motion`.
5. Quality tiers: **high** (WebGPU, compute particles), **mid** (WebGL 2, fewer particles), **low** (poster image).
   The render loop pauses when the tab is hidden or the canvas is off-screen.

## Rules for dependencies

**Never add a dependency without saying why** — state the reason and its gzip size in the PR before adding it.

## Definition of done (every piece)

- [ ] Builds; lint, typecheck and tests pass in CI
- [ ] Lighthouse CI and bundle budgets green
- [ ] Readable with JS off; correct under reduced motion
- [ ] Checked at 360 px and 1440 px on the preview URL
- [ ] Keyboard path works; focus is visible
- [ ] PR describes what, why, and how to verify
