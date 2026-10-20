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
