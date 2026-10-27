# Revenue Pioneer runtime extension

## Actual tree and integration

This repository is a root-level Node ESM service, not a `/src/bot.py` project. Production runs `npm start` → `node server.js`. The existing Dockerfile sets `WORKDIR /app`; the modified image installs Python 3 alongside Node and the existing media tools. No second Railway service or project is required.

| Repository path | Container path | Responsibility |
| --- | --- | --- |
| `server.js` | `/app/server.js` | Existing HTTP server and owner authorization; Pioneer health, queue and result routes |
| `executive-runtime.mjs` | `/app/executive-runtime.mjs` | Existing durable PostgreSQL job admission, token/job limits and provider tools; optional public-text routing |
| `executive-business.mjs` | `/app/executive-business.mjs` | Existing minute scheduler invokes a finite Pioneer pulse without blocking customer HTTP |
| `workers/pioneer-bridge.mjs` | `/app/workers/pioneer-bridge.mjs` | Bounded JSON stdin/stdout subprocess bridge; two-process cap, timeout and shutdown |
| `workers/revenue_pioneer/compute_router.py` | `/app/workers/revenue_pioneer/compute_router.py` | Provider adapters, dated-price eligibility, telemetry, bounded fallback and reservations |
| `workers/revenue_pioneer/data_factory.py` | `/app/workers/revenue_pioneer/data_factory.py` | Allowlisted HTTPS crawl, robots, noise removal, labels, price observations and quarantine |
| `workers/revenue_pioneer/moe_router.py` | `/app/workers/revenue_pioneer/moe_router.py` | Deterministic / micro / standard / heavy task routing |
| `workers/revenue_pioneer/scale_orchestrator.py` | `/app/workers/revenue_pioneer/scale_orchestrator.py` | Durable idempotent queue and finite asynchronous worker pulses |
| `workers/revenue_pioneer/constitutional_guard.py` | `/app/workers/revenue_pioneer/constitutional_guard.py` | Capability, payload, destination and draft-file constraints at the new subsystem boundary |
| `workers/revenue_pioneer/runtime_store.py` | `/app/workers/revenue_pioneer/runtime_store.py` | SQLite transactions for queue, cost reservations, telemetry, provenance and hashed audit records |
| Persistent state | `/data/revenue-pioneer/runtime.sqlite3` | Existing Railway volume; bounded to approximately 32 MiB via SQLite max pages |

The architecture takes inspiration from the requested infrastructure/data/efficiency/operations/safety themes. This is not a claim to reproduce proprietary systems or authenticate anyone's personal operating methods. Task-level expert routing is not a neural network's internal mixture-of-experts architecture.

## Runtime behavior

