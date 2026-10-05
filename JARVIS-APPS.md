# ULTRON JARVIS — Cross-platform product architecture

## Target clients
- Desktop: macOS, Windows, Linux
- Mobile: iPhone/iPad and Android
- Web/PWA fallback

## Recommended shell
Use a shared React/TypeScript UI. Package mobile with React Native/Expo and desktop with Tauri. All clients authenticate to the same ULTRON JARVIS API rather than embedding provider secrets in the app.

## Brain
The server-side brain is `jarvis-core.mjs`: orchestrator + specialists + policy engine + shared state + event/audit stream + evaluation loop. The existing AI Market and Crypto research services become tools/divisions beneath the orchestrator.

## Client surfaces
1. Command: text/voice request and streaming status.
2. Missions: goal, subtasks, agents, progress, evidence, approvals.
3. AI Market: products, acquisition, leads, checkout, fulfillment, revenue analytics.
4. Crypto Research: market regime, ranked hypotheses, risk, proposals, journal and P&L attribution.
5. Builder: software/product factory, preview, tests, deploy and rollback.
6. Communications: permissioned email/voice/social adapters.
7. Memory: projects, decisions, source provenance and user-controlled retention.
8. Control Center: permissions, budgets, API/tool connections, kill switch and audit log.

## API contract
- `GET /api/jarvis/manifest`
- `POST /api/jarvis/mission`
- `GET /api/jarvis/missions/:id`
- `POST /api/jarvis/missions/:id/approve`
- `POST /api/jarvis/missions/:id/cancel`
- Existing AI Market endpoints remain available.
- Existing Crypto endpoints remain available for research/proposals.

## Financial boundary
Crypto research uses real market information when connected, but any consequential real-money order remains an explicit approval action. Paper trading is not the product's primary UI and must never be presented as realized money. The system records research, proposed order, approval, external execution result, fees and realized/unrealized P&L as separate fields.

## Security
Secrets live server-side. Use short-lived client sessions, encrypted storage, scoped tool permissions, idempotency keys, append-only audit events, rate limits, device/session revocation and a global kill switch. Never expose exchange, payment or OpenAI secrets in iOS/Android/Desktop bundles.

## Reliability
Every autonomous workflow must expose traces, retries, timeout, circuit breaker, test/eval result and rollback. Background work runs in a durable queue rather than depending on an open phone or laptop.

## Release path
1. Integrate Jarvis endpoints into current server.
2. Add durable Postgres mission/event schema.
3. Build shared TypeScript client SDK.
4. Build responsive web shell.
5. Wrap mobile with React Native/Expo.
6. Wrap desktop with Tauri.
7. Add voice/realtime interface.
8. Add push notifications and approval inbox.
9. Run unit/integration/e2e/security/eval suites.
10. Sign/notarize desktop apps and submit mobile builds through Apple/Google developer accounts.
