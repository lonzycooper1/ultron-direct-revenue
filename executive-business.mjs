import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {financialSummary,independentSale} from './ultron-revenue-operations-v41.mjs';
import {executive} from './executive-runtime.mjs';
import {productDeployer} from './product-deployer.mjs';

const KEY='ultron-executive-business',fresh=()=>({events:{},lastSync:null,learning:null});
const hash=x=>createHash('sha256').update(String(x)).digest('hex');
const text=(x,n=2000)=>String(x??'').trim().slice(0,n);
export function reconciliationSnapshot(orders=[]){
 const seen=new Set(),paid=orders.filter(o=>o.status==='COMPLETED'&&o.captureId&&o.capturedAt&&!seen.has(o.captureId)&&(seen.add(o.captureId),true));
 const known=paid.filter(o=>o.capturedAmount!==null&&o.capturedAmount!==undefined&&o.capturedAmount!==''&&typeof o.capturedAmount!=='boolean'&&Number.isFinite(Number(o.capturedAmount))&&Number(o.capturedAmount)>=0),missingAmounts=paid.length-known.length;
 let summary;try{summary=financialSummary(known)}catch{summary={grossCapturedUsd:null,paypalFeesUsd:null,providerRefundsUsd:null,recordedCostsUsd:null,recordedContributionProfitUsd:null,bankSettlementStatus:'INVALID_RECORDS_REQUIRE_REVIEW'}}
 return {...summary,captures:paid.length,...(missingAmounts?{grossCapturedUsd:null,paypalFeesUsd:null,providerRefundsUsd:null,recordedCostsUsd:null,recordedContributionProfitUsd:null}:{}),missingCaptureAmounts:missingAmounts,bankSettlementIndependentlyVerified:false};
}
export function learningSnapshot(orders=[]){
 const seen=new Set(),accepted=orders.filter(o=>independentSale(o)&&!seen.has(o.captureId)&&(seen.add(o.captureId),true));
 const channels={};
 for(const o of accepted){const channel=text(o.attribution?.channel||'UNATTRIBUTED',80);(channels[channel]??=[]).push(o)}
 const groups=Object.entries(channels).map(([channel,list])=>({channel,acceptedOrders:list.length,finance:reconciliationSnapshot(list)}));
 return {acceptedIndependentOrders:accepted.length,channels:groups,decision:accepted.length<5?'INSUFFICIENT_VERIFIED_OUTCOMES':groups.every(g=>g.finance.recordedContributionProfitUsd!==null)?'REVIEW_MEASURED_CONTRIBUTION':'COST_RECONCILIATION_REQUIRED',automaticBudgetChange:false};
}
export function advertisingRecommendation({spendUsd,conversions,revenueUsd,dailyBudgetUsd,maxDailyBudgetUsd}={}){
 const values=[spendUsd,conversions,revenueUsd,dailyBudgetUsd,maxDailyBudgetUsd];
 if(values.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0)||!Number.isInteger(conversions)||dailyBudgetUsd>maxDailyBudgetUsd)throw Error('Verified nonnegative metrics and an explicit budget cap are required');
 if(conversions<20)return {action:'HOLD',reason:'Fewer than 20 measured conversions',executed:false};
 return {action:revenueUsd>spendUsd*2&&spendUsd>0?'REVIEW_INCREASE':'REVIEW_EFFICIENCY',proposedDailyBudgetUsd:Math.round(Math.min(maxDailyBudgetUsd,dailyBudgetUsd*1.1)*100)/100,reason:'Revenue ROAS is not profit; review fees, delivery costs and attribution before spending',executed:false};
}
export function verifyBusinessWebhook(raw,headers,secret,now=Date.now()){
 if(!secret)throw Error('Business webhook secret is not configured');
 const stamp=String(headers['x-ultron-timestamp']||''),signature=String(headers['x-ultron-signature']||'');
 if(!/^\d{13}$/.test(stamp)||Math.abs(now-Number(stamp))>5*60000||!/^sha256=[a-f0-9]{64}$/.test(signature))throw Error('Invalid or expired business webhook signature');
 const expected=Buffer.from(createHmac('sha256',secret).update(stamp+'.'+raw).digest('hex'),'hex'),provided=Buffer.from(signature.slice(7),'hex');
 if(!timingSafeEqual(expected,provided))throw Error('Invalid business webhook signature');
 const input=JSON.parse(raw);if(!['signup','support'].includes(input.type)||!/^[\w:.-]{1,120}$/.test(input.eventId||''))throw Error('Supported event type and stable ID required');
 if(!text(input.message))throw Error('Event message required');
 return {id:'webhook:'+hash(input.eventId),kind:input.type==='support'?'support':'analysis',prompt:'Authenticated application event ('+input.type+'). This signature establishes sender access, not payment, identity or permission to send a message. Prepare a draft response or onboarding task from this evidence. No external actions. '+text(input.message,6000)};
}
export function businessEvents({orders=[],leads=[],tasks=[]}={}){
 const events=[];
 for(const o of orders.slice(-100)){
  if(o.status!=='COMPLETED'||!o.captureId||!o.capturedAt)continue;
  const baseline={product:o.product||null,amountUsd:o.capturedAmount??null,capturedAt:o.capturedAt,intake:o.auditIntake?{company:text(o.auditIntake.company,160),website:text(o.auditIntake.website,300),workflow:text(o.auditIntake.currentWorkflow,1500)}:null,fulfilled:Boolean(o.fulfillmentCompletedAt),accepted:o.customerAcceptanceVerified===true};
  events.push({id:'capture:'+hash(o.captureId),kind:'analysis',prompt:'Prepare a customer-specific fulfillment checklist for this captured order. Payment is not delivery. Identify missing intake, evidence, quality review and acceptance. Do not mark the service delivered. Application evidence: '+JSON.stringify(baseline)});
 }
 for(const lead of leads.slice(0,20)){
  if(lead.followupConsent!==true||lead.consentScope!=='REQUESTED_ONE_TO_ONE_DIAGNOSTIC_FOLLOWUP'||['suppressed','closed'].includes(lead.status))continue;
  events.push({id:'lead:'+hash(lead.id),kind:'marketing',prompt:'Prepare one requested diagnostic follow-up draft. This lead consented to one-to-one diagnostic follow-up; do not send. Do not imply a purchase or measured revenue loss. Evidence: '+JSON.stringify({company:text(lead.company,160),niche:lead.niche,severity:lead.severity,reportedMonthlyLeads:lead.monthlyLeads,reportedResponseMinutes:lead.responseMinutes})});
 }
 for(const task of tasks.slice(-50))if(task.type==='SUPPORT'&&task.id&&task.notes)events.push({id:'support:'+hash(task.id),kind:'support',prompt:'Prepare a support response draft. Do not issue refunds or assume entitlement; the source is an existing application support task. Request: '+text(task.notes,1500)});
 return events;
}
export function createBusinessRuntime({read=()=>getJson(KEY,fresh()),mutate=f=>mutateJson(KEY,fresh(),f),enqueue=x=>executive.enqueue(x)}={}){
 async function receive(event){
  let saved;
  await mutate(s=>{
   const old=s.events[event.id];if(old){saved=old;return}
   const terminal=Object.values(s.events).filter(e=>e.status==='QUEUED').sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
   for(const e of terminal.slice(0,Math.max(0,Object.keys(s.events).length-2000)))delete s.events[e.id];
   saved={...event,status:'PENDING',createdAt:new Date().toISOString()};s.events[event.id]=saved;
  });
  if(saved.status==='QUEUED')return {duplicate:true,jobId:saved.jobId};
  const job=await enqueue({kind:saved.kind,prompt:saved.prompt,idempotencyKey:saved.id});
  await mutate(s=>{s.events[saved.id].status='QUEUED';s.events[saved.id].jobId=job.id});
  return {queued:true,jobId:job.id};
 }
 async function sync(input){
  const events=businessEvents(input);let queued=0;
  // Retry durable pending events with their original prompt after a transient queue failure.
  const pending=Object.values((await read()).events).filter(e=>e.status==='PENDING');
  for(const event of [...pending,...events].slice(0,30)){try{const result=await receive(event);if(result.queued)queued++}catch{break}}
  const learning=learningSnapshot(input.orders);
  await mutate(s=>{s.lastSync=new Date().toISOString();s.learning=learning;s.finance=reconciliationSnapshot(input.orders)});return {queued,learning};
 }
 async function status(){const s=await read();return {lastSync:s.lastSync,eventCount:Object.keys(s.events).length,pending:Object.values(s.events).filter(e=>e.status==='PENDING').length,learning:s.learning,finance:s.finance}}
 return {receive,sync,status};
}
export const businessRuntime=createBusinessRuntime();
export async function executiveBusinessPulse(orders){
 const [leads,ops]=await Promise.all([getJson('acquisition-leads-v1',{leads:[]}),getJson('ultron-revenue-operations-v41',{tasks:{}})]);
 const result=await businessRuntime.sync({orders,leads:leads.leads||[],tasks:Object.values(ops.tasks||{})});
 if(process.env.ULTRON_VERCEL_TOKEN&&process.env.ULTRON_VERCEL_PROJECT_ID){
  const jobs=(await executive.status(true)).jobs.filter(j=>j.kind==='build'&&j.status==='DRAFT_READY').slice(-5);
  for(const job of jobs)await productDeployer.submit(job).catch(()=>{});
  await productDeployer.poll().catch(()=>{});
 }
 return result;
}
