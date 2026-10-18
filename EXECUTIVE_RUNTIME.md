# ULTRON executive runtime — October 18, 2026

## Confirmed project state before this change

The real repository is `lonzycooper1/ultron-direct-revenue`, branch `main`, initially at `b7b89ee231cedb4fb961d931c361546321d4c6fc`. Railway project `2e0b0216-9aba-4ff3-bf10-e1f5b44d28e3` contains Postgres, ultron-web/JARVIS, ultron-direct-revenue, ultron-market-stream and ultron-trading-engine. Railway reported successful deployments, which by itself is not an integration test. The revenue HTTP health endpoint independently returned a healthy PostgreSQL connection. The existing encrypted OpenAI credential and model configuration were found on ultron-web; Anthropic credentials were not found on the inspected services.

The user authorized reuse of existing credentials and implementation/deployment. No new key is required for the existing OpenAI path. Existing PayPal payment flows remain the processor; the user's closed Stripe account is not reintroduced.

## Research corrections

The pasted comparison is outdated and describes two alternative ecosystems, not an installable specification. Claude Sonnet 3.5 and 3.7 are retired. OpenAI's Assistants API sunset on August 26, 2026; use Responses for the existing Responses-based application. Swarm's own repository recommends its replacement, Agents SDK. The app already uses an application-owned Node/Responses architecture, which this change preserves. Code Interpreter is a sandboxed analysis tool; it is not a production terminal, hosting account, Google Ads credential, or automatic deployment system. Function calling returns requests that application code must actually execute. Both vendors support computer-use workflows requiring an executor, screenshots and tool-result handling. No official source supports an unconditional claim that one vendor always self-corrects better.

Primary references checked:

- https://developers.openai.com/api/docs/assistants/migration
- https://github.com/openai/swarm
- https://developers.openai.com/api/docs/guides/tools-computer-use
- https://developers.openai.com/api/docs/guides/tools-code-interpreter
- https://developers.openai.com/api/docs/guides/function-calling
- https://developers.openai.com/api/docs/guides/image-generation
- https://code.claude.com/docs/en/headless
- https://platform.claude.com/docs/en/about-claude/model-deprecations
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool

## Implemented here

`executive-runtime.mjs` integrates into the real revenue server and existing transactional PostgreSQL state store. It adds a durable queue, owner-only task creation and private results, public aggregate execution evidence, per-job idempotency, independent quality-review turns, bounded output, single active lease across replicas, per-day job counts, and reconciliation for uncertain interrupted work. It never treats a model's assertion as proof of a publication, payment, deployment or refund. No sensitive external effect is automatically retried.

`/executive` is the browser workspace. `/api/executive/status` exposes configuration, counts, tool execution metadata and aggregate usage; the existing `ULTRON_ACQUISITION_ADMIN_TOKEN` in a Bearer header unlocks private job content. `POST /api/executive/jobs` accepts a supported kind, prompt, provider and optional idempotencyKey. The owner token is not put into URLs or browser storage.

With `ULTRON_EXECUTIVE_ENABLED=true`, the server checks for work each minute. It queues one sourced market-research task per UTC day, a marketing draft after that research completes, and one ledger-analysis task per UTC month. Default limit: four claimed jobs/day, each normally one specialist request plus one quality-review request. This is a job limit, not a dollar-denominated budget. Provider billing and rate limits still apply. The latest 250 terminal jobs are retained, together with unresolved work. Results remain drafts; quality review is not business authorization.

| Requested capability | Implementation and actual boundary |
| --- | --- |
| CEO and specialized workers | Durable scheduler plus research, marketing, support, analysis, finance and art-director roles; independent reviewer for OpenAI text tasks |
| Research market and competitors | OpenAI Responses web_search; citations stored with result |
| Python analysis / CSV work | Responses code_interpreter; actual returned execution records preserved; data can be supplied in task instructions |
| Branding and image creation | Responses image_generation; job fails without a completed image artifact |
| Marketing posts | Original draft generation; existing publishing integrations still require service credentials and authorized destination |
| Customer email support | Support draft jobs; existing Gmail ingestion and sending workflows remain separate; no fabricated incoming webhook |
| Paid-customer status | Existing captured-payment ledger; no change to an entitlement solely from a model output |
| Monthly finance | Sanitized current-month captured-order analysis; missing fees, refunds and settlement are reported as missing |
| Claude reasoning | Anthropic Messages adapter, inactive without ANTHROPIC_API_KEY and ULTRON_CLAUDE_MODEL |
| Build/test/deploy | Dedicated-worker HTTP adapter with idempotency and completed-evidence checks; no worker provisioned or CLI installed by this change |
| Visual desktop loop | Dedicated-worker HTTP adapter; no desktop/computer-use executor provisioned by this change |
| Infinite loop | Replaced with a bounded scheduler and crash reconciliation, not an unbounded spending loop |

## Outstanding prerequisites, not completed integrations

- Anthropic API credentials and a current model available to that account. OpenAI keys cannot authenticate Anthropic.
- An isolated build worker with Claude Code, git, Node/React toolchains, actual test/build commands, durable artifacts and scoped deployment credentials. It must return execution evidence, not a generated claim of success. The revenue service deliberately does not execute model-generated shell commands inside its production container.
- A dedicated desktop/browser executor with its own authenticated sessions, screenshot/action implementation, and Anthropic sampling loop. For computer use the official API emits actions; it does not supply the desktop.
- Owned Vercel and Supabase projects and scoped credentials if those additional platforms are desired. The existing Railway/Postgres deployment already hosts ULTRON; it does not prove a Vercel/Supabase deployment.
- Runtime CMS/social, Gmail, Google Ads and settlement-report authorizations. ChatGPT connector access does not automatically grant credentials to Railway.
- Specific approved campaigns and maximum ad budgets before automatic ad optimization can make financial changes.
- A genuine external order, delivery, acceptance and bank-settlement evidence to establish revenue. None is created by this upgrade.

Dedicated workers use `ULTRON_ENGINEER_URL` + `ULTRON_ENGINEER_TOKEN`, or `ULTRON_COMPUTER_URL` + `ULTRON_COMPUTER_TOKEN`. The URL must be HTTPS and must not be supplied by model output. Contract: accept `{jobId,kind,prompt,maxIterations:8}` with Bearer authorization and `Idempotency-Key: jobId`; return `{status:"completed",evidence:...}` only after verified execution. These are adapter contracts, not claims that a worker exists.

## Validation

Run `npm test` for the repository suite, or `npm run test:executive` for queue/idempotency/concurrency/recovery/provider-boundary checks. A live execution must independently show a provider response, appropriate tool evidence, a persisted result and review where applicable. A health response or configured key alone does not pass this check.

Local validation: all 10 new runtime/HTTP checks passed. The full local run produced 298 passes and 14 failures, all requiring DATABASE_URL. This workspace cannot launch PostgreSQL under a non-root UID, so those existing database-dependent checks must be verified by the configured Railway pre-deploy test stage. No tests were pointed at the production database from this workspace.

## Deployment outcome for this session

Code committed on main as 544eb6f054883b4b4e93467fe7f2e4e1d288699b. Five Railway variables were staged, including cross-service references to the existing encrypted OpenAI key and model, worker enablement and a four-job daily cap. The accept-deploy tool was rejected with: "Cancelled — the user did not approve this action. No changes were made." No alternate write path was used to bypass that rejection. At the verification check, the live service still used the October 15 deployment at b7b89ee; the new runtime was not live and no live model execution was verified. The settings remain staged for review in Railway. Anthropic and isolated build/desktop workers remain unconfigured.
