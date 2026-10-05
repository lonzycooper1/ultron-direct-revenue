// ULTRON JARVIS Core — shared brain for desktop, iOS, Android and web clients.
// Real-money financial execution is intentionally approval-gated.

export const JARVIS_PLATFORMS = Object.freeze(['macOS','Windows','Linux','iOS','Android','Web']);

export const JARVIS_SPECIALISTS = Object.freeze([
  {name:'ChiefOrchestrator',job:'Decompose goals, route work, merge results and track completion.'},
  {name:'ResearchAgent',job:'Search authorized/public sources, compare evidence, cite provenance and flag uncertainty.'},
  {name:'MarketAgent',job:'Analyze market data, regimes, catalysts, liquidity and risk; produce proposals only.'},
  {name:'CommerceAgent',job:'Research demand, competitors, products, offers, pricing and conversion opportunities.'},
  {name:'BuilderAgent',job:'Design and generate original software, products, tests and deployment plans.'},
  {name:'CreativeAgent',job:'Generate truthful marketing concepts and channel-native variants.'},
  {name:'SalesAgent',job:'Qualify leads, prepare offers, route checkout and measure conversion.'},
  {name:'SupportAgent',job:'Answer customer questions, triage issues and preserve human handoff.'},
  {name:'MemoryAgent',job:'Maintain durable task/project state with provenance and retention controls.'},
  {name:'SafetyAgent',job:'Enforce permissions, financial approval gates, privacy controls and audit logging.'},
  {name:'EvaluatorAgent',job:'Run tests/evals, challenge conclusions and detect regressions before release.'}
]);

export const JARVIS_PERMISSIONS = Object.freeze({
  readPublicWeb:'auto',
  readConnectedData:'scoped-user-permission',
  createDrafts:'auto',
  generateCode:'auto',
  runTests:'auto',
  lowRiskBusinessAutomation:'policy-gated',
  publishExternalContent:'authorized-channel-only',
  sendMessages:'authorized-channel-only',
  purchases:'explicit-approval',
  realMoneyTrades:'explicit-approval',
  withdrawals:'explicit-approval',
  accountSecurityChanges:'explicit-approval'
});

export function jarvisManifest(){
  return {
    name:'ULTRON JARVIS',version:'1.0.0',platforms:JARVIS_PLATFORMS,
    specialists:JARVIS_SPECIALISTS,permissions:JARVIS_PERMISSIONS,
    architecture:['client shell','voice/text interface','orchestrator','specialist agents','tool gateway','shared state','event bus','policy engine','audit log','eval loop'],
    interfaces:['text','voice','push notifications','dashboard','background task queue'],
    principles:['least privilege','evidence before action','observable agent runs','tests before deploy','human approval for consequential financial actions','rollback and kill switch']
  };
}

export function classifyAction(action=''){
  const a=String(action).toLowerCase();
  if(/trade|buy crypto|sell crypto|withdraw|transfer money|purchase|payment/.test(a)) return {approvalRequired:true,risk:'financial'};
  if(/publish|post|email|message|call/.test(a)) return {approvalRequired:false,risk:'external-action',requiresAuthorizedChannel:true};
  return {approvalRequired:false,risk:'normal'};
}

export function buildJarvisMission({goal='',division='general',context={}}={}){
  const policy=classifyAction(goal);
  return {
    id:`jarvis-${Date.now()}`,createdAt:new Date().toISOString(),goal:String(goal),division,context,policy,
    stages:['understand','retrieve evidence','plan','delegate','execute permitted tools','evaluate','request approval if required','record outcome','learn'],
    specialists:JARVIS_SPECIALISTS.map(x=>x.name)
  };
}
