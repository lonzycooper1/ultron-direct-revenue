# ULTRON executive runtime

The current implementation and the status of all 14 requested gaps are documented in [AUTONOMY_IMPLEMENTATION.md](AUTONOMY_IMPLEMENTATION.md).

The existing Node/PostgreSQL service now contains a durable executive queue, specialist and review turns, OpenAI-hosted coding and browser execution, authenticated business events, generated-artifact downloads, a tested-build-to-Vercel preview workflow, financial reconciliation and outcome learning.

The owner workspace is `/executive`. Private APIs require the existing `ULTRON_ACQUISITION_ADMIN_TOKEN` as a Bearer header. The original five Railway settings remain staged after the activation tool was rejected. Production is not verified to be running this code. The Vercel connection created Product Lab, but deployment and sandbox requests returned provider HTTP 403. No live model execution, customer, revenue, delivery, bank settlement, publication or message is claimed.

Run `npm run test:executive` for the new deterministic integration checks. Read the full implementation document for provider requirements, exact configuration, security boundaries, test limitations and the external actions still required.
