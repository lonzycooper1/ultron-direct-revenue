# ULTRON executive runtime

The current implementation and the status of all 14 requested gaps are documented in [AUTONOMY_IMPLEMENTATION.md](AUTONOMY_IMPLEMENTATION.md).

The existing Node/PostgreSQL service now contains a durable executive queue, specialist and review turns, OpenAI-hosted coding and browser execution, authenticated business events, generated-artifact downloads, a tested-build-to-Vercel preview workflow, financial reconciliation and outcome learning.

The owner workspace is `/executive`. Private APIs require the existing `ULTRON_ACQUISITION_ADMIN_TOKEN` as a Bearer header. Railway activation is resolved: deployment `02173768-c442-4b2c-bfc4-169a0697a41d` runs `d2b3166`; the live finance job and independent review succeeded. No settings were staged at the October 19 00:27 UTC check. Vercel deployment scope is resolved; AI Gateway billing verification remains separate.

The first hosted build completed at the provider and passed six tests, but its `/bin/bash -lc 'node --test'` receipt was rejected by the old command parser. The corrected parser recognizes a narrowly bounded shell wrapper while rejecting command chains and substitutions. Both build completion and deployment validation use the same evidence check. Run `node scripts/reconcile-hosted-build.mjs <saved-job-id>` inside the authorized service to recover a completed build without replaying its input; ownership, terminal turn, test receipts and deployment-manifest digest are checked before the atomic state update. Provider originals are retained.

The first desktop turn was cancelled after an approval request and is not a completed browser check. A manually queued, bounded public-page verification with idempotency key `verification:hosted-browser:read-only:v3` can approve origin access solely to `https://ultron-product-lab.vercel.app`. It cannot approve authentication or other origins. No customer, revenue, delivery, bank settlement, publication or message is claimed.

Run `npm run test:executive` for the new deterministic integration checks. Read the full implementation document for provider requirements, exact configuration, security boundaries, test limitations and the external actions still required.
