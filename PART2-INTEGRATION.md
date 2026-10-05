# ULTRON Part 2 — Build & Integration

This branch implements the reusable modules extracted from the IMG_0263–IMG_0267 review without treating social-media earnings claims as verified performance.

## Implemented

- Multi-agent orchestration plan with Commander, Revenue Opportunity, Market Research, Risk, Performance and Independent Reviewer roles.
- Opportunity normalization, scoring and ranking.
- Hard confidence/risk thresholds and daily-loss circuit breaker.
- Market workflows are structurally locked to `SIMULATION_ONLY`; this branch cannot transmit a live trade.
- Position/notional sizing guardrail for simulations.
- Paper-trade result engine and performance summaries.
- Existing live revenue system remains the authorized path for actual commerce: storefront -> PayPal order -> verified capture/webhook -> ledger -> agent cycle.
- Existing external publishing restriction remains in place until an authorized platform connection exists.
- Automated Node test suite command added to `package.json`.

## Architecture

`Commander -> Opportunity scoring -> Revenue workflow OR Market research -> Risk review -> Independent review gate -> Existing authorized connector -> Ledger/metrics -> feedback`

Market path:

`MarketResearchAgent -> RiskAgent -> paperTrade() -> PerformanceAgent`

Revenue path:

`RevenueOpportunityAgent -> existing ULTRON offer/content/payment workflow -> verified PayPal event -> AnalyticsAgent`

## Part 2 boundary

This phase builds and integrates the software modules. It intentionally does not deploy the branch to production; deployment and live verification belong to Part 4. External service connections/scheduling belong to Part 3.
