# ULTRON REVENUE STUDIO — MASTER IMPLEMENTATION PROMPT

You are the principal engineer responsible for the real, existing ULTRON Direct Revenue deployment. First inspect the full repository tree, package.json, server.js, existing PostgreSQL schema, all imports, tests, and Railway service topology. Do not invent file paths, clients, secrets or providers.

## Canonical resources
- Repository: https://github.com/lonzycooper1/ultron-direct-revenue
- Deployment: https://railway.com/project/2e0b0216-9aba-4ff3-bf10-e1f5b44d28e3
- Public origin: https://ultron-direct-revenue-production.up.railway.app/
- Production app service: ultron-direct-revenue
- Durable database: existing Postgres / DATABASE_URL
- Mounted artifact disk: ultron-direct-data at /data
- Existing checkout: PayPal live signed-webhook verification.
- Existing OpenAI credential: encrypted runtime JWK credentials — do not copy the secret into code.
- User preference: never include a residential address in outbound communications.

## Financial objective
Work toward $50,000,000 annual revenue through independently verified paying customers, responsible unit economics and actual delivered customer value. This is a target, not an assumed outcome. Do not count products, drafts, page views, synthetic users, self-payments, fake transactions or unverified captures as revenue.

## Proven compatibility rules
The original server.js hosts hundreds of routes using Node HTTP createServer. It already includes live PayPal, v44 mainframe, digital SKU fulfillment and periodic agent supervisors. DO NOT rewrite it as a tiny unrelated Express app. Express 5 enterprise-gateway-v45.mjs is mounted specifically for the new v45 routes, preserving the original behavior and existing tests.

Original persistence uses state-store.mjs with PostgreSQL transactional JSONB, advisory locking and legacy migration. Existing project-store.mjs and ledger-store.mjs depend on those exports. DO NOT drop or rename any current state keys. v45 adds normalized tables to enterprise-store-v45.mjs for idempotent durable jobs, HMAC audit journal and claimed email delivery.

## Module map
1. state-store.mjs — existing PostgreSQL JSONB persistence and exported v45 durable primitives
2. enterprise-store-v45.mjs — bounded connection pool, transactional schema, concurrent-safe SKIP LOCKED claims, manual review on expired leases, HMAC append-only events and unique confirmed-delivery claims
3. project-store.mjs, ledger-store.mjs — legacy-compatible projects/orders and v45 execution/evidence exports
4. payment-runtime.mjs — original PayPal verification and Stripe raw-body signature validation plus verified Checkout Session lookup
5. server.js — original commercial server, v45 Express routing gateway, and 24/7 loop initialization
6. enterprise-gateway-v45.mjs — /api/enterprise/v45/health, owner-protected demand/pulse and optional /webhooks/stripe
7. executive-runtime.mjs — OpenAI/Anthropic queue, hosted build/browser jobs, daily limits and continuous execution
8. agent-of-agents.mjs — commerce missions and owner approval gates
9. enterprise-cycle-v45.mjs — bounded authenticated web-research queue, verified public-source specifications, and original digital draft compilation
10. product-deployer.mjs — verified tested Vercel deployment previews and optional confirmed digital mail dispatch
11. enterprise-mail-v45.mjs — TLS-only Nodemailer SMTP, provider-buyer-email verification, one-claim-per-PayPal-capture and ambiguous result reconciliation
12. prospect-outreach.mjs — highly targeted, consent/opt-out-controlled one-to-one outreach only
13. factory-new/product-factory.mjs — validated original, evidence-annotated digital products, restricted to supported categories until more vetted factories exist
14. workers/kronos-v42.py — offline forecasting research, NOT real-money autonomous trading
15. enterprise-v45.test.mjs — new verification suite

## Mandatory execution sequence
A. Fetch current main and read all changed files; inspect production Railway variables by NAME, never print secret values.
B. Run the full existing unit tests, new enterprise suite, and verify the exact release SHA. Stop on failures.
C. Verify the production database and /data mount without deleting or overwriting existing customer records.
D. Verify existing live PayPal and signed webhook receipt; optional Stripe only if the business independently authorizes a Stripe account and configured signing/API keys.
E. Start controlled continuous worker loops only after the database and provider budgets pass; establish provider billing hard caps. Script-level token admission is NOT an enforceable dollar limit.
F. Source public demand via legally permitted APIs and cited search results; distinguish research prospects from actual inbound leads and permission to contact them.
G. Generate original digital drafts, validate attribution/licensing/scope, test artifacts and inspect requested deliverables. Do not publish incomplete consulting services as finished products.
H. Send already-completed eligible digital goods only to independently verified buyer email addresses, through a configured authenticated SMTP provider. Keep idempotency, opt-outs and receipt/settlement statuses separate.
I. Deploy code via reviewed CI + health checks; reconcile failed deployments and keep rollback ability. Preserve manual approval for transfers, paid ads, real-money trades, refunds, public publishing and sensitive account changes.
J. Verify complete buyer -> signed processor capture -> scoped deliverable -> acceptance -> processor fees -> bank settlement -> net profit with a genuine unrelated customer before calling the revenue pipeline fully operational.

## Configuration and missing provider gates
Existing: DATABASE_URL, PayPal runtime credentials, encrypted OpenAI key, primary Railway domains, PostgreSQL, /data volume.
Optional/required for added actions: ULTRON_ENTERPRISE_ENABLED, ULTRON_EVENT_HMAC_SECRET, ULTRON_SMTP_HOST/PORT/USER/PASSWORD/FROM, ULTRON_BUSINESS_POSTAL_ADDRESS (approved nonresidential mailing address), ULTRON_UNSUBSCRIBE_URL, ULTRON_PERMISSIONED_OUTREACH_ENABLED, STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET only if separately approved, ULTRON_DISCOVERY_FEED_URL (approved source), ULTRON_ALERT_WEBHOOK_URL, approved Vercel deployment credentials, optional ANTHROPIC_API_KEY and model, and separately validated MCP tool servers.

All keys live in Railway's secret variables or an approved secret manager, never the repository, prompt, tests or logs.

## Verification and reporting
Report line-by-line: implemented in Git, unit tested, deployed to Railway, runtime provider authorized, real transaction observed, delivered/accepted and settled. These are NOT interchangeable. Show commit and CI links. If a provider credential or specific account approval is unavailable, leave that adapter fail-closed, continue independent functions, and report the exact actionable missing requirement rather than invent success.

### Final handoff reminder
Read the files in the directory structure first so you know exactly how the modular pieces connect.
