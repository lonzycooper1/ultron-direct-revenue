import {getJson,mutateJson} from './state-store.mjs';

export const AUTONOMY_VERSION='12.0.0';
export const DEFAULT_REVENUE_TARGET=Number(process.env.ULTRON_REVENUE_TARGET||2000000);
export const DEFAULT_HORIZON_DAYS=Math.max(1,Number(process.env.ULTRON_REVENUE_HORIZON_DAYS||60));

const agents=[
['ceo-orchestrator','CEO / Orchestrator Bot','executive',['read:all','assign:jobs','pause:experiments'],'verified_revenue_velocity'],
['opportunity-hunter','Opportunity Hunter Bot','discovery',['read:public-signals','write:opportunities'],'qualified_opportunities'],
['market-validation','Market Validation Bot','discovery',['read:opportunities','score:ideas'],'validation_pass_rate'],
['product-factory','Product Factory Bots','product',['read:validated-opportunities','write:products'],'products_ready'],
['offer-architect','Offer Architect Bot','product',['read:products','write:offers'],'offer_quality'],
['pricing','Pricing Bot','growth',['read:conversion','propose:pricing'],'contribution_margin'],
['website-factory','Website Factory Bot','growth',['read:offers','write:drafts'],'funnel_readiness'],
['conversion-optimization','Conversion Optimization Bot','growth',['read:analytics','propose:tests'],'conversion_rate'],
['prospect-discovery','Prospect Discovery Bot','sales',['read:icp','write:prospects'],'qualified_prospects'],
['prospect-intelligence','Prospect Intelligence Bot','sales',['read:prospects','write:research'],'actionable_prospect_insights'],
['personalization','Personalization Bot','sales',['read:research','write:copy'],'personalized_messages'],
['outbound-sales','Outbound Sales Bot','sales',['read:approved-copy','send:approved-outreach'],'positive_reply_rate'],
['inbound-lead','Inbound Lead Bot','sales',['read:leads','route:leads'],'qualified_inbound_rate'],
['ai-sales-rep','AI Sales Representative','sales',['read:offers','write:proposals','escalate:commitments'],'checkout_conversion'],
['crm-manager','CRM Manager Bot','sales',['read:crm','write:crm'],'pipeline_hygiene'],
['follow-up','Follow-Up Bot','sales',['read:crm','send:approved-followup'],'followup_conversion'],
['payment-verification','Payment Verification Bot','commerce',['read:payments','verify:payments'],'verified_payment_accuracy'],
['order-router','Order Router Bot','commerce',['read:verified-orders','route:fulfillment'],'routing_success'],
['fulfillment-manager','Fulfillment Manager Bot','delivery',['read:orders','assign:fulfillment'],'on_time_delivery'],
['quality-control','Quality-Control Bot','delivery',['read:deliverables','approve:quality'],'qa_pass_rate'],
['customer-success','Customer Success Bot','retention',['read:customers','write:support'],'customer_resolution_rate'],
['retention','Retention Bot','retention',['read:customers','propose:renewals'],'retention_rate'],
['referral','Referral Bot','retention',['read:satisfied-customers','request:referrals'],'referral_rate'],
['content-factory','Content Factory Bots','content',['read:offers','write:content'],'content_output'],
['distribution-manager','Distribution Manager Bot','content',['read:content','publish:approved-content'],'qualified_traffic'],
['seo','SEO Bot','content',['read:search-performance','write:seo-drafts'],'organic_conversions'],
['advertising-research','Advertising Research Bot','growth',['read:market','write:ad-plans'],'predicted_unit_economics'],
['ad-optimization','Ad Optimization Bot','growth',['read:ad-performance','adjust:within-approved-budget'],'roas'],
['creative-testing','Creative Testing Bot','growth',['read:creative','write:variants'],'creative_win_rate'],
['financial-controller','Financial Controller Bot','finance',['read:ledger','write:financial-summary'],'ledger_accuracy'],
['profitability','Profitability Bot','finance',['read:ledger','score:profitability'],'contribution_profit'],
['cash-allocation','Cash Allocation Bot','finance',['read:profit','propose:allocation'],'capital_efficiency'],
['fraud-risk','Fraud / Risk Bot','risk',['read:orders','flag:risk'],'loss_prevention'],
['compliance','Compliance Bot','risk',['read:outbound','block:noncompliant'],'compliance_pass_rate'],
['security-supervisor','Security Supervisor Bot','risk',['read:security-events','pause:unsafe-workflows'],'security_incidents'],
['credential-vault','Credential Vault / Permission System','platform',['enforce:least-privilege'],'permission_violations'],
['approval-gateway','Approval-Gateway Bot','platform',['gate:high-impact-actions'],'approval_integrity'],
['agent-auditor','Agent Auditor Bot','platform',['read:agent-runs','flag:agent-failures'],'agent_accuracy'],
['evidence','Evidence Bot','platform',['read:completions','require:evidence'],'evidence_coverage'],
['experiment-manager','Experiment Manager Bot','growth',['read:metrics','start:low-risk-tests','stop:losers'],'experiment_velocity'],
['winner-replication','Winner Replication Bot','growth',['read:winners','propose:replication'],'winner_scale_rate'],
['failure-analysis','Failure Analysis Bot','platform',['read:failures','write:root-cause'],'root_cause_resolution'],
['knowledge-graph','Knowledge Graph / Shared Memory','platform',['read:approved-data','write:knowledge'],'knowledge_reuse'],
['event-bus','Event Bus','platform',['emit:events','route:events'],'event_delivery'],
['job-queue','Job Queue','platform',['enqueue:jobs','retry:jobs'],'job_completion'],
['revenue-attribution','Revenue Attribution Engine','finance',['read:touchpoints','write:attribution'],'attributed_revenue'],
['executive-dashboard','Executive Dashboard','executive',['read:metrics'],'decision_latency'],
['daily-planning','Daily Autonomous Planning Cycle','executive',['read:metrics','assign:daily-plan'],'plan_completion'],
['continuous-improvement','Continuous Improvement Cycle','platform',['read:outcomes','write:lessons'],'cycle_improvement'],
['emergency-stop','Emergency Stop System','risk',['pause:high-impact-actions'],'stop_response_time']
].map(([id,name,department,permissions,kpi])=>({id,name,department,permissions,kpi,status:'ACTIVE'}));

