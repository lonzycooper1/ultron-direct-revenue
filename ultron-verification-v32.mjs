/** ULTRON v32: bounded, evidence-first business Verification Agent. */
import {createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {resilienceDetail,DEPARTMENTS} from './ultron-resilience-v31.mjs';
import {agentOfAgentsState} from './agent-of-agents.mjs';
import {growthState} from './ultron-growth-runtime-v19.mjs';
import {ledger} from './ledger-store.mjs';
const KEY='ultron-verification-v32',now=()=>new Date().toISOString();
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const VERIFIER_VERSION='32.0.0';
export const OWNER_MISSION=Object.freeze({
 role:'Owner and Editor-in-Chief; never impersonate owner or provider',
 purpose:'Build ULTRON/JARVIS into one resilient AI-assisted company creating genuine value for real customers and generating independently verified revenue.',
 goals:['First verified external paying customer and quality-controlled fulfillment','Repeatable profitable revenue before arbitrary product or agent counts','Long-term aspirational $1 trillion cumulative external customer revenue, never a forecast','24/7 monitored business operation with minimal owner burden'],
 offer:{free:'Voluntary response-gap scan',auditUsd:500,miniUsd:99,upgradeUsd:[2500,7500,10000],monthlyServiceUsd:1500},
 priorities:['Deliver genuine paid work','Respond to interested opted-in buyers','Repair broken integrations','Find attributable public buyer problems','Prepare truthful demos and proposals','Inspect operations and verify improvements'],
 rules:['No fake customers, fake sales, fake testimonials or guaranteed earnings','No identity impersonation or MFA/OTP bypass','No provider-restriction bypass','No public sends, spend, publishing, trading, refunds, transfers, contracts or subscriptions without scoped owner authorization','No ChatGPT OAuth assumed to transfer to Railway','No unchecked approval when owner is absent','No sensitive personal details in public source code'],
 privacy:'Use only owner-approved non-sensitive business instructions; never ingest all personal history or identity documents by default',
 unavailable:'Continue verified read-only operations, draft and triage; queue consequential requests for owner'
});
export const ACTION_AUTHORITY=Object.freeze({
 auto:['read-only audit','agent heartbeat check','internal task evidence verification','internal draft quality review','approval triage','issue categorization and owner notification'],
 owner:['identity and account verification','passwords, OTP or MFA','authorization changes','payments or refunds','customer sends','ads or other spending','live trades','banking and payouts','contracts and credit','paid plan upgrade','public publishing']
});
export function classifyAction(action=''){
 const a=String(action).toLowerCase().slice(0,250);
 if(/(?:kyc|identity|mfa|2fa|otp|verification code|password|captcha|biometric)/.test(a))return {permission:'OWNER_ONLY',reason:'Security or identity verification cannot be delegated to this agent'};
 if(/(?:send|email|customer contact|publish|advertis|spend|budget|contract|refund|wire|transfer|payout|withdraw|trade|loan|credit|billing|plan upgrade|oauth|credential|permission)/.test(a))return {permission:'OWNER_APPROVAL_REQUIRED',reason:'Consequential external action'};
 if(/(?:read|review|audit|verify|inspect|draft|triage|analy|monitor|research|test|compare|score|reconcile)/.test(a))return {permission:'AUTO_INTERNAL_ONLY',reason:'Internal, bounded, read-only action'};
 return {permission:'REVIEW_REQUIRED',reason:'Unknown intent is not preauthorized'};
}
const base=()=>({version:VERIFIER_VERSION,createdAt:now(),cycles:0,lastRun:null,status:'NOT_STARTED',checks:[],history:[],lastFingerprint:null,lastError:null,
 ownerBusinessProfile:{focus:'First verified unrelated paying buyer',instructions:'Only safe internal verification while unreachable',escalation:'Queue owner-required decisions'}});
const c=(id,status,why,source,data={})=>({id,status,why,source,data});
export function evaluate({supervisor={},commerce={},growth={},ledgerOrders=[],env={},payment={}}={}){
 const age=Math.round((Date.now()-Date.parse(supervisor.lastHeartbeat||''))/60000);
 const jobs=Object.values(supervisor.jobs||{});
 const finished=jobs.filter(x=>x.status==='COMPLETE');
 const certified=finished.filter(x=>x.verification?.status==='PASSED'&&x.verification.reviewer===x.reviewer&&x.owner!==x.reviewer);
 const pending=(commerce.approvals||[]).filter(x=>x.status==='pending');
 const orders=ledgerOrders.filter(x=>x.captureId&&x.capturedAt);
 const paymentVerified=payment.ok===true&&payment.apiAuthorized===true&&payment.webhookEndpointVerified===true&&payment.captureEventsSubscribed===true;
 const configured=keys=>keys.every(k=>Boolean(env[k]));
 const check=[
 c('SUPERVISOR_HEARTBEAT',Number.isFinite(age)&&age>=0&&age<=20?'VERIFIED':'STALE_OR_MISSING','Last durable supervisor heartbeat age '+(Number.isFinite(age)?age:'unknown')+' minutes','ultron-resilience-v31'),
 c('REVIEW_COVERAGE',certified.length>0?'INTERNAL_CHECKS_RECORDED':'NOT_VERIFIED',certified.length+' of '+finished.length+' completed jobs have a separate review role; this is schema/evidence checking, not a second model','ultron-resilience-v31'),
 c('OWNER_APPROVALS',pending.length?'OWNER_ACTION_REQUIRED':'CLEAR',pending.length+' consequential commerce approvals pending; never auto-decide','agent-of-agents-v2',{pending:pending.length}),
 c('CAPTURE_EVIDENCE',orders.length?'INDEPENDENT_CONFIRMATION_REQUIRED':'NO_VERIFIED_EXTERNAL_CUSTOMER',orders.length+' recorded ledger captures; internal entries alone do not establish an independent payer or settled funds','order-ledger',{recordedCaptures:orders.length}),
 c('PAYPAL_RUNTIME',paymentVerified?'VERIFIED_PROVIDER_CONFIG':'NOT_VERIFIED',paymentVerified?'Production API/webhook verified; not proof of any sale':'Current provider connection not independently verified in this cycle','payment-runtime'),
 c('DISCOVERY_SOURCE',configured(['ULTRON_DISCOVERY_FEED_URL'])||configured(['ULTRON_DISCOVERY_FALLBACK_URL'])?'CONFIGURED_NOT_BUYER_PROOF':'OWNER_ACTION_REQUIRED','Feed presence does not establish buyer intent or permission','railway-env'),
 c('GMAIL_SENDING',configured(['ULTRON_GMAIL_CLIENT_ID','ULTRON_GMAIL_CLIENT_SECRET','ULTRON_GMAIL_REFRESH_TOKEN','ULTRON_BUSINESS_POSTAL_ADDRESS','ULTRON_UNSUBSCRIBE_SECRET'])?'CONFIGURED_SEND_TEST_REQUIRED':'OWNER_ACTION_REQUIRED','Railway-specific OAuth, valid mailing address and scoped send authorization required','railway-env'),
 c('HUBSPOT_RUNTIME',configured(['ULTRON_HUBSPOT_PRIVATE_APP_TOKEN'])?'CONFIGURED_CRM_TEST_REQUIRED':'OWNER_ACTION_REQUIRED','ChatGPT HubSpot connector is not Railway runtime authorization','railway-env'),
 c('HUNTER','EXTERNAL_ACCOUNT_RESTRICTED','Provider restriction needs owner or provider restoration, not bypass','last-provider-check'),
 c('SHOPIFY','PLAN_UPGRADE_NOT_VERIFIED','Shopify trial upgrade and actual purchase need independent verification','last-connected-Shopify-check'),
 c('PROSPECT_CLASSIFICATION','NO_BUYER_PROOF',Object.keys(growth.prospects||{}).length+' researched business records are candidates, not verified buying customers','growth-v19')
 ];
 return check;
}
export function publicVerifier(state={}){
 return {version:VERIFIER_VERSION,identity:'ULTRON Business Verification Agent',lastRun:state.lastRun||null,cycles:state.cycles||0,status:state.status||'NOT_STARTED',
 checks:(state.checks||[]).map(x=>({id:x.id,status:x.status,why:x.why})),
 businessScope:'business operating mission only; no personal secrets or identity authority',
 note:'Read-only autonomous verifier; some external integrations and real customer purchases still require account owner or customer.'};
}
export const verifierState=()=>getJson(KEY,base());
export async function updateOwnerBusinessProfile(change={}){
 if(!change||typeof change!=='object'||Array.isArray(change))throw Error('Business profile fields required');
 const allowed=['focus','instructions','escalation'],next={};
 for(const k of allowed)if(Object.hasOwn(change,k)){
  if(typeof change[k]!=='string'||change[k].length>600)throw Error('Short business-only text required');
  if(/(?:sk-[A-Za-z0-9_-]{15,}|\d{3}-\d{2}-\d{4}|password\s*[:=]|api.?key\s*[:=])/i.test(change[k]))throw Error('Do not store secrets or identity data');
  next[k]=change[k].trim();
 }
 if(!Object.keys(next).length)throw Error('No supported fields');
 const s=await mutateJson(KEY,base(),x=>{x.ownerBusinessProfile={...x.ownerBusinessProfile,...next};
  x.history.unshift({at:now(),event:'business_profile_updated',evidenceHash:digest(next)});x.history=x.history.slice(0,70)});
 return {ok:true,profile:s.ownerBusinessProfile};
}
export async function verificationCycle(payment={}){
 try{
  const [supervisor,commerce,growth,l]=await Promise.all([resilienceDetail(),agentOfAgentsState(),growthState(),ledger()]);
  const checks=evaluate({supervisor,commerce,growth,ledgerOrders:Object.values(l.orders||{}),env:process.env,payment});
  const degraded=checks.some(x=>x.status==='STALE_OR_MISSING');
  const status=degraded?'DEGRADED':checks.some(x=>x.status==='OWNER_ACTION_REQUIRED')?'OWNER_ACTIONS_PENDING':'MONITORING';
  const fp=digest(checks.map(x=>[x.id,x.status,x.data?.pending||0]));
  const state=await mutateJson(KEY,base(),s=>{s.lastRun=now();s.cycles++;s.status=status;s.checks=checks;s.lastError=null;
   if(s.lastFingerprint!==fp){s.lastFingerprint=fp;s.history.unshift({at:s.lastRun,event:'verification_state_changed',evidenceHash:fp});s.history=s.history.slice(0,70)}});
  return {ok:true,cycle:state.cycles,status,checks:checks.length};
 }catch(e){const error=String(e?.message||e).slice(0,200);try{await mutateJson(KEY,base(),s=>{s.status='DEGRADED';s.lastError={at:now(),error}})}catch{}return {ok:false,error}}
}
export async function startVerificationLoop(provider){
 const run=()=>verificationCycle(typeof provider==='function'?provider():provider||{});
 const first=await run();const interval=setInterval(()=>run().then(r=>{if(!r.ok)console.error('ULTRON verifier',r.error)}).catch(e=>console.error('ULTRON verifier exception',String(e))),5*60000);
 interval.unref?.();return {started:true,everyMinutes:5,first};
}
