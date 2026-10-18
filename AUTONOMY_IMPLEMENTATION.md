# ULTRON autonomy implementation — October 18, 2026

## Actual state

This change extends the existing Railway/Node/PostgreSQL application. It is source implementation with automated boundary tests, not a claim of a live autonomous business. The existing encrypted OpenAI credential is reused; no credential was extracted or exposed. The owner has authorized the work. A tool-level rejection still prevents activating the five staged Railway variables. The production deployment inspected in this session remains the October 15 build.

Vercel is connected to this ChatGPT session. Creating `ultron-product-lab` succeeded: project `prj_F4KwMNbx22NgsOtL3zKH1gGvY1vB`, owner scope `team_jRBk4kTYtsgIPOYf5xWWTarz`. Both the preview deployment and isolated sandbox creation returned provider HTTP 403 for scope `lonzycooper5-5987`. No deployment or sandbox was created. No separately authenticated Vercel CLI was available. This connection is not a Railway runtime token. Supabase was suggested and is still awaiting connection; no Supabase project was created. Windsor account discovery showed an Instagram connection only, with no connected Google Ads or PayPal reporting account. No Anthropic plugin was found by exact-provider discovery.

## What the code now does

- `hosted-executor.mjs` uses the public OpenAI Agents API through `openai@7.38.0`. Build jobs run in an OpenAI-hosted sandbox; browser jobs enable its hosted desktop. Every session has a $1 API spend limit, a four-minute client deadline, bounded execution counts, durable session/turn checkpoints and no automatic request retry. Production keys stay outside the sandbox.
- Build completion requires an observed standalone test command with exit code zero and an actual downloaded project ZIP. Browser completion requires observed computer-use activity and a screenshot. A generated sentence claiming success cannot satisfy either condition. Downloaded artifact bytes are checkpointed before deleting the provider-side session. Ambiguous failures retain their IDs for reconciliation.
- `executive-business.mjs` scans actual captured orders, consented diagnostic requests and existing support tasks into durable deduplicated jobs. It freezes event evidence before queue insertion so interrupted processing can recover without changing the original prompt. An HMAC-authenticated signup/support webhook is available, with timestamp validation and stable event IDs. Webhook possession never establishes payment.
- `product-deployer.mjs` validates the saved build's observed test evidence and the SHA-256 digest of a generated file manifest, then submits only to a fixed configured Vercel project as a preview. Repeated or interrupted submissions cannot cause an automatic second POST. Polling requires a provider `READY` receipt before marking deployment successful. No production-site replacement is attempted.
- The owner workspace provides authenticated downloads of saved artifacts. Tokens are not put in query strings or local storage. Business status, financial reconciliation and deployment records are owner-only. Public status exposes aggregate execution evidence rather than private prompts.
- Finance uses captured amounts, provider fee evidence, signed refund records, reviewed costs and separately labeled settlement records. Missing amounts are unknown, not zero. The learning snapshot uses independently evidenced, delivered and accepted orders. It cannot create customer success evidence from model output. The ad helper returns capped recommendations only; it does not spend money or change budgets.
- Paid support/analysis jobs receive queue priority. A queue-full scheduling error no longer prevents the executor from processing existing work.

## Requested gaps and their completion boundary

