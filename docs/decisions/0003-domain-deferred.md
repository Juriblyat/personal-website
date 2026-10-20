# 0003 — Custom domain: deferred

Date: 2026-10-20 · Status: open (decided to wait)

## Decision

Do not buy a domain yet. Run on `workers.dev` (see 0002) until a name is chosen.

## Plan for later

- Registrar: Cloudflare Registrar (at-cost, no renewal markup, free WHOIS privacy). Approximate prices seen: `.com` about $9–10/year, `.dev` about $12/year; confirm at checkout.
- TLD shortlist: `.dev` (developer signal, HTTPS enforced) or `.com`.
- Attach with one config line: `routes: [{ pattern: "<domain>", custom_domain: true }]`; needs an active Cloudflare zone for the domain.
- Email: Cloudflare Email Routing (free) needs the domain on Cloudflare DNS and adds MX, SPF and DKIM records.

## Consequences

- P0.3's "custom domain" Done-when item stays open; the hello-world is verified on `workers.dev`.
- Links shared before the switch will break unless redirected.
- Needed by: P6.5 (contact email), P8.4 (canonicals, OG previews).

## Reversible?

Buying is not refundable. Everything after that (attach, detach, transfer after 60 days) can be undone.
