/**
 * ULTRON v31 resilient operations supervisor.
 * "Clones" are independent reviewer roles, not claims of extra model IQ.
 * No unattended payment, email, publication, legal action or trading.
 */
import crypto from 'node:crypto';
import {getJson, mutateJson} from './state-store.mjs';
import {discoveryFallback} from './ultron-sales-v22.mjs';
import {growthState} from './ultron-growth-runtime-v19.mjs';
import {agentOfAgentsState} from './agent-of-agents.mjs';
import {inboundWorkQueue} from './ultron-inbound-ops-v28.mjs';
import {ledger} from './ledger-store.mjs';

export const RESILIENCE_VERSION='31.0.0';
const KEY='ultron-resilience-v31';
const MAX_JOBS=350, MAX_EVENTS=150, LEASE_MS=120000;
const now=()=>new Date().toISOString();
const clean=(v,n=240)=>String(v??'').slice(0,n);
export const DEPARTMENTS=Object.freeze({
 acquisition:{manager:'AcquisitionManager',worker:'ProspectResearchAgent',reviewer:'ProspectResearchReviewer',backup:'ConversionResearchAgent'},
 conversion:{manager:'ConversionManager',worker:'DemoProposalAgent',reviewer:'DemoProposalReviewer',backup:'CustomerSuccessAgent'},
 commerce:{manager:'CommerceManager',worker:'StoreBuilderAgent',reviewer:'StoreBuilderReviewer',backup:'ContentQualityAgent'},
 fulfillment:{manager:'FulfillmentManager',worker:'DeliveryAgent',reviewer:'DeliveryQualityReviewer',backup:'CustomerSuccessAgent'},
 payments:{manager:'PaymentsManager',worker:'ReconciliationAgent',reviewer:'ReconciliationReviewer',backup:'FinanceResearchAgent'},
 customer:{manager:'CustomerSuccessManager',worker:'CustomerSupportAgent',reviewer:'CustomerSupportReviewer',backup:'FulfillmentAgent'},
 engineering:{manager:'EngineeringManager',worker:'CodeQualityAgent',reviewer:'IndependentCodeReviewer',backup:'InfrastructureAgent'},
 infrastructure:{manager:'InfrastructureManager',worker:'ServiceHealthAgent',reviewer:'ReliabilityReviewer',backup:'EngineeringAgent'},
 integrations:{manager:'IntegrationsManager',worker:'ProviderStatusAgent',reviewer:'AuthorizationReviewer',backup:'InfrastructureAgent'},
 finance:{manager:'FinanceManager',worker:'EvidenceAccountingAgent',reviewer:'AccountingQualityReviewer',backup:'ReconciliationAgent'},
 security:{manager:'SecurityManager',worker:'PolicyAuditAgent',reviewer:'SecurityReviewAgent',backup:'ComplianceAgent'},
 compliance:{manager:'ComplianceManager',worker:'PrivacyPolicyAgent',reviewer:'ComplianceReviewer',backup:'SecurityAgent'}
});
export const ACTION_POLICY=Object.freeze({
 allowed:['health monitoring','public/authorized prospect research','CRM read','drafts','quality review','idempotent evidence reconciliation','retrying harmless reads','internal reassignment'],
 ownerRequired:['outbound message sending','publication','paid advertising','contracts','refunds','money movement','credentials and OAuth','trades','credit applications','plan purchases'],
 never:['fake customers','fake sales','self-payments as revenue','bypassing restricted providers','fabricated agent work','claiming configured integrations are functioning']
});
const base=()=>({
 version:RESILIENCE_VERSION,createdAt:now(),lastHeartbeat:null,cycle:0,
 jobs:{},events:[],latest:{},lastError:null,
 mode:'CONTINUOUS_SUPERVISION_WITH_OWNER_GATES',
 departmentNames:Object.keys(DEPARTMENTS)
});
const event=(s,type,data={})=>{s.events.unshift({at:now(),type,data});s.events=s.events.slice(0,MAX_EVENTS)};
export function computeGates(env={}, data={}){
 const exists=k=>Boolean(env[k]);
 const gate=(ok,next)=>({status:ok?'CONFIGURED_NEEDS_END_TO_END_TEST':'OWNER_ACTION_REQUIRED',next});
 return {
 discovery:gate(exists('ULTRON_DISCOVERY_FEED_URL')||exists('ULTRON_DISCOVERY_FALLBACK_URL'),'Provide an authorized external discovery feed or use owned first-party diagnostic traffic'),
 gmail:gate(['ULTRON_GMAIL_CLIENT_ID','ULTRON_GMAIL_CLIENT_SECRET','ULTRON_GMAIL_REFRESH_TOKEN','ULTRON_BUSINESS_POSTAL_ADDRESS','ULTRON_UNSUBSCRIBE_SECRET'].every(exists),'Authorize Railway Gmail OAuth and business postal address; sending requires a scoped approved campaign'),
 hunter:{status:'RESTRICTED_EXTERNALLY',next:'Restore Hunter account through provider; never bypass restriction'},
 shopify:{status:'TRIAL_UPGRADE_OWNER_REQUIRED',next:'Upgrade Shopify with account owner billing approval, or sell via independent PayPal service page'},
 hubspot:gate(exists('ULTRON_HUBSPOT_PRIVATE_APP_TOKEN'),'Authorize HubSpot private app for Railway; ChatGPT connector permissions do not transfer'),
 calendar:gate(['ULTRON_GOOGLE_CLIENT_ID','ULTRON_GOOGLE_CLIENT_SECRET','ULTRON_CALENDAR_REFRESH_TOKEN','ULTRON_CALENDAR_ID'].every(exists),'Authorize Calendar separately for Railway'),
 paypal:{status: ['PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_WEBHOOK_ID'].every(exists)?'CREDENTIALS_CONFIGURED_VERIFY_PROVIDER':'CONFIGURATION_MISSING',next:'Require signed provider capture, webhook, fulfillment and bank settlement evidence for each sale'},
 approvals:{status:Number(data.pendingApprovals)>0?'OWNER_DECISION_REQUIRED':'NO_COMMERCE_APPROVAL_PENDING',count:Number(data.pendingApprovals)||0,next:'Review scope, recipients, publishing, budgets and refunds individually in Owner Action Center'},
 buyers:{status:Number(data.paidOrders)>0?'VERIFY_INDEPENDENT_CUSTOMER':'NO_VERIFIED_PAID_ORDER',count:Number(data.paidOrders)||0,next:'Run legitimate buyer acquisition; cannot manufacture a customer or order'}
 };
}
export function jobPlan(at=new Date()){
 const day=at.toISOString().slice(0,10),hour=at.toISOString().slice(0,13);
 return [
  {id:'health:'+hour,kind:'HEALTH',department:'infrastructure',priority:65},
  {id:'sales-truth:'+hour,kind:'SALES_TRUTH',department:'payments',priority:95},
  {id:'approval-triage:'+hour,kind:'APPROVAL_TRIAGE',department:'compliance',priority:90},
  {id:'discovery:'+day,kind:'DISCOVERY',department:'acquisition',priority:80},
  ...Object.keys(DEPARTMENTS).map(department=>({id:'pulse:'+day+':'+Math.floor(at.getUTCHours()/6)+':'+department,kind:'DEPARTMENT_PULSE',department,priority:35}))
 ];
}
export function reassignJob(job,at=Date.now()){
 if(job.status!=='RUNNING'||Number(job.leaseExpiresAt)>at)return job;
 const dept=DEPARTMENTS[job.department]||DEPARTMENTS.infrastructure;
 const attempts=(job.attempts||0)+1;
 return {...job,attempts,owner:attempts===1?dept.backup:dept.reviewer,
  status:attempts>=3?'BLOCKED':'QUEUED',leaseExpiresAt:null,leaseId:null,
  lastError:attempts>=3?'Repeated worker timeout; escalate to owner':'Worker lease expired; backup or reviewer assigned'};
}
export function reviewResult(kind,result){
 if(!result||typeof result!=='object')return {ok:false,why:'Missing execution evidence'};
 if(kind==='HEALTH')return {ok:Number.isFinite(result.prospectCandidates)&&Number.isFinite(result.consentRequests),why:'Read-only monitoring results'};
 if(kind==='SALES_TRUTH')return {ok:Number.isFinite(result.paidOrders)&&Number.isFinite(result.revenueUsd),why:'Ledger result cannot be treated as bank settlement'};
 if(kind==='APPROVAL_TRIAGE')return {ok:Number.isFinite(result.pendingApprovals),why:'Owner-only approvals must not be auto-decided'};
 if(kind==='DISCOVERY')return {ok:typeof result.status==='string',why:'Feed results are candidates, not verified buyers'};
 if(kind==='DEPARTMENT_PULSE')return {ok:Boolean(DEPARTMENTS[result.department])&&result.manager===DEPARTMENTS[result.department].manager&&Number.isFinite(result.paidOrders)&&Number.isFinite(result.prospectCandidates),why:'Manager pulse is a read-only evidence check, not model execution'};
 return {ok:false,why:'Unrecognized action'};
}
export function publicStatus(state={}){
 const jobs=Object.values(state.jobs||{});
 const byStatus={};for(const j of jobs)byStatus[j.status]=(byStatus[j.status]||0)+1;
 const s=state.latest||{},g=s.gates||{};
 return {version:RESILIENCE_VERSION,mode:'BOUNDED_AUTOMATION_NOT_HUMAN_OR_CONSCIOUS',
  lastHeartbeat:state.lastHeartbeat||null,cycles:state.cycle||0,
  departments:Object.keys(DEPARTMENTS).length,workerSlots:Object.keys(DEPARTMENTS).length,
  independentReviewers:Object.keys(DEPARTMENTS).length,jobCounts:byStatus,
  verifiedOrders:Number(s.paidOrders)||0,verifiedRevenueUsd:Number(s.revenueUsd)||0,
  source:s.source||'UNVERIFIED',gateStatus:Object.fromEntries(Object.entries(g).map(([k,v])=>[k,v.status])),
  discovery:s.discovery||null,updatedAt:s.at||null,
  note:'Supervision means scheduled deterministic checks and bounded execution, not 24/7 LLM inference or guaranteed sales.'};
}
async function inspect(){
 const [growth,commerce,inbound,sales]=await Promise.all([growthState(),agentOfAgentsState(),inboundWorkQueue(1),ledger()]);
 const orders=Object.values(sales.orders||{}).filter(o=>o.captureId&&o.capturedAt);
 const revenueUsd=+orders.reduce((a,o)=>a+Number(o.capturedAmount??o.amount??0),0).toFixed(2);
 const pendingApprovals=(commerce.approvals||[]).filter(x=>x.status==='pending').length;
 return {at:now(),source:'durable_store_and_runtime_names',paidOrders:orders.length,revenueUsd,pendingApprovals,
  prospectCandidates:Object.keys(growth.prospects||{}).length,
  consentRequests:inbound.consentedOpen||0,gates:computeGates(process.env,{paidOrders:orders.length,pendingApprovals})};
}
async function execute(kind,department){
 if(kind==='DEPARTMENT_PULSE'){
  const x=await inspect(),d=DEPARTMENTS[department];if(!d)throw Error('unknown department');
  return {department,manager:d.manager,at:x.at,paidOrders:x.paidOrders,prospectCandidates:x.prospectCandidates,pendingApprovals:x.pendingApprovals,externalActions:0};
 }
 if(kind==='DISCOVERY'){
  if(!process.env.ULTRON_DISCOVERY_FEED_URL&&!process.env.ULTRON_DISCOVERY_FALLBACK_URL)
   return {status:'BLOCKED_NO_AUTHORIZED_FEED',imported:0};
  return discoveryFallback();
 }
 const x=await inspect();
 if(kind==='SALES_TRUTH')return {paidOrders:x.paidOrders,revenueUsd:x.revenueUsd};
 if(kind==='HEALTH')return {prospectCandidates:x.prospectCandidates,consentRequests:x.consentRequests};
 if(kind==='APPROVAL_TRIAGE')return {pendingApprovals:x.pendingApprovals};
 throw Error('Unknown executor');
}
async function leaseNext(){
 let picked=null;
 await mutateJson(KEY,base(),s=>{
  for(const job of Object.values(s.jobs))Object.assign(job,reassignJob(job));
  for(const item of jobPlan()){
   if(s.jobs[item.id])continue;
   const dept=DEPARTMENTS[item.department];
   s.jobs[item.id]={...item,manager:dept.manager,owner:dept.worker,reviewer:dept.reviewer,
    status:'QUEUED',attempts:0,queuedAt:now(),leaseExpiresAt:null,leaseId:null};
  }
  const all=Object.values(s.jobs);
  all.sort((a,b)=>b.priority-a.priority||a.queuedAt.localeCompare(b.queuedAt));
  const job=all.find(j=>j.status==='QUEUED'&&(!j.retryAfter||Date.parse(j.retryAfter)<=Date.now()));
  if(job){
   const leaseId=crypto.randomUUID();
   Object.assign(job,{status:'RUNNING',startedAt:now(),leaseId,leaseExpiresAt:Date.now()+LEASE_MS});
   picked={id:job.id,kind:job.kind,department:job.department,leaseId,reviewer:job.reviewer,owner:job.owner};
  }
  if(all.length>MAX_JOBS){
   const removable=all.filter(j=>['COMPLETE','BLOCKED'].includes(j.status)).sort((a,b)=>a.queuedAt.localeCompare(b.queuedAt));
   for(const j of removable.slice(0,all.length-MAX_JOBS))delete s.jobs[j.id];
  }
 });
 return picked;
}
async function settle(job,result,error){
 await mutateJson(KEY,base(),s=>{
  const x=s.jobs[job.id];if(!x||x.leaseId!==job.leaseId)return;
  const reviewer=reviewResult(job.kind,result);
  x.attempts=(x.attempts||0)+1;x.leaseExpiresAt=null;x.leaseId=null;
  if(!error&&reviewer.ok){
   x.status=job.kind==='DISCOVERY'&&/^(BLOCKED_|NO_|ERROR)/.test(String(result?.status||''))?'BLOCKED':'COMPLETE';
   x.finishedAt=now();x.evidence=result;
   x.verification={reviewer:job.reviewer,check:'shape_and_source_validation',status:'PASSED',at:now()};
  }else{
   const dept=DEPARTMENTS[x.department];
   x.status=x.attempts>=3?'BLOCKED':'QUEUED';x.owner=dept.backup;
   x.lastError=clean(error||reviewer.why);
   x.retryAfter=new Date(Date.now()+Math.min(3600000,60000*2**x.attempts)).toISOString();
   event(s,'job.failure',{id:x.id,reason:x.lastError});
  }
 });
}
export async function supervisionCycle(){
 const started=Date.now();let completed=0;
 try {
  const snapshot=await inspect();
  await mutateJson(KEY,base(),s=>{s.lastHeartbeat=now();s.cycle++;s.latest={...snapshot,discovery:s.latest?.discovery||null};event(s,'heartbeat',{paidOrders:snapshot.paidOrders,pendingApprovals:snapshot.pendingApprovals});});
  for(let n=0;n<4&&Date.now()-started<45000;n++){
   const j=await leaseNext();if(!j)break;
   let result=null,error=null;
   try{result=await execute(j.kind,j.department)}catch(e){error=clean(e?.message||e)}
   await settle(j,result,error);
   if(j.kind==='DISCOVERY')await mutateJson(KEY,base(),s=>{s.latest.discovery=result||{status:'ERROR'};});
   completed++;
  }
  return {ok:true,processed:completed,public:publicStatus(await getJson(KEY,base()))};
 } catch(e){
  const message=clean(e?.message||e);
  try{await mutateJson(KEY,base(),s=>{s.lastError={at:now(),message};event(s,'supervisor.error',{message});})}catch{}
  return {ok:false,error:message};
 }
}
export const resilienceDetail=()=>getJson(KEY,base());
export async function startResilienceLoop(){
 await supervisionCycle();
 const t=setInterval(()=>supervisionCycle().then(x=>{if(!x.ok)console.error('ULTRON resilience',x.error)}).catch(e=>console.error('ULTRON resilience unexpected',String(e))),5*60000);
 t.unref?.();
 return {started:true,everyMinutes:5};
}
