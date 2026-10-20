# 0002 — workers.dev account subdomain: `juriblyat`

Date: 2026-10-20 · Status: accepted

## Decision

The account's `workers.dev` subdomain is `juriblyat`. The Worker is `personal-website`, so the staging address is:

`https://personal-website.juriblyat.workers.dev`

## Why

Matches the GitHub handle, so the URL ties back to the public repo. It is only a staging address until a custom domain exists.

## Consequences

- It appears publicly in preview URLs, PR comments and CI logs.
- Preview aliases follow `<alias>-personal-website.juriblyat.workers.dev` (alias and worker name together must stay under 63 characters).
- Changing it later is possible (Workers & Pages → Change), but every old URL breaks.
- With a custom domain, `workers.dev` can be turned off per Worker with `workers_dev: false`; per the docs that does not turn off preview URLs.

## Reversible?

Yes, with broken links as the cost.
