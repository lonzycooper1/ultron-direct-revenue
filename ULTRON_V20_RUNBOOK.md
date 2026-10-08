# ULTRON Reflective Executive v20 — production integration

ULTRON v20 is a **self-observing program**, not self-aware consciousness. It uses actual PostgreSQL events, counters, payment records, work queues, quality evidence and explicit owner policy to choose safe tasks.

## Enabled functional controls

- **Mission controller**: prioritizes paying customer fulfillment above speculative research, then high-intent replies, then first-customer acquisition.
- **Central event bus**: idempotent event IDs and provenance; event log plus durable jobs in PostgreSQL.
- **Leased job queue**: capped attempts, safe internal job evaluation; no external sends, hidden trades or money transfers.
- **Payment-to-work-order bridge**: trusted PayPal capture events enqueue a scoped job. Existing PayPal API verifies signatures/captures; v20 never treats arbitrary owner-submitted events as paid orders.
- **Revenue ledger**: captured payments, matched refunds, documented costs, reserve holdback calculations; recommendations do not spend.
- **Emergency stop**: owner-gated /api/reflective/v20/stop halts v19 Gmail send and new checkout while leaving already-paid fulfillment accessible.
- **Opportunity evidence scoring**: owner-imported sourced public RFP requests. No fictional verified contacts or provider accounts.
- **Privacy and claim controls**: suppression registry, provenance, no fabricated income or guaranteed revenue.
- **Self reflection**: dynamic allocation and blocker diagnosis every 10 minutes. The system reports its limits.
- **Customer outcome gate**: 3 independent satisfied verified paid customers before any approved growth recommendation.

## Key routes

- Public read-only human-readable operational dashboard: `GET /cognition`
- Owner-authenticated reflection: `GET /api/reflective/v20`
- Owner-authenticated work queue: `GET /api/reflective/v20/queue`
- Owner mutations via `POST /api/reflective/v20/{reflect,run-safe-jobs,buyer-intent,event,stop,quality,cost,satisfaction,budget,campaign,suppress,experiment,partner}`
- Ownership requires `Authorization: Bearer <ULTRON_ACQUISITION_ADMIN_TOKEN>` or existing authenticated admin header.

## Critical boundaries

- **No claim of actual consciousness, sentience or independent free will**.
- **No auto-purchase of branded domain, Google or service-provider authorization**.
- **No invented buyer intent**: sourced leads still require verification.
- **No broad spam**: v19 checks opt-outs, provider evidence, daily caps, and manual campaign approval.
- **No unapproved withdrawals, ads, real-money trading or spending**.
- **No unconditional automatic services**: each real paid work order requires the deliverable, QA and evidence of delivery.
- **No fabricated credit, loan documentation, tax filings, business history or customer satisfaction**.
- **Revenue and contribution after recorded costs are not cash on hand or complete net profit**.

## What still requires external production integrations

A legitimate discovery/RFP data provider feed, live OAuth credentials on Railway for business Gmail and Calendar, custom branded domain and DNS, customer-authorized fulfillment integrations, permitted social publishing, CRM synchronization bridge, payment settlement reconciliation with bank transactions, document vault, partner legal agreements. The 50-upgrade registry distinguishes working code from adapters and evidence gates; never use it as a claim that every external operation is already live.

## Production sequence

Verify `/health`, PayPal runtime readiness, `/cognition`; check signed payment path, idempotent capture recording, invoice and fulfillment; then connect live discovery/email/calendar in owner-controlled production settings. Prioritize first real paying customer and real delivery, three unrelated satisfied customers, and only then a funded positive-unit-economics acquisition experiment.