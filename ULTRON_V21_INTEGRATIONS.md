ULTRON V21 EXTERNAL INTEGRATION RUNBOOK

Verification matters: ChatGPT connected Gmail, Calendar and HubSpot are separate from deployed Railway service credentials. No provider integration is complete just because its name appears in configuration.

New owner-only API routes under /api/integrations/v21:
 GET /api/integrations/v21 — readiness and actual provider sync counts
 POST /api/integrations/v21/domain — public domain DNS audit
 POST /api/integrations/v21/freebusy — Google Calendar availability
 POST /api/integrations/v21/booking — owner-approved verified Calendar booking
 POST /api/integrations/v21/crm — owner-approved sourced contact synchronization

RAILWAY ENV VARIABLES:
 Discovery: ULTRON_DISCOVERY_FEED_URL, optional ULTRON_DISCOVERY_FEED_TOKEN
 Domain: ULTRON_BRANDED_DOMAIN (user-owned), attached Railway domain and DNS
 Gmail existing v19: ULTRON_GMAIL_CLIENT_ID, ULTRON_GMAIL_CLIENT_SECRET, ULTRON_GMAIL_REFRESH_TOKEN, ULTRON_BUSINESS_SENDER, ULTRON_BUSINESS_POSTAL_ADDRESS, ULTRON_UNSUBSCRIBE_SECRET
 Calendar: ULTRON_GOOGLE_CLIENT_ID, ULTRON_GOOGLE_CLIENT_SECRET, ULTRON_CALENDAR_REFRESH_TOKEN, ULTRON_CALENDAR_ID
 CRM: ULTRON_HUBSPOT_PRIVATE_APP_TOKEN
 Existing PayPal: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID
 All secrets must be stored in Railway variable manager, not GitHub or user chat.

Owner actions:
 1. Resolve Hunter restriction at Hunter account. Connect alternative authorized public buyer-intent feed if Hunter remains inaccessible.
 2. Provide ownership/authorize purchase of brand domain and mailbox; set MX, SPF, DKIM, DMARC and Railway CNAME/A records; verify TLS and send test.
 3. Authorize Gmail and Google Calendar OAuth app to Railway; test dry-run and real event under owner approval.
 4. Provide HubSpot private app token with minimum contacts scopes; test one real user-approved sourced prospect, never a fake one.
 5. Ensure real purchased work is delivered with scoped QC and customer consent; the service cannot modify customer's websites without consent.
 6. Reconcile actual PayPal settlement, fees, refunds, bank deposits and expenses. No cash or profit forecast may be mistaken for revenue.
 7. Negotiate and sign real agency distribution or licensing agreements before automated resale.

Payments, CRM writes, and scheduling must remain idempotent and approval-gated. The system does not buy domains, create external consents, withdraw funds, fabricate buyers, or claim unrealized revenue.