const highImpact=new Set(['spend_money','move_funds','real_trade','sign_contract','change_bank','publish_claim','send_bulk_outreach','change_credentials']);
const initial=()=>({
 version:AUTONOMY_VERSION,
 createdAt:new Date().toISOString(),
 updatedAt:new Date().toISOString(),
 goal:{revenueTarget:DEFAULT_REVENUE_TARGET,horizonDays:DEFAULT_HORIZON_DAYS,currency:'USD'},
 emergencyStop:false,
 metrics:{verifiedRevenue:0,verifiedOrders:0,refunds:0,grossMarginEstimate:0,openJobs:0,failedJobs:0,activeExperiments:0,approvalPending:0,evidenceCoverage:100},
 dailyPlan:[],
 opportunities:[],
 experiments:[],
 jobs:[],
 events:[],
 approvals:[],
 evidence:[],
 knowledge:[],
 agentRuns:[],
 lastCycleAt:null,
 lastDailyPlanDate:null,
 cycleCount:0
});

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const money=n=>Math.round((Number(n)||0)*100)/100;
const now=()=>new Date().toISOString();
const uid=p=>p+'_'+crypto.randomUUID();
const pushBounded=(arr,item,max=500)=>{arr.push(item);if(arr.length>max)arr.splice(0,arr.length-max)};
const capturedOrders=(ledger={})=>Object.values(ledger.orders||{}).filter(o=>o&&o.status==='COMPLETED'&&Number(o.capturedAmount||o.amount||0)>0);
function scoreOpportunity(o){
 const demand=clamp(Number(o.demand||60),0,100),competition=clamp(Number(o.competition||50),0,100),urgency=clamp(Number(o.urgency||60),0,100),margin=clamp(Number(o.margin||70),0,100),delivery=clamp(Number(o.deliveryEase||70),0,100),access=clamp(Number(o.buyerAccess||50),0,100),cash=clamp(Number(o.timeToCash||60),0,100);
 const score=Math.round(demand*.22+(100-competition)*.12+urgency*.18+margin*.17+delivery*.10+access*.11+cash*.10);
 return {...o,demand,competition,urgency,margin,deliveryEase:delivery,buyerAccess:access,timeToCash:cash,score,validated:score>=65};
}
function defaultOpportunities(state){
 if(state.opportunities.length)return;
 const seeds=[
 {id:'opp_ai_lead_recovery',name:'AI lead-response recovery for local service businesses',demand:78,competition:57,urgency:86,margin:89,deliveryEase:82,buyerAccess:72,timeToCash:79,source:'existing ULTRON acquisition funnel'},
 {id:'opp_conversion_audit',name:'Website + lead conversion audit and implementation',demand:74,competition:61,urgency:75,margin:92,deliveryEase:90,buyerAccess:76,timeToCash:85,source:'existing ULTRON flagship offer'},
 {id:'opp_digital_ops',name:'AI workflow implementation packs for small businesses',demand:69,competition:64,urgency:68,margin:94,deliveryEase:88,buyerAccess:66,timeToCash:73,source:'existing ULTRON product factory'}
 ];
 state.opportunities=seeds.map(scoreOpportunity);
}
function emit(s,type,data={}){const e={id:uid('evt'),type,at:now(),data};pushBounded(s.events,e,1000);return e}
function evidence(s,kind,ref,detail={}){const e={id:uid('evd'),kind,ref,at:now(),detail};pushBounded(s.evidence,e,1000);return e}
function enqueue(s,agentId,type,payload={},priority=50,requiresApproval=false){
 const existing=s.jobs.find(j=>j.status==='QUEUED'&&j.type===type&&JSON.stringify(j.payload)===JSON.stringify(payload));
 if(existing)return existing;
 const j={id:uid('job'),agentId,type,payload,priority,requiresApproval,status:'QUEUED',attempts:0,createdAt:now(),updatedAt:now()};
 s.jobs.push(j);emit(s,'job.queued',{jobId:j.id,agentId,type});return j;
}
function requestApproval(s,action,detail={}){
 const existing=s.approvals.find(a=>a.status==='PENDING'&&a.action===action&&JSON.stringify(a.detail)===JSON.stringify(detail));
 if(existing)return existing;
 const a={id:uid('apr'),action,detail,status:'PENDING',createdAt:now()};s.approvals.push(a);emit(s,'approval.required',{approvalId:a.id,action});return a;
}
function addKnowledge(s,topic,fact,source='runtime'){
 const key=topic+'|'+fact; if(s.knowledge.some(k=>k.key===key))return;
 pushBounded(s.knowledge,{id:uid('kn'),key,topic,fact,source,at:now()},500);
}
function runJob(s,j){
 j.attempts++;j.updatedAt=now();
 if(s.emergencyStop && ['SEND_OUTREACH','PUBLISH','SPEND','REAL_TRADE','MOVE_FUNDS'].includes(j.type)){j.status='PAUSED';return}
 if(j.requiresApproval){const a=requestApproval(s,j.type,j.payload); if(a.status!=='APPROVED'){j.status='WAITING_APPROVAL';return}}
 j.status='COMPLETED';j.completedAt=now();
 evidence(s,'job_completion',j.id,{agentId:j.agentId,type:j.type});
 pushBounded(s.agentRuns,{id:uid('run'),agentId:j.agentId,jobId:j.id,status:'COMPLETED',at:now()},1000);
 emit(s,'job.completed',{jobId:j.id,agentId:j.agentId,type:j.type});
}
function buildDailyPlan(s){
 const revenue=s.metrics.verifiedRevenue,target=s.goal.revenueTarget,remaining=Math.max(0,target-revenue),days=Math.max(1,s.goal.horizonDays);
 const dailyTarget=money(remaining/days);
 const winners=s.opportunities.filter(o=>o.validated).sort((a,b)=>b.score-a.score).slice(0,3);
 s.dailyPlan=[
  {owner:'ceo-orchestrator',objective:'Verified revenue progress',target:dailyTarget,unit:'USD/day',priority:100},
  {owner:'prospect-discovery',objective:'Generate qualified prospects for validated offers',target:Math.max(10,Math.ceil(dailyTarget/100)),unit:'prospects',priority:90},
  {owner:'offer-architect',objective:'Keep validated offers checkout-ready',target:winners.length,unit:'offers',priority:85},
  {owner:'conversion-optimization',objective:'Run evidence-based funnel tests',target:2,unit:'experiments',priority:75},
  {owner:'financial-controller',objective:'Reconcile verified revenue and profitability',target:1,unit:'reconciliation',priority:80}
 ];
 s.lastDailyPlanDate=new Date().toISOString().slice(0,10);
 emit(s,'plan.created',{dailyTarget,winners:winners.map(x=>x.id)});
}
export function autonomyManifest(){
 return {name:'ULTRON Autonomous Company OS',version:AUTONOMY_VERSION,architecture:'goal -> CEO -> department managers -> specialists -> verification -> event bus -> measurement -> reallocation',revenueLoop:['discover demand','validate','build offer','build funnel','find buyers','sell','verify money','fulfill','QA','retain','measure profit','reinvest','repeat'],agents,highImpactActions:[...highImpact],safety:{realMoneyTrading:'APPROVAL_REQUIRED',fundMovement:'APPROVAL_REQUIRED',adSpend:'APPROVAL_REQUIRED_ABOVE_LIMIT',contracts:'APPROVAL_REQUIRED',bankChanges:'APPROVAL_REQUIRED',research:'AUTONOMOUS',drafting:'AUTONOMOUS',analysis:'AUTONOMOUS'}};
}
export async function autonomyState(){return getJson('autonomy-v12',initial())}
export async function runAutonomyCycle({ledger={},baseUrl=''}={}){
 return mutateJson('autonomy-v12',initial(),async s=>{
  s.version=AUTONOMY_VERSION;s.updatedAt=now();s.cycleCount=(s.cycleCount||0)+1;s.lastCycleAt=now();
  const orders=capturedOrders(ledger);
  s.metrics.verifiedRevenue=money(orders.reduce((a,o)=>a+Number(o.capturedAmount||o.amount||0),0));
  s.metrics.verifiedOrders=orders.length;
  s.metrics.refunds=Object.values(ledger.orders||{}).filter(o=>String(o?.status||'').includes('REFUND')).length;
  defaultOpportunities(s);
  for(const o of s.opportunities)Object.assign(o,scoreOpportunity(o));
  const today=new Date().toISOString().slice(0,10);if(s.lastDailyPlanDate!==today)buildDailyPlan(s);
  const top=s.opportunities.filter(o=>o.validated).sort((a,b)=>b.score-a.score)[0];
  if(top){
   enqueue(s,'product-factory','BUILD_PRODUCT_BLUEPRINT',{opportunityId:top.id},85);
   enqueue(s,'offer-architect','BUILD_OFFER',{opportunityId:top.id},88);
   enqueue(s,'website-factory','BUILD_FUNNEL_DRAFT',{opportunityId:top.id},80);
   enqueue(s,'prospect-discovery','BUILD_ICP_PROSPECT_PLAN',{opportunityId:top.id},82);
   enqueue(s,'advertising-research','MODEL_PAID_ACQUISITION',{opportunityId:top.id},55);
   addKnowledge(s,'winning-opportunity',top.name,top.source);
  }
  for(const o of s.opportunities.filter(o=>!o.validated))emit(s,'experiment.rejected',{opportunityId:o.id,score:o.score});
  const exp=s.experiments.find(e=>e.status==='ACTIVE');
  if(!exp&&top){const e={id:uid('exp'),name:'Offer/funnel test: '+top.name,opportunityId:top.id,status:'ACTIVE',successMetric:'verified_checkout_conversion',minimumEvidence:25,createdAt:now()};s.experiments.push(e);emit(s,'experiment.started',{experimentId:e.id})}
  const executable=s.jobs.filter(j=>j.status==='QUEUED').sort((a,b)=>b.priority-a.priority).slice(0,12);
  for(const j of executable)runJob(s,j);
  for(const j of s.jobs.filter(j=>j.status==='WAITING_APPROVAL')){const a=s.approvals.find(a=>a.action===j.type&&JSON.stringify(a.detail)===JSON.stringify(j.payload));if(a?.status==='APPROVED'){j.requiresApproval=false;j.status='QUEUED'}}
  s.metrics.openJobs=s.jobs.filter(j=>['QUEUED','WAITING_APPROVAL','PAUSED'].includes(j.status)).length;
  s.metrics.failedJobs=s.jobs.filter(j=>j.status==='FAILED').length;
  s.metrics.activeExperiments=s.experiments.filter(e=>e.status==='ACTIVE').length;
  s.metrics.approvalPending=s.approvals.filter(a=>a.status==='PENDING').length;
  const complete=s.jobs.filter(j=>j.status==='COMPLETED').length;s.metrics.evidenceCoverage=complete?Math.round(100*s.evidence.filter(e=>e.kind==='job_completion').length/complete):100;
  s.metrics.grossMarginEstimate=s.metrics.verifiedRevenue>0?clamp(85-s.metrics.refunds*2,0,100):0;
  evidence(s,'cycle',String(s.cycleCount),{verifiedRevenue:s.metrics.verifiedRevenue,verifiedOrders:s.metrics.verifiedOrders,baseUrl});
  return s;
 })
}
export async function setEmergencyStop(enabled,reason='owner command'){
 return mutateJson('autonomy-v12',initial(),s=>{s.emergencyStop=Boolean(enabled);s.updatedAt=now();emit(s,enabled?'emergency_stop.enabled':'emergency_stop.disabled',{reason});evidence(s,'owner_control','emergency-stop',{enabled:Boolean(enabled),reason})})
}
export async function recordApproval(id,decision,note=''){
 const d=String(decision||'').toUpperCase();if(!['APPROVED','REJECTED'].includes(d))throw Error('decision must be APPROVED or REJECTED');
 return mutateJson('autonomy-v12',initial(),s=>{const a=s.approvals.find(x=>x.id===id);if(!a)throw Error('approval not found');a.status=d;a.decidedAt=now();a.note=String(note||'');emit(s,'approval.decided',{approvalId:id,decision:d});evidence(s,'approval',id,{decision:d})})
}
export async function ingestOpportunity(input={}){
 return mutateJson('autonomy-v12',initial(),s=>{const o=scoreOpportunity({id:String(input.id||uid('opp')),name:String(input.name||'Unnamed opportunity'),demand:input.demand,competition:input.competition,urgency:input.urgency,margin:input.margin,deliveryEase:input.deliveryEase,buyerAccess:input.buyerAccess,timeToCash:input.timeToCash,source:String(input.source||'owner/runtime')});s.opportunities=s.opportunities.filter(x=>x.id!==o.id);s.opportunities.push(o);emit(s,'opportunity.ingested',{opportunityId:o.id,score:o.score,validated:o.validated});return o})
}
export async function executiveDashboard(){
 const s=await autonomyState();const target=Number(s.goal?.revenueTarget||0),rev=Number(s.metrics?.verifiedRevenue||0);
 return {version:s.version,goal:s.goal,progress:{verifiedRevenue:rev,target,percent:target?money(100*rev/target):0,remaining:money(Math.max(0,target-rev))},metrics:s.metrics,emergencyStop:s.emergencyStop,dailyPlan:s.dailyPlan,topOpportunities:[...s.opportunities].sort((a,b)=>b.score-a.score).slice(0,5),activeExperiments:s.experiments.filter(e=>e.status==='ACTIVE'),pendingApprovals:s.approvals.filter(a=>a.status==='PENDING'),recentEvidence:s.evidence.slice(-20).reverse(),recentEvents:s.events.slice(-30).reverse(),agentCount:agents.length,agentsByDepartment:agents.reduce((a,x)=>(a[x.department]=(a[x.department]||0)+1,a),{})};
}
