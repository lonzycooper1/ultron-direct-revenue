# ULTRON v43: Evidence execution and blocked-provider fallback

**Goal:** fulfill the owner's entire 500-requirement audit as an honestly reported operating program. **This document is not a claim that 500 tasks or the $1 trillion aspiration have been completed.**

## Concrete code added
- GET \`/completion-execution\`: public, read-only priority and 20-workstream dashboard; no authentication data or customer details.
- GET \`/api/completion-execution/v43?offset=0&limit=100\`: bounded evidence register for C001–C500; all entries remain \`NOT_VERIFIED\` until independent proof exists.
- \`ultron-completion-execution-v43.mjs\`: reads the existing 500-item list and 22 external capability gates, derives runtime auth/readiness states, ranks paid work ahead of speculative discovery, and offers permitted fallbacks and direct owner-action pages.
- \`ultron-growth-runtime-v19.mjs\`: when primary discovery fails, tries the existing authorized fallback without an unsafe write or contacting Hunter. Stores failure context and explicitly labels fallback output **candidate businesses**, not interested buyers.
- Tests for coverage, immutable authorization boundaries, no secrets in public status, no fake sales, heartbeat freshness, fallback-priority policy, and owner evidence awaiting review.

## Evidence standard
No item becomes VERIFIED_END_TO_END merely because a provider variable is present, GitHub tests pass, a model wrote a draft, or a source yielded candidates. C001–C500 require real independently checkable proof. The public route intentionally does not grant itself the authority to certify external records; use the owner-protected evidence endpoint \`/api/completion-500/evidence\` for submissions and review those independently.

### Revenue business P0 — close real buyer/delivery
1. **Discovery:** primary and independently authorized fallback, with source permission and verified public buyer intent. Fallback to the owned opt-in \`/free-response-gap-scan\` and manually researched official RFPs when providers fail. Never evade Hunter restrictions.
2. **Owner contact:** activate server Gmail credentials scoped to the selected sender; an approved nonresidential business postal address and \`ULTRON_BUSINESS_POSTAL_ADDRESS_APPROVED=true\` only after owner verification. Ingestion remains opt-in for approved prior contacts. If unavailable, keep automatic sending OFF and work only with genuine voluntarily supplied inbound inquiries.
3. **Sales and CRM:** submit real bids through authorized platform accounts, record buyer reply and accepted scope; HubSpot manual owner-confirmed entry until runtime authorization and real read/write round trip.
4. **Booking:** manual confirmed scheduling until separate Google Calendar runtime OAuth and tested real free/busy/event/cancellation/reminder workflow.
5. **Provider money:** signed live PayPal capture and provider payer/merchant evidence, distinguish order authorization, captured payment, independent-buyer review, audit QC and client acceptance. A direct PayPal consulting checkout does not depend on the Shopify plan.
6. **Paid work:** owner reviews due-date, customer-specific audit findings, release quality and revisions before customer acceptance. Never treat a fulfillment token as finished work.
7. **Profit:** reconcile fees/refunds/chargebacks/costs and actual bank settlement separately. Owner-recorded documents alone are not independently verified bank receipts.

### Infrastructure P0 — reliability and security
8. **Notifications:** configure owner-approved alert destination and verify recipient acknowledgment. HTTP 200 and an enabled ChatGPT task do not prove owner delivery; task notification switches must be enabled in the user's app.
9. **Backups:** production key \`ULTRON_BACKUP_KEY_BASE64\` in secure variables, protected durable offsite storage, retention, schedule and isolated full restore rehearsal. The v41 script verifies application-state snapshots but does not prove production database recovery.
10. **Security:** signed webhooks, least privilege, owner-only identity/MFA, external sends, spending, contracts, refunds, banking and trades. No unilateral power of attorney or unrestricted automation.
11. **Deployment:** CI and Railway health must pass. Compare pinned runtime commit with GitHub \`main\`; deliberately deploy only an approved tested release.

### Product expansion P1/P2
12. **Identity:** owner-owned custom domain, DNS and SPF/DKIM/DMARC only with actual domain approval. Railway domain works for initial direct checkout.
13. **Web/video:** original/licensed imagery, audio, rendering, motion consistency, QA, publishing accounts and independently accepted commercial deliverables. Browser prototypes are not rendered client videos.
14. **Native apps:** signed iOS/Mac builds, device and push testing, owner auth and permitted distribution.
15. **Telephony:** provider number, AI voice stack, consent/recording disclosures, failover to human and verified booked call.
16. **Quantum:** classical simulation is not hardware. IBM Quantum account, isolated Qiskit worker, approved quota, real QPU job and baseline only if there is a research or customer need.
17. **Marketplace/POD:** actual supplier, subscriptions, shipping, taxes, returns and authorized plan activation when financially justified.
18. **Property and market intelligence:** licensed source data, external counterparties and financial/legal checks before calling an opportunity a deal.
19. **Agent system:** bounded jobs, tool permissions, concurrency and token budgets; proven worker execution and reviewer independence. Count completed commercial outcomes, not agent cycles.
20. **Governance/scale:** verify retained customer outcomes and margins before increasing outreach, ad spend, products, agents or infrastructure.

## Manual unblock playbooks
| Block | Acceptable temporary workaround | Must stay unverified |
|---|---|---|
| Hunter restricted / discovery provider 404 | Owned voluntary diagnostic + official authorized opportunities; use working fallback with provenance | True buying intent, authorization for contact |
| Railway Gmail OAuth absent | Owner-reviewed genuine inbound; use owner-authorized email client for customer-initiated reply where lawful | Unattended email send/reply loop |
| Business postal address not owner-approved | No commercial outbound sending | CAN-SPAM compliance / send readiness |
| CRM server token absent | Human owner uses authorized HubSpot interface; timestamp manual work | API round-trip |
| Calendar server OAuth absent | Owner schedules manually and confirms independently | Automated booking |
| Shopify trial | Sell scoped consulting via existing PayPal route | Shopify orders / POD fulfillment |
| Alert destination absent | Manual review of current owner dashboard | Received alerts |
| Backup key/retention/restore absent | Preserve existing database, do not risk direct restores | Disaster recovery |
| Upwork API/account not approved | Owner submits proposal in compliant platform UI, no browser bypass | Application submitted or client hired |
| IBM, professional video, phone, paid ads not connected | Limit claims to existing simulators, prototypes and owner-reviewed plans | Real QPU/video publication/phone/customer sales |

## Go/no-go
Only label **VERIFIED_END_TO_END** with time-stamped external provider confirmation, correct recipient/user, expected result, and independently reviewable evidence. Label \`CONFIGURED_TEST_REQUIRED\`, \`PROVIDER_RESTRICTED\`, \`OWNER_INPUT_REQUIRED\`, and \`REAL_WORLD_EVIDENCE_REQUIRED\` accurately. No cryptographic key, residence, bank details, customer record, OAuth token, or MFA code belongs in repository or public reporting.

**Related:** [500-item checklist](ULTRON_500_COMPLETION_CHECKLIST.md), [v41 revenue audit](ULTRON_V41_REVENUE_COMPLETION.md), [Work handoff](ULTRON_WORK_EXECUTION_HANDOFF.md), [v42 media limitations](ULTRON_V42_RECORDING_ANALYSIS.md).
