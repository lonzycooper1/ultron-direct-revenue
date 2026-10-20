# Crypto.com App connection

The trading service now defaults to `crypto-com-app`, separately from the
Crypto.com Exchange adapter. Set `CRYPTO_PROVIDER=crypto-com-app` explicitly in
the existing Railway trading service. The App uses `https://wapi.crypto.com`
and its documented base64 HMAC authentication, rather than Exchange endpoints.

Generate credentials in Crypto.com App → More → Agent Key. Enter `CDC_API_KEY`
and `CDC_API_SECRET` directly in that service's Railway Variables; never paste
them in chat, source, a screenshot, or a command saved in shell history.
Exchange `CRYPTOCOM_API_KEY` and `CRYPTOCOM_API_SECRET` are never used by this
App adapter. App keys can expire and must be replaced securely when necessary.

`POST /api/provider/verify` (or `/api/app/verify`) requires the existing owner
approval credential and checks fiat and crypto account reads only. It returns
sanitized authentication evidence, never balances, keys or provider messages.
The legacy `/api/exchange/verify` path aliases the selected provider check for
existing clients; the response identifies the actual provider.

This migration does **not** certify live trading. Execution remains blocked,
including if old Exchange live flags are enabled. The existing PostgreSQL stop
and ledger remain intact. Unresolved Exchange orders require separate review;
they are never reconciled against an App account. App quote-to-approval binding,
trusted risk accounting, and durable dispatch/reconciliation must be completed
and tested before any App live order can be enabled. Each real order must still
receive its own owner approval. No funds are moved by this migration.

Provider reference: https://github.com/crypto-com/crypto-agent-trading/tree/main/crypto-com-app

## Durable quote review continuation

Owner-authenticated endpoints now support non-executing quote review:

- `POST /api/app/quotes` takes `{ "instrument": "BTC-USD", "side": "BUY", "amount": "10.00" }`.
  BUY amount is USD; SELL amount is the exact base-asset quantity. Amounts must
  be decimal strings. Only BTC/ETH at 1x are accepted.
- `GET /api/app/quotes/:id` reads a stored proposal across process restarts.
- `POST /api/app/quotes/:id/review` takes the exact proposal ID in `confirmation`,
  its stored `digest`, and `approved: true`. This is an approval-boundary rehearsal,
  **not a trade**. It returns HTTP 423, `REVIEWED_BLOCKED`, `orderSubmitted:false`,
  and explicit blockers. The review is recorded once; it grants no permission
  that can be replayed later. Request a fresh quotation for another review.
- The legacy `/api/proposals` and `/:id/approve` routes use the same durable
  App controls in App mode. Their old in-memory Exchange path cannot execute
  an App order.
- `POST /api/app/readiness` verifies account reads and validates the provider
  weekly-budget response, while retaining explicit uncertified capabilities.

Quotes are bound to the configured Agent Key identity, provider quote ID,
currencies, exact amounts, instrument, side, 1x leverage and conservative expiry.
The transport signs only account reads and purchase/sale quote requests; it has
no allowed order, transfer, withdrawal or key-revocation endpoint. Expiry starts
at request initiation and subtracts an extra second. Replayed provider quote IDs,
changed digests, rotated keys and concurrent repeated reviews are rejected.

The exact-decimal daily accounting engine and its seven tests were recovered
unchanged from open PR #44 (`e3ba29de06992f44f379a4ca4f7c1b277090091c`). It handles
verified opening cost basis, USD/asset fees, capital flows, daily realized and
unrealized P&L, and exact balance reconciliation. It is **not connected to a
certified complete App history adapter**. Recent transactions cannot establish
complete history or absence of an ambiguous order.

Remaining activation blockers are explicit: complete authoritative App daily
history/cost-basis evidence, verified quote fee semantics, authoritative recovery
of uncertain submissions, reviewed App dispatch, production authentication,
permissions/eligibility, and production workflow verification. No environment
flag can override these missing controls. Existing emergency stops and unresolved
Exchange ledger rows are never changed by quote review.
