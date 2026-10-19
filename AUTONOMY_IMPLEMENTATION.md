# ULTRON autonomy implementation — October 18, 2026

## Actual state

ULTRON's existing Railway/Node/PostgreSQL executive runtime is live. Railway deployment `141a35c6-5391-4951-9566-398218445ca2` successfully deployed commit `8df6c48` with the encrypted OpenAI references and executive settings. The former staged-variable activation block is resolved. Its public aggregate evidence recorded a completed finance job with a completed Python Code Interpreter call and an independent model review. This proves that the existing OpenAI credential executes Responses requests; hosted coding and browser access require separate acceptance checks.

The Vercel 403 was narrowed to explicit team-scoped connector calls. The authenticated default account is `lonzycooper5-5987`, owns Product Lab `prj_F4KwMNbx22NgsOtL3zKH1gGvY1vB`, and successfully deploys and creates isolated sandboxes when unnecessary team parameters are omitted. https://ultron-product-lab.vercel.app returned HTTP 200 with the expected marker. Both production and preview deployments reached READY. Preview requests must OMIT `target`; the literal `preview` is rejected with HTTP 400. Provider-returned targets are retained in deployment records.

The isolated Product Lab provider-check function uses a secret owner token and short-lived Vercel OIDC identity, with fixed prompts/models and 128 output tokens. OIDC authentication is available. Actual Anthropic and OpenAI AI Gateway attempts returned HTTP 403 `customer_verification_required`: this Vercel account needs a payment card on file. This is a billing-verification block, separate from the resolved deployment permission issue. It does not establish direct Anthropic credential access or OpenAI hosted-session access.

Supabase remains optional and pending; Railway PostgreSQL is healthy. Runtime Gmail, HubSpot, publishing, ads, alert destination and external statement credentials were absent from the inspected Railway service. ChatGPT connector credentials were not copied into the server.

## What the code now does

- `hosted-executor.mjs` uses the public OpenAI Agents API through `openai@7.38.0`. Build jobs run in an OpenAI-hosted sandbox; browser jobs enable its hosted desktop. Every session has a $1 API spend limit, a four-minute client deadline, bounded execution counts, durable session/turn checkpoints and no automatic request retry. Production keys stay outside the sandbox.
- Build completion requires an observed standalone test command with exit code zero and an actual downloaded project ZIP. Browser completion requires observed computer-use activity and a screenshot. A generated sentence claiming success cannot satisfy either condition. Downloaded artifact bytes are checkpointed before deleting the provider-side session. Ambiguous failures retain their IDs for reconciliation.
- `executive-business.mjs` scans actual captured orders, consented diagnostic requests and existing support tasks into durable deduplicated jobs. It freezes event evidence before queue insertion so interrupted processing can recover without changing the original prompt. An HMAC-authenticated signup/support webhook is available, with timestamp validation and stable event IDs. Webhook possession never establishes payment.
- `product-deployer.mjs` validates the saved build's observed test evidence and the SHA-256 digest of a generated file manifest, then submits only to a fixed configured Vercel project with the API preview default. Repeated or interrupted submissions cannot cause an automatic second POST. Polling requires a provider `READY` receipt before marking deployment successful. No production-site replacement is attempted.
- The owner workspace provides authenticated downloads of saved artifacts. Tokens are not put in query strings or local storage. Business status, financial reconciliation and deployment records are owner-only. Public status exposes aggregate execution evidence rather than private prompts.
- Finance uses captured amounts, provider fee evidence, signed refund records, reviewed costs and separately labeled settlement records. Missing amounts are unknown, not zero. The learning snapshot uses independently evidenced, delivered and accepted orders. It cannot create customer success evidence from model output. The ad helper returns capped recommendations only; it does not spend money or change budgets.
- Paid support/analysis jobs receive queue priority. A queue-full scheduling error no longer prevents the executor from processing existing work.

## Requested gaps and their completion boundary

