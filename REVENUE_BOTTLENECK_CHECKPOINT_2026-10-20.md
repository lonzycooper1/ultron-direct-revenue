# Revenue bottleneck checkpoint — October 20, 2026 (America/Chicago)

## Evidence inspected

Revenue service 6414a1c3-7fcc-4153-ac89-e8adf52ea9ac, production environment
7f1a8b7e-52c3-47a8-b4a7-edf7f812e265, project
2e0b0216-9aba-4ff3-bf10-e1f5b44d28e3.

At inspection, main and successful Railway deployment
3fcec903-1551-4f5b-9b8a-24db09e60fd4 both referenced d324df29f43b5baa5ffa180cb0cab66498936533.
No Railway changes were staged. Matching CI run 39511748785 succeeded.
These facts supersede older claims that deployment remains paused or production
is still fc4c93d. Later releases must be independently verified.

Direct HTTPS reads around 2026-10-21T04:00Z established:

- /health: PostgreSQL healthy and paymentReady true.
- /api/payment-status: live PayPal API authorization, webhook endpoint and
  capture-event subscriptions verified at startup, checkedAt 2026-10-20T22:57:47.822Z.
  This is not a customer capture, refund, delivery or bank settlement test.
- /api/revenue-operations/v41: 0 captures, $0 recorded gross, 0 accepted
  customers, 0 inbound signals, unknown profit and unverified settlement.
- /api/demand/v46/status: PARTIAL_PUBLIC_FEED, 0 stored signals and assets.
- /api/executive/status: coding and browser checks recorded as verified,
  10 DRAFT_READY and 6 BLOCKED jobs, no running lease. Provider originals
  and private artifacts were not retrieved in this inspection.
- /flagship, /audit-intake, /audit-terms, /support and /customer-delivery
  have working render routes; local HTTP tests check terms and legacy redirects.
  Rendering alone is not end-to-end checkout certification.
- Railway OAuth lists credential names only. Owner token, PayPal secrets and
  database credentials cannot be read through this connection. No secrets
  were requested in chat, copied into source, or recreated.

## Corrections in this branch

1. Preserve the numeric Hacker News discussion ID in source URLs. Previously
   removing all query parameters erased the source and collapsed different
   discussions into one identity. Reject malformed IDs and deduplicate repeats.
2. Carry forward the financial evidence validation from unmerged PR #41 into
   current main's files. Blank, null, boolean and structured amounts remain
   unknown instead of creating zero fees/costs or false profit. Preserve current
   dependency versions and newer work; do not merge the older lockfile.

Local discovery/financial tests: 17 passed. Local customer HTTP/database-boundary
tests: 3 passed. Full database journey tests require the isolated PostgreSQL CI
environment; the initial local attempt failed because DATABASE_URL was absent,
not because a production database was used. Full CI and deployment evidence
must be checked on the final branch head before reporting this release live.

## Remaining bottlenecks and verification

| Obstacle | Type and evidence | Next supported action | Resolution test |
| --- | --- | --- | --- |
| No genuine demand/customer | Business assumption; zero inbound signals/captures | Review a specific offer with real prospective customers through authorized channels; do not treat public discussions as permission to contact | Genuine inquiry, independent paid capture, scoped delivery and acceptance |
| Partial discovery | Provider/runtime; public snapshot reports PARTIAL_PUBLIC_FEED | Inspect private source errors through owner console; repair the failing source or configure an authorized alternative | Successful scheduled fetch with usable attributed sources; a signal is still not a buyer |
| Email unavailable | Missing runtime authorization; AUTH_REQUIRED and no SMTP/Gmail OAuth variable names | Authorize the selected business mailbox for the deployed server through secure setup | Specifically authorized send, received message and reply ingestion |
| CRM not proven | HubSpot variable exists; CONFIGURED_ROUND_TRIP_REQUIRED | Verify scoped runtime read through owner controls, then an authorized test record if needed | Provider read/write/read with the expected portal and record identity |
| Owner review and alerts | Operational; artifact release checks exist, notification receipt unverified | Sign into existing owner console, inspect exact samples and pending cases, choose alert destination | Exact-version review recorded and alert received/acknowledged |
| Profit and cash unknown | Missing external evidence | Reconcile actual provider fees, delivery costs, refunds and bank settlement after a legitimate purchase | Complete amounts with source documents; no inferred zero costs |
| Recovery not certified | Restore drill required in public operations state | Configure backup retention and test restore in isolation before any production recovery | Populated restore, matching state and documented recovery outcome |

Manual support/booking and private delivery are available alternatives while
email/calendar transports are unfinished. Do not label manual tasks as provider
automation. No buyer outreach, paid advertising, purchases, transfers, refunds,
trades or invented customer activity were performed in this checkpoint.

## Resume

Inspect PR #62 and final CI, reconcile current main and Railway commits, then
verify production after deployment. Preserve concurrent PR #61 and other newer
changes. For private provider verification, use the existing owner console with
its configured owner token; OAuth variable-name access does not unlock private
application APIs. Do not ask the owner to paste secrets into chat.
