# 0001 — Hosting platform: Cloudflare Workers with static assets

Date: 2026-10-20 · Status: accepted

## Decision

Host the site as a single Cloudflare Worker that serves the Astro build as static assets and also runs the Hono API (Phase 6). Start on the Workers Free plan.

## Options considered

| Option | Why not |
| --- | --- |
| Cloudflare Pages | Works, but new features ship to Workers first; Durable Objects are not hosted by Pages itself |
| Vercel Hobby | Non-commercial use only; no WebSockets or Durable Objects |
| Netlify Free | Credit pool; the whole site pauses when credits run out |
| GitHub Pages | Static only; no backend, so Phase 6 is impossible |

## Why this one

- Static asset requests are free and unlimited, so traffic never costs anything.
- D1, KV, Durable Objects and Analytics Engine sit next to the site in one deploy.
- The Free plan cannot bill overage; hitting a limit makes the dynamic part fail, not the static site.

## Consequences

- Lock-in: bindings (`env.DB`, Durable Objects) only run on Cloudflare. The static site itself is portable.
- Do not set `run_worker_first` to `/*`; it would put every page view on the metered 100k/day Worker quota. Scope it to `/api/*`.
- Free limits checked 2026-10-20: 100k Worker requests/day, 10 ms CPU, 5 cron triggers, KV 1k writes/day, D1 100k row writes/day, Analytics Engine 100k points/day, Workers AI 10k neurons/day. Phase 7 (AI) is the likeliest to need the $5/month Paid plan.

## Reversible?

The platform is hard to leave once Phase 6 bindings exist. The plan (Free to Paid) is reversible at any time.
