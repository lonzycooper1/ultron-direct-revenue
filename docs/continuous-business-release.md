# Continuous operations and first-customer evidence release

## Baseline and release boundary

Inspected main `3cab6fb7cc4452c9f784e0aa9382db8a22785204`, tree `d8216965f2500325a663b8d1ecde9b3f8e24020a`. Local source tree exactly matched remote main before edits. No AGENTS.md was found during repository inspection. Open PR41 financial validation and PR44 crypto safety are already represented in current files; their old branches were not merged over newer work. Other old draft/research PRs were not blindly incorporated.

Railway revenue service was SUCCESS at deployment `87e23e5c-01d9-40fd-828f-1f4ac491d523`, same revision. All five environment services reported SUCCESS. This is platform status, not proof all workflows work. PostgreSQL health and PayPal API/webhook runtime checks previously passed. Public research status contained 17 historical observations and PARTIAL_PUBLIC_FEED; those are neither buyers nor contact permission.

Patch `ec0ebf5b-5a6f-4a72-acac-fbf980cde6ca` read-back contained ONLY revenue `deploy.restartPolicyType=ALWAYS`. The earlier sleepApplication=false request produced no serialized delta; do not claim an independently verified sleep setting from that response. On this execution, accept-deploy returned: **Cancelled — the user did not approve this action. No changes were made.** No alternative deployment route was used. This release is not production-verified until the intended merged commit is deployed and observed.

## Working changes

- `continuous-operations.mjs`: atomic PostgreSQL-backed cycle leases, renewal, persisted pause/resume, restart interruption records, per-step attempts/successes, bounded history and overdue status. Existing 30-minute scheduler remains the sole enterprise timer. Startup is explicitly distinguished from unattended scheduled runs; successful scheduled-run counts are scoped to the deployed revision, so previous-release history cannot verify a new release. Each step is isolated; a feed failure does not stop independent reconciliation. Provider-specific timeouts remain; no unsafe Promise.race permits continuing side effects after a lease release.
- `live-demand-v46.mjs`: independently recorded GitHub/HN source results, last success, age, next due time, sanitized failure codes; malformed response schema rejected; one retry after 100ms for network/5xx reads, no immediate 429 retry; existing 30-minute persisted cooldown and byte limits retained. This supplies at most four provider requests per poll. Failed cooldown cannot become a healthy feed.
- `enterprise-cycle-v45.mjs`: durable supervisor integration, discovery failures no longer overwritten by CYCLE_EXECUTED. Existing deduplicated draft queues and generation limits preserved. No new outreach or spending authority.
- `business-evidence.mjs`: actual HTTP-view counters (including bots, not unique humans), checkout creation deduplication, existing ledger/inbound/financial evidence combined, incomplete metrics explicitly unknown, ten evidence states, expansion blocked pending owner review and sufficient evidence. It does not claim all ten requirements are complete.
- Shared `createOrder` blocks new checkout when three paid manual deliveries are pending or a dated paid delivery is overdue. Existing deliveries continue. This is an admission check, not a guarantee against concurrently completing already-created checkouts. Generic ready downloads and accepted mini audits do not consume manual-work capacity.
- Owner-only actual/estimated cost breakdown endpoint: six explicit USD-cent categories, unknowns remain null, estimates stored separately from actual costs, bounded review history, PayPal fees remain provider sourced. Provider fee ingestion now rejects blank/whitespace amounts instead of recording zero.
- Private $500 audit support has explicit support/revision versus refund-review choice. No refund is initiated; existing review queue is used.
- `public/business-operations.html`: actual records, functional authenticated pause/resume and cost entry; secure existing owner session; new navigation from source workflows. Public runtime endpoint exposes no customer records or credentials. Private business report and every mutation require existing owner authorization.
- `railway.json`: restart ALWAYS persisted in repository configuration. No dependencies, production data migrations, trading permissions, public campaigns or payments added.

## Ten requirement accounting

