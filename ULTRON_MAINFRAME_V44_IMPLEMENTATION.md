# ULTRON Autonomous Mainframe v44 — Production Runbook

## Goal
Integrate the requested live infrastructure into the existing ULTRON Direct Revenue Railway deployment. Preserve real-payment verification, customer consent, and manual approval for consequential changes. Do not claim a customer, revenue, an API integration, or a successful restore without provider evidence.

## Already implemented before v44
- Railway PostgreSQL and DATABASE_URL. state-store.mjs persists JSONB transactionally and is already used by project-store.mjs and ledger-store.mjs. Do not create a duplicate database.
- Persistent executive worker with one-minute schedule in server.js and executive-runtime.mjs.
- Live PayPal verification through a signature-verification API, with checkout and order ledger. A payment capture is not bank settlement or accepted fulfillment.
- Existing owner workflows for audits, queue review, mail reply ingestion, and operational alerts; authorization and receipt evidence still matter.

## v44 changes
- /mainframe and /autonomy-mainframe: public operational dashboard and owner console with no credential persistence.
- GET /api/mainframe/v44: public health, integrations, lead and payment counters without personal records.
- GET /api/mainframe/v44/owner: owner-token-only detailed draft and approval metadata.
- POST /api/leads: consent-aware first-party lead intake, bounded JSON, honeypot rejection, email-based daily throttle, Postgres persistence through acquisition-funnel.mjs. Unconsented submissions cannot be used for unsolicited outreach.
- POST /api/mainframe/v44/draft: owner-only original product draft with evidence requirements and SHA-256 manifest, stored on a mounted artifact volume and indexed in Postgres.
- GET /api/mainframe/v44/artifact?id=UUID: owner-only download with integrity validation; drafts are never auto-published.
- POST /webhooks/payhip: optional Payhip transaction webhook acceptance and deduplicated PostgreSQL ledger receipts. Payhip documents a static SHA256(apiKey) signature rather than a body-bound MAC, so this is provisional evidence, not independently verified payment or permission to fulfill.
- GET /api/mainframe/v44/payhip: owner-only provisional Payhip event and transaction counts.
- runtime-budget-v44.mjs: conservative daily token reservations and UTC worker execution windows, never mistaken for a hard monetary cap. Real spending limits must be configured at the AI provider billing/project level.

## Railway instructions
- Project: 2e0b0216-9aba-4ff3-bf10-e1f5b44d28e3
- Attach the preexisting unmounted ultron-direct-data volume to service ultron-direct-revenue at /data. Keep the separate web volume and Postgres data unchanged.
- Preserve database connection and encrypted OpenAI credential; do not duplicate a plaintext LLM_API_KEY or copy ChatGPT connector tokens.
- Optional budget variables: ULTRON_EXECUTIVE_DAILY_TOKEN_CAP default 100000, ULTRON_EXECUTIVE_TOKEN_RESERVATION default 20000, ULTRON_EXECUTIVE_WINDOW_START_UTC default 0 and ULTRON_EXECUTIVE_WINDOW_END_UTC default 24.
- Optional ULTRON_PAYHIP_API_KEY comes from the authorized Payhip Developer account. Configure Payhip paid/refunded webhook address to /webhooks/payhip. Do not paste the key into public code.
- Gmail runtime, HubSpot, Calendar, Anthropic, Vercel product deployment and MCP server credentials are NOT provisioned by a connected ChatGPT app. Activate only after scope and successful provider verification. MCP is fail-closed until there is a separately reviewed gateway and tool allowlist.
- Existing alert webhook needs a real authorized destination and proof of received alert.
- Python Kronos worker is offline market research requiring local reviewed models. Do not enable unverified continuous trading or broker actions.

## Verification and revenue completion
1. Run npm test, including the new v44 tests; approve production deployment only after CI passes.
2. Confirm Railway online status, /health, /mainframe and owner authorization. Confirm /data mount is accessible.
3. Test a synthetic original draft and verify file digest after restarting the server. Keep synthetic data separate from real orders.
4. Confirm the verified PayPal webhook, customer intake, actual delivery, review and acceptance. Do not count a webhook or draft as delivered revenue.
5. Prove provider-scoped sending, reply ingestion, CRM and Calendar actions before marking any external integration complete.
6. Verify real customer purchase, fees, refunds, bank payout and settlement separately.
7. Prove an alert was received and a safely isolated database backup was restored.
8. Keep advertising, publishing, refunds, payments, deployment promotion, crypto trading and banking human-approval-gated.

## Security
Owner tokens are never added to URLs, git files or frontend storage. Files are retrieved by random UUID after authentication and checksum verification. Draft assets are not exposed as public HTML. No self-pay, fake customers, fabricated buyer intent or unconditional third-party execution is authorized.
