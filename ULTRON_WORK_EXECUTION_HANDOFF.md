# ULTRON / JARVIS — ChatGPT Work Execution Handoff
**Release:** 2026-10-14 v40 | **Owner-directed objective:** Move every safely connectable ULTRON internal module toward a verified end-to-end external service, without falsely claiming provider access, revenue, quantum hardware, or customer outcomes.

> **START HERE IN CHATGPT WORK:** Read this file completely. Open the linked GitHub repo, Railway project, and existing live ULTRON website with your authorized cloud browser and available connected applications. Work from actual repository state and provider evidence. Execute reversible safe tasks autonomously, then perform owner-approved external account configuration through the supported UI. Do not stop just because one provider requires owner intervention: continue all independent tasks, log blockers precisely, and report testable results. Reuse the existing code and agents; do not replace or destroy live customer data or payment flows.

## Project links (use as references; refresh live state first)

- GitHub repo: https://github.com/lonzycooper1/ultron-direct-revenue
- Railway production project: https://railway.com/project/2e0b0216-9aba-4ff3-bf10-e1f5b44d28e3
- ULTRON website: https://ultron-direct-revenue-production.up.railway.app/
- Work readiness endpoint: https://ultron-direct-revenue-production.up.railway.app/api/work-activation/v40
- Existing Revenue Commander: https://ultron-direct-revenue-production.up.railway.app/api/revenue-commander/v38
- Owner activation center: https://ultron-direct-revenue-production.up.railway.app/activation-center
- Free customer diagnostic: https://ultron-direct-revenue-production.up.railway.app/free-response-gap-scan
- $500 audit service: https://ultron-direct-revenue-production.up.railway.app/flagship
- Owner-only inquiry inbox: https://ultron-direct-revenue-production.up.railway.app/inbound-inbox
- Quantum CPU simulator: https://ultron-direct-revenue-production.up.railway.app/quantum-core
- Source research/IBM bridge: https://github.com/lonzycooper1/ultron-direct-revenue/blob/main/ULTRON_V39_QUANTUM_VIDEO_RUNBOOK.md
- Existing production handoff: https://github.com/lonzycooper1/ultron-direct-revenue/blob/main/ULTRON_PRODUCTION_HANDOFF.md

## Current baseline (checked October 14, 2026; REVALIDATE)

- Five Railway production services had **SUCCESS** deployments: ultron-direct-revenue, ultron-web, ultron-market-stream, ultron-trading-engine, Postgres.
- Main production release v39 (commit db165ef4e32037055895cf6251c7818d40add4c7) was successfully deployed. The v40 activation work may supersede it.
- Live PayPal OAuth and signed capture webhook checks succeeded at process startup. This proves provider readiness only, **not** a genuine sale. No independent completed customer order or revenue was verified in latest startup ledger.
- Three pending commerce approvals were recorded; review individually (store publishing / advertising / refunds). Never grant standing blanket approval.
- Discovery primary/fallback URL variables were present, but no independent confirmed buyer-intent leads were demonstrated.
- Sender email variable exists; essential Railway runtime Gmail OAuth client, secret, refresh token, compliant nonresidential mailing address, and unsubscribe secret were missing in the verified variable-name inventory.
- Railway runtime HubSpot and Google Calendar auth variables were missing. Existing ChatGPT connectors do not automatically authenticate the Node process.
- No custom domain was attached to the main service. No IBM Quantum API key or CRN was attached to it.
- Two ULTRON ChatGPT scheduled tasks were enabled but **notifications_enabled=false** and **email_enabled=false**; fix this through account settings/owner UI if possible, and verify an actual received notification.
- The v39 Quantum Core is an eight-qubit maximum **classical statevector simulator**; `quantum/qiskit_worker.py` is a standalone opt-in Qiskit example, not a QPU-connected Railway service.
- Existing system records indicate 0 independently confirmed paying customers. Do not invent contacts, fake payments, fake customers, revenue or investment returns.

## Rules for autonomous operation