| Gap | Added or available | Still required for live completion |
| --- | --- | --- |
| Activate executive runtime | Existing five-variable staged patch reviewed as non-destructive | Railway accept-deploy was rejected again; no bypass attempted |
| Share existing OpenAI access | Encrypted cross-service references already staged | Apply those settings and verify a successful provider execution |
| Claude reasoning / Claude Code | Existing Anthropic adapter preserved | An actual Anthropic credential and current account-authorized model; no credential was available |
| Isolated coding worker | Hosted OpenAI coding implementation, tests, ZIP retrieval and cleanup | Existing API key must have Agents scopes/access; live account check not possible while inactive |
| Browser/desktop worker | Hosted desktop implementation with actual activity/screenshot checks | Agents desktop/model access and any destination-specific sign-in |
| Generated-product deployment | Validated saved-build-to-Vercel preview workflow | Vercel runtime token/project scope and a successful live deployment; connected tool returned 403 |
| Email/social/CRM/ads connections | Existing adapters remain; connector discovery performed | Runtime credentials, correct accounts and authorized destinations; ChatGPT connection is not server OAuth |
| Event-triggered work | Captures, first-party opt-ins, support tasks, signed signup/support webhook | Deploy code; configure the source webhook secret and actual event producer |
| Live end-to-end checks | Deterministic integration checks and a real Vercel project-creation check | Production activation, provider session access and successful deployment receipt |
| Customer fulfillment | Captured-order-specific task creation, saved outputs and existing review/acceptance flows | Genuine buyer intake, correct delivery, quality evidence and customer acceptance |
| Financial reporting | Provider-aware reconciliation snapshot and corrected finance inputs | Actual processor statements, cost records and bank settlement evidence |
| Advertising | Validated metrics, sample threshold and explicit cap checks; no invented spend | Connected advertising account, funding, conversion tracking and configured spending authority |
| Backups/recovery/alerts | Existing encrypted backup/restore script, recovery supervisor and alert dispatcher preserved | Separate restore target, backup key/storage, a completed restoration drill and received alert evidence |
| Learning | Accepted-order/channel feedback snapshot and evidence thresholds | Real accepted outcomes, reliable attribution and complete measured costs |

## Configuration for the added paths

Existing OpenAI credential variables and `OPENAI_MODEL` are sufficient to attempt hosted jobs. `OPENAI_AGENT_MODEL` can select a model supported by the Agents API for the account. Presence is never labeled successful access. Existing executive daily job limits still apply in addition to the hosted $1/session limit.

For generated previews, use scoped `ULTRON_VERCEL_TOKEN`, `ULTRON_VERCEL_PROJECT_ID`, optional `ULTRON_VERCEL_TEAM_ID`, and optional `ULTRON_VERCEL_PROJECT_NAME`. The created Product Lab IDs are above. These credentials were not available to Railway and were not invented. Build jobs must publish both `/workspace/outputs/product.zip` and `/workspace/outputs/vercel-files.json`. The manifest is an array of `{file,encoding:"base64",data}`, capped at 150 files / 2 MiB decoded; dotfiles, traversal and duplicate paths are rejected.

For application-originated events, configure `ULTRON_BUSINESS_WEBHOOK_SECRET`. POST the JSON body to `/api/executive/events` with `x-ultron-timestamp` as a Unix timestamp in milliseconds and `x-ultron-signature` as `sha256=` plus HMAC-SHA256 of `timestamp + "." + exactBody`. Supported JSON: `{eventId,type:"signup"|"support",message}`. There is a five-minute timestamp window. Duplicate event IDs do not create another job.

Read owner evidence from `/api/executive/business`, `/api/executive/deployments` and authenticated `/api/executive/status`. Artifact downloads use `/api/executive/artifact?job=...&id=...` with a Bearer owner token in the header, never the URL.

## Validation and external evidence

`npm run test:executive`: 28 passed, zero failures. These test provider contracts with fixtures; they are not paid live model executions. The full local suite produced 315 passes and 14 failures, all from existing tests requiring an unavailable `DATABASE_URL`. Attempts to obtain an isolated Vercel sandbox for those checks were rejected with HTTP 403. No local tests were pointed at the production database.

The official references used for the hosted path and deployment request are:

- https://developers.openai.com/api/docs/guides/agents-api/quickstart
- https://developers.openai.com/api/docs/guides/agents-api/tools/computer-use
- https://developers.openai.com/api/docs/guides/agents-api/environments/files
- https://vercel.com/docs/rest-api/deployments/create-a-new-deployment

No customers, sales, publications, emails, advertising changes, bank settlements, provider sessions, or successful deployments are claimed by this document.
