/**
 * ULTRON Reflective Revenue Controller v20.
 * Machine self-monitoring, not consciousness. Execution is evidence-gated.
 * Persistent state is PostgreSQL via state-store.mjs.
 */
import crypto from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
const KEY='ultron-reflective-revenue-v20';
const iso=()=>new Date().toISOString();
const uid=()=>crypto.randomUUID();
const dollars=x=>Math.round(Math.max(0,Number(x)||0)*100)/100;
const note=x=>String(x||'').trim().slice(0,1200);
const ACT=['research','outreach','booking','fulfillment','publishing','spending','trading','checkout','credentials'];
const GOAL='NEXT_VERIFIED_INDEPENDENT_PAYING_CUSTOMER';
const makeState=()=>({
 version:'20.0.0',identity:{kind:'REFLECTIVE_OPERATING_SYSTEM',conscious:false,objective:GOAL},
 startedAt:iso(),updatedAt:null,heartbeat:null,lastReflection:null,
 emergency:{enabled:false,reason:null,activatedAt:null,by:null},
 authority:{automatic:['public evidence analysis','decision scoring','internal work queues','QA drafts','invoice reconciliation','monitoring','idempotent event processing'],
   approvalRequired:['new outbound campaign','customer contact without consent','spending or reinvesting','contract or legal commitment','refund outside published policy','trading','credential change','financial transfer'],
   forbidden:['fabricated customers','fabricated revenue','false testimonials','unsupported income claims','bypassing provider controls']},
 businessEvents:{},eventOrder:[],jobs:{},opportunities:{},decisions:[],campaignEnvelopes:{},suppression:{},
 payments:{},refunds:{},costs:{},orders:{},customerEvidence:{},subscriptions:{},partners:{},experiments:{},content:{},
 policy:{ownerApprovedDailySpendUsd:0,ownerApprovedCampaignSpendUsd:0,reserveRatePct:35,taxAllowancePct:25,
   minSatisfiedIndependentCustomers:3,minContributionMarginPct:40,maxSendPerDay:10,
   autonomousMoneyTransfer:false,autonomousTrading:false,requiredEvidenceForScaling:true},
 metrics:{cycles:0,events:0,handledJobs:0,failures:0},health:{},errors:[]
});
const transact=async change=>{let answer;await mutateJson(KEY,makeState(),s=>{answer=change(s);s.updatedAt=iso();});return answer;};
export const operatingState=()=>getJson(KEY,makeState());
const addEvent=(s,x)=>{const id=note(x.id)||uid();if(s.businessEvents[id])return {event:s.businessEvents[id],duplicate:true};
 const e={id,kind:note(x.kind),source:note(x.source),subject:note(x.subject),evidence:note(x.evidence),occurredAt:iso(),data:x.data||{}};
 s.businessEvents[id]=e;s.eventOrder.push(id);s.metrics.events++;
 // Bound event log without deleting payment evidence from the separate financial ledger.
 if(s.eventOrder.length>3000){const gone=s.eventOrder.splice(0,s.eventOrder.length-3000);for(const g of gone)delete s.businessEvents[g];}
 return {event:e,duplicate:false};};
