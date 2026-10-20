# 0005 — Visual language: dark and pastel-pink light, three signals, effects allowed

Date: 2026-10-20 · Status: accepted

## Decision

- **Both themes ship.** Dark is the default and follows the OS preference when set; light follows the OS unless `data-theme` overrides it.
- **Dark:** near-black with a faint blue cast, phosphor green as the primary accent, cyan and magenta as secondary signals.
- **Light:** pastel pink surfaces. The accents are deepened so text still meets WCAG AA: deep magenta is the primary, with deep cyan and deep green as secondaries. The primary and tertiary accents swap hue between themes on purpose, because green on pastel pink looks seasonal while magenta on pink looks designed.
- **Warm incident colour** (orange) is for errors and alerts only, and stays distinct from magenta.
- **Effects are part of the language:** blur, glow and shadow tokens, a shimmer gradient, and animated, pointer-reactive geometric shapes. This amends two lines in the plan ("ONE accent" and "No drop shadows, no gradients on UI chrome").

## Guard rails (these keep the performance budgets intact)

- Only `transform` and `opacity` are animated in the DOM. An animated blur or glow is a pre-blurred layer whose opacity or transform moves, never a live `filter` animation.
- Effects must degrade under `prefers-reduced-motion` and with WebGL off (motion rule 4); durations collapse to ~0 via the tokens.
- Contrast is enforced in CI: `src/styles/tokens.test.ts` checks every text and accent pair at 4.5:1 in both themes.

## Where the values live

`src/styles/tokens.css`, one definition per colour using `light-dark(<light>, <dark>)`. Changing a hue is a one-line edit; the test tells you if it breaks AA. Browse every token at `/lab/tokens` in dev.

## Open

No reference sites were named yet; add them here if they should steer later pieces (P1.4 components, P4.3 the Mesh).

## Reversible?

Yes. Everything is tokens, so a palette change touches one file.
