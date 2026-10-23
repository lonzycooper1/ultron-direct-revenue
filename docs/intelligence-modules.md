# ULTRON intelligence modules

Extends the existing Node ESM HTTP service, PostgreSQL `ultron_state` and executive worker. No additional paid service, model credential, processor or database is introduced. The state store creates its existing table idempotently; this release adds the `intelligence-runtime-v1` JSON state key and does not modify customer rows.

## API

All routes below require existing owner authorization except `/api/intelligence/health`, which exposes only release and observation health. Existing secure owner sessions or Bearer authentication are reused.

- `GET /api/intelligence/status`: supported tools, durable task summaries, observation history and existing worker status.
- `GET /api/intelligence/revenue`: USD application capture ledger, known fees/refunds/costs, signed subscription-event risk signals.
- `POST /api/intelligence/execute`: JSON `{ "tool": "revenue.snapshot", "input": {}, "idempotencyKey": "owner-review-1" }`.

Allowed tools: `revenue.snapshot`, `sports.board`, `sports.prop`, `sports.preview`, `sports.summary`, `conversation`. An unknown tool is rejected before execution. No send, trade, refund or price-change executor is registered. Public sports routes remain available.

Sports preview/summary input: `{ "sport":"NBA", "eventId":"actual-provider-event-id" }`. Preview requires pre-game state; summary requires final state. Prop input follows the existing Sports JARVIS schema. Predictions remain uncalibrated estimates. Current public scoreboard/box-score observations do not supply licensed historical player data, injury assurance, play-by-play or verified PrizePicks lines.

Conversation input: `{ "module":"revenue", "message":"Explain current reconciliation gaps" }`, or module `sports` with optional sport. Returns an existing executive job reference, not a completed model answer. Retrieve the result through authenticated `/api/executive/status`. Execution uses the existing worker switch, budget and pause controls; this release does not change them. Model provider success must be verified separately.

## Persistent operations

The existing startup/ten-minute reflective loop calls a database-leased observation cycle. It stores up to 72 recent revenue/feed health snapshots. One slot is claimed across replicas; a restart cannot silently duplicate that slot. Provider failures yield unavailable/degraded evidence. The next interval provides recovery without an unbounded retry loop. Completed on-demand tasks replay their durable result, and changed input with the same key is rejected. Interrupted on-demand work requires reconciliation and a new key rather than automatic re-execution.

Financial event records are retained (10,000-event capacity, then explicit archival/backpressure). Task results are capped at 500 KB and 1,000 records, after which archival is required. No financial evidence is silently evicted. Provider reads have bounded timeouts; selected HTTP transient feed responses receive one delayed retry. Financial mutations are not automatically retried.

The PayPal signature-verification route records supported subscription lifecycle/failure/sale events only after verification. Duplicates are idempotent; older events cannot regress current state. This does not backfill provider history or change webhook subscriptions. If the existing PayPal webhook is not subscribed to those events, billing risk remains incomplete until the owner-authorized provider configuration is completed. Unknown subscription cohorts, prices, customer identities and billing histories leave ARPU/LTV/MRR/churn null; zero observations never prove zero churn. Recovery produces review signals only.

Existing capture accounting is reused. It describes application capture records, not independent customer proof or bank settlement. Non-USD orders are excluded and counted. Unknown fees and costs remain unknown.

## Verification

New behavior is included in `npm test`. Focused local command: `node --test intelligence-runtime.test.mjs sports-jarvis.test.mjs sports-live-feed.test.mjs executive-runtime.test.mjs`.

Production acceptance requires the merged revision to be live, the public health endpoint to show a fresh scheduled observation, authenticated tool execution and replay, verified actual sports responses, and signed real PayPal billing events when available. Fixtures do not count as actual customers, payments, sports outcomes or model-provider executions. No test payment or customer message is needed or authorized.

## Completion evidence extension

`/intelligence` is an owner workspace using the existing secure session (no browser storage of credentials). `GET /api/intelligence/tasks/:reference` retrieves a saved result. Conversation submission now returns `QUEUED`; retrieval resolves the existing executive job into `DRAFT_READY`, blocked or reconciliation state. A generated draft never becomes an externally completed action. Task identity conflicts still prevent duplicate work.

Scheduled observations now record startup versus scheduled trigger, release commit and process run ID. Public health exposes current-release scheduled-cycle count separately from all retained observations. Older release and startup counts cannot satisfy the two-natural-cycle acceptance check. Observation history survives deployment; that alone does not verify two scheduled runs or interrupted model recovery.

The existing PayPal credential performs only a GET of the configured webhook, once per observation cycle. Private revenue evidence reports missing subscription event names, wildcard coverage or provider unavailability; no remote webhook configuration is changed. Subscribed events do not prove a real signed event arrived. Conflicting events with equal provider timestamps retain a reconciliation/risk flag rather than silently clearing a payment failure.

The HTTP process handles SIGTERM/SIGINT with bounded admission shutdown, HTTP draining and a wait for existing executive runs. A 25-second deadline records unresolved durable reconciliation rather than marking work completed. The operating system can still terminate sooner; leases and provider reconciliation remain necessary. This does not certify every older background loop as drained. The executive timer stops admitting new interval runs.

One-sided sportsbook odds without at least five supplied historical observations return PASS; confidence is explicitly a heuristic score, not a calibrated cover probability.