| Gap | Added or available | Still required for live completion |
| --- | --- | --- |
| Activate executive runtime | Successful live Railway deployment and enabled worker verified | Resolved |
| Share existing OpenAI access | Encrypted references live; finance execution and independent review completed | Hosted coding/browser checks remain separate |
| Claude reasoning / Claude Code | Existing Anthropic adapter preserved | An actual Anthropic credential and current account-authorized model; no credential was available |
| Isolated coding worker | Hosted OpenAI coding implementation, tests, ZIP retrieval and cleanup | Existing API key must have Agents scopes/access; live account check not possible while inactive |
| Browser/desktop worker | Hosted desktop implementation with actual activity/screenshot checks | Agents desktop/model access and any destination-specific sign-in |
| Generated-product deployment | Validated saved-build-to-Vercel preview workflow | Vercel runtime token/project scope and a successful runtime-driven generated-product deployment; ChatGPT deployment and isolated VM now verified |
| Email/social/CRM/ads connections | Existing adapters remain; connector discovery performed | Runtime credentials, correct accounts and authorized destinations; ChatGPT connection is not server OAuth |
| Event-triggered work | Captures, first-party opt-ins, support tasks, signed signup/support webhook | Deploy code; configure the source webhook secret and actual event producer |
| Live end-to-end checks | Deterministic integration checks and a real Vercel project-creation check | Hosted provider session access and generated-product delivery; runtime activation and Vercel deployment receipt now verified |
| Customer fulfillment | Captured-order-specific task creation, saved outputs and existing review/acceptance flows | Genuine buyer intake, correct delivery, quality evidence and customer acceptance |
| Financial reporting | Provider-aware reconciliation snapshot and corrected finance inputs | Actual processor statements, cost records and bank settlement evidence |
| Advertising | Validated metrics, sample threshold and explicit cap checks; no invented spend | Connected advertising account, funding, conversion tracking and configured spending authority |
| Backups/recovery/alerts | Existing encrypted backup/restore script, recovery supervisor and alert dispatcher preserved | Separate restore target, backup key/storage, a production-backup drill and received alert evidence; populated isolated fixture restore passed |
| Learning | Accepted-order/channel feedback snapshot and evidence thresholds | Real accepted outcomes, reliable attribution and complete measured costs |

## Configuration for the added paths

Existing OpenAI credential variables and `OPENAI_MODEL` are sufficient to attempt hosted jobs. `OPENAI_AGENT_MODEL` can select a model supported by the Agents API for the account. Presence is never labeled successful access. Existing executive daily job limits still apply in addition to the hosted $1/session limit.

For generated previews, use scoped `ULTRON_VERCEL_TOKEN`, `ULTRON_VERCEL_PROJECT_ID`, optional `ULTRON_VERCEL_TEAM_ID`, and optional `ULTRON_VERCEL_PROJECT_NAME`. The created Product Lab IDs are above. These credentials were not available to Railway and were not invented. Build jobs must publish both `/workspace/outputs/product.zip` and `/workspace/outputs/vercel-files.json`. The manifest is an array of `{file,encoding:"base64",data}`, capped at 150 files / 2 MiB decoded; dotfiles, traversal and duplicate paths are rejected.

For application-originated events, configure `ULTRON_BUSINESS_WEBHOOK_SECRET`. POST the JSON body to `/api/executive/events` with `x-ultron-timestamp` as a Unix timestamp in milliseconds and `x-ultron-signature` as `sha256=` plus HMAC-SHA256 of `timestamp + "." + exactBody`. Supported JSON: `{eventId,type:"signup"|"support",message}`. There is a five-minute timestamp window. Duplicate event IDs do not create another job.

Read owner evidence from `/api/executive/business`, `/api/executive/deployments` and authenticated `/api/executive/status`. Artifact downloads use `/api/executive/artifact?job=...&id=...` with a Bearer owner token in the header, never the URL.

## Validation and external evidence

`npm run test:executive`: 28 passed, zero failures after correcting the Vercel request and adding one-time hosted acceptance scheduling. The full suite passed all 331 tests with PostgreSQL and ffmpeg in a disposable Vercel sandbox. The initial attempt passed 330/331 because ffmpeg was absent; installing the production dependency resolved that environmental failure.

A separate populated recovery drill exported three synthetic state rows using the existing encrypted backup script, verified ciphertext, restored into a distinct isolated PostgreSQL database, and compared sorted state fingerprints. Both hashes were `02f90a12de3e682453617cb12bc6d258a625cd3804431b77a2a1a8c5549ce77a`. Production customer data was not used. This verifies the backup implementation on real PostgreSQL, not production backup retention or disaster recovery. The temporary VM was stopped after verification.

Vercel production verification deployment `dpl_DQ2DG7ZD582Pe6FjXKGnxHV9prDu` serves the test page and protected provider-check function. Preview deployment `dpl_2epg4h6jC6LBFbA3JqK78iR8NvBK` reached READY with target null (preview) after omitting the target field.

The official references used for the hosted path and deployment request are:

- https://developers.openai.com/api/docs/guides/agents-api/quickstart
- https://developers.openai.com/api/docs/guides/agents-api/tools/computer-use
- https://developers.openai.com/api/docs/guides/agents-api/environments/files
- https://vercel.com/docs/rest-api/deployments/create-a-new-deployment

No customer acceptance, email delivery, publication, advertising changes or bank settlements are claimed. Hosting checks, model execution and isolated recovery checks are distinguished above from live customer fulfillment.
