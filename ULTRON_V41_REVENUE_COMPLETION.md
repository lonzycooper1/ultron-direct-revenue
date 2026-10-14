# ULTRON v41 revenue operations

This release implements the missing workflow and truth controls. It does not claim new customers, email authorization, received alerts, provider access or bank settlement.

## Implemented

1. The $500 checkout now redirects through `/audit-intake`: public website, delivery email, business baseline and versioned scope/terms are required. Its agreed deadline is five weekdays after payment and complete intake. Existing paid audits without intake enter private onboarding rather than receiving generic worksheets as completed work.
2. A completed PayPal capture starts a customer-specific draft. Static homepage observations and customer statements are qualified separately. The report includes a workflow map and 90-day roadmap. Private owner review requires at least two substantive sourced findings before releasing it. Customer acceptance records a report version; a revised report invalidates previous acceptance.
3. Actual first-party diagnostic submissions are recorded as unqualified inbound signals. This is an authorized owned intake channel, not proof of genuine demand or buyer intent. No fake inquiries or automatic prospect contact is created.
4. Gmail reply ingestion is available but disabled by default. It verifies the mailbox identity, reads at most 20 eligible replies per cycle from previously approved contacted prospects, deduplicates message IDs and processes opt-outs. Recognized delivery failures require matching thread and recipient evidence. New sends require an approved nonresidential business mailing address and matching sender identity. Ambiguous send attempts are held for reconciliation rather than automatically retried.
5. `/revenue-operations` offers an owner-authenticated paid-review queue and manual CRM, booking, support and refund-review tasks. A manual task marked complete is explicitly owner-reported and does not masquerade as a verified provider workflow. Existing provider adapters remain available after secure runtime authorization.
6. `/audit-terms` documents the $500 scope, delivery, exclusions, acceptance, support and refund review. The private order page allows support/revision requests and acceptance. Refund review does not execute a refund.
7. Signed capture event IDs are persisted only after PayPal signature verification. An accepted independent sale also requires a matching completed capture, provider payer/merchant read, owner review of buyer independence, reviewed delivery and customer acceptance. No simulated outcome is recorded in production.
8. Financial reporting distinguishes gross capture, provider-signed refunds, fees, documented costs, contribution profit and bank settlement. Missing evidence stays unknown. Payout/bank document references are owner-reconciled evidence, never labeled independently verified bank receipts.
9. Paid-work alerts are durable and deduplicated. An explicitly enabled approved webhook destination can receive a small status-only notice without customer details. Provider HTTP acceptance is not recipient receipt; owner acknowledgment is separate. Failed/ambiguous POSTs are not retried automatically. Safe transient reads have bounded backoff.
10. `scripts/state-backup-v41.mjs` exports the state table from a repeatable-read snapshot with AES-256-GCM encryption and a digest. Verification decrypts and validates without printing contents. Restore defaults to dry-run; applying requires explicit approval and an isolated target for drills. No database, encryption key, backup job or paid resource is created by this release.
11. v40 now reports PayPal configuration as `PROVIDER_CONFIG_VERIFIED` until a signed capture delivery record exists. A fulfillment token alone no longer proves completion of the $500 consulting service.

## Provider inputs required

Use secure provider OAuth and Railway variables, never public issues, repository files or chat plaintext.

- Gmail: existing client ID/secret/refresh token, selected sender, nonresidential address, unsubscribe secret; set `ULTRON_BUSINESS_POSTAL_ADDRESS_APPROVED=true` only after owner verification. OAuth must permit the needed Gmail read/send scopes. Set `ULTRON_GMAIL_INGEST_ENABLED=true` only for the authorized selected mailbox and reply workflow.
- CRM: authorize the correct HubSpot runtime app/service credential with minimum scopes. Existing implementation uses `ULTRON_HUBSPOT_PRIVATE_APP_TOKEN`; current HubSpot Service Keys may be a suitable scoped alternative if supported by the portal. Verify compatibility and one authorized round trip.
- Calendar: authorize the runtime client/secret/refresh token and select the calendar. Existing event creation needs confirmation, cancellation and reminder verification before claiming a complete appointment workflow; use manual scheduling meanwhile.
- Alerts: supply an owner-approved HTTPS webhook endpoint using `ULTRON_ALERT_WEBHOOK_URL`; set `ULTRON_ALERTS_ENABLED=true` only after approving that destination. Verify actual receipt on the intended device. Two ChatGPT monitoring tasks are separate from this server adapter.
- Backups: securely provide `ULTRON_BACKUP_KEY_BASE64` containing a 32-byte key and the target database connection. Keep encryption key separately from backup files. Choose retention and durable storage. Perform an isolated restore drill and record its evidence. Do not restore over live customer data as a test.
- Customers: distribute the owned diagnostic through an authorized channel, speak to real interested buyers, confirm service fit and deliver the agreed scope. A genuine unrelated customer's voluntary purchase cannot be created by code.