- Node decrypts the existing `OPENAI_API_KEY_ENCRYPTED` / `OPENAI_API_KEY_PRIVATE_JWK` through the existing `existingOpenAIKey()` implementation and supplies the key only to the subprocess environment when needed. Python does not require a copy of the secret on disk. Conventional `OPENAI_API_KEY` remains supported by that existing resolver.
- The bridge passes only the necessary provider/configuration variables. PayPal credentials, owner tokens and `DATABASE_URL` do not enter the Python process. Existing payment code remains the sole checkout/payment authority.
- Ordinary executive tools (web search, code interpreter, image generation, hosted coding/browser) retain their current provider-specific path; this text-only router does not pretend to offer tool parity. Existing jobs are not silently moved across providers.
- Owner-submitted `marketing` jobs explicitly marked `dataClass: "public"` use the new router when enabled. Private memory and support context cannot be relabeled public. These jobs still enter the existing PostgreSQL admission/limits and receive a second bounded draft review. That review is advisory; it is not a claim of an independent provider or human approval. Data-factory consensus separately requires distinct provider/model identities.
- `parse_json` and `extract_prices` run deterministically with zero model spend. `classify_text` and `label_signal` require eligible open-source micro nodes. `product_draft`, `marketing`, `support` use standard-tier models when explicitly passed public data in the Pioneer queue. `system_design` and `market_analysis` require `requiresHeavy: true` and a .95 configured quality benchmark. No arbitrary database SQL, shell commands or trading executor exists.
- Model quality values are operator-supplied benchmark thresholds, not probabilities or live benchmark measurements. Costs use dated configured per-million-token prices and actual reported usage; they are **not** live marketplace quotes or billing statements. Price evidence expires after seven days. Stale configuration blocks model work rather than making up a price. Latency, rate-limit headers, cooldowns and usage are observed during real requests; no paid probe loop runs.
- Each network attempt first reserves an estimated worst-case cost using UTF-8 input bytes plus framing and the output-token ceiling. Budget checks are transactional across subprocesses. Failed/uncertain requests retain their reservation. Definite HTTP rejection permits at most two distinct fallback attempts. Timeout/network uncertainty stops fallback and requires reconciliation. Provider account billing limits are the actual monetary backstop; configured estimates cannot guarantee a provider invoice amount or 100% uptime.
- The worker processes at most two queued tasks per pulse, uses durable claims and marks stale RUNNING tasks `RECONCILIATION_REQUIRED`. It does not retry unknown model effects. Completed and blocked jobs retain the latest 500 records; unresolved work is never evicted. At 600 total records new jobs are refused. Audit retains 1,000 hashes; sources retain 500 bounded records. No infinite in-memory conversation history exists.
- Crawling is limited to three explicitly configured URLs per hourly scheduling slot. HTTPS destinations must be exact allowlisted hosts, DNS must resolve only to public addresses, the connection pins the resolved address and verifies TLS against the original hostname, and redirects are rejected. Robots errors defer crawling; 404 means no robots file. Per-host delay is at least 60 seconds, or the larger robots crawl delay.
- Prices and labels are source observations with retrieval time and content hash, not verified buyer intent or market truth. Low-confidence extraction is quarantined. Consensus requires two distinct configured provider/model identities, agreeing on a permitted label and each returning an exact source quotation. Agreement is still not independent factual corroboration. Only non-quarantined observations less than 24 hours old enter the existing research job context. They cannot authorize sales, trades or other actions.
- Generated artifacts are bounded non-executable drafts. Executable extensions, path traversal, credential-like strings and obvious execution patterns are rejected. This guard covers all input/output at the **new Pioneer boundary**; it is not an assertion that every legacy route has been replaced or that static checks prove arbitrary code safe. Existing financial and application controls remain in force.
- Shutdown stops new bridge admission and terminates child processes. Durable running work and reserved spend remain for reconciliation. The existing HTTP shutdown deadline still applies.

## Environment variables

The configuration review found existing encrypted OpenAI credentials and `OPENAI_MODEL`; Anthropic, DeepSeek and public open-source cluster credentials/endpoints were absent. Do not invent keys or populate dashboard secrets with dummy strings. The extension is useful for deterministic jobs with zero paid routing budget.

| Variable | Deployment/default value | Meaning |
| --- | --- | --- |
| `ULTRON_PIONEER_ENABLED` | `true` for activation | Runs the finite pulse from the existing executive business scheduler |
| `ULTRON_PIONEER_STATE_DIR` | `/data/revenue-pioneer` | State on existing persistent volume |
| `ULTRON_PIONEER_DAILY_BUDGET_USD` | `0` | New provider spending disabled; explicit finite value 0–10 enables reservations |
| `ULTRON_COMPUTE_NODES_JSON` | `[]` | Explicit model/endpoint/price/quality registry; empty means no eligible compute nodes |
| `ULTRON_COMPUTE_ALLOWED_HOSTS` | empty | Exact public cluster hosts allowed for open-source endpoints |
| `ULTRON_CRAWL_ALLOWED_HOSTS` | empty | Exact approved public crawl hosts, comma-separated |
| `ULTRON_CRAWL_TARGETS_JSON` | `[]` | Up to three approved HTTPS source URLs; none means no automatic crawl |
| `ANTHROPIC_API_KEY` | unavailable, leave unset | Required for Anthropic nodes; existing `ULTRON_CLAUDE_MODEL` may inform owner-selected model registry |
| `DEEPSEEK_API_KEY` | unavailable, leave unset | Required for DeepSeek nodes |
| `ULTRON_OPEN_SOURCE_API_KEY` | unavailable, leave unset | Required bearer credential for a public OpenAI-compatible cluster |
| `OPENAI_API_KEY` | inherited in child memory | Resolved by Node from existing conventional/encrypted credentials |
| `ULTRON_PYTHON_BINARY` | `python3` | Optional Node-side interpreter path |

