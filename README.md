# shapi-demo

A small TypeScript service that SHAPI uses as its end-to-end demo. It calls third-party APIs the way real integrations do:

- `src/deploy.ts` dispatches a GitHub Actions workflow and throws unless the response status is exactly `204`. GitHub's `workflow_dispatch` endpoint started answering `200` with a body in December 2025, which broke integrations written this way.
- `src/billing.ts` creates a Stripe customer with a pinned API version.
- `src/accounting.ts` queries QuickBooks Online with `minorversion=65` (silently answered as 75 since August 2025).
- `src/crm.ts` reads HubSpot deal pipelines through the v1 Pipelines API (retired 2026-12-04).

SHAPI scans this repo, finds the call sites affected by known breaking changes, and opens pull requests that fix them. Each PR includes a contract test that fails before the fix and passes after it; CI runs `npm test` on every PR.
