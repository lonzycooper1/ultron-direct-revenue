# ULTRON Revenue Activation v27 — real completion gates

> This document is an operating runbook, not proof of customer revenue. ULTRON's $1,000,000,000,000 goal is a long-horizon aspiration, not a forecast.

## Production foundations already present
- Railway direct-revenue, market-stream, trading-engine, web and Postgres services have run in production.
- PayPal production API and webhook configuration were verified by the application during the latest checked startup.
- The opt-in response-gap diagnostic, $500 audit page, PayPal checkout route, 500-requirement plan and the mainframe supervisor exist in code.
- The selected business-contact address is `hunterward199@gmail.com`, but selecting an address is **not** Gmail API authorization for the deployed server.

## Highest-priority execution gaps and genuine acceptance criteria

| Gate | Automatic work ULTRON can do now | External requirement / evidence |
|---|---|---|
| Independent buyer discovery | Rank public/authorized business problems, deduplicate and draft relevant demos | Hunter connection currently reports a restriction. Owner must restore that account or authorize an alternative permitted feed; successful independent import required |
| First-party inbound traffic | Serve free diagnostic, score self-reported response friction, log opt-in separately, prioritize inbound queue | Real visitors and voluntarily submitted inquiries; promotion through permitted owned channels |
| Gmail sending | Prepare drafts, suppress opted-out recipients, review rate and message scope | Owner-authorized Google Cloud OAuth credentials for Railway, correct sender authority, required business postal address and unsubscribe policy, compliant actual send test |
| HubSpot reconciliation | Prepare records and field mappings without writes | Authorized Railway HubSpot app token and a real test read/write under appropriate permission; HubSpot portal onboarding may also need owner action |
| Appointment booking | Prepare booking request and proposal | Actual Google Calendar OAuth and free/busy verification for Railway; attendee confirmation |
| PayPal checkout | Present legitimate public price and create real customer checkouts | Independent customer must buy; signed provider capture and webhook, refund/fee audit and delivery evidence |
| Fulfillment | Generate scoped paid deliverable, QA and customer handoff | Actual paid order, customer scope/consent and acceptance |
| Processor-to-bank | Match captured order to provider settlement and expenses | Real settlement statement and bank evidence; provider payment authorization by itself is not a deposit |
| Company domain | Continue with existing Railway URL and selected Gmail for early validation | Owned domain purchase and DNS proof if/when owner chooses branded identity |
| Legal and lending | Prepare templates/checklists and scenario forecasts | Verified EIN, entity, fiscal statements, contracts, taxes, collateral and specific owner approval for loans or legal acts |
| Marketing | Create accurate SEO copy, short educational drafts, channel plan and conversion measurement | Publishing authorizations, opt-in, and approved ad budgets |
| Scale | Track margin, retention and real customer outcomes | Repeatable profitable demand and capacity, not claimed traffic or synthetic products |

## Fallback logic
1. Paid customer delivery comes first; then genuine interested replies.
2. Review voluntary inbound diagnostic scans and their explicit one-to-one contact consent.
3. When third-party discovery is restricted, direct permitted traffic to the first-party diagnostic rather than claiming imported prospects.
4. If Gmail is not separately authorized for Railway, queue drafts for owner review; **never** mark messages as sent.
5. Do not change external financial, legal, publishing, spending or trading state without action-specific authority.
6. Never claim a configured connector proves a successful customer outcome. Track capture, refund, fulfillment and settlement independently.

## Production pages
- `/activation-center`: safe activation summary, first-party inbound count and owner/provider gates.
- `/api/activation/v27`: machine-readable status (no personal contact details).
- `/api/activation/v27/inbound`: owner-authenticated voluntary diagnostic inbox.
- `/free-response-gap-scan`: real public opt-in demand-capture page.
- `/flagship`: $500 audit offer and PayPal checkout route.
- `/completion-500`: 500-item requirements backlog, not 500 completed items.
- `/integrations`: status of required production authorizations.

## Release criteria
- Run Node server syntax check and all regression tests before deploy.
- Confirm Railway deployment SUCCESS and HTTP health.
- Verify that absent provider OAuth remains BLOCKED and zero customers remain zero verified revenue.
- Verify the public activation endpoint excludes personal emails and private tokens.
- Verify the owner-only inbound endpoint rejects requests without administrative authorization.
- Confirm the new selected Gmail does not authorize unattended sending by itself.
