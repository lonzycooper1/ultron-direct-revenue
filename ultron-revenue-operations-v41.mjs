import {randomBytes,timingSafeEqual,createCipheriv,createDecipheriv,createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {validateV34Intake,buildV34Report} from './ultron-autonomous-revenue-v34.mjs';

import {recordRevenueCase,escalateRevenueCases} from './revenue-case-queue.mjs';

export const AUDIT_SKU='ai-revenue-audit-500';
export const TERMS=Object.freeze({version:'audit-2026-10-14-v41',priceUsd:500,currency:'USD',deliveryBusinessDays:5,
 scope:'Customer-specific inquiry and booking workflow audit: supplied baseline, sourced observations, prioritized fixes, 90-day roadmap and quality review.',
 exclusions:'No implementation, private account access, full technical/SEO audit or guaranteed revenue. Any implementation requires a separate agreed scope.',
 acceptance:'Review the delivered report. Accept it or request an in-scope revision through your private order page. Customer acceptance is separate from payment.',
 refunds:'Request a cancellation or refund review through the private order support form. Refunds require individual review; this policy does not waive applicable customer rights.',
 support:'Use the private order page or /support. Do not send passwords, banking information or private customer records.'});
export const OPS_KEY='ultron-revenue-operations-v41';
export const freshOps=()=>({version:'41.0.0',tasks:{},signals:{},alerts:{},evidence:{},updatedAt:null});
export const operationsState=()=>getJson(OPS_KEY,freshOps());
const clean=(x,n=500)=>String(x??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const iso=()=>new Date().toISOString();
export const recordedAmount=x=>(typeof x==='number'||typeof x==='string'&&x.trim()!=='')&&Number.isFinite(Number(x))&&Number(x)>=0;
const money=x=>{if(!recordedAmount(x))throw Error('Recorded nonnegative amount required');return Math.round(Number(x)*100)/100};
const eq=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length>=32&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function businessDeadline(start,days=TERMS.deliveryBusinessDays){
 const d=new Date(start);if(!Number.isFinite(d.getTime()))throw Error('Valid start date required');
 for(let n=0;n<days;){d.setUTCDate(d.getUTCDate()+1);if(![0,6].includes(d.getUTCDay()))n++;}
 return d.toISOString();
}
export function validateAuditIntake(raw={}){
 if(raw.acceptTerms!==true||raw.termsVersion!==TERMS.version)throw Error('Accept the current audit terms before checkout');
 const baseline=validateV34Intake(raw);
 const email=clean(raw.email,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Valid delivery email required');
 return {...baseline,email,acceptTerms:true,currentWorkflow:clean(raw.currentWorkflow,1500),termsVersion:TERMS.version,termsAcceptedAt:iso(),
  consentScope:'ORDER_SERVICE_ONLY',marketingConsent:raw.marketingConsent===true};
}
export function prepareAudit(order,inspection={status:'UNAVAILABLE',reason:'Inspection unavailable'}){
 if(!order?.captureId||order.status!=='COMPLETED')throw Error('Verified completed payment required');
 // Legacy paid orders must enter onboarding, never receive a generic worksheet as a completed audit.
 if(!order.auditIntake)return {token:randomBytes(24).toString('hex'),title:'Revenue Leak Audit — onboarding required',status:'ONBOARDING_REQUIRED',orderId:order.id,
  nextSteps:['Submit your business website and baseline through this private order page.','A reviewer will confirm scope and the delivery deadline after intake.'],sections:[],createdAt:iso()};
 const x=order.auditIntake,base=buildV34Report(x,inspection);
 const sections=[...base.sections.filter(s=>!['Scope and evidence','Limits and handoff','7-day implementation checklist'].includes(s.title)),
  {title:'Current-state workflow map',body:'Customer-reported workflow for '+x.company+': '+(x.currentWorkflow||'Confirm channel, owner, qualification, booking and follow-up during review.')+' Response '+x.responseMinutes+' minutes; booking '+x.bookingMethod+'; follow-up '+x.followup+'. These inputs are unverified self-report.'},
  {title:'90-day implementation roadmap',body:'Days 1–14: verify the baseline, inspect inquiry paths and assign owners. Days 15–30: test one approved response or booking fix and measure latency. Days 31–60: review permission-aware follow-up and qualified booking outcomes. Days 61–90: compare equivalent cohorts, reconcile actual costs and decide whether measured results justify expansion. This is a proposed plan, not completed implementation.'},
  {title:'Scope and limits',body:TERMS.scope+' '+TERMS.exclusions+' Customer-provided estimates are not verified revenue facts. Public homepage observations are limited to accessible static HTML.'}];
 return {token:randomBytes(24).toString('hex'),orderId:order.id,title:'Revenue Leak Audit for '+x.company,status:'QUALITY_REVIEW_PENDING',
  sections:[],draftSections:sections,inspection,reportVersion:1,dueAt:businessDeadline(order.capturedAt||iso()),createdAt:iso(),termsVersion:TERMS.version};
}
export function reviewAudit(order,input={}){
 const f=order?.fulfillment;
 if(order?.product!==AUDIT_SKU||!order.captureId||!order.auditIntake||!(f?.draftSections||f?.sections?.length))throw Error('Paid audit with complete intake required');
 if(!clean(input.reviewer,100)||input.scopeConfirmed!==true||input.qualityApproved!==true)throw Error('Named reviewer, scope and quality approval required');
 const findings=(input.findings||[]).slice(0,30).map(x=>{
  const observation=clean(x.observation,1000),sourceUrl=clean(x.sourceUrl,300),source=clean(x.source,40);
  if(observation.length<30||!['PUBLIC_PAGE','CUSTOMER_STATEMENT'].includes(source))throw Error('Substantive sourced findings required');
  if(source==='PUBLIC_PAGE'){const u=new URL(sourceUrl);if(u.protocol!=='https:'||u.username||u.password)throw Error('Public HTTPS evidence required');}
  if(source==='CUSTOMER_STATEMENT'&&!clean(x.reference,150))throw Error('Customer-statement reference required');
  return {observation,source,sourceUrl,reference:clean(x.reference,150),observedAt:iso()};
 });
 if(findings.length<2)throw Error('At least two reviewed evidence findings required');
 if(f.review){f.reportVersion=(f.reportVersion||1)+1;delete order.customerAcceptanceEvidence;}
 const draft=f.draftSections||f.sections.filter(x=>x.title!=='Reviewed evidence findings');
 f.sections=[{title:'Reviewed evidence findings',body:findings.map((x,i)=>(i+1)+'. '+x.observation+' Source: '+x.source+' '+(x.sourceUrl||x.reference)).join('\n')},...draft];
 f.review={reviewer:clean(input.reviewer,100),at:iso(),scopeConfirmed:true,qualityApproved:true,findings};
 f.status='READY_FOR_CUSTOMER_REVIEW';f.deliveredAt=iso();delete f.draftSections;
 order.fulfillmentCompletedAt=f.deliveredAt;order.customerAcceptanceVerified=false;
 return order;
}
export function acceptAudit(order,input={}){
 const f=order?.fulfillment;
 if(!eq(f?.token,input.token)||!['READY_FOR_CUSTOMER_REVIEW','CUSTOMER_ACCEPTED'].includes(f.status)||!f.review?.qualityApproved||input.reportVersion!==f.reportVersion||input.accepted!==true)
  throw Error('Current reviewed report and private customer token required');
 if(f.status==='CUSTOMER_ACCEPTED')return order;
 order.customerAcceptanceVerified=true;order.customerAcceptanceEvidence={reportVersion:f.reportVersion,at:iso(),source:'PRIVATE_CUSTOMER_ORDER_PAGE'};
 f.status='CUSTOMER_ACCEPTED';return order;
}
export function recordSignedCapture(order,{eventId,captureId,receivedAt}={}){
 if(!order||order.captureId!==captureId||!eventId||!Number.isFinite(Date.parse(receivedAt)))throw Error('Matching signed capture evidence required');
 order.webhookEvidence={eventId,captureId,receivedAt,signatureVerified:true,provider:'PAYPAL'};return order;
}
export function independentSale(order){return Boolean(order?.status==='COMPLETED'&&order.captureId&&order.capturedAt&&
 order.webhookEvidence?.signatureVerified===true&&order.webhookEvidence.captureId===order.captureId&&order.webhookEvidence.eventId&&
 order.independentBuyerEvidence?.source==='PAYPAL_ORDER_READ_AND_OWNER_REVIEW'&&order.independentBuyerEvidence.orderId===order.id&&order.independentBuyerVerified===true&&
 order.fulfillment?.review?.qualityApproved===true&&order.fulfillmentCompletedAt&&order.customerAcceptanceVerified===true&&order.customerAcceptanceEvidence?.at);}

export function financialSummary(orders=[]){
 const seen=new Set(),paid=orders.filter(o=>o?.status==='COMPLETED'&&o.captureId&&o.capturedAt&&!seen.has(o.captureId)&&(seen.add(o.captureId),true));
 const gross=paid.every(o=>recordedAmount(o.capturedAmount))?paid.reduce((n,o)=>n+money(o.capturedAmount),0):null;
 const refundRows=paid.flatMap(o=>(o.refunds||[]).filter(r=>r.source==='PAYPAL_SIGNED_EVENT'));
 const refunds=refundRows.every(r=>recordedAmount(r.amountUsd))?refundRows.reduce((s,r)=>s+money(r.amountUsd),0):null;
 const feesKnown=paid.length>0&&paid.every(o=>o.paypalFeeSource==='PROVIDER'&&recordedAmount(o.paypalFeeUsd));
 const fees=feesKnown?paid.reduce((n,o)=>n+money(o.paypalFeeUsd),0):null;
 const costsKnown=paid.length>0&&paid.every(o=>o.costReview?.complete===true&&o.costReview.reference&&recordedAmount(o.costReview.amountUsd));
 const costs=costsKnown?paid.reduce((n,o)=>n+money(o.costReview.amountUsd),0):null;
 const settled=paid.filter(o=>o.settlement?.payoutReference&&o.settlement?.bankReference&&o.settlement.source==='OWNER_RECONCILED_DOCUMENTS'&&recordedAmount(o.settlement.bankAmountUsd));
 return {captures:paid.length,grossCapturedUsd:gross===null?null:money(gross),providerRefundsUsd:refunds===null?null:money(refunds),paypalFeesUsd:fees,
  recordedCostsUsd:costs,recordedContributionProfitUsd:[gross,refunds,fees,costs].every(x=>x!==null)?Math.round((gross-refunds-fees-costs)*100)/100:null,
  bankSettlementStatus:settled.length===paid.length&&paid.length?'OWNER_DOCUMENTS_RECONCILED_NOT_INDEPENDENTLY_VERIFIED':'UNVERIFIED',
  recordedBankSettlementUsd:settled.length?money(settled.reduce((s,o)=>s+money(o.settlement.bankAmountUsd),0)):null};
}
export async function recordOps(kind,data={}){
 return mutateJson(OPS_KEY,freshOps(),s=>{
  s.updatedAt=iso();
  if(kind==='REVENUE_CASE'){
   recordRevenueCase(s,data);
  }else if(kind==='DEMAND'){
   if(!data.leadId||data.source!=='FIRST_PARTY_DIAGNOSTIC')throw Error('Actual diagnostic reference required');
   s.signals[data.leadId]={id:data.leadId,source:data.source,contactPermission:data.contactPermission===true,at:iso(),status:'INBOUND_UNQUALIFIED_NOT_A_BUYER'};
  }else if(kind==='MANUAL_TASK'){
   if(!['CRM','BOOKING','FULFILLMENT','SUPPORT','REFUND_REVIEW'].includes(data.type)||!clean(data.reference,150))throw Error('Supported task and source reference required');
   const id=data.id||randomBytes(16).toString('hex');const old=s.tasks[id];
   s.tasks[id]={...old,id,type:data.type,reference:clean(data.reference,150),notes:clean(data.notes,1500),status:data.completed===true?'OWNER_REPORTED_COMPLETE':'OWNER_ACTION_REQUIRED',updatedAt:iso(),providerVerified:false};
  }else if(kind==='ALERT_RECEIPT'){
   const a=s.alerts[data.id];if(!a||!clean(data.receiptReference,150))throw Error('Known alert and receipt reference required');
   a.receivedAt=iso();a.receiptReference=clean(data.receiptReference,150);a.status='OWNER_ACKNOWLEDGED_RECEIPT';
  }else if(kind==='EVIDENCE'){
   if(!['email','crm','booking','recovery','backup'].includes(data.capability)||!clean(data.reference,150))throw Error('Supported capability and evidence reference required');
   s.evidence[data.capability]={reference:clean(data.reference,150),at:iso(),source:'OWNER_RECORDED_REQUIRES_INDEPENDENT_VERIFICATION'};
  }else throw Error('Unsupported operation');
 });
}
export async function operationsPulse(orders=[]){
 return mutateJson(OPS_KEY,freshOps(),s=>{
  const now=iso();s.updatedAt=now;escalateRevenueCases(s,now);
  for(const o of orders){const f=o.fulfillment;if(o.product===AUDIT_SKU&&o.captureId&&f?.status!=='CUSTOMER_ACCEPTED'){
   const key='audit:'+o.id,overdue=f?.dueAt&&Date.parse(f.dueAt)<Date.now();
   s.alerts[key]??={id:key,kind:'PAID_AUDIT_NEEDS_REVIEW',reference:o.id,createdAt:now,status:'QUEUED_NOT_DELIVERED'};
   s.alerts[key].overdue=Boolean(overdue);
   s.tasks[key]??={id:key,type:'FULFILLMENT',reference:o.id,status:'OWNER_ACTION_REQUIRED',providerVerified:false,updatedAt:now,notes:'Review paid audit and deliver by '+(f?.dueAt||'deadline pending intake')};
  }}
 });
}

export async function safeRead(operation,{attempts=2,wait=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 for(let n=0;n<Math.min(3,attempts);n++)try{return await operation()}catch(e){if(n+1>=Math.min(3,attempts)||e.retryable!==true)throw e;await wait(100*2**n);}
 throw Error('Read attempts must be positive');
}
export function publicOperations(orders=[],state=freshOps(),env={}){
 const paid=orders.filter(o=>o.captureId&&o.status==='COMPLETED');
 return {version:'41.0.0',asOf:iso(),realAcceptedCustomers:orders.filter(independentSale).length,financials:financialSummary(orders),
  pendingAuditReviews:paid.filter(o=>o.product===AUDIT_SKU&&!['READY_FOR_CUSTOMER_REVIEW','CUSTOMER_ACCEPTED'].includes(o.fulfillment?.status)).length,
  inboundSignals:Object.keys(state.signals||{}).length,confirmedBuyers:0,
  manualTasks:Object.values(state.tasks||{}).filter(t=>t.status==='OWNER_ACTION_REQUIRED').length,
  pendingAlerts:Object.values(state.alerts||{}).filter(a=>a.status!=='OWNER_ACKNOWLEDGED_RECEIPT').length,
  alerts:'QUEUED_ALERTS_ARE_NOT_RECEIVED_NOTIFICATIONS',
  email:env.ULTRON_GMAIL_REFRESH_TOKEN?'CONFIGURED_ROUND_TRIP_REQUIRED':'AUTH_REQUIRED',
  crm:env.ULTRON_HUBSPOT_PRIVATE_APP_TOKEN?'CONFIGURED_ROUND_TRIP_REQUIRED':'MANUAL_FALLBACK_AVAILABLE',
  booking:env.ULTRON_CALENDAR_REFRESH_TOKEN?'CONFIGURED_ROUND_TRIP_REQUIRED':'MANUAL_FALLBACK_AVAILABLE',
  backups:state.evidence?.backup?'OWNER_EVIDENCE_RECORDED':'RESTORE_DRILL_REQUIRED',
  note:'Real buyer demand, received notifications, owner authorizations and settlement are external outcomes; code cannot manufacture them.'};
}
export function renderAuditDelivery(order){
 const f=order.fulfillment,ready=['READY_FOR_CUSTOMER_REVIEW','CUSTOMER_ACCEPTED'].includes(f.status);
 const token=JSON.stringify(f.token).replace(/</g,'\\u003c');
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Your audit order</title><style>body{font:16px/1.6 system-ui;max-width:850px;margin:32px auto;padding:20px}textarea{width:100%;min-height:90px}section{border-top:1px solid #ccc}button{padding:12px}</style><main><h1>'+escape(f.title)+'</h1><p>Payment confirmed; service status: '+escape(f.status)+'</p><p>Order '+escape(order.id)+'</p><p>Delivery deadline: '+escape(f.dueAt||'Pending completed intake and scope confirmation')+'</p>'+
 (ready?f.sections.map(x=>'<section><h2>'+escape(x.title)+'</h2><p>'+escape(x.body).replace(/\n/g,'<br>')+'</p></section>').join(''):'<p>Your report is awaiting onboarding or quality review. A payment receipt is not a completed consulting audit.</p>')+
 (f.status==='READY_FOR_CUSTOMER_REVIEW'?'<button id="accept">Accept this delivered report</button>':'')+
 (f.status==='ONBOARDING_REQUIRED'?'<p><a href="/audit-intake?orderToken='+encodeURIComponent(f.token)+'">Complete private order onboarding</a></p>':'')+'<h2>Support, revision or refund review</h2><form id="support"><label>Request type<select name="requestType"><option value="SUPPORT">Support or revision</option><option value="REFUND_REVIEW">Refund review</option></select></label><label>Describe your request without secrets<textarea name="notes" required maxlength="1500"></textarea></label><button>Submit request</button></form><p id="status" role="status"></p><script>const token='+token+';const status=document.getElementById("status");async function send(path,b){const r=await fetch(path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...b,token})});const d=await r.json();status.textContent=r.ok?d.message:d.error;return r.ok}const accept=document.getElementById("accept");if(accept)accept.onclick=async()=>{if(await send("/api/audit/v41/accept",{accepted:true,reportVersion:'+Number(f.reportVersion||1)+'}))location.reload()};document.getElementById("support").onsubmit=async e=>{e.preventDefault();await send("/api/audit/v41/support",{notes:new FormData(e.target).get("notes"),requestType:new FormData(e.target).get("requestType")})};</script><p><a href="/audit-terms">Service terms</a></p></main></html>';
}

// Versioned authenticated encryption for backups; never export plaintext credentials.
export function encryptSnapshot(snapshot,key){
 const k=Buffer.from(key||'','base64');if(k.length!==32)throw Error('32-byte base64 backup key required');
 const data=Buffer.from(JSON.stringify(snapshot)),iv=randomBytes(12),c=createCipheriv('aes-256-gcm',k,iv);
 const encrypted=Buffer.concat([c.update(data),c.final()]);
 return {version:1,algorithm:'AES-256-GCM',iv:iv.toString('base64'),tag:c.getAuthTag().toString('base64'),data:encrypted.toString('base64'),sha256:createHash('sha256').update(data).digest('hex')};
}
export function decryptSnapshot(backup,key){
 if(backup?.version!==1||backup.algorithm!=='AES-256-GCM')throw Error('Unsupported backup');
 const k=Buffer.from(key||'','base64');if(k.length!==32)throw Error('32-byte base64 backup key required');
 const d=createDecipheriv('aes-256-gcm',k,Buffer.from(backup.iv,'base64'));d.setAuthTag(Buffer.from(backup.tag,'base64'));
 const plain=Buffer.concat([d.update(Buffer.from(backup.data,'base64')),d.final()]);
 if(createHash('sha256').update(plain).digest('hex')!==backup.sha256)throw Error('Backup digest mismatch');
 return JSON.parse(plain.toString());
}
