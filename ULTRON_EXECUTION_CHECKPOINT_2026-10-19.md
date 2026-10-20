# ULTRON verified execution checkpoint — 2026-10-19 22:06 UTC

This checkpoint supersedes historical activation conclusions only where direct evidence is recorded below. It is not a declaration that the business is complete. No production deployment, trade, customer message, payment, or production database mutation was performed during this checkpoint.

## Changes prepared for review

PR #41: https://github.com/lonzycooper1/ultron-direct-revenue/pull/41
Code commit: 7c008a24430be060615c281f2366de3f018c0f45

- Reproduced a $500 capture with an empty provider fee and null reviewed cost incorrectly reporting $500 contribution profit.
- Added strict recorded-amount validation in ultron-revenue-operations-v41.mjs; unknown capture, refund, fee, cost and bank receipt amounts remain unknown. Explicit numeric/string zero remains valid.
- Applied the same validation to executive-business.mjs.
- Added adversarial regression cases in the corresponding test files.
- Repaired package-lock.json to include the already-declared nodemailer dependency. Clean npm ci succeeded in isolation.
- Changes are on a review branch, not main and not deployed.

## Independent platform reads

Railway project: 2e0b0216-9aba-4ff3-bf10-e1f5b44d28e3
Revenue service: 6414a1c3-7fcc-4153-ac89-e8adf52ea9ac
Production environment: 7f1a8b7e-52c3-47a8-b4a7-edf7f812e265

- Revenue deployment b0d274b0-3e14-40d9-a49a-aa7dc930f098 is SUCCESS with commit fc4c93d64ddb7b2805d7833b580cac6c25920e35. Revenue service has no staged changes.
- Railway service configuration has preDeployCommand ["env -u NODE_OPTIONS npm test"], timeout 300 seconds. This gate exists in platform settings even though railway.json does not declare it.
- GET /health returned database.ok=true, backend=postgres, paymentReady=true. This does not prove customer payment or settlement.
- GET /api/revenue-operations/v41 at 22:03 UTC returned zero captures, zero accepted customers, zero inbound signals, AUTH_REQUIRED email, and unverified bank settlement.
- GET /api/demand/v46/offers returned an empty offers array. Generated catalog counts are not evidence of reviewed products or sales.
- GET /api/executive/status reported worker enabled, daily job limit 4, coding/browser verified, completed finance evidence with independent review, and no RECONCILIATION_REQUIRED jobs. Browser evidence included five computer actions, one screenshot and DELETED_AFTER_DOWNLOAD. This is runtime aggregate evidence: private artifact bytes/provider originals were not independently retrieved during this session. No replacement hosted jobs were submitted.
- Product Lab prj_F4KwMNbx22NgsOtL3zKH1gGvY1vB successfully created the isolated Vercel test sandbox through the connected account without a team parameter. Do not repeat an old blanket Vercel 403 claim as current. This does not supply a Railway Vercel token.
- Revenue variable-name inventory lacks runtime Gmail OAuth, HubSpot, Calendar, SMTP, Vercel preview credentials, backup key and alert destination variables. Existing sealed/encrypted OpenAI references and PayPal variables were present; values were not exposed.

## Tests actually executed

1. Targeted new financial regression suite: node --test ultron-revenue-operations-v41.test.mjs executive-business.test.mjs. 16 passed, zero failed/skipped.
2. PR #40 head 83a9672cbc017719f23d70e838ff243cc9cc4f01: npm ci, then npm test with disposable loopback PostgreSQL and FFmpeg. Main suite 360 passed; crypto safety/HTTP suite 16 passed; zero failed/skipped in either suite.
   Existing matching GitHub CI: https://github.com/lonzycooper1/ultron-direct-revenue/actions/runs/39330922355
3. PR #41 code commit 7c008a24430be060615c281f2366de3f018c0f45: clean npm ci, npm test using disposable PostgreSQL. 362 passed, zero failed/skipped. GitHub CI also succeeded:
   https://github.com/lonzycooper1/ultron-direct-revenue/actions/runs/39332299948
4. Encrypted populated restore drill: scripts/state-backup-v41.mjs export, verify and restore --apply, between two separate isolated databases. Three synthetic ultron_state rows restored; cmp matched and both sorted fingerprints were df8fd57d2ea23828e36f62434772f978e452c2a15236b32494238c052dfdc594.
   This tests the current ultron_state backup implementation only. It does not establish production retention, backups of normalized enterprise/crypto tables, production restoration, or alert receipt.

Sandbox session: sbx_07W8yQwwwz3vMqzzK6ZvYJmQxA7T. No production credentials were supplied. Source/test logs were /tmp/ultron-pr40-tests.log and /tmp/ultron-revenue-tests.log. These are temporary; GitHub CI links above provide durable test logs.

## PR #40 and trading boundary

PR #40 is still draft and unmerged. Its gateway integrates persistent stop/locking and reservation checks but deliberately throws before dispatch. readExchangeRisk explicitly rejects missing certified daily account P&L. These are unfinished code requirements, not merely missing authorization.

Read-only reconciliation validates identity and fill totals but still rejects truncated history; complete history/pagination and submission transitions remain work. No real exchange order or read-only credential acceptance check was performed here.

Railway trading deployment 4bdcb023-e32a-48fd-97f1-fdea95062ea6 is SUCCESS. Startup log at 21:14:33 UTC confirms liveTradingEnabled=false, autonomousLiveOrders=false, humanApprovalRequired=true. Deployment metadata names fc4c93d, while live service source configuration pins 2fb561597a976ce447a57d793403c413bd853402; do not infer its effective safety code from the metadata alone.

Trading has seven pending changes, patch 49a45b52-f3a1-4c29-8c64-83c725e47596: source branch safety/live-trading-fail-closed-20261019 at 83a9672 plus database and safety variables. The patch was not accepted or modified during this checkpoint. Inspect actual staged values securely before any later application. Passing fail-closed tests does not certify order execution or authorize live trading.

## Smallest next actions

1. Review PR #41 and its passing CI. Keep deployment separate; retain current production commit until the release decision is authorized.
2. Complete the immediate $500 audit service dependencies: authorize the selected Gmail mailbox for the deployed server, provide the approved nonresidential mailing identity where commercial messages require it, configure an owner alert destination, and verify permissioned send/receipt/reply plus alert receipt. No raw credentials in chat or GitHub. Direct setup: https://railway.com/project/2e0b0216-9aba-4ff3-bf10-e1f5b44d28e3/service/6414a1c3-7fcc-4153-ac89-e8adf52ea9ac
3. Verify the real buyer path using /flagship, /audit-intake and /audit-terms; retain reviewed fulfillment and customer acceptance checks. No fake customer/payment. The first sale requires an actual buyer; missing inbound demand is not a passing integration test.
4. Finish separate infrastructure code gaps: backups of normalized enterprise/crypto state, production backup policy and a received alert. Add certified daily P&L accounting, a tested dispatch boundary and complete reconciliation to PR #40 without activating live trading. Do not treat these unfinished code tasks as authorization-only blockers.