const enqueue=(s,type,ref,priority=25,data={})=>{
 const key=type+':'+ref;const old=s.jobs[key];if(old&&!['FAILED','DONE','CANCELLED'].includes(old.status))return old;
 const j={id:key,type,ref,priority,context:data,status:'READY',attempts:0,leaseUntil:null,
  createdAt:iso(),updatedAt:iso(),result:null,lastError:null};s.jobs[key]=j;return j;
};
const ALL_PHASES=['acquisition','conversion','fulfillment','retention','finance','security'];
export function resourcePriorities({unfulfilled=0,interested=0,paid=0,verifiedRevenue=0}={}){
 const w={acquisition:30,conversion:25,fulfillment:20,retention:10,finance:10,security:5};
 if(unfulfilled>0){w.fulfillment=55;w.acquisition=10;w.conversion=15;w.retention=5;w.finance=10;w.security=5;}
 else if(interested>0){w.conversion=55;w.acquisition=20;w.fulfillment=5;w.retention=5;w.finance=10;w.security=5;}
 else if(paid===0||verifiedRevenue===0){w.acquisition=60;w.conversion=25;w.fulfillment=0;w.retention=0;w.finance=10;w.security=5;}
 return {objective:GOAL,weights:w,explanation:unfulfilled>0?'Paid customer delivery outranks speculative acquisition':interested>0?'High-intent prospects outrank catalog expansion':'No proven purchases: customer acquisition gets most resources'};
}
export function intentEvidence(x={}){
 const source=note(x.sourceUrl);let validUrl=false;
 try {const u=new URL(source);validUrl=u.protocol==='https:'&&u.hostname.includes('.');}catch{}
 const evidence=note(x.publicRequest);
 const matches=/(seeking|looking for|need|request|hiring|rfp|proposal|quote|budget|website|booking|automation|lead)/i.test(evidence);
 const corroboration=Boolean(note(x.postedAt))&&validUrl&&evidence.length>=30;
 const intent=corroboration&&matches?Math.min(90,35+Math.round(Math.min(100,evidence.length)/5)+(/budget|request for proposal|rfp/i.test(evidence)?20:0)):0;
 return {score:intent,verdict:intent>=50?'EVIDENCED_PUBLIC_INTENT_CANDIDATE':'INSUFFICIENT_PUBLIC_BUYER_INTENT',verifiedBuyer:false,proof:{sourceUrl:validUrl?source:null,postedAt:note(x.postedAt)||null,excerpt:evidence.slice(0,250)}};
}
export function contactConfidence({role,sourceUrl,email,publiclyListed,deliverabilityVerified}={}){
 let score=0;const r=note(role).toLowerCase();if(/owner|founder|ceo|director|manager|principal/.test(r))score+=25;
 try{if(new URL(sourceUrl).protocol==='https:')score+=20;}catch{}
 if(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email||'')))score+=15;
 if(publiclyListed===true)score+=15;
 if(deliverabilityVerified===true)score+=25;
 return {score,status:score>=85?'HIGH_CONFIDENCE_SOURCE':'REQUIRES_VERIFICATION',isMailboxValid:deliverabilityVerified===true};
}
export function safeSalesClaim(s=''){
 const t=String(s||'');
 const unsupported=/(guaranteed?\s+(?:revenue|profits?|sales|results)|we (?:made|earned|generated) \${0,1}[\d,]+|100%\s+(?:success|conversion)|double your revenue)/i.test(t);
 return {approved:!unsupported,requiresEvidence:unsupported,reasons:unsupported?['Quantified or guaranteed outcome needs independently documented evidence and explicit review']:[]};
}
export function offerMatch(problem=''){
 const p=note(problem).toLowerCase();
 if(/implementation|install|integrat|automate system/.test(p))return {id:'lead-recovery-implementation-2500',priceUsd:2500,requiresScope:true};
 if(/full audit|strategy|advanced|deep dive/.test(p))return {id:'ai-revenue-audit-500',priceUsd:500,requiresScope:false};
 return {id:'missed-lead-mini-audit-99',priceUsd:99,requiresScope:false};
}
export function queuePriority(kind,ctx={}){
 const table={VERIFIED_PAYMENT:100,FULFILLMENT_BLOCKED:100,INTERESTED_REPLY:90,REFUND_DISPUTE:95,
   RFP_DEADLINE:75,BOOKING_REQUEST:75,PROPOSAL_STALLED:60,ABANDONED_CHECKOUT:45,RESEARCH_LEAD:20,PRODUCT_IDEA:5};
 const age=Math.min(15,Math.floor(Math.max(0,Number(ctx.ageHours)||0)/24));
 return (table[kind]||10)+age;
}
export async function operationalGate(action){
 const s=await operatingState();
 if(s.emergency.enabled)return {allowed:false,reason:'EMERGENCY_STOP',at:s.emergency.activatedAt};
 const k=note(action).toLowerCase();
 if(k==='spending'&&s.policy.ownerApprovedDailySpendUsd<=0)return {allowed:false,reason:'ZERO_APPROVED_SPEND'};
 if(k==='trading')return {allowed:false,reason:'REAL_MONEY_TRADING_REQUIRES_SEPARATE_HUMAN_APPROVAL'};
 if(k==='credentials')return {allowed:false,reason:'OWNER_MFA_REQUIRED'};
 return {allowed:true,reason:'POLICY_PASS'};
}
export async function emergencyStop({enabled,reason,owner}={}){
 if(typeof enabled!=='boolean'||!note(owner))throw Error('owner and boolean enabled required');
 return transact(s=>{s.emergency={enabled,reason:enabled?note(reason)||'Owner emergency stop':null,activatedAt:enabled?iso():null,by:note(owner)};
   addEvent(s,{id:'stop:'+uid(),kind:enabled?'EMERGENCY_STOP':'EMERGENCY_RESUME',source:'OWNER_AUTHENTICATED',evidence:note(reason)});return {...s.emergency};});
}
export async function registerPublicOpportunities(items=[]){
 if(!Array.isArray(items)||items.length>50)throw Error('up to 50 public opportunities per batch');
 return transact(s=>{let accepted=0;
   for(const x of items){const i=intentEvidence(x);if(i.score===0)continue;
     const id=crypto.createHash('sha256').update(i.proof.sourceUrl+'|'+note(x.company)).digest('hex').slice(0,24);
     if(s.opportunities[id])continue;
     s.opportunities[id]={id,company:note(x.company),source:i.proof.sourceUrl,postedAt:i.proof.postedAt,
       intent:i.score,publicEvidence:i.proof.excerpt,sourceSystem:note(x.sourceSystem)||'OWNER_REVIEWED_PUBLIC_FEED',
       status:'UNVERIFIED_CONTACT_REQUIRES_APPROVAL',offer:offerMatch(x.publicRequest),createdAt:iso()};accepted++;
     addEvent(s,{id:'intent:'+id,kind:'PUBLIC_BUYER_INTENT_CANDIDATE',source:'PUBLIC_EVIDENCE',subject:id,evidence:i.proof.sourceUrl});
     enqueue(s,'REVIEW_PUBLIC_OPPORTUNITY',id,queuePriority('RESEARCH_LEAD')+Math.floor(i.score/10));
   }return {accepted,total:Object.keys(s.opportunities).length,contacted:0};});
}
export async function registerBusinessEvent({id,kind,subject,evidence,source,data}={}){
 const allowed=['INTERESTED_REPLY','BOOKING_REQUEST','RFP_DEADLINE','PROPOSAL_STALLED','ABANDONED_CHECKOUT',
   'PUBLIC_LEAD','CUSTOMER_FEEDBACK','DELIVERABILITY_BOUNCE','DELIVERABILITY_COMPLAINT',
   'PROVIDER_OUTAGE','SUBSCRIPTION_BILLING_FAILURE','CASE_STUDY_PERMISSION','SUPPORT_REQUEST','WEBSITE_VISIT',
   'DIAGNOSTIC_COMPLETED','DEMO_VIEWED','CHECKOUT_STARTED'];
 if(!allowed.includes(kind))throw Error('use trusted PayPal capture path for payments or refunds');
 if(!note(evidence))throw Error('event provenance required');
 return transact(s=>{const v=addEvent(s,{id,kind,subject,evidence,source:note(source)||'OWNER_AUTHENTICATED',data});
   if(v.duplicate)return {duplicate:true,eventId:v.event.id};
   const priority=queuePriority(kind);
   if(kind==='INTERESTED_REPLY')enqueue(s,'HANDLE_INTEREST',subject,priority);
   if(kind==='RFP_DEADLINE')enqueue(s,'DRAFT_RFP',subject,priority);
   if(kind==='BOOKING_REQUEST')enqueue(s,'PREPARE_BOOKING',subject,priority);
   if(kind==='PROPOSAL_STALLED')enqueue(s,'REVIEW_PROPOSAL',subject,priority);
   if(kind==='ABANDONED_CHECKOUT')enqueue(s,'REVIEW_CHECKOUT',subject,priority);
   if(kind==='DELIVERABILITY_COMPLAINT'||kind==='DELIVERABILITY_BOUNCE'){
     s.suppression[note(subject)]='DELIVERABILITY_SUPPRESSED';
     enqueue(s,'REVIEW_SENDER_HEALTH',note(subject),98);
   }
   return {duplicate:false,eventId:v.event.id,scheduledJobs:Object.keys(s.jobs).length};});
}
/* Only call from server AFTER signed PayPal webhook or PayPal's authenticated capture response.
 * No public route exposes this function or permits callers to set "trusted". */