1. **Default autonomy:** inspect, reason, classify, research permitted public material, draft original assets, run tests, perform idempotent reads, correct low-risk reversible bugs, and prepare exact provider setup screens without repeated user prompts.
2. **Scoped provider autonomy:** actions via Gmail, HubSpot, Calendar, publishing accounts and other providers are permitted only within real granted scopes and explicit approved campaign/workflow boundaries; honor platform rules, suppression, consent and rate limits.
3. **Never claim authority you do not have:** No legal power of attorney, impersonation, KYC/identity/OTP completion for another person, security bypasses, evasion of rate limits, provider blocks, or use of someone else's accounts.
4. **Owner approval needed:** spending, plan upgrades, domains, ads, customer outreach campaigns, contract signing, refunds, bank movements, real-money trading, real QPU quota consumption, and material credential or security modifications when no scoped approval exists. One narrow approval cannot authorize every future action.
5. **Protect sender privacy:** **Never include the owner's residential/home address** in customer-facing messages, drafts, attachments, footers or public data. Use only an owner-approved compliant business mailing address. Do not guess or reuse past residential details.
6. **Secure credentials:** Put all tokens in the provider's OAuth/credential workflow or sealed secret store. Never request user to paste raw private keys in public chat, issue, repo, spreadsheet or file.
7. **Evidence first:** A success label is only earned after independent provider evidence, a real end-to-end round trip and an identifiable timestamp. Distinguish CODE_READY, CONFIGURED_UNVERIFIED, AUTH_REQUIRED, PROVIDER_BLOCKED, APPROVAL_REQUIRED, VERIFIED_END_TO_END and LIVE_EXTERNAL_OUTCOME.
8. **Never stop at the first blocker:** after documenting its exact missing owner step, continue the next independent task without manufacturing success. Retain existing payment security and consent guards.
9. **Autonomy is not perpetual magic:** create or reuse authorized scheduled jobs on an actual service, check their run logs and alerts; do not promise 24/7 processing from a single ChatGPT conversation.
10. **True mission order:** first real customer & delivery > reply from interested buyer > opted-in inbound > authorized discovery > verified booking/proposal > production repairs > optional advanced features. A trillion dollars is an aspirational long-term ambition, not forecast or accomplished earnings.

## Immediate executable work queue — carry out to proof

### P0. First verified sale infrastructure

**0. Confirm live production:** inspect Railway service/source branch, runtime logs, health endpoint, latest deploy, durable Postgres connection, correct PayPal mode, and emergency pause state. Preserve signed webhook verification. Record exact current commit and timestamp.

**1. Qualify real buyer pipeline:** inspect authorized discovery feed URLs, request representative samples within provider terms, validate real business sources and actual purchase signals. Verify fallback is independent and legitimately accessible; do not bypass Hunter or any restricted provider. Dedupe, score need, record official source URLs and contact permissions. Retain opt-in website diagnostic even when feed access fails.

**2. Activate real email sending and reply ingestion:** use owner-authorized Google OAuth for the correct business mailbox. Validate `ULTRON_GMAIL_CLIENT_ID`, `ULTRON_GMAIL_CLIENT_SECRET`, `ULTRON_GMAIL_REFRESH_TOKEN`, `ULTRON_BUSINESS_SENDER`, `ULTRON_BUSINESS_POSTAL_ADDRESS`, `ULTRON_UNSUBSCRIBE_SECRET` in secure Railway variables. Do not expose their values. Check sender identity, SPF/DKIM/DMARC if domain is used, opt-outs, bounce suppression, lawful mailing identity. Prove a permissioned send, inbox receipt, reply ingestion and suppression. **Do not send bulk unsolicited messages.**

**3. Activate HubSpot CRM runtime:** owner-authorize minimum scoped HubSpot private app access and `ULTRON_HUBSPOT_PRIVATE_APP_TOKEN`; read one permissible record, perform one authorized write, observe reconciliation in HubSpot and ULTRON. Detect duplicates and respect data rights.

**4. Activate Google Calendar runtime:** owner-authorize `ULTRON_GOOGLE_CLIENT_ID`, `ULTRON_GOOGLE_CLIENT_SECRET`, `ULTRON_CALENDAR_REFRESH_TOKEN`, `ULTRON_CALENDAR_ID`. Test free/busy, create a real permissioned appointment, verify attendee confirmation and CRM attribution, cancellation and reminder behavior.

**5. Activate quote-to-payment funnel:** inspect existing $200 pilot and $500 audit flows, choose one unambiguous buyer offer, verify a real checkout path with PayPal (provider sandbox tests are not real revenue), lead-to-proposal flow, accepted terms and service scope. Do not ask an unrelated buyer to test pay under false pretenses.

**6. Deliver and reconcile:** for the first real unrelated customer, verify provider signed completed capture, fulfillment quality, customer acceptance, processor fee/refund data, payout and bank settlement as separate steps. Never mark revenue from internal orders, simulated data, site visits, checkout clicks or a PayPal link.

**7. Review three queued commerce approvals individually:** determine exact action, source, consequences and permitted owner decision. Publishing, advertising and refunds require separate scoped approvals. Continue direct PayPal sale while Shopify trial blocks full store features.

### P1. Trustworthy autonomy and operations

**8. Make alerts usable:** inspect existing ULTRON CEO and Verifier scheduled tasks and enabled-but-delivery-off settings. Ask the owner to enable notification/email preferences if tools cannot; validate a delivered alert about a real status change. Deduplicate updates and avoid noisy 'all green' notifications.

**9. Make self-healing demonstrable:** test retry/backoff only for safe idempotent reads. Use authorized fallback providers. Prove alarm, recovery and owner escalation in controlled failure tests. Never automatically retry ambiguous payments, refunds, emails, signatures or other consequential POSTs.

**10. Secure persistent memory and backups:** confirm existing Postgres, encrypted storage, retention, restore drills, access controls, job audit and idempotency keys. Implement versioned object storage only after approved billing/resource considerations; encryption and backups are more important than claimed 'quantum hard drives.'

**11. Brand identity:** confirm owned business name and permitted business mailing address. Register a domain only with approval; connect DNS, TLS, mail SPF/DKIM/DMARC, sender addresses and test deliverability. Branded domain is not an absolute prerequisite for first PayPal sale.