Each registry row must provide: `id`, `provider` (`openai`, `anthropic`, `deepseek`, `open_source`), `model`, `endpoint`, `key_env`, `tier` (`micro`, `standard`, `heavy`), `input_per_million`, `output_per_million`, `price_verified_at` (UTC ISO timestamp), `quality`, and `open_source` (boolean). Optional `rpm` defaults to 5 and `max_latency_ms` to 60000. A missing key makes that node unavailable. Provider credential variable names are fixed and cannot point at PayPal or arbitrary environment secrets. For open-source nodes `open_source` must be true; for other providers it must be false.

Allowed paths: OpenAI `https://api.openai.com/v1/responses`; Anthropic `https://api.anthropic.com/v1/messages`; DeepSeek `https://api.deepseek.com/chat/completions`; public cluster `https://<allowlisted-host>/v1/chat/completions`. Do not copy an outdated model alias or guess a price: choose models available to the actual account and record current owner-reviewed pricing and quality evidence. Zero-price nodes still require a nonzero configured reservation budget so paid routing never activates implicitly.

Use one Railway replica with the existing volume for this SQLite-backed worker. Multi-process claims on that volume are transactional. Multiple independent replica volumes do not share reservations; do not scale replicas without migrating this store to shared PostgreSQL.

## API and commands

`GET /api/pioneer/health` is a cached public Python-version/capability probe, with no queue, spend or credential data. `GET /api/pioneer/status` is owner-only and returns node configuration metadata, observed telemetry, aggregate queue and reservation evidence. No token appears in URLs or browser storage.

`POST /api/pioneer/jobs` accepts owner-authenticated JSON with a stable ID, kind and payload. `GET /api/pioneer/jobs/<id>` returns the saved draft result to the owner. Background pulses process the queue; a queue acknowledgment is not completion. Example zero-spend task:

```json
{"id":"public-price-parse-001","kind":"task","payload":{"kind":"extract_prices","text":"Public starter offer: $29.00","data_class":"public"}}
```

Supported worker kinds: `task`, `demand` (payload `url`), `product_draft` (payload `text`), `checkout_route` (fixed existing `/autonomous-audit` path; no order created). External messaging, automatic payment mutation and trading are absent.

Compile and verify from repository root:

```bash
python3 -m compileall -q workers/revenue_pioneer
npm run test:pioneer
npm test
```

Local Python entry point is `python3 -m workers.revenue_pioneer.scale_orchestrator` and accepts one JSON request on stdin. Start the full application through `npm start`, preserving the established Railway start command. Do not run a second cron daemon; Node invokes finite async pulses.

## References and acceptance boundary

Protocol/build references checked during implementation:
- https://developers.openai.com/api/reference/python/resources/responses/methods/create
- https://platform.claude.com/docs/en/api/sdks/python
- https://api-docs.deepseek.com/quick_start/agent_integrations/
- https://api-docs.deepseek.com/api/create-chat-completion/
- https://docs.railway.com/builds/dockerfiles

Python stdlib means no new pip packages or supply-chain bootstrap script. The Docker image must include Python; compilation is part of its build. Tests cover adapters with controlled responses, persistent subprocess queue round trips, budget concurrency, fallback, stale evidence, SSRF/DNS, robots, auth and context isolation. These are not proof of successful live alternate-provider authentication, profitability, automatic customers, arbitrary-code safety, or guaranteed uptime. Live alternate-provider calls remain blocked until credentials, registry/benchmark/price evidence and an explicit new compute budget exist. Existing payment/provider integrations are preserved.
