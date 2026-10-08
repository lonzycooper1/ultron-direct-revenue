# ULTRON — Production completion and authorization handoff
Updated 2026-10-08. This is an operator playbook, NOT a claim that accounts are connected or customers have paid.

## Mission and order of work
Long-term **stretch**: $1 trillion cumulative externally verified customer revenue. Immediate goal: a legitimate independent buyer purchasing and receiving the flagship $500 Revenue Leak Audit. Do not confuse cash captures, settlement, profit, net worth or projections.
Priority: paid customer delivery > interested buyer > opted-in inbound diagnostic > authorized external discovery > new products/agents.

## Present verified facts (check again before relying on these)
- Direct-revenue and its four peer Railway services have been observed online.
- PayPal production API and webhook are reported authorized in the latest Railway startup logs. No independently verified customer capture recorded in that report.
- Customer-contact address is selected as a Railway sender value; selecting a Gmail address does not transfer ChatGPT Gmail OAuth to Railway.
- Hunter connector returns account-restricted errors; do not bypass the restriction.
- Shopify store is on a trial; full selling requires an upgrade. PayPal direct checkout exists independently.
- No live HubSpot deals were returned in the most recent deal query. The ChatGPT connector is not Railway server authorization.
- A public voluntary diagnostic flow and an owner-only inbound inbox exist; absence of inbound traffic is not a software failure.

## Current immediate revenue workflow (no extra vendor required)
1. Publish the free diagnostic URL on a business-controlled channel: `/free-response-gap-scan`.
2. Receive voluntary diagnostic scans in durable Postgres state. Anonymous scans without explicit one-to-one follow-up consent are not email prospects.
3. Owner opens `/inbound-inbox` and supplies the existing Railway acquisition-admin token. Token is not saved by the page or passed in a query URL.
4. Review actual submissions. For leads who expressly requested a personal reply, open a factual draft in the owner's email application and SEND ONLY if appropriate. The draft is not sent by ULTRON.
5. Offer the verified $500 audit checkout through `/flagship`; do not promise measurable lift before collecting real baseline data.
6. Record PayPal verified capture, signed scope, consent, fulfillment QC, customer acceptance, fees, refunds and bank payout separately.

## External authorizations required for unattended execution
**Gmail on Railway:** Configure `ULTRON_GMAIL_CLIENT_ID`, `ULTRON_GMAIL_CLIENT_SECRET`, `ULTRON_GMAIL_REFRESH_TOKEN`, `ULTRON_BUSINESS_SENDER`, `ULTRON_BUSINESS_POSTAL_ADDRESS`, `ULTRON_UNSUBSCRIBE_SECRET` using the owner's Google OAuth consent and encrypted Railway service variables. Existing Gmail in ChatGPT is not this permission. Give only minimum required Gmail API scopes, inspect the sending policy and respect opt-outs. Never paste client secrets or refresh tokens into a public issue, code file, chat, or URL.
**HubSpot on Railway:** Configure `ULTRON_HUBSPOT_PRIVATE_APP_TOKEN` from the correct owner-authorized portal with minimum CRM scopes. Test read and an approved write; connection to ChatGPT alone does not grant access to the Railway process. No automatic modification of user-entered CRM records.
**Calendar on Railway:** Configure `ULTRON_GOOGLE_CLIENT_ID`, `ULTRON_GOOGLE_CLIENT_SECRET`, `ULTRON_CALENDAR_REFRESH_TOKEN`, `ULTRON_CALENDAR_ID` after user grants API permission. Test read-only free/busy before a genuine owner-approved booking with attendee invite.
**Authorized discovery:** Use `ULTRON_DISCOVERY_FEED_URL` and `ULTRON_DISCOVERY_FALLBACK_URL` for *authorized* JSON feeds with schema `{"businesses":[{"name":"...","website":"https://..."}]}`. Existing fallback automatically avoids failed providers, but only if source permissions and working endpoints are present. Do not hide a restricted Hunter connection behind a proxy.
**Domain:** Optional for first PayPal sale, valuable for reputation later. Owner must own and authorize purchase and DNS edits; then configure `ULTRON_BRANDED_DOMAIN` and SPF/DKIM/DMARC. A free personal Gmail mailbox may be used without pretending to be a branded sender.
**Shopify:** Trial requires plan upgrade before full launch; do not conflate with independent PayPal storefront.
**Payout and lending:** Confirm settlement in the actual business account and provide real legal entity, EIN, statements, P&L, ownership and lender documents. No fabricated finance records, credit applications, funds movement or new debts without explicit approval.

## Hard go/no-go conditions
- No automated external outreach without verified Gmail OAuth plus approved campaign, truthful claims, valid business context, bounce/suppression controls and lawful opt-outs.
- No use of suppressed contacts or unsolicited consumer contacts.
- No purchased domains, ad budgets, loans, signed agreements, live trades or bank transfers without owner permission.
- No fabricated orders, Google/Shopify/Hunter access, revenue or customer results.
- Do not mark a requirement complete without independently checkable proof.

## URLs
- Mainframe: https://ultron-direct-revenue-production.up.railway.app/
- Flagship service: https://ultron-direct-revenue-production.up.railway.app/flagship
- Free self-service diagnostic: https://ultron-direct-revenue-production.up.railway.app/free-response-gap-scan
- Owner-only inbox: https://ultron-direct-revenue-production.up.railway.app/inbound-inbox
- Activation Center: https://ultron-direct-revenue-production.up.railway.app/activation-center
- 500-requirement Center: https://ultron-direct-revenue-production.up.railway.app/completion-500

Do not share the owner token in public. In the inbox, qualify or draft replies only for leads that have consented; the user still decides whether a real external message is sent.