**12. Tests and release pipeline:** use feature branches, unit/integration tests, CI, staged review and production healthchecks. Do not replace existing live code with new incompatible systems. Verify server and public endpoints after rollout.

### P2. Video-derived business modules

**13. Quantum Core:** IBM Quantum free account/instance requires actual owner signup. Add secure isolated Qiskit Python worker, manual quota approval, one real QPU job (if available), result logs and classical baseline. Never advertise a generic speedup. No need to buy a physical QPU.

**14. Quantum-AI consulting:** complete original assessment template and capability claims with the truthful limit of expertise, validate a genuine customer problem, price scope, obtain customer acceptance. When a quantum advantage is unsuitable, recommend classical solution.

**15. Quantum guide and newsletter:** review original `content/quantum-ai-practical-guide-2026.md`; finish fact checking, package an original downloadable file; connect authorized Payhip or Gumroad listing; activate a consented newsletter account; publish only authorized original media. Subscriptions and sales require independent provider evidence.

**16. Real estate:** integrate only authorized property data feeds, public-record rights, title/ownership assessment, compliant contract assignment and state licensure rules. Existing example margin calculator does not find or close deals. Do not buy properties.

**17. AI phone receptionist:** connect a legitimately owned number/telephony account, approved voice/LLM pipeline, lawful consent and recording handling, fallback human escalation, verified booking and a live permissioned test call. No random outbound dialing.

**18. Video/content engine:** generate original source-backed scripts, edits, captions, licensed footage and approved schedules; use authorized YouTube/TikTok/Instagram/X accounts, verify live posts and analytics; avoid reproducing other creators' clips and inflating engagement.

**19. Paper trading:** ensure independent market data, dated backtest, slippage/fees, exposure/risk limits and paper order reporting. Live orders need separate authorization and an appropriate regulated provider connection; no guaranteed return assertions.

**20. Shopify/POD:** owner-approved store upgrade and supplier linking, fulfillment QA and returns, real inventory/cost tracking and first actual unrelated buyer order.

**21. Apps:** optional native signed Mac/iPhone monitoring and approval apps, permissioned alerts, reliable login and device-side testing. Do not treat a prototype URL as an installed app.

### P3. Scaling only after revenue evidence

**22. Customer success/retention:** only real customers, permissioned follow-ups, satisfaction evidence, measurable business outcomes, referrals and recurring retention.

**23. Financial controls:** gross captures, net revenue, refunds, costs, settlement and profit are different. Report credible financials, and never apply for lending or move cash autonomously.

**24. Modular AI agent ecosystem:** orchestration roles, bounded sessions, sandboxed tools, audit trails, cost caps, concurrency limits, robust evaluation and graceful degradation. Avoid increasing agent count as a substitute for customer demand.

## Test and verification contract

For EVERY P0–P3 row record:
- system capability and dependency; owner/provider approval scope;
- code path + deployed commit (if changed);
- direct provider record or read-only dashboard evidence;
- exact end-to-end test including source, request, provider effect, returned state and timestamp;
- status `VERIFIED_END_TO_END` only on that test, else a precise blocker;
- rollback plan and data security review;
- next owner action when blocked, with direct page link (no secret contents).

**Do not treat:** successful deployment = confirmed operational workflow; configured URL = real feed; queued lead = buyer; SENT message = delivered; signed capture = bank payout; model P&L = earned profit; CPU simulation = real QPU.

## Explicit remaining owner/provider inputs

1. Authorized business email, Google OAuth approval and a NONRESIDENTIAL owner-approved legitimate business mailing address for commercial communication.
2. Permissioned buyer-discovery source and the exact legitimate accounts to use.
3. HubSpot portal credential via its own secure private-app workflow.
4. Google Calendar runtime authorization and calendar selection.
5. Decisions on each of the three pending commerce approval records.
6. Approval of the flagship offer/scope and any lawful outbound campaign boundary.
7. Domain ownership, purchase spending limit and DNS edit authorization if branded email is requested.
8. ChatGPT task notification/email settings.
9. IBM Quantum owner account/instance and limited-use runtime credential if real quantum hardware experiments are desired.
10. Account owners' permissions for telephony, publishing platforms, payhip/gumroad, Shopify/POD, and optional real estate feeds, each only when its workstream is reached.
11. Any spending ceilings and chargeable provider quota approvals, one provider/action at a time.

## Completion reporting in Work

At each checkpoint produce a compact table: `Workstream | Code Ready | Auth | Tested External Result | Evidence | Next Action`. Count only genuinely verified live external outcomes. Keep real first-customer work as first priority. State which operations Work completed itself, which ULTRON will perform through deployed schedulers/agents, which are waiting on the real owner, and which are impossible with current provider access. Never end with unverified 'everything completed.'

**Privacy reminder:** This handoff is in a public GitHub repository. Do not add bank data, residential address, sender tokens, identity documents, passwords, private emails or customers' private records here. Keep that information in the correctly permissioned provider or private audit system.