## Owner workflow

1. Open `/revenue-operations` and authenticate using the existing owner token. Tokens stay in the page session; do not include them in public URLs.
2. Review actual paid order intake and draft evidence. Inspect the public site/customer-provided material, then submit reviewer and findings. Release only accurate, scoped reports.
3. Direct the actual customer to their existing private order link using an authorized communication channel. The page shows the deadline and permits review, support requests and acceptance. No automatic message is sent merely by approval.
4. After genuine acceptance, use the authenticated `/api/audit/v41/buyer-verification` with the actual order ID and `ownerReviewedUnrelatedBuyer=true`. The server re-reads PayPal and requires matching capture plus distinct payer/merchant identifiers. This is an owner assertion combined with provider identity evidence, not an infallible test of all personal relationships.
5. Record documented costs/payout/bank references through authenticated `/api/audit/v41/financial-review`. Keep full documents private. Reconcile refunds and fees before using profit as a scaling metric.
6. Use `/api/revenue-operations/v41/record` for manual tasks, owner evidence references and acknowledgment of an actually received alert. Supported kinds are `MANUAL_TASK`, `EVIDENCE`, `ALERT_RECEIPT`; public diagnostic events are recorded internally as `DEMAND`.

## Backup commands

With the existing authorized environment and a securely supplied backup key:

```sh
node scripts/state-backup-v41.mjs export /private/backups/ultron-state.enc.json
node scripts/state-backup-v41.mjs verify /private/backups/ultron-state.enc.json
# Point DATABASE_URL at an isolated restore target first:
node scripts/state-backup-v41.mjs restore /private/backups/ultron-state.enc.json
# Actual restore requires explicit scope and ULTRON_RESTORE_APPROVED=true:
node scripts/state-backup-v41.mjs restore /private/backups/ultron-state.enc.json --apply
```

Do not check backup files, credentials or customer data into Git. The restore path upserts snapshot keys; it does not delete unrelated keys. Stop workers before an approved real restore and verify all relevant records afterward. This application-state export complements provider/database backups; it is not a full infrastructure disaster-recovery image.

## Research sources

- Google: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/messages/list — message lists return IDs/thread IDs; details require message retrieval. The bounded reader uses these documented calls.
- PayPal: https://developer.paypal.com/api/rest/webhooks/rest — subscription configuration differs from receiving and verifying actual events; mock simulator postback verification is not supported. Live customer proof is kept distinct.
- FTC: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business — commercial email requires mailing identity and an operable opt-out. The owner's home address is prohibited by the user's instructions; only their approved nonresidential business address may be used.
- HubSpot: https://developers.hubspot.com/blog/hubspot-service-keys-the-right-api-credential-for-data-integrations — investigate the current scoped credential option when authorizing the runtime.

## Validation and rollback

New isolated tests exercise terms rejection, customer-specific paid lifecycle, quality gate, signed-event matching, independent-buyer evidence, versioned acceptance, capture deduplication, unknown fees/costs, encrypted restore/tamper rejection, safe read recovery, mailbox mismatch, reply deduplication, suppression classification, bounce scoping, alert receipt distinctions and local HTTP authorization/redirect behavior.

Local fixtures are mock data only and never real customers or production revenue. The existing complete test command expects an ephemeral PostgreSQL database (the GitHub CI workflow already provisions one). Preserve main commit `c39f12c2a8fb66211d52d1eb8f44a71c0ecf7089` as the pre-change rollback reference. No automatic refund, domain purchase, live trade, bulk send or plan upgrade was added.
