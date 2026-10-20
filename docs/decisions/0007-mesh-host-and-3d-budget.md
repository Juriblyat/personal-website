# 0007 — Mesh canvas host, and the 3D bundle budget

Date: 2026-10-20 · Status: accepted (budget question open for P4.3)

## Decisions

- **One persistent canvas** (`MeshCanvas.astro`, `transition:persist`) behind every page. It stays an empty, transparent canvas until the 3D chunk starts.
- **Lazy, after load:** a small loader waits for `window.load`, then `requestIdleCallback` (3 s timeout), then imports the 3D chunk. It skips the 3D entirely (and records why in `data-mesh-reason`) under `prefers-reduced-motion`, Save-Data, `?tier=low`, or a software GPU renderer. `?tier=high|mid` forces it on, for tests. P4.2 turns this into the full capability tiers.
- **One chunk:** `manualChunks` in `astro.config.mjs` puts `three` and `src/scene/` into a chunk named `scene`, so `pnpm budget` can budget it separately.
- **Renderer:** `WebGPURenderer` (WebGPU where available, its WebGL 2 backend otherwise), as the plan specifies.
- **Loop control:** the render loop runs only while the tab is visible and the canvas is on screen; DPR is capped at 2. State is mirrored to `data-mesh` (`off | loading | running | paused | unsupported`) for CSS, tests and the P5.5 ops overlay.
- **Theme-aware colours:** scene colours are read from CSS tokens (`src/scene/tokens.ts`) and update on theme change.

## Measurements (three 0.186, esbuild, minified, tree-shaken)

| Bundle | gzip | brotli |
| --- | --- | --- |
| `WebGLRenderer` only, trivial scene | 131 KB | 108 KB |
| `WebGPURenderer`, trivial scene (what ships in P4.1) | 207 KB | 172 KB |
| `WebGPURenderer` + a realistic TSL set + `BloomNode`, no scene code | 245 KB | 195 KB |

Cloudflare serves brotli, so visitors receive the brotli figure.

## Open: the 250 KB gzip budget (decide at P4.3)

The planned recipe (WebGPU + TSL + bloom) is already 245 KB gzip before any scene code, so the real Mesh will not fit 250 KB gzip as measured today. Options when P4.3 starts:

1. Measure the 3D budget in brotli (what is actually transferred): 195 KB leaves ~55 KB of headroom. Amend the plan wording.
2. Raise the gzip budget to ~300 KB.
3. Drop bloom/TSL post-processing for a cheaper glow (pre-blurred sprites), keeping WebGPU/WebGL2.
4. Split tiers: plain `WebGLRenderer` (131 KB) for mid, WebGPU only for high. Costs two shader code paths, against the "one shader codebase" goal.

Recommendation: option 1, then 3 if the scene grows.

## What the 3D costs the page (Lighthouse, simulated mobile, 3 runs x 4 pages)

| | LCP | TBT | Score |
| --- | --- | --- | --- |
| 3D chunk blocked | 1352 ms | 0 ms | 1.00 |
| 3D loading (my machine, SwiftShader) | 1352 ms | 111–184 ms | 0.97–0.99 |
| 3D loading (CI runner, SwiftShader) | not captured | ~7,100 ms | 0.7 |

LCP is unchanged (the chunk loads after paint). The 3D does cost ~110–180 ms of main-thread time on a simulated slow phone, right after load. Tier gating (P4.2) and a real-device pass (P8.1) are where this is managed.

## Software rendering: found in CI, and why it gates the 3D

With the 3D loading on GitHub's GPU-less runner (software WebGL via SwiftShader), Lighthouse measured **TBT of about 7,100 ms**; on my machine, also SwiftShader but faster, it was 110–180 ms. A visitor on a VM, remote desktop or blocklisted GPU would hit the same stalls. So a software renderer (`src/lib/gpu.ts`: SwiftShader, llvmpipe, softpipe, Basic Render Driver) gets the static page and no 3D. Hardware GPUs are unaffected. The 3D's real cost on real hardware is a P8.1 (real-device pass) question, not something a GPU-less CI runner can measure.

## CI: Lighthouse runs in two stages

- `lighthouserc.json`: all four pages, 3D chunk **blocked**: performance >= 95, a11y/best-practices/SEO = 100, LCP <= 2.0 s, CLS <= 0.02, TBT <= 150 ms. "The WebGL must never cost the content."
- `lighthouserc.no-gpu.json`: the home page with **no blocking**, in CI's real software-GL environment, which must pick the no-3D path: the same strict budgets. This is the permanent guard for the finding above: if the detection breaks, TBT jumps to seconds and CI fails.

## Reversible?

Yes. Removing `MeshCanvas` from `Base.astro` returns the site to no 3D.
