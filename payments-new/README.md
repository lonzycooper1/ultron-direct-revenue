# Standalone payment event groundwork

Run `node --test payhip-events.test.mjs` with Node 22+.

Official source checked October 4, 2026:
https://help.payhip.com/article/115-webhooks

Payhip documents `paid` and `refunded` events, transaction IDs, integer cents, and a signature equal to SHA-256 of the API key. Non-200 responses are retried hourly for up to three hours. This module compares that documented digest using timing-safe equality and validates a minimal payment/refund representation. It retains no buyer email, IP, address, license key or signature in the normalized output.

## Integration limits

This is tested groundwork, not a deployed endpoint or verified payment connection. No real key or transaction is present. Keep the key and supplied digest server-side: the documented signature is static and does not authenticate the payload contents. Anyone obtaining that digest could modify or fabricate payloads. Require independent transaction reconciliation before any consequential release of funds or custom delivery.

The documented refund payload does not clearly establish whether repeated partial refunds report cumulative totals or individual increments. The reducer conservatively uses the maximum reported refund total, never adds repeated notifications, and rejects a newer decrease. Reconcile actual processor history before treating this as an authoritative net-revenue ledger. If the provider reports individual increments, the adapter must change after verified fixtures establish semantics.

Duplicate keys use transaction ID, event type, event time and reported refund total. Same-key mutations and transaction currency/price conflicts fail for review. Persist the event key and updated transaction together atomically in the production database. This in-memory pure reducer provides no concurrency lock, durable storage, HTTP request size cap, rate limit, reconciliation API or response handling. Do not acknowledge an event before successful durable persistence.

Only payment/refund observation is modeled. Missing fees remain unknown; retained gross cents excludes processing fees, operating costs, chargebacks and tax treatment. A paid event never verifies delivery or bank settlement. No transfers, trading, refund actions or autonomous spending are implemented. Bank settlement and delivery remain explicitly unverified.

Six test cases exercise valid/invalid signatures, malformed and fractional amounts, repeated delivery, refund-before-payment ordering, full/partial refunds, stale notifications, conflicting payloads, input immutability and prototype-key handling.
