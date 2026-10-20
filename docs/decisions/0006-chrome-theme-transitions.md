# 0006 — Site chrome, theme persistence and page transitions

Date: 2026-10-20 · Status: accepted

## Decisions

- **Navigation:** Work, Notes, About in the header (Now, Uses and Contact join in P3.5/P3.6). The header wraps naturally on narrow screens: no hamburger menu for three links.
- **Theme:** the toggle switches between light and dark and the choice is saved in `localStorage` (`theme`). With no saved choice the site follows the OS. A tiny inline script in `<head>` applies it before first paint (no flash) and carries it across view transitions via `astro:before-swap`.
- **Transitions:** Astro's `ClientRouter` (View Transitions API, with a fallback for browsers without it). The header opts out of animation (`transition:animate="none"`) so it stays still while the page content changes. Animation is disabled by Astro under `prefers-reduced-motion`.
- **No JS:** every page is plain HTML links; the theme toggle is hidden and the theme follows the OS.
- **Delegated scripts:** scripts that act on elements (magnetic button, theme toggle) listen on `document`, so they survive page swaps without re-initialising.

## Cost

About 5.4 KB gzip of initial JS (the router) against the 40 KB budget.

## Open for P4.1

The Mesh canvas will use `transition:persist` so it survives navigation; the chrome and router are already in place for it.

## Reversible?

Yes: removing `<ClientRouter />` returns the site to plain navigation.
