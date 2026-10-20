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

| Bundle | Uncompressed | gzip |
| --- | --- | --- |
| `WebGLRenderer` only, trivial scene | 522 KB | 131 KB |
| `WebGPURenderer`, trivial scene (what ships in P4.1) | 774 KB | 207 KB |
| `WebGPURenderer` + a realistic TSL set + `BloomNode`, no scene code | 888 KB | 245 KB |

**Brotli does not help here.** Measured on the live Cloudflare preview, the shipped chunk is 767 KB uncompressed, 206 KB with gzip and 205 KB with brotli: Cloudflare compresses on the fly at a fast setting, so its brotli is barely smaller than gzip. (Maximum-effort brotli would give ~167 KB, but visitors never receive that.) So budgets stay in gzip, which matches what is really transferred.

## Decision: the 3D budget is 300 KB gzip (was 250)

The planned recipe (WebGPU + TSL + bloom) is already 245 KB before any scene code, so 250 KB could never hold the real Mesh. The 3D costs visitors a one-time download after the page has loaded, plus main-thread time; it does not affect LCP, and it is skipped entirely for reduced-motion, Save-Data and software-GPU visitors. Bloom costs only ~33 KB and delivers the glow the design depends on. 300 KB leaves ~55 KB for the scene itself.

If the scene outgrows 300 KB, the levers in order: replace bloom with a cheaper pre-blurred glow, then trim unused TSL nodes. A plain-WebGL second code path (131 KB) was rejected: it doubles the shader code to maintain.

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
