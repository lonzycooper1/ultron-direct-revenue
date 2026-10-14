# ULTRON V34: Autonomous Revenue Director

**Release candidate, not a claim of independent customer sales.**

## Objective
Turn ULTRON's existing five-service Railway/Postgres/PayPal stack into a self-service, bounded digital audit business with a **$99** entry offer and an independent verified paying customer as the primary objective.

### Buyer flow
1. A real business owner visits \`/autonomous-audit\`.
2. The buyer submits non-sensitive business intake, including their own public HTTPS website, estimated lead volume, missed inquiry percentage, response time, and follow-up mode.
3. The server validates inputs and creates an actual **PayPal LIVE order** for the registered \`instant-lead-audit-99\` SKU.
4. The buyer approves payment **directly at PayPal**. Do not use ULTRON's own funds, employee payments or anonymous simulated purchases as revenue.
5. PayPal returns a signed, completed capture via webhook or approved checkout return. Server matches completed capture amount and USD currency to the known order.
6. ULTRON executes a bounded read-only inspection of static public homepage HTML (DNS validation, no redirects or arbitrary ports, limits on bytes and execution time).
7. A personalized nine-section audit is generated from explicitly labeled customer-supplied inputs plus separately labeled homepage observations, if public HTML was accessible. QC gates must pass.
8. A random token authenticates retrieval at \`/fulfillment?token=...\` without publishing intake to an open dashboard. PayPal fees are recorded when present in the provider receipt.
9. Manager heartbeat prioritizes real independently verified buyer purchases and fulfillment, never artificial metrics.

### Twelve feature mappings
- **Autonomous Revenue Director:** \`runRevenueDirector\` evidence-based priority and heartbeat.
- **Buyer-Intent Intelligence:** \`buyerIntent\` verified source, freshness and explicit need qualification; no contact assumed without permission.
- **Competitor Analysis:** \`competitorGaps\` flags missing *claimed* capabilities as hypotheses requiring evidence.
- **Instant Product Factory:** \`artifactFactory\` creates reports, templates, original basic website HTML, software source scaffolds and consent-aware follow-up scripts. It does not imply complete any-complexity deployment.
- **Self-Service Checkout:** \`/api/v34/checkout\` and existing live PayPal SDK/API.
- **Automated Fulfillment:** \`fulfill\` requires a verified matching capture before creating the report; existing tokenized fulfillment route now displays sections.
- **Quality Control:** \`qualityGate\` enforces deliverable completeness and evidence labels.
- **Self-Healing:** \`retryPlan\` caps harmless read retries at three and refuses blind repeat of financial or public contact actions.
- **Revenue Intelligence:** \`reconcileVerifiedRevenue\` deduplicates captures; net profit remains **unknown** until verified fee/cost coverage is complete, and bank settlement is never assumed.
- **Continuous Improvement:** \`experimentDecision\` requires a meaningful data sample and known positive profit contribution.
- **Retention:** \`retentionOpportunity\` gates marketing contact on consent and paid fulfillment.
- **Delegated Authority:** \`delegatedAuthority\` auto-grants bounded reads, generation and verified paid digital fulfillment; consequential external actions require explicit standing scopes.

## 10 simulated test customers, not actual sales
\`simulationCustomers()\` yields 10 anonymous fake business profiles with \`simulation: true\`, \`realSale: false\`, \`sendToPayPal: false\`, \`countAsRevenueUsd: 0\`. The test suite runs them through the report/QC generator **without** persistence to the order ledger, PayPal calls, or any public testimonials.

## Test / release
\`\`\`bash
npm install
npm run test:v34
npm test
\`\`\`
GitHub Actions checks the branch, then a pull request can be merged to \`main\`; Railway's \`ultron-direct-revenue\` service follows the repository and runs \`npm test\` as its predeployment check. Verify \`/health\`, \`/api/payment-status\` and \`/api/revenue-autonomy/v34\` in live. Use a genuine independent buyer for an end-to-end payment/fulfillment test; do not self-purchase and call it revenue.

## Production boundaries
- ChatGPT connectors don't automatically grant credentials to Railway runtime.
- Publishing content outside the owned store, bulk contact sending, ads, refunds, bank transfers, onboarding OTP/MFA and identity validation require appropriate actual authorizations.
- Existing Hunter restrictions remain restrictions: no evasion.
- If external discovery API is unavailable, customers can still purchase from the owned offer page, but qualified traffic is not guaranteed.
- **PayPal balance availability and bank deposit are different from gross capture and net profit.** Verify directly with provider and financial records.
- Use website analysis only on an authorized buyer-submitted public webpage; all observations are limited and may be incomplete.
- No guaranteed leads, profit or conversion lift.
- The agent manager records priorities; it does not itself magically execute every external integration.

## Operational success definition
A real unrelated buyer receives a useful, personalized nine-section audit after successful completed PayPal capture, with an attributable product, reproducible evidence, a private delivery token, a support path, no falsely stated findings, and a receipt. The company records actual refunds, fees and costs before asserting profit.
