# 0004 — Deploy flow: GitHub Actions + Wrangler

Date: 2026-10-20 · Status: accepted

## Decision

Deploy from GitHub Actions with Wrangler, not Cloudflare's Workers Builds git integration.

- Production: push to `main` runs `wrangler deploy`.
- Preview: pull requests run `wrangler versions upload --preview-alias pr-<number>`, giving `https://pr-<number>-personal-website.juriblyat.workers.dev`.
- Deploy jobs depend on the existing CI checks (verify, budgets, Lighthouse) passing.

## Credentials

- Repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set (names only recorded here).
- The token is a custom, account-scoped token with Workers Scripts: Edit and Account Settings: Read. Never the Global API Key.
- Add D1: Edit, Workers KV Storage: Edit and a zone-scoped Workers Routes: Edit only when a phase needs them.
- Pull requests from forks receive no secrets, so they get no preview. That is intended.

## Rollbacks

Every deploy is an immutable version; the last 100 can be promoted again. Dashboard: Worker → Deployments → Rollback, or `wrangler rollback`. Rollbacks do not undo data, so D1 migrations must stay backward-compatible.

## Open for Phase 6

`versions upload` previews share production bindings (same D1, KV). Revisit before P6.1: either keep previews read-only or evaluate `wrangler preview` with a `previews` block for isolated resources (not yet verified against the docs).

## Setup status

The Worker `personal-website` was first deployed manually on 2026-10-20 with `wrangler deploy ./dist` and answers at the workers.dev URL. The token stored in the repo secret has not yet been proven by a CI run.

## Reversible?

Yes. Switching to Workers Builds later changes no site code.
