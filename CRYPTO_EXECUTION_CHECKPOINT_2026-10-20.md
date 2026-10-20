# Crypto execution checkpoint — 2026-10-20 UTC

## Verified provider state

Current main before this change: 98950230b333dfea85fa9d399bacd7c774cf3148.
Trading service: cedb8297-7d1a-4aeb-8a51-1b8a050430ee, production
7f1a8b7e-52c3-47a8-b4a7-edf7f812e265, deployment
7a8e8d0b-036c-44dc-a597-789654e53bb0. Restarting this existing release
performed a new backend private/user-balance request at
2026-10-20T21:07:24.339Z. Result: HTTP 401, provider code 40101,
KEY_OR_SIGNATURE_REJECTED. API variables exist; their values were not exposed.
The configured provider was Crypto.com Exchange; live and autonomous execution
were false. This is a fresh failure, not reliance on yesterday's evidence.

The Exchange website redirected to https://crypto.com/exchange-pro/en-US.
It was not signed in. Secure email sign-in reached a human-verification
challenge; no account balance, key identity, permission or IP restriction could
be inspected. Browser login is separate from deployed-server API authorization.

## Changes

Reconciles the durable dispatch work from draft PR44 with the newer provider
routing, App quotation controls, customer journey and current main. Persistent
Exchange proposals bind immutable order fields and the exact credential pair
through a non-public SHA-256 binding. A credential rotation invalidates pending
proposals. Legacy proposals without a binding fail closed.

The gateway consumes approval and commits a unique reservation before dispatch.
A shared advisory lock serializes emergency stops and dispatch. Committed
SUBMISSION_UNKNOWN claims survive process death and never automatically retry.
Withdrawal, transfer and leverage-changing methods are prohibited by the signed
transport allowlist. Response identity is checked before accepting an order
acknowledgment. New runtime modules are included in pinned bootstrap checksums.

## Explicit non-activation

readExchangeRisk still rejects unverified daily P&L. Its history, external-flow
and opening-basis adapter is not certified or connected to production provider
evidence. App execution remains blocked. No environment switch can replace
those checks. UI forms remain disabled and health reports liveOrders=false.
This change improves safety infrastructure; it is not live-trading activation.

Required before activation: correct authenticated account access; verify the
account/product and spot eligibility; verify key read/trade permissions and
withdrawals disabled; establish approved server egress/IP allowlist; obtain
complete paginated history, authoritative opening basis, balances and fees;
connect and test risk accounting; bind exact approved quantity/type/cost/price
limits; complete provider and production acceptance. Never infer these from a
passing fixture test. No real order is authorized by this checkpoint.

## Validation

Local non-database targeted tests passed (23 tests, no failures or skips) before
the additional transport test was included. Full PostgreSQL/FFmpeg/PDF CI must
pass on the final PR head before merge. Fixture dispatch tests include changed
order/account binding, concurrent approvals, restart, process death, timeout,
malformed acknowledgment and database failures. They are not provider fills.

Official references reviewed October 20:
- https://exchange-developer.crypto.com/exchange/v1/docs/api/rest-common-api-reference
- https://help.crypto.com/en/articles/3511424-api

40101 does not distinguish a wrong key from a wrong signature or mismatched
product. Trading API keys require IP allowlisting according to provider help.
No secret, account balance or order approval is included in this file.
