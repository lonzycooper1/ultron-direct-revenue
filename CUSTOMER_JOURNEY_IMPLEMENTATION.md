# Customer journey implementation checkpoint

## What this change does

The owner workspace at `/customer-journey` records sourced inquiry and consent
references, applies the existing explainable qualification rubric, prepares a
proposal for an existing catalog SKU, and binds an already completed order to an
exact reviewed printable artifact. The proposal records an owner-supplied scope
agreement reference; it does not independently establish that the customer signed
or accepted an offer. No offer, payment, outreach or publication is created here.

The buyer workspace `/customer-delivery` accepts the existing private purchase
code in memory. APIs use Authorization headers, never URL codes. Before access,
the server reads the current ledger and independently re-reads PayPal. Exact
order/capture identity, USD amount, SKU, buyer email, private code and reviewed
artifact hash must match. Refund records, changed captures, changed artifacts,
provider failure and missing consent/qualification stop the relevant transition.
An order cannot be bound to two proposals. Financial reconciliation preserves
unknown fees/costs and keeps settlement evidence and independent buyer review
separate from payment and customer acceptance.

Download preparation is recorded as preparation, not confirmed receipt. A buyer
can explicitly accept the exact prepared PDF version. Possession of a purchase
code is not independent verification of an unrelated customer or bank settlement.
The API does not expose purchase codes or code hashes in owner listings.

## Verification boundaries

Automated fixtures exercise inquiry -> qualification -> proposal -> provider-read
verification -> private PDF download -> explicit exact-version acceptance ->
reconciliation. They use synthetic contacts, fixture provider responses and an
isolated test database. They are not a sale, live provider write or customer.
PostgreSQL tests check competing order bindings and restart recovery.

This is a supplementary delivery record for an existing agreed purchase, not a
replacement checkout or permission to change what a customer bought. Owner scope
and rights review remains mandatory. Existing audit/video workflows and trading
controls are untouched. Never attach a different resource to a customer's order
without their actual agreement.

## Still blocked / owner or provider action

- Railway currently rejects deploys as temporarily paused. Latest production
  inventory reports fc4c93d; these routes require a successful latest-main release
  and production acceptance before being called live.
- Revenue-service variable-name inventory lacks SMTP/Gmail OAuth, HubSpot,
  Calendar, telephony and publishing credentials. Provision minimum-scoped secrets
  through the chosen provider's secure workflow and Railway secret controls.
  Existing ChatGPT connectors are not Node server authorization.
- Email: configure ULTRON_SMTP_HOST, ULTRON_SMTP_PORT, ULTRON_SMTP_USER,
  ULTRON_SMTP_PASSWORD and ULTRON_SMTP_FROM for the existing SMTP adapter, or finish
  the existing Gmail OAuth path. A sender label is not transport authorization.
- CRM: supply ULTRON_HUBSPOT_PRIVATE_APP_TOKEN for the authorized portal with
  minimum CRM scopes. Calendar: authorize ULTRON_GOOGLE_CLIENT_ID,
  ULTRON_GOOGLE_CLIENT_SECRET, ULTRON_CALENDAR_REFRESH_TOKEN and
  ULTRON_CALENDAR_ID. Verify reads before a specifically approved write/invite.
- Voice requires an owned phone number, telephony/speech accounts, approved FAQ
  and permissioned test call. Publishing and POD require account authorization,
  rights, funded provider access where needed and scoped publication approval.
- No source recordings are present in this turn's scratch workspace. Full audio
  extraction and unavailable carousel material remain unresolved. No transcript
  was fabricated. Restore access to the original attachments to resume review.
- Genuine inquiry/payment/acceptance and bank settlement require actual external
  customer activity and evidence. No such outcome is asserted by these tests.

The remaining SaaS/media/voice/CRM/booking/publishing workstreams are partial;
this checkpoint does not label all six requested steps complete.
