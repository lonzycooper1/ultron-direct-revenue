export const VIDEO_UPGRADE_VERSION='2026.10.06-final';

export const VIDEO_FINDINGS=Object.freeze([
 {id:'v1-autonomous-company-layer',source:'ScreenRecording 23-21-24',finding:'Combine a strong coding/reasoning model with a company-operating layer that can continue scoped work while the owner is away.',apply:'JARVIS Overnight Operator: persistent missions, budgets, checkpoints, approval gates and next-morning receipts.'},
 {id:'v2-self-improving-strategy',source:'ScreenRecordings 23-21-24 / 23-22-29',finding:'A strategy agent repeatedly tests a simple rule, refreshes a changing universe, records scores and learns from failed experiments.',apply:'Strategy Lab with walk-forward backtests, leakage checks, paper mode, experiment history and promotion thresholds.'},
 {id:'v3-public-business-gap-finder',source:'ScreenRecording 23-22-29',finding:'Search a city/state/niche for businesses with a visible digital gap, then turn the gap into a lead list.',apply:'Extend qualified acquisition with public business-gap discovery and evidence-based scoring instead of private-contact scraping.'},
 {id:'v4-audit-to-roadmap',source:'ScreenRecording 23-22-29',finding:'Use a structured audit first, then convert the findings into a prioritized 90-day repair/implementation roadmap.',apply:'General Audit -> Strategy -> 90-day Roadmap primitive for revenue, operations, content and customer workflows.'},
 {id:'v5-open-financial-research',source:'ScreenRecording 23-24-14',finding:'Use open-source financial research infrastructure such as OpenBB instead of paying for a proprietary terminal for every query.',apply:'Optional OpenBB-compatible data adapter and source-normalized market-research interface.'},
 {id:'v6-crawler-plus-specialists',source:'ScreenRecording 23-28-45',finding:'A crawler finds public opportunities; specialist agents independently verify the source, reject recycled/fake signals, calculate entries and report decisions.',apply:'Research Crawler with Discoverer, Source Verifier, Skeptic, Calculator and Audit agents; no real-money execution.'},
 {id:'v7-creative-variant-engine',source:'ScreenRecording 23-27-07',finding:'Turn one campaign asset into multiple creative directions and simplify presentations so each slide communicates one strong idea.',apply:'Creative Lab: five-direction campaign generator, slide clarity editor and optional Runway bridge.'},
 {id:'v8-adversarial-ai-defense',source:'ScreenRecording 23-30-58',finding:'Jailbroken or untrusted agents can become dangerous once they have tools and host access.',apply:'Adversarial Safety Lab: prompt-injection red-team tests, source/sink separation, least privilege, sandboxing and approval gates.'},
 {id:'v9-public-portfolio-intelligence',source:'ScreenRecordings 23-27-07 / 23-30-58',finding:'Public filings and portfolio disclosures can be turned into structured research signals without relying on secret insider data.',apply:'SEC/13F Public Portfolio Research: filing-age labels, position-change summaries and source provenance.'},
 {id:'v10-mcp-market-bridge',source:'ScreenRecording 23-25-26',finding:'Separate the model brain from the market/exchange server through a typed MCP-style bridge.',apply:'Read-only/live-data + paper-trading MCP contract; any real-money order remains explicit owner-approved and bounded.'}
]);

const clean=(v,max=5000)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

export function overnightMission({goal='',budgetUsd=0,maxHours=8}={}){
 const g=clean(goal||'Improve ULTRON acquisition, product quality and operating reliability',3000);
 return {
  mode:'bounded-overnight-operator',goal:g,budgetUsd:Math.max(0,Number(budgetUsd)||0),
  maxHours:clamp(maxHours,1,12),
  stages:['restate objective','inspect live telemetry','find highest-value bottleneck','run reversible research/build tasks','test outputs','record evidence','stop at consequential actions','prepare morning receipt'],
  canDo:['research','drafting','coding','testing','paper backtests','data analysis','content variants','workflow compilation','diagnostics'],
  mustPauseFor:['spending','publishing','sending external messages','refunds','banking','real-money trades','irreversible account changes'],
  receipt:['work completed','tests/evidence','files or commits changed','blocked actions','recommended next decision']
 };
}

export function strategyLabSpec({universe='liquid US equities',rebalanceDays=30,holdCount=10,signal='value-quality composite'}={}){
 return {
  mode:'research-and-paper-only',
  universe:clean(universe,300),signal:clean(signal,500),
  rebalanceDays:clamp(rebalanceDays,1,365),holdCount:clamp(holdCount,1,100),
  loop:[
   'freeze point-in-time universe','build factor values using only data available at that time','rank candidates','simulate transaction costs/slippage','hold through next rebalance','record return/drawdown/turnover','run walk-forward window','compare to baseline','reject if leakage/instability detected'
  ],
  promotionGate:{minimumOutOfSampleWindows:4,requiresPositiveAfterCosts:true,maxDrawdownReview:true,paperTradingBeforeAnyLiveOrder:true},
  antiOverfit:['point-in-time data','delisted names where available','no future fundamentals','walk-forward evaluation','parameter stability','multiple-comparison caution'],
  liveTrading:'disabled by default; owner-approved bounded order path only'
 };
}

