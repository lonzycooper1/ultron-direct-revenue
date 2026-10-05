// Evidence-grounded competitive intelligence distilled from current 2026 public documentation.
// Facts here are architectural/product lessons only; agents must refresh time-sensitive market data before acting.
export const COMPETITIVE_INTELLIGENCE_2026=Object.freeze({
 commerce:{
   principles:[
     'Behavior-triggered automation beats generic blasts: welcome, browse-abandonment, checkout-abandonment and post-purchase are foundational flows.',
     'Personalization should use observed browsing/purchase behavior rather than invented attributes.',
     'Reduce checkout friction and route high-intent traffic directly to the most relevant product/checkout path.',
     'Generate multiple creative variants, run controlled tests, and concentrate distribution on measured conversion lift.',
     'Make product information structured and agent-readable for emerging agentic commerce.'
   ],
   metrics:['qualifiedTraffic','productViewRate','checkoutStartRate','verifiedPurchaseRate','recoveryRate','netRevenuePerVisitor']
 },
 creative:{
   principles:[
     'Treat product URL/catalog fields as structured creative inputs.',
     'Produce channel-native variants: UGC, static, motion, product hero, short-form demo.',
     'Multiply hooks while preserving truthful product claims.',
     'Score and test variants before scaling distribution.'
   ]
 },
 appFactory:{
   principles:[
     'Use prompt -> plan -> build -> test -> preview -> feedback -> publish.',
     'Keep preview separate from production and make rollback possible.',
     'Use acceptance tests and deployment health checks before promotion.',
     'Capture user feedback as structured next-iteration tasks.'
   ]
 },
 callCenter:{
   principles:[
     'Route inbound calls through an intent/knowledge layer.',
     'Use telephony for call state, an AI voice layer for dialogue, calendar tools for booking, CRM for customer state.',
     'Recover missed calls with permissioned follow-up and preserve a human handoff path.',
     'Write every completed interaction back to shared customer memory.'
   ]
 },
 agentCompany:{
   principles:[
     'Use an orchestrator/control plane that decomposes objectives into tasks and assigns specialized agents.',
     'Give each task isolated working context and observable status.',
     'Run tests/evals/guardrails continuously; a running agent is not necessarily a good agent.',
     'Scale by parallel workers only when backlog, latency, quality and economics justify more capacity.',
     'Keep budgets, permissions and sensitive-action approvals explicit.'
   ]
 },
 marketIntelligence:{
   principles:[
     'Separate data ingestion, features, signal ensembles, regime/catalyst analysis, risk review and outcome attribution.',
     'Require reproducible research and independent evidence before upgrading a hypothesis to a trade proposal.',
     'Treat social or celebrity commentary as hypothesis input, never as an execution signal.',
     'Track strategy drift and compare results against a benchmark.'
   ],
   safety:['real-money actions remain approval-gated','no guaranteed-return objective','no leverage escalation to hit a deadline']
 }
});
export function intelligenceFor(division='market'){return division==='crypto'?{marketIntelligence:COMPETITIVE_INTELLIGENCE_2026.marketIntelligence,agentCompany:COMPETITIVE_INTELLIGENCE_2026.agentCompany,appFactory:COMPETITIVE_INTELLIGENCE_2026.appFactory}:{commerce:COMPETITIVE_INTELLIGENCE_2026.commerce,creative:COMPETITIVE_INTELLIGENCE_2026.creative,appFactory:COMPETITIVE_INTELLIGENCE_2026.appFactory,callCenter:COMPETITIVE_INTELLIGENCE_2026.callCenter,agentCompany:COMPETITIVE_INTELLIGENCE_2026.agentCompany}}