export async function recordTrustedCapture({orderId,captureId,offerId,amountUsd,status,currency='USD',customerId}={}){
 if(!note(orderId)||!note(captureId)||status!=='COMPLETED'||currency!=='USD'||!(Number(amountUsd)>0))
   throw Error('completed USD capture proof required');
 return transact(s=>{
   if(s.payments[captureId])return {duplicate:true,captureId,orderId};
   const amt=dollars(amountUsd),eventId='paypal:capture:'+captureId;
   s.payments[captureId]={orderId:note(orderId),captureId:note(captureId),amountUsd:amt,offerId:note(offerId),
     customerId:note(customerId)||null,currency:'USD',source:'VERIFIED_PAYPAL_SERVER_PATH',recordedAt:iso()};
   s.orders[note(orderId)]={orderId:note(orderId),captureId:note(captureId),status:'PAID_WORK_ORDER',
     amountUsd:amt,offerId:note(offerId),ownerApprovalForScope:amt>=2500,createdAt:iso(),deliveryProof:null,qc:null};
   addEvent(s,{id:eventId,kind:'VERIFIED_PAYMENT',source:'PAYPAL_VALIDATED_RUNTIME',subject:orderId,evidence:captureId,data:{amountUsd:amt}});
   enqueue(s,'CREATE_FULFILLMENT_SCOPE',orderId,100,{offerId,amountUsd:amt});
   return {duplicate:false,orderId,captureId,orderStatus:'PAID_WORK_ORDER',queued:'CREATE_FULFILLMENT_SCOPE'};
 });
}
export async function recordTrustedRefund({refundId,captureId,amountUsd,status}={}){
 if(!note(refundId)||!note(captureId)||status!=='COMPLETED'||!(Number(amountUsd)>0))throw Error('completed verified refund required');
 return transact(s=>{if(s.refunds[refundId])return {duplicate:true,refundId};
   const origin=s.payments[captureId];if(!origin)throw Error('unmatched refund: requires reconciliation');
   const prior=Object.values(s.refunds).filter(r=>r.captureId===captureId).reduce((a,r)=>a+r.amountUsd,0);
   const amount=dollars(amountUsd);if(prior+amount>origin.amountUsd+.01)throw Error('refund greater than captured sum');
   s.refunds[refundId]={refundId,captureId,amountUsd:amount,source:'VERIFIED_PAYPAL_SERVER_PATH',at:iso()};
   addEvent(s,{id:'paypal:refund:'+refundId,kind:'VERIFIED_REFUND',source:'PAYPAL_VALIDATED_RUNTIME',subject:captureId,evidence:refundId});
   return {duplicate:false,refundId};});
}
export function scopedDeliverables(offerId){
 const offers={
  'missed-lead-mini-audit-99':{slaHours:24,items:['Public-page audit','Observed conversion gaps','Three prioritized recommendations'],requiresAccess:false},
  'ai-revenue-audit-500':{slaHours:48,items:['Multi-page audit','Customer journey map','Evidence-backed implementation plan'],requiresAccess:false},
  'lead-recovery-implementation-2500':{slaHours:168,items:['Agreed integration specification','Sandbox implementation','QA and customer acceptance'],requiresAccess:true}
 };
 return offers[offerId]||{slaHours:72,items:['Verify purchased scope','Complete contracted deliverable','Perform QA'],requiresAccess:true};
}
export async function recordQualityEvidence({orderId,checks,receiptRef,customerAcknowledgement}={}){
 const c=checks||{};if(!orderId||!receiptRef)throw Error('order and evidence reference required');
 const required=['accuracy','acceptance','links','security','delivery'];
 if(!required.every(k=>c[k]===true))throw Error('all independent quality checks must pass');
 return transact(s=>{const o=s.orders[orderId];if(!o)throw Error('verified paid order required');
   if(o.status==='FULFILLED')return {duplicate:true,orderId};
   o.qc={...Object.fromEntries(required.map(x=>[x,true])),receiptRef:note(receiptRef),checkedAt:iso()};
   o.deliveryProof=note(receiptRef);o.customerAcknowledgement=Boolean(customerAcknowledgement);o.status='FULFILLED';
   addEvent(s,{id:'fulfilled:'+orderId,kind:'FULFILLMENT_EVIDENCED',source:'OWNER_QC_RECORD',subject:orderId,evidence:receiptRef});
   enqueue(s,'RETENTION_REVIEW',orderId,30);
   return {orderId,fulfilled:true,ownerConfirmedDelivery:!!customerAcknowledgement};});
}
export async function addRealCost({id,amountUsd,category,sourceRef,orderId}={}){
 if(!id||!(Number(amountUsd)>0)||!category||!sourceRef)throw Error('verified expense ID, amount, category and source needed');
 return transact(s=>{if(s.costs[id])return {duplicate:true,id};
   s.costs[id]={id,amountUsd:dollars(amountUsd),category:note(category),orderId:note(orderId),sourceRef:note(sourceRef),at:iso()};
   return {duplicate:false,id};});
}
export function financialControls({grossRevenue=0,refunds=0,recordedCosts=0,reserveRatePct=35,taxAllowancePct=25,ownerApprovedDailySpendUsd=0,satisfiedCustomers=0,minCustomers=3}={}){
 const gross=dollars(grossRevenue),reversed=dollars(refunds),cost=dollars(recordedCosts);
 const realized=Math.max(0,gross-reversed),operatingContribution=dollars(realized-cost);
 const taxHold=dollars(operatingContribution*Math.min(1,Math.max(0,Number(taxAllowancePct)||0))/100);
 const liquidityReserve=dollars(realized*Math.min(1,Math.max(0,Number(reserveRatePct)||0))/100);
 const available=dollars(Math.max(0,operatingContribution-taxHold-liquidityReserve));
 const threshold=Number(satisfiedCustomers)>=Number(minCustomers);
 const authorized=dollars(Math.min(available,Math.max(0,Number(ownerApprovedDailySpendUsd)||0)));
 return {grossRevenueUsd:gross,refundsUsd:reversed,recordedCostsUsd:cost,
   contributionAfterRecordedCostsUsd:operatingContribution,reserveUsd:liquidityReserve,taxAllowanceUsd:taxHold,
   availableAfterIllustrativeHoldsUsd:available,scalingGateOpen:threshold&&operatingContribution>0,
   maxApprovedExperimentSpendUsd:threshold?authorized:0,automaticPaymentOrTransferEnabled:false,
   caveat:'Only recorded costs are known. Actual bank cash, liabilities, taxes and processor settlements must be reconciled before any spending.'};
}
export async function authorizeBudget({usd,owner,period='DAILY'}={}){
 if(!note(owner)||!Number.isFinite(Number(usd))||Number(usd)<0||Number(usd)>1000||period!=='DAILY')
   throw Error('authenticated owner, 0-1000 daily USD limit required');
 return transact(s=>{s.policy.ownerApprovedDailySpendUsd=dollars(usd);
   s.decisions.push({kind:'BUDGET_CAP_SET',owner:note(owner),usd:dollars(usd),at:iso(),result:'RECOMMENDATIONS_ONLY_NO_AUTOMATIC_PAYMENT'});s.decisions=s.decisions.slice(-500);
   return {limitUsd:s.policy.ownerApprovedDailySpendUsd,automaticPayment:false};});
}
export async function recordCustomerSatisfaction({orderId,customerId,independent,satisfied,evidenceRef}={}){
 if(!orderId||!customerId||!evidenceRef||typeof satisfied!=='boolean')throw Error('customer and evidence required');
 return transact(s=>{const o=s.orders[orderId];if(!o||o.status!=='FULFILLED')throw Error('fulfilled real order required');
   s.customerEvidence[orderId]={orderId,customerId:note(customerId),independent:independent===true,satisfied,evidenceRef:note(evidenceRef),at:iso()};
   return {orderId,satisfied,independent:independent===true};});
}
export async function approveCampaignEnvelope({id,owner,audience,offer,maxRecipients=10,expiresAt}={}){
 if(!id||!owner||!audience||!offer)throw Error('approved envelope must define owner, audience and offer');
 if(!(Number(maxRecipients)>=1&&Number(maxRecipients)<=10))throw Error('maxRecipients must be 1-10');
 if(!expiresAt||Date.parse(expiresAt)<=Date.now())throw Error('envelope must expire in the future');
 return transact(s=>{s.campaignEnvelopes[id]={id,owner:note(owner),audience:note(audience),offer:note(offer),
   maxRecipients:Number(maxRecipients),expiresAt,approvedAt:iso(),status:'OWNER_APPROVED_POLICY_ENVELOPE',sent:0};
   return {id,approved:true,sendSystem:'V19_GMAIL_ONLY_IF_RUNTIME_OAUTH_CONFIGURED'};});
}
export async function suppressContact({contactId,reason}={}){
 if(!contactId||!reason)throw Error('contact and reason required');
 return transact(s=>{s.suppression[note(contactId)]=note(reason);return {contactId,suppressed:true};});
}
export async function recordExperiment({name,hypothesis,metric,baselineRef,owner}={}){
 if(!name||!hypothesis||!metric||!baselineRef||!owner)throw Error('baseline and owner review required');
 return transact(s=>{const id=uid();s.experiments[id]={id,name:note(name),hypothesis:note(hypothesis),metric:note(metric),
   baselineRef:note(baselineRef),status:'DRAFT_NO_SPEND_NO_PUBLICATION',owner:note(owner),at:iso()};return {id,status:'DRAFT_NO_SPEND_NO_PUBLICATION'};});
}
export async function recordPartner({id,company,agreementEvidence,ownerApproved}={}){
 if(!id||!company||!agreementEvidence||ownerApproved!==true)throw Error('signed agreement evidence and owner approval needed');
 return transact(s=>{s.partners[id]={id,company:note(company),agreementEvidence:note(agreementEvidence),
  ownerApproved:true,status:'APPROVED_NOT_AUTOMATICALLY_BILLED',at:iso()};return {id,status:s.partners[id].status};});
}
export async function claimJobs({limit=5}={}){
 const max=Math.max(0,Math.min(10,Number(limit)||5));
 return transact(s=>{if(s.emergency.enabled)return [];
  const ts=Date.now();const jobs=Object.values(s.jobs).filter(j=>j.status==='READY'||j.status==='LEASED'&&Date.parse(j.leaseUntil||'')<ts)
    .sort((a,b)=>b.priority-a.priority).slice(0,max);
  for(const j of jobs){j.status='LEASED';j.attempts++;j.leaseUntil=new Date(ts+2*60000).toISOString();j.updatedAt=iso();}
  return jobs.map(j=>({...j}));});
}
const executeSafeJob=async job=>{
 if(job.type==='CREATE_FULFILLMENT_SCOPE')return {scope:scopedDeliverables(job.context.offerId),status:'AWAITING_ACTUAL_QC_AND_DELIVERY'};
 if(job.type==='HANDLE_INTEREST')return {status:'AWAITING_APPROVED_REPLY',recommendation:'Respond promptly using verified, authorized business sender'};
 if(job.type==='REVIEW_PUBLIC_OPPORTUNITY')return {status:'NEEDS_VERIFIED_DECISION_MAKER',recommendation:'Confirm contact, consent and relevant proposal'};
 if(job.type==='REVIEW_SENDER_HEALTH')return {status:'PAUSED_CONTACT',recommendation:'Check bounce/complaint before any further sending'};
 if(job.type==='RETENTION_REVIEW')return {status:'REQUIRES_REAL_CUSTOMER_CONSENT'};
 if(job.type==='DRAFT_RFP')return {status:'DRAFT_NEEDS_CONTRACT_REVIEW'};
 if(job.type==='PREPARE_BOOKING')return {status:'AWAITING_REAL_CALENDAR_AVAILABILITY'};
 if(job.type==='REVIEW_CHECKOUT')return {status:'CONSENT_REQUIRED_FOR_RECOVERY'};
 if(job.type==='REVIEW_PROPOSAL')return {status:'REQUIRES_CURRENT_CONTACT_CHECK'};
 return {status:'UNSUPPORTED_SAFE_JOB'};
};
export async function runSafeJobs(limit=5){
 const jobs=await claimJobs({limit});let done=0;for(const job of jobs){
   let result,error=null;try{result=await executeSafeJob(job);}catch(e){error=note(e.message);}
   await transact(s=>{const j=s.jobs[job.id];if(!j||j.status!=='LEASED')return;
     if(error){j.lastError=error;j.status=j.attempts>=3?'FAILED':'READY';s.metrics.failures++;s.errors.push({at:iso(),jobId:job.id,error});s.errors=s.errors.slice(-80);}
     else {j.result=result;j.status='DONE';s.metrics.handledJobs++;done++;}j.updatedAt=iso();});
 }
 return {claimed:jobs.length,handled:done,externalActions:'NONE',moneyMovements:'NONE'};
}
export function readinessRegistry(provider={}){
 const defs=[
 ['revenue-mission-controller','ACTIVE_LOGIC'],['buyer-intent-detector','EVIDENCE_SCORING_FEED_REQUIRED'],
 ['closed-loop-sales','EVENTS_AND_QUEUE_ACTIVE_EXTERNAL_ADAPTERS_REQUIRED'],['instant-paid-fulfillment','TRUSTED_PAYMENT_TO_QC_QUEUE'],
 ['self-financing-growth','RESERVE_AND_APPROVAL_LOGIC'],
 ['opportunity-alerts','EVENT_DRIVEN'],['buyer-intent-network','EXTERNAL_SOURCE_REQUIRED'],['rfp-monitor','EVIDENCE_FEED_REQUIRED'],
 ['self-learning-profile','VERIFIED_FEEDBACK_ONLY'],['decision-maker-confidence','ACTIVE_SCORING'],
 ['deliverability-watchdog','BOUNCE_EVENTS_SUPPORTED_LIVE_GMAIL_REQUIRED'],['contact-suppression','ACTIVE'],['campaign-approval-envelope','ACTIVE_GATED'],
 ['high-intent-replies','PRIORITY_QUEUE'],['acquisition-attribution','CAPTURE_EVIDENCE_REQUIRED'],
 ['behavioral-funnel-analytics','EVENT_INGEST_ACTIVE'],['interactive-diagnostic','V19_EXISTING_FORM'],
 ['automatic-offer-matching','ACTIVE'],['evidence-vault','EVENT_REFERENCE_STORE'],['truth-claims-auditor','ACTIVE'],
 ['price-sensitivity','EXPERIMENT_DRAFT_ONLY'],['service-bundles','COST_EVIDENCE_REQUIRED'],['checkout-monitor','EVENTS_READY_LIVE_PROBES_PENDING'],
 ['chargeback-evidence','PROVENANCE_LOG_ACTIVE'],['offer-validation','REQUIRES_REAL_DEMAND'],
 ['dynamic-scope-builder','ACTIVE_AFTER_CAPTURE'],['pre-delivery-qc','EVIDENCE_GATED'],['onboarding','CUSTOMER_AUTHORIZATION_REQUIRED'],
 ['payment-to-work-order','ACTIVE'],['customer-order-portal','V19_DELIVERY_LINK_ONLY'],
 ['delivery-deadlines','WORK_QUEUE_ACTIVE'],['subscription-provisioning','PAYPAL_SUBSCRIPTION_CONFIRMATION_REQUIRED'],
 ['failed-renewal-recovery','EVENTS_READY'],['customer-results-reports','AUTHORIZED_METRICS_REQUIRED'],['account-expansion','VERIFIED_NEEDS_REQUIRED'],
 ['central-event-bus','ACTIVE_POSTGRES'],['durable-job-queue','ACTIVE_POSTGRES_LEASED'],
 ['customer-data-isolation','CUSTOMER_SCOPED_ROUTES_STILL_REQUIRED'],['emergency-stop','ACTIVE_FOR_V20_GUARDED_ACTIONS'],
 ['end-to-end-monitoring','SELF_REFLECTION_ACTIVE_EXTERNAL_PROBES_PENDING'],['deployment-acceptance-tests','AUTOMATED_NODE_TEST_GATE'],
 ['independent-transaction-auditor','LOCAL_CAPTURE_AUDIT'],['agent-performance-evaluator','OUTCOME_NOT_CYCLE_RANKING'],
 ['compute-efficiency','EVENT_DRIVEN_NO_IDLE_EXECUTION'],['data-governance','MINIMAL_EVIDENCE_REFERENCES'],
 ['profitability','CAPTURE_REFUND_COST_LEDGER'],['cash-reserves','ILLUSTRATIVE_HOLDS'],
 ['growth-capital-allocation','RECOMMEND_ONLY_APPROVAL_GATED'],['financing-data-room','ACTUAL_DOCUMENTS_REQUIRED'],['partner-api','SIGNED_AGREEMENT_REQUIRED']
 ];
 return defs.map(([id,status],i)=>({number:i+1,id,status:provider[id]||status}));
}
export async function introspect({v19=null,legacyLedger=null,dbHealth=null}={}){
 const s=await operatingState();const leads=Object.values(v19?.prospects||{}),orders=Object.values(s.orders),verified=Object.values(s.payments),refunds=Object.values(s.refunds);
 const completed=orders.filter(o=>o.status==='FULFILLED').length;
 const satisfied=new Set(Object.values(s.customerEvidence).filter(x=>x.independent&&x.satisfied).map(x=>x.customerId)).size;
 const gross=verified.reduce((a,x)=>a+x.amountUsd,0),refunded=refunds.reduce((a,x)=>a+x.amountUsd,0),cost=Object.values(s.costs).reduce((a,x)=>a+x.amountUsd,0);
 const financial=financialControls({grossRevenue:gross,refunds:refunded,recordedCosts:cost,...s.policy,satisfiedCustomers:satisfied,minCustomers:s.policy.minSatisfiedIndependentCustomers});
 const interested=leads.filter(x=>/interested|replied|meeting/i.test(x.stage||'')).length;
 const unfulfilled=orders.filter(o=>o.status!=='FULFILLED').length;
 const allocation=resourcePriorities({unfulfilled,interested,paid:verified.length,verifiedRevenue:gross});
 const blockers=[];
 if(!process.env.ULTRON_DISCOVERY_FEED_URL)blockers.push('Business discovery feed not configured');
 if(!process.env.ULTRON_GMAIL_REFRESH_TOKEN)blockers.push('Deployed business Gmail OAuth missing');
 if(!process.env.ULTRON_CALENDAR_REFRESH_TOKEN)blockers.push('Deployed Calendar OAuth missing');
 if(!process.env.ULTRON_BRANDED_DOMAIN)blockers.push('Owned branded domain not configured');
 if(!verified.length)blockers.push('No captured PayPal order observed by v20');
 if(!satisfied)blockers.push('No independently satisfied v20 customer evidence');
 const moneyKeys=new Set(verified.map(x=>x.orderId));
 const paidInLegacy=Object.values(legacyLedger?.orders||{}).filter(o=>o.captureId&&o.capturedAt).map(o=>o.id);
 const unmatchedLegacy=paidInLegacy.filter(id=>!moneyKeys.has(id));
 if(unmatchedLegacy.length)blockers.push('Some older captured ledger orders not yet reflected in v20; reconciliation required');
 const provider={buyerIntent:!!process.env.ULTRON_B2B_INTENT_FEED_URL,gmail:!!process.env.ULTRON_GMAIL_REFRESH_TOKEN,calendar:!!process.env.ULTRON_CALENDAR_REFRESH_TOKEN};
 return {version:s.version,systemType:s.identity.kind,selfAwareness:false,
   description:'Goal-based introspection using observed software state, not consciousness or sentience.',
   objective:s.identity.objective,reflectionTime:iso(),safety:s.emergency,dbHealth:dbHealth?.ok===true?'CONNECTED':'UNVERIFIED',
   operatingMode:s.emergency.enabled?'EMERGENCY_STOP':financial.scalingGateOpen?'VALIDATION_PASSED_OWNER_APPROVAL_REQUIRED':'VALIDATION_FIRST',
   agency:{automatic:s.authority.automatic,approvalRequired:s.authority.approvalRequired,forbidden:s.authority.forbidden},
   decisions:{allocation,actions:unfulfilled?'Complete paid customer obligations first':interested?'Respond to real buyer interest within approved policy':'Verify demand and acquire first paying customer',blockers},
   evidence:{leadCandidates:leads.length,interestedCandidates:interested,verifiedCaptureEvents:verified.length,fulfilled:completed,
     independentlySatisfied:satisfied,readyJobs:Object.values(s.jobs).filter(j=>j.status==='READY').length,
     outstandingJobs:Object.values(s.jobs).filter(j=>!['DONE','CANCELLED'].includes(j.status)).length,
     successfulExecutionEvents:s.metrics.handledJobs,unmatchedLegacyOrders:unmatchedLegacy.length,
     actualExternalSendConfirmed:false},
   finances:financial,providers:provider,capabilities:readinessRegistry(),lastReflection:s.lastReflection,
   metrics:s.metrics,limitations:['Unrecorded operating costs and available bank balances are unknown.','External CRM and email adapters require separate runtime authorization.','No financial transfer or trade is autonomously authorized.']};
}
export async function rememberReflection(snapshot){
 return transact(s=>{const r={at:iso(),mode:snapshot.operatingMode,objective:snapshot.objective,
   allocation:snapshot.decisions.allocation.weights,blockers:snapshot.decisions.blockers.slice(0,12),
   captureEvents:snapshot.evidence.verifiedCaptureEvents,action:snapshot.decisions.actions};
  s.lastReflection=r;s.heartbeat=iso();s.metrics.cycles++;s.decisions.push(r);s.decisions=s.decisions.slice(-500);return r;});
}