export function crawlerResearchPlan({query=''}={}){
 return {
  query:clean(query,2000),
  agents:[
   {name:'Discoverer',job:'find public sources, announcements, filings and datasets'},
   {name:'SourceVerifier',job:'open the primary source and verify date, issuer and exact claim'},
   {name:'Skeptic',job:'look for recycling, stale information, contradictions, manipulation or missing context'},
   {name:'Calculator',job:'compute normalized metrics/scenarios from verified inputs'},
   {name:'AuditAgent',job:'record provenance, confidence, rejected evidence and unresolved uncertainty'}
  ],
  rules:['primary source before secondary claim','no secret/illicit data','reject stale recycled signals','separate facts from inference','paper research only for trading outputs'],
  output:['claim','primary source','timestamp','confidence','counterevidence','calculation','decision','audit receipt']
 };
}

export function creativeDirections({asset='',goal=''}={}){
 const a=clean(asset||'campaign asset',1000),g=clean(goal||'increase qualified attention',1000);
 return {
  asset:a,goal:g,
  directions:[
   {id:'proof',concept:'Proof-first',prompt:'Lead with the strongest verifiable result or demonstration, then reveal how it works.'},
   {id:'problem',concept:'Problem-first',prompt:'Open on the costly customer pain, then show the smallest credible fix.'},
   {id:'process',concept:'Behind-the-scenes',prompt:'Show the workflow, transformation or build process in a fast visual sequence.'},
   {id:'contrast',concept:'Before / after',prompt:'Contrast the old workflow with the improved workflow without fabricating results.'},
   {id:'education',concept:'Teach one thing',prompt:'Turn the asset into a concise educational hook with one takeaway and one CTA.'}
  ],
  production:'Generate scripts/storyboards internally; if RUNWAYML_API_SECRET is configured, stage an image-to-video task for owner-approved generation.',
  rights:'Use only original or properly licensed input assets.'
 };
}

export function slideClarityRules(){
 return ['one strong idea per slide','remove redundant prose','headline states the takeaway','support with one chart/image/example','preserve factual qualifiers','move detail to notes or appendix','end with explicit decision/CTA'];
}

export function adversarialSafetyPlan(){
 return {
  purpose:'defensive agent red-team testing',
  tests:['prompt injection in webpages/email/files','tool-call argument manipulation','secret-exfiltration attempts','cross-tenant data requests','malicious redirect/link','false urgency/social engineering','approval-bypass attempt','untrusted code/data payload'],
  controls:['instruction hierarchy','source/sink separation','least privilege','destination allowlist','secret isolation','sandboxed code','read-only-by-default connectors','consequential-action confirmation','tamper-evident audit','kill switch'],
  passCondition:'Untrusted content may influence analysis but cannot silently change owner intent, expose secrets or execute consequential actions.'
 };
}

export function publicPortfolioResearchPlan({manager=''}={}){
 return {
  manager:clean(manager,200),
  sources:['SEC EDGAR 13F and related public filings','issuer filings','official fund letters when public'],
  workflow:['resolve filing entity','fetch latest and prior filing','label filing/report date','normalize positions','calculate additions/reductions/exits','flag stale disclosure window','cross-check issuer events','produce sourced summary'],
  warnings:['13F data is delayed','reported positions are not a live portfolio','derivatives/short exposure may be incomplete','public filings are research inputs, not insider information']
 };
}

export function integrationStatus(){
 return {
  openbb:{configured:Boolean(process.env.OPENBB_BASE_URL),env:'OPENBB_BASE_URL'},
  runway:{configured:Boolean(process.env.RUNWAYML_API_SECRET),env:'RUNWAYML_API_SECRET'},
  marketMcp:{configured:Boolean(process.env.MARKET_MCP_URL),env:'MARKET_MCP_URL'},
  secEdgar:{configured:true,mode:'public HTTPS with compliant user-agent'}
 };
}

export function videoUpgradeManifest(){
 return {
  version:VIDEO_UPGRADE_VERSION,
  analyzedRecordings:9,
  findings:VIDEO_FINDINGS,
  modules:{
   overnightOperator:overnightMission({}),
   strategyLab:strategyLabSpec({}),
   researchCrawler:crawlerResearchPlan({query:'example opportunity'}),
   creativeLab:creativeDirections({}),
   slideClarity:slideClarityRules(),
   adversarialSafety:adversarialSafetyPlan(),
   publicPortfolioResearch:publicPortfolioResearchPlan({}),
   integrations:integrationStatus()
  },
  boundary:'Ideas from social videos are treated as hypotheses/patterns. JARVIS uses clean-room implementation, public/authorized data, paper research for trading, and approval gates for consequential actions.'
 };
}
