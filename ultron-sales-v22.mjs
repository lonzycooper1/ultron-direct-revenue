import {getJson,mutateJson} from './state-store.mjs';
import {growthState,importProspects,prepareSales,safeWebsite} from './ultron-growth-runtime-v19.mjs';
import {integrationSummary} from './ultron-integration-v21.mjs';
import {ledger} from './ledger-store.mjs';
const KEY='ultron-sales-v22',now=()=>new Date().toISOString();
const seed=()=>({runs:{},deliveries:{},acceptances:{},campaigns:{},signals:{},lastCycle:null});
const read=()=>getJson(KEY,seed());
async function save(fn){let result;await mutateJson(KEY,seed(),s=>{result=fn(s)});return result}
export function scoreEvidence(x={}){
 let site=false;try{site=new URL(x.sourceUrl).protocol==='https:'}catch{}
 const recent=Number.isFinite(Date.parse(x.postedAt))&&Date.now()-Date.parse(x.postedAt)<45*86400000&&Date.parse(x.postedAt)<=Date.now();
 const text=String(x.publicRequest||'');
 const intent=/(looking for|we need|seeking|request for proposal|hiring)/i.test(text);
 const fit=/(website|booking|lead|appointment|automation|marketing)/i.test(text);
 const score=(site?20:0)+(recent?20:0)+(intent?30:0)+(fit?30:0);
 return {score:site&&recent&&intent&&fit?score:Math.min(39,score),
 status:site&&recent&&intent&&fit?'EVIDENCED_CANDIDATE':'INSUFFICIENT_EVIDENCE',verifiedBuyer:false};
}
export function workPriority({paid=0,interested=0,sales=0}={}){
 if(paid)return {next:'COMPLETE_PAID_DELIVERY',weights:{fulfillment:60,conversion:20,acquisition:10,retention:5,finance:5}};
 if(interested)return {next:'ANSWER_BUYER',weights:{fulfillment:10,conversion:60,acquisition:20,retention:5,finance:5}};
 if(!sales)return {next:'FIRST_VERIFIED_SALE',weights:{fulfillment:0,conversion:25,acquisition:65,retention:0,finance:10}};
 return {next:'RETAIN_CUSTOMERS',weights:{fulfillment:10,conversion:30,acquisition:20,retention:35,finance:5}};
}
export function sendPolicy({domain,oauth,bounces=0,complaints=0,unsubscribeCleared=false}={}){
 const problems=[];if(!domain)problems.push('DOMAIN_REQUIRED');if(!oauth)problems.push('PRODUCTION_OAUTH_REQUIRED');
 if(bounces>0)problems.push('BOUNCES_REQUIRE_REVIEW');if(complaints>0)problems.push('COMPLAINTS_REQUIRE_REVIEW');
 if(!unsubscribeCleared)problems.push('SUPPRESSION_CHECK_REQUIRED');
 return {ready:problems.length===0,problems};
}
export function pruning({views=0,purchases=0,refunds=0,contributionUsd=0,openOrders=0}={}){
 if(openOrders>0)return 'FULFILL_BEFORE_PRUNING';
 if(views<100||purchases<3)return 'INSUFFICIENT_DATA';
 if(refunds/purchases>0.2||contributionUsd<0)return 'REVIEW_MANUALLY';
 return 'KEEP_MEASURING';
}
export async function discoveryFallback(){
 const z=await read(),date=now().slice(0,10);if(z.runs[date])return {status:'ALREADY_RAN',...z.runs[date]};
 const sources=[['primary',process.env.ULTRON_DISCOVERY_FEED_URL],['fallback',process.env.ULTRON_DISCOVERY_FALLBACK_URL]].filter(x=>x[1]);
 if(!sources.length)return {status:'NO_AUTHORIZED_FEED',imported:0};
 const errors=[];for(const [provider,raw] of sources){
  try{const site=await safeWebsite(raw),r=await fetch(site,{redirect:'error',signal:AbortSignal.timeout(10000),headers:{accept:'application/json'}});
   if(!r.ok||!(r.headers.get('content-type')||'').includes('json'))throw Error('source unavailable');
   const txt=await r.text();if(txt.length>250000)throw Error('source size exceeded');
   const data=JSON.parse(txt);if(!Array.isArray(data.businesses))throw Error('invalid source schema');
   const valid=data.businesses.slice(0,50).filter(x=>x.website&&x.name);
   const imported=await importProspects(valid,'AUTHORIZED_'+provider.toUpperCase());
   return save(s=>{const v={at:now(),provider,valid:valid.length,imported:imported.imported};
    s.runs[date]=v;return {status:'SOURCE_IMPORTED_NOT_VERIFIED_BUYERS',...v};});
  }catch(e){errors.push(provider+':'+String(e.message).slice(0,120));}
 }return {status:'NO_FEED_AVAILABLE',errors};
}
export async function generateEvidenceDemo(id){
 const s=await growthState(),p=s.prospects[id];
 if(!p||p.audit?.status!=='SCANNED')throw Error('scanned site required');
 return {...await prepareSales(id,'mini'),disclaimer:'SIMULATION_NOT_ACTUAL_CLIENT_RESULTS'};
}
export async function crmDiff(){
 const [g,i,legacy]=await Promise.all([growthState(),integrationSummary(),getJson('ultron-v21-provider-integrations',{crmSync:{}})]);
 const missing=Object.values(g.prospects).filter(p=>p.decisionMaker?.email&&!p.optOut&&!legacy.crmSync?.[p.id]);
 return {provider:i.readiness.hubspot.status,unlinked:missing.slice(0,50).map(x=>({id:x.id,name:x.name})),total:missing.length,autoWrites:0};
}
export async function ownerCampaign({id,messageIds,expiresAt,audience,offer}={}){
 if(!id||!audience||!offer||!Array.isArray(messageIds)||messageIds.length<1||messageIds.length>10||Date.parse(expiresAt)<=Date.now())throw Error('owner-reviewed campaign envelope required');
 const g=await growthState();for(const key of messageIds){const m=g.outbox[key],p=m&&g.prospects[m.prospectId];
  if(!p?.decisionMaker?.source||p.optOut||g.suppression[p.id]||!m.to)throw Error('recipient not sourced or is suppressed');}
 return save(s=>{s.campaigns[id]={id,messageIds,expiresAt,audience,offer,status:'OWNER_ENVELOPE_RECORDED_NOT_SENT',at:now()};return s.campaigns[id]});
}
export async function trustedDispatch({orderId,captureId,offerId}={}){
 if(!orderId||!captureId)throw Error('verified capture path required');
 return save(s=>{if(s.deliveries[orderId])return {...s.deliveries[orderId],duplicate:true};
  return s.deliveries[orderId]={orderId,captureId,offerId,status:'PAID_JOB_QC_REQUIRED',at:now()};});
}
export async function acceptance({orderId,customerId,accepted,receiptRef,qcRef}={}){
 if(!orderId||!customerId||!receiptRef||!qcRef||typeof accepted!=='boolean')throw Error('customer, QC and delivery evidence needed');
 return save(s=>{const d=s.deliveries[orderId];if(!d)throw Error('paid job required');
  d.status=accepted?'CUSTOMER_ACCEPTED':'REWORK_REQUIRED';s.acceptances[orderId]={orderId,customerId,accepted,receiptRef,qcRef,at:now()};
  return {orderId,status:d.status};});
}
export async function overview(){
 const [z,g,i,l]=await Promise.all([read(),growthState(),integrationSummary(),ledger()]);
 const paid=Object.values(l.orders||{}).filter(o=>o.captureId&&o.capturedAt);
 const outstanding=Object.values(z.deliveries).filter(x=>x.status!=='CUSTOMER_ACCEPTED');
 const interested=Object.values(g.prospects).filter(x=>x.stage==='INTERESTED');
 return {version:'22.0.0',priority:workPriority({paid:outstanding.length,interested:interested.length,sales:paid.length}),
  metrics:{prospectCandidates:Object.keys(g.prospects).length,verifiedPaidOrders:paid.length,
   outstandingDelivery:outstanding.length,interestedBuyers:interested.length,accepted:Object.keys(z.acceptances).length},
  adapters:i.readiness,alertQueue:[...outstanding.map(x=>({kind:'DELIVERY',id:x.orderId,priority:100})),...interested.map(x=>({kind:'INTEREST',id:x.id,priority:90}))],
  sourceRuns:Object.keys(z.runs).length,claimedRealRevenueUsd:0,note:'No fabricated customers or payments; revenue comes only from verified ledger'};
}
export async function safeCycle(){
 const x=await overview();await save(s=>{s.lastCycle={at:now(),priority:x.priority.next}});
 return {priority:x.priority.next,alerts:x.alertQueue.length,externalSends:0,spentUsd:0};
}