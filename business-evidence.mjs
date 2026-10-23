import {createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {financialSummary,independentSale} from './ultron-revenue-operations-v41.mjs';
const KEY='business-funnel-v1';
const fresh=()=>({events:{},totals:{},startedAt:null,lastRecordedAt:null});
const TYPES=new Set(['OFFER_HTTP_VIEW','INTAKE_HTTP_VIEW','CHECKOUT_CREATED']);
export function createBusinessEvidence({read=()=>getJson(KEY,fresh()),mutate=fn=>mutateJson(KEY,fresh(),fn),clock=Date.now}={}){
 async function record(type,reference){
  if(!TYPES.has(type)||typeof reference!=='string'||!reference||reference.length>180)throw Error('Invalid funnel event');
  const id=createHash('sha256').update(type+':'+reference).digest('hex'),at=new Date(clock()).toISOString();
  await mutate(s=>{if(s.events[id])return;s.startedAt??=at;s.lastRecordedAt=at;s.events[id]={type,at};s.totals[type]=(s.totals[type]||0)+1;
   const keys=Object.keys(s.events);if(keys.length>10000)delete s.events[keys[0]];});
  return {recorded:true};
 }
 return {record,snapshot:async()=>{const s=await read();return {source:'business-funnel-v1',periodStart:s.startedAt,lastRecordedAt:s.lastRecordedAt,totals:s.totals,deduplicationWindow:10000,note:'HTTP views include automated traffic; not unique people. Capture and delivery metrics come from order records.'}}};
}
export function capacityGate(orders,{limit=3,now=Date.now()}={}){
 const pending=orders.filter(o=>o.status==='COMPLETED'&&o.captureId&&!o.fulfillmentCompletedAt&&!o.customerAcceptanceEvidence?.at&&!o.auditDelivery?.acceptedAt&&(o.fulfillment?.dueAt||o.auditIntake||o.v34Intake||o.videoQuote||o.product==='ai-revenue-audit-500'||!o.fulfillment));
 const overdue=pending.filter(o=>Number.isFinite(Date.parse(o.fulfillment?.dueAt))&&Date.parse(o.fulfillment.dueAt)<now);
 return {allowed:pending.length<limit&&overdue.length===0,pending:pending.length,limit,overdue:overdue.length,reason:overdue.length?'OVERDUE_PAID_DELIVERY':pending.length>=limit?'DELIVERY_CAPACITY_REACHED':null,source:'order-ledger',appliesTo:'NEW_CHECKOUT_ONLY_EXISTING_DELIVERIES_CONTINUE'};
}
export function businessEvidenceReport({orders=[],inbound={items:[],total:0},funnel={},continuous={},feeds={},payment={},sampleReady=false,env={}}={}){
 const dedup=new Map();for(const o of orders)if(o.captureId&&!dedup.has(o.captureId))dedup.set(o.captureId,o);
 const paid=[...dedup.values()].filter(o=>o.status==='COMPLETED'&&o.capturedAt),accepted=paid.filter(independentSale),fin=financialSummary(orders),capacity=capacityGate(orders);
 const reasons=[];
 if(accepted.length<3)reasons.push('FEWER_THAN_THREE_INDEPENDENT_ACCEPTED_CUSTOMERS');
 if(fin.recordedContributionProfitUsd===null)reasons.push('ACTUAL_COSTS_OR_FEES_INCOMPLETE');
 else if(fin.recordedContributionProfitUsd<=0)reasons.push('NONPOSITIVE_RECORDED_CONTRIBUTION');
 if(!capacity.allowed)reasons.push(capacity.reason);
 if(continuous.status!=='HEALTHY'||!(continuous.consecutiveSuccessfulScheduledRuns>=2))reasons.push('CONTINUOUS_OPERATION_NOT_VERIFIED');
 if(feeds.freshness!=='RECENT'||feeds.sourceStatus!=='LIVE_PUBLIC_FEED')reasons.push('FEEDS_STALE_OR_DEGRADED');
 const statuses=[
  ['continuous-operation',continuous.status==='HEALTHY'&&continuous.consecutiveSuccessfulScheduledRuns>=2?'OBSERVED_HEALTHY_CYCLES':'VERIFICATION_REQUIRED','/api/continuous-operations'],
  ['customer-offer',sampleReady?'REVIEWED_SAMPLE_AVAILABLE_DEMAND_UNVALIDATED':'SAMPLE_REVIEW_REQUIRED','/autonomous-audit'],
  ['verified-demand',inbound.total?'INBOUND_REVIEW_REQUIRED':'NO_VERIFIED_BUYER_EVIDENCE','/owner/inbox'],
  ['authorized-acquisition',env.ULTRON_GMAIL_REFRESH_TOKEN?'CONFIGURED_ROUND_TRIP_REQUIRED':'SENDER_AUTHORIZATION_REQUIRED','/activation-center'],
  ['buying-journey',payment.ok?'PAYPAL_RUNTIME_VERIFIED_CUSTOMER_OUTCOME_PENDING':'PAYPAL_VERIFICATION_REQUIRED','/autonomous-audit'],
  ['profitable-fulfillment',fin.recordedContributionProfitUsd===null?'COST_EVIDENCE_INCOMPLETE':fin.recordedContributionProfitUsd>0?'POSITIVE_RECORDED_CONTRIBUTION':'POSITIVE_CONTRIBUTION_NOT_ESTABLISHED','/revenue-operations'],
  ['business-readiness','IDENTITY_CONTACT_TERMS_REVIEW_REQUIRED','/support'],
  ['measurement',funnel.lastRecordedAt?'EVENTS_RECORDED_RECONCILIATION_REQUIRED':'MEASUREMENT_WINDOW_NOT_STARTED','/api/business-evidence/owner'],
  ['repeatable-sales',accepted.length>=3?'MULTIPLE_ACCEPTED_OUTCOMES_REVIEW_REQUIRED':'REPEATABILITY_NOT_ESTABLISHED','/source-lab'],
  ['controlled-scaling',reasons.length?'EXPANSION_BLOCKED':'ELIGIBLE_FOR_OWNER_REVIEW','/api/business-evidence/owner']
 ];
 return {asOf:new Date().toISOString(),release:process.env.RAILWAY_GIT_COMMIT_SHA||process.env.ULTRON_BOOTSTRAP_COMMIT||null,
  requirements:statuses.map(([id,status,href],i)=>({number:i+1,id,status,href})),capacity,financials:fin,
  funnel:{...funnel,inboundRecords:inbound.total||0,consentedOpen:inbound.consentedOpen||0,qualifiedRecords:(inbound.items||[]).filter(x=>x.status==='qualified').length,
   applicationCaptures:paid.length,independentAcceptedCustomers:accepted.length,deliveryCompleted:paid.filter(o=>o.fulfillmentCompletedAt).length,customerAccepted:paid.filter(o=>o.customerAcceptanceEvidence?.at||o.auditDelivery?.acceptedAt).length,
   coverage:'Order ledger and legacy audit outcomes; independent-customer verification still requires the existing signed-payment and owner-review evidence. Separate video and print acceptance stores are not combined here.',
   repeatPurchases:null,repeatPurchaseReason:'Independent buyer identity across orders not reconciled'},
  expansion:{allowed:false,eligibleForOwnerReview:reasons.length===0,reasons,automaticSpending:false,automaticOutreach:false},
  alerts:env.ULTRON_ALERTS_ENABLED==='true'&&env.ULTRON_ALERT_WEBHOOK_URL?'CONFIGURED_RECEIPT_NOT_VERIFIED':'OWNER_ALERT_DESTINATION_REQUIRED'};
}
export function validateCostBreakdown(input){
 if(!input||!['ACTUAL','ESTIMATE'].includes(input.basis)||typeof input.reference!=='string'||input.reference.trim().length<5||input.reference.length>250)throw Error('Valid cost basis and reference required');
 const keys=['labor','api','hosting','assets','acquisition','other'],values={};
 for(const k of keys){const v=input.cents?.[k];if(v!==null&&(!Number.isSafeInteger(v)||v<0||v>100000000))throw Error('Each cost must be nonnegative integer USD cents or explicit null');values[k]=v}
 const complete=input.basis==='ACTUAL'&&Object.values(values).every(x=>x!==null),sum=Object.values(values).reduce((a,b)=>a+(b??0),0);
 return {basis:input.basis,cents:values,complete,amountUsd:complete?sum/100:null,reference:input.reference.trim(),source:'OWNER_RECORDED_COST_DOCUMENTS',recordedAt:new Date().toISOString()};
}
export const businessEvidence=createBusinessEvidence();