| Requirement | Existing implementation extended/preserved | Test evidence | Remaining limit |
|---|---|---|---|
| 1 Continuous operation | enterprise-cycle-v45, continuous-operations, live-demand-v46 | two clock-driven due cycles, early retry rejection, concurrent workers, PostgreSQL restart persistence, interrupted lease, stale status, independent failures | actual release deployment; two natural 30-minute production cycles; current hosting sleep setting not independently serialized |
| 2 Customer offer | existing $99 audit preparation, reviewed-sample gate, scoped PDF/ZIP/Markdown; $500 audited scope | audit-delivery, service-document, revenue-http-v41 existing suite | named customer demand and owner review of current sale-ready sample must be verified through authorized owner session |
| 3 Verified demand | public-source provenance, inboundWorkQueue, consent rules, duplicate handling | live-demand-identity, live-demand-v46, inbound-ops-v28 | source diagnostics only become available after deployment; no public observation is independently verified buying intent |
| 4 Acquisition | voluntary diagnostic intake, private inbox, draft-only follow-up, existing provider gates | inbound-ops-v28, growth-runtime-v19, customer-journey tests | runtime Gmail OAuth/verified sender and independent CRM verification; no sending authorized by this task |
| 5 Buying journey | server-priced PayPal orders, signed captures, paid-only private artifacts and exact acceptance | controlled customer-journey/audit-delivery/payment tests, not real payments | authenticated production journey and independent customer outcome not verified |
| 6 Profit | existing financialSummary + actual cost categories and estimate separation | business-evidence tests; strict unknown finance tests | actual fees, costs, receipts, refunds, labor and settlement documents only arise from real activity |
| 7 Readiness | existing scope/terms; repaired live support page routing, bounded persisted public request form, private owner queue/review, current PayPal-only FAQ and explicit refund-review task | support-intake, support retrieval/HTTP, revenue-http-v41 and revenue-operations-v41 tests | owner business identity/address, sender and applicable professional review not independently established; no legal completion claim |
| 8 Measurement | HTTP views, checkout events, ledger captures/delivery/acceptance, inbound source records | event deduplication/privacy and HTTP authorization tests | counters start with this release, do not reconstruct history or unique people; separate print/video acceptance stores and repeat-buyer identity not combined |
| 9 Repeatability | existing source-integration experiments with deadlines, criteria, stop/review history | source-integration and source-workflows tests | no multiple independent accepted sales; experiments are not evidence of market fit |
| 10 Scaling | real checkout capacity guard, existing executive daily caps/queue deduplication, persisted research pause; expansion evidence gate | capacity, overdue, completed-work release and evidence-negative tests | no automatic expansion/spend endpoint enabled; actual economics/customer demand remain unproven |

## Release verification procedure

1. Confirm current main/diff and required CI at the exact reviewed head.
2. Merge after checks pass. Inspect all staged Railway changes before pinning the merged revision. Respect the cancelled deployment boundary; owner must apply reviewed pending deployment through authorized controls.
3. Observe terminal SUCCESS, matching release commit at `/api/continuous-operations`, database/payment health and public customer pages.
4. Authorize a browser through the existing secure owner flow to verify private business report, saved records, cost validation and controls. Never paste credentials in a report.
5. Wait for two naturally scheduled cycles; verify trigger SCHEDULED and source statuses, not only startup. A partial feed remains degraded.
6. Use isolated controlled customer journeys for payment/delivery failure cases; no real demonstration charge, trade, outreach or spend.
7. No external owner alert destination is configured in the inspected variable-name inventory. In-app status is available; delivered notifications are not claimed.

## Local validation evidence

- Isolated loopback PostgreSQL full regression: 476 application tests + 43 crypto safety tests = 519, all passed with zero skips (`/tmp/ultron-continuous-reviewed-tests.log`).
- Final focused tests after the review corrections: 18 passed, zero failures/skips. These include a genuinely terminated child process holding a persisted cycle lease, recovery in a separate process at a controlled later clock, and verification that an unrelated synthetic customer record is unchanged. This is controlled restart evidence, not a production restart claim.
- Node syntax checks for server/modules and both changed browser scripts passed; `git diff --check` passed. Exact-head GitHub CI and production deployment remain separate gates.

## Customer support defect corrected

Read-only production inspection found `/support` only said “through the support API,” with no form. An existing unused public HTML FAQ also linked historical Payhip listings and obsolete audit prices. The actual route now serves the extended existing page with FAQ retrieval preserved and an operational support intake. Current FAQ distinguishes the inspected $99 and $500 scopes and uses PayPal-only direct-sales links. Historical products are not advertised as available.

`support-intake.mjs` writes customer-consented requests and owner tasks atomically in the existing operations namespace. Exact retries deduplicate; conflicting retries, credential-like content, requests beyond three per submitted email/day, and storage beyond 1,000 records are refused. These bounded controls do not guarantee prevention of distributed abuse. Requests are private to owner endpoints and contain no verified payment/buyer assertion. Owner reviews retain history; marking an owner-reported resolution never sends a reply or issues a refund. The operations UI exposes the working private queue and review controls. Missing authorized sender/owner response remains explicit. Controlled support tests passed five checks including PostgreSQL restart and HTTP privacy/validation; no production support request was submitted.

## $99 first-customer evidence correction

The $99 audit previously saved exact-document acceptance only in `auditDelivery.acceptedAt`, while legacy accepted-customer counters required the separate $500 fulfillment markers. `audit-delivery.mjs` now writes canonical acceptance/completion evidence after a fresh matching PayPal read, exact owner-reviewed artifact, and prepared download. `independentSale` recognizes this path only when package/SHA/reviewer evidence matches and the independently reviewed capture identity plus signed capture event are present. The existing owner buyer-verification endpoint now supports both audit SKUs, verifies the provider order identity and distinct payer/merchant, and rechecks the capture before committing review evidence. The operations UI provides the explicit owner review form. It does not create/capture orders or initiate refunds. Controlled audit/financial/activation tests: 31 passed with zero failures/skips, including rejection of changed artifact or buyer-review capture identities. Existing separately stored print/video acceptance remains outside this consolidated audit counter.
