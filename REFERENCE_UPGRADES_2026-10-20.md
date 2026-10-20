# ULTRON reference upgrades — implementation and evidence boundaries

This is a partial implementation, not completion of all 14 references. The source
captions and selected visuals were observed in a signed-in Instagram browser on
2026-10-20. Full reel audio review remains incomplete: the supported media download
operation returned `Download ... was canceled` on references 1 and 10. No transcript
or creator-gated repository was invented. Recommended reels below the requested
post are excluded from its evidence.

## Source-to-feature matrix

| # | Source / creator | Inspected / actual focus | Disposition and remaining dependency |
|---|---|---|---|
| 1 | [DbsM7RMBSzo](https://www.instagram.com/reel/DbsM7RMBSzo/) — bennett.spooner | Caption and selected frames, including a hierarchy and connected-agent graph. 72.19-second reel; full audio not reviewed. | Reuse executive queue, role ownership, durable status and owner reviews. Creator's advertised repository not attributable yet; no imported code. Full recording/transcript required for complete method. |
| 2 | [Dd55LlECSWd](https://www.instagram.com/p/Dd55LlECSWd/?img_index=8) — gobi_automates | All eight slides inspected: task routing, fresh retrieval, cached context, graph relationships, connected apps/data, repeatable workflows and departmental worktrees. | Implement scoped sourced memory, explicit relationships and opt-in executive context. Lexical retrieval is operational; semantic embeddings, cached model understanding and Composio/Treg are not implemented or claimed. Existing connectors retained. |
| 3 | [Del5xpMtE-t](https://www.instagram.com/p/Del5xpMtE-t/) — quantfinance.ai | Full single infographic and caption: 20 strategy families including momentum, reversion, pairs, execution and derivatives. | Reuse candle evaluator for a baseline only. Twenty production strategies are not implemented; each needs an exact specification, suitable historical data, realistic costs and out-of-sample validation. Derivatives remain research-only. |
| 4 | [Dehh-GGgg0G](https://www.instagram.com/reel/Dehh-GGgg0G/) — nickafischer | Caption identifies day-trading options bots; full audio/method not reviewed. | Consolidate with #9; no broker connection, options implementation or financial execution. Recording/transcript needed. |
| 5 | [Dd48nVoD7FR](https://www.instagram.com/p/Dd48nVoD7FR/) — seb.ai | Caption and first slide: public-data research terminal, company research, news, filings and stress tests; eight-slide carousel not fully inspected. | Reuse executive research, finance analysis and market service; add input-based company screening. Licensed data, authoritative current fundamentals and remaining slides still needed for a complete terminal. |
| 6 | [DecWLCNxlz2](https://www.instagram.com/reel/DecWLCNxlz2/) — sweatpant_millionaire / primecapitalre | Caption: claimed commercial-property appreciation, refinancing and tax outcome; full audio not reviewed. | Add transparent loan, cash-after-costs, amortization and DSCR scenarios; reuse existing property diligence. No independent valuation, tax determination or financing approval. |
| 7 | [DemltRcE1sR](https://www.instagram.com/p/DemltRcE1sR/) — arwazaz_ | Caption and slide 1/8: measurable business-quality screening, Python and validation. | Implement explicit ROE/debt/equity/P-E input screen with missing data preserved. Remaining slides, authoritative historical fundamentals and strategy specification needed; no claim to reproduce Buffett or backtested returns. |
| 8 | [DeHIAcjtHRr](https://www.instagram.com/p/DeHIAcjtHRr/) — finfab.app | Single wealth infographic and caption inspected. | Research-only: wealth estimates are unverified third-party claims, not an operational capability, customer evidence or revenue forecast. No feature count assigned. |
| 9 | [DeCk2UugeNF](https://www.instagram.com/reel/DeCk2UugeNF/) — nickafischer | Caption: one-day-to-expiry Python bots; video/audio method not fully inspected. | Consolidate with #4. Research-only; full source and a tested strategy specification remain missing. |
| 10 | [DeOT1GRBXJ-](https://www.instagram.com/reel/DeOT1GRBXJ-/) — jun_yuh | Caption and opening revenue-claim frame only; actual business/content method not verified. | Blocked pending recording/transcript. No invented product strategy or adopted revenue claim. Supported media retrieval was canceled. |
| 11 | [Dd_wlJNqYVv](https://www.instagram.com/reel/Dd_wlJNqYVv/) — kumail.si | Caption and leaderboard frame inspected: reuse, engineering, review, security, clear communication, diagrams, graph context and design skills. | Reuse code and behavior tests; scoped memory and controlled error handling added. Named repositories, licenses and star claims unverified; no third-party skill installation. Full audio review outstanding. |
| 12 | [DeR_GUEifqy](https://www.instagram.com/p/DeR_GUEifqy/) — gobi_automates | Caption and first slide: shared structured company context across business departments. Remaining slides not inspected. | Consolidate with #2; do not reproduce advertised agent/automation counts as evidence of working systems. |
| 13 | [DeqdTxjgZ62](https://www.instagram.com/p/DeqdTxjgZ62/) — n8nstack | Caption and first slide: bounded tools, relevant context, deterministic processing, structured validation and output verification. | Apply validation, authorization-before-storage, exact scope binding, evidence snapshots, failure blocking and concurrency tests. Remaining carousel review outstanding. |
| 14 | [Degl67_mOq5](https://www.instagram.com/p/Degl67_mOq5/) — 10xprompt | Caption and first slide: scene/camera/light prompts, VFX, transitions, product ads and storytelling. Remaining prompt slides not inspected. | Reuse `makeStoryboard`, cinematic rights/budget gates, render and review workflow. No generated clip, approved sample, provider access or newly inspected full prompt set claimed. |

## Implemented code in this change

- `/workbench`: public deterministic research demonstrations plus an owner-only
  company-memory interface. Synthetic examples are labeled; it collects no payment.
- Owner API `/api/company-memory/v47/{save,search,relate,context,snapshot}` uses the
  existing owner token and PostgreSQL-backed state transactions. Unauthorized
  requests are rejected before any read/write. Scope, provenance, evidence type,
  timestamps, expiry and optimistic versions are required. Exact replays do not
  create new versions. Graph links cannot cross scopes. No vector capability is
  claimed; this is bounded lexical retrieval over at most 500 documents per scope.
- Executive jobs may explicitly supply `memoryScope`. Retrieval occurs before a
  provider/worker request; a read failure blocks execution. Scope is part of
  idempotency identity and results save the actual source versions/digests used.
  The owner opts into sending matching excerpts to the configured model/worker.
  Retrieved instructions never grant authority or change existing action gates.
- `/api/research/v47/refinance` computes debt service, cash after debt/costs and
  DSCR from supplied assumptions. `/api/research/v47/screen` evaluates explicit
  ratios with source/as-of labels and preserves insufficient evidence. Neither
  calls a provider, verifies input, determines taxes, places orders or sells advice.

## Current infrastructure evidence

Reconciled main: `0b19457a9ae53972acdbe7b87ae1de366e14c938`.
Revenue, JARVIS, market-stream, trading and PostgreSQL were distinct existing
services. Production revenue `/health` returned HTTP 200 with PostgreSQL healthy;
`/api/payment-status` reported PayPal ready. JARVIS and market-stream health returned
HTTP 200. These reads do not prove a new customer payment, fulfillment, bank
settlement, SMTP delivery or live hosted session.

Railway's 2026-10-20 19:10 UTC update still states new builds are paused for all
workspaces. Existing releases are running; these new changes are not deployed.
No production data, credential, trading flag, risk limit, stop, financial
transaction or external communication was changed by this implementation.

## Acceptance still required

Full source audio/carousel review; full isolated PostgreSQL CI; deployment SUCCESS
and exact revision verification; production owner-memory workflow and retained
records after restart; provider execution/approved cinematic sample; truthful
commercial offer, genuine intake/payment/delivery evidence where applicable.
No new priced offer is activated before its delivery capability is verified.

Run `npm test` with an isolated loopback PostgreSQL test database and FFmpeg.
The full suite deliberately fails without that database instead of skipping the
persistence/concurrency controls. Existing hosted workflow and cryptocurrency
safety tests remain required.
