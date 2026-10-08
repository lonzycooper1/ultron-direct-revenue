import {getJson,mutateJson,storeHealth} from './state-store.mjs';
import {growthState} from './ultron-growth-runtime-v19.mjs';
import {readiness} from './ultron-integration-v21.mjs';
import {discoveryFallback,overview as salesOverview,safeCycle as salesCycle} from './ultron-sales-v22.mjs';
import {report as financeReport} from './ultron-finance-v22.mjs';
import {ledger} from './ledger-store.mjs';
import {leadSummary} from './acquisition-funnel.mjs';
import {activationPlan} from './ultron-activation-v27.mjs';
import {buildTrillionMission} from './ultron-trillion-mission-v25.mjs';
import {assessCompletion500,validateCompletionEvidence} from './ultron-500-completion-v26.mjs';

const KEY='ultron-v23-supervisor',now=()=>new Date().toISOString();
const init=()=>({version:'23.0.0',lastCycle:null,history:[],ownerEvidence:{},activeAlerts:{},v26Evidence:{},v26WorkQueue:[],cycleNumber:0});
const read=()=>getJson(KEY,init());
const names=[
'Buyer acquisition with dual authorized feeds','Owned domain and authenticated business mail','Live Gmail and HubSpot execution','500 dollar flagship audit and value ladder',
'Evidence-based custom demos','Calendar to proposal and checkout','Storefront commercial activation','Verified payment to accepted delivery',
'Authorized marketing distribution','Independent paid client proof',
'Single accountable CEO controller','Durable queue and memory','Fallback and self-healing integrations','Paid-job-first scheduling','Agent outcome evaluation',
'Tests, deployment health, and rollback','Cross-provider record reconciliation','Exception-only owner approval','Accurate executive dashboard','Security, backup and restore tests',
'Recurring revenue','Enterprise offers and capacity','Signed reseller partnerships','Retention and customer success','Contribution margin and CAC controls',
'Processor to bank reconciliation','Loan-ready financial documents','Contracts and business protection','Channel attribution','Mobile and Mac operator experience'];
export const TARGET_COUNT=30;
export function requiredStatus({integration={},paidOrders=0,accepted=0,crmDeals=0,domainVerified=false,shopifyLive=false}={}){
 const r=Array.from({length:30},(_,i)=>({id:i+1,name:names[i],status:'IMPLEMENTATION_OR_EVIDENCE_REQUIRED',proof:'Independent execution evidence required'}));
 const set=(i,status,proof)=>{r[i-1].status=status;r[i-1].proof=proof};
 const d=integration.discovery?.configured,mail=integration.gmail?.configured,c=integration.calendar?.configured,h=integration.hubspot?.configured;
 set(1,d?'FEED_CONFIGURED_NOT_VERIFIED':'BLOCKED_NO_AUTHORIZED_FEED','Two working authorized feeds and a verified import required');
 set(2,domainVerified?'DOMAIN_EVIDENCE_PRESENT':'BLOCKED_DOMAIN_OWNERSHIP','Owned domain, mailboxes, SPF DKIM DMARC and TLS must be verified');
 set(3,mail&&h?'CONNECTORS_CONFIGURED_NOT_VERIFIED':'BLOCKED_RAILWAY_OAUTH','Verify live send, inbound reply and HubSpot write under approved policy');
 set(4,'OFFER_BUILT_VALIDATE_DEMAND','500 dollar audit and 2500 / 7500 / 10000 dollar service ladder already defined');
 set(5,'SOFTWARE_AVAILABLE_NOT_CUSTOMER_PROOF','Scanned real website and labeled demo required');
 set(6,c?'CALENDAR_CONFIGURED_NOT_VERIFIED':'BLOCKED_CALENDAR_OAUTH','Confirm booking, attendee and proposal or checkout attribution');
 set(7,shopifyLive?'STORE_READY_VERIFY_CHECKOUT':'BLOCKED_SHOPIFY_TRIAL','Verify paid Shopify checkout or use direct live PayPal');
 set(8,paidOrders&&accepted?'EVIDENCE_REVIEW_REQUIRED':'BLOCKED_NO_ACCEPTED_PAID_DELIVERY','Signed capture, scoped QC, delivery and customer acceptance required');
 set(9,'BLOCKED_DISTRIBUTION_AUTHORIZATION','Production publishing accounts, permissions and conversion evidence required');
 set(10,paidOrders?'REQUIRES_CASE_STUDY_CONSENT':'BLOCKED_NO_INDEPENDENT_CUSTOMER','Document first actual paid customer and delivery with permission');
 set(11,'CONTROLLER_CODE_EXISTS','Observe real decisions and completed external outcomes');
 set(12,'PERSISTENT_POSTGRES_AVAILABLE','Verify durable jobs and restart-recovery in production');
 set(13,d?'FALLBACK_IMPLEMENTED_TEST_REQUIRED':'BLOCKED_NO_FEEDS','Demonstrate a permitted fallback during source failure');
 set(14,'SCHEDULER_IMPLEMENTED_VERIFY_OUTCOMES','Confirm paid tasks preempt new speculative work');
 set(15,'MEASUREMENT_REQUIRED','Agent outcomes must be tied to verified sales, costs and quality');
 set(16,'DEPLOY_GATE_AVAILABLE','CI coverage, monitored releases and recovery drill remain required');
 set(17,h?'CRM_ADAPTER_CONFIGURED_NOT_VERIFIED':'BLOCKED_CRM_AUTH','Reconcile real contacts, orders and opted-out records across systems');
 set(18,'APPROVAL_CONTROL_AVAILABLE','Prove nonfinancial routines operate without unapproved writes');
 set(19,'DASHBOARD_IMPLEMENTED_VERIFY_DATA','Check live metrics against processors and business records');
 set(20,'SECURITY_AUDIT_REQUIRED','Backups, restore tests, access control and incident procedures require evidence');
 set(21,'RECURRING_BILLING_VALIDATION_REQUIRED','Verify contracted real subscription and customer value');
 set(22,'SALES_AND_DELIVERY_CAPACITY_REQUIRED','Qualified enterprise customer and delivery capacity required');
 set(23,'SIGNED_PARTNERS_REQUIRED','Partners are not active without executed agreements');
 set(24,'CUSTOMER_OUTCOMES_REQUIRED','Retention and satisfaction require paying customers');
 set(25,'MARGIN_EVIDENCE_REQUIRED','Require true attributable expenses and client acquisition data');
 set(26,'BANK_SETTLEMENT_CONFIRMATION_REQUIRED','Processor captures alone are not bank deposits');
 set(27,'LENDER_DOCUMENT_EVIDENCE_REQUIRED','EIN, entity, accounts, financials and eligibility are not confirmed');
 set(28,'LEGAL_REVIEW_AND_RECORDS_REQUIRED','Executed contracts, policies, rights and insurance must be evidenced');
 set(29,'ATTRIBUTION_EVIDENCE_REQUIRED','Trace an actual lead through a paid order');
 set(30,'DEVICE_ACCEPTANCE_TEST_REQUIRED','Run iPhone and Mac workflow accessibility and login tests');
 return r;
}
export function prioritize({paid=0,interested=0,inbound=0,blockers=0}={}){
 return paid>0?'FULFILL_PAID_ORDERS':interested>0?'RESPOND_TO_INTERESTED_BUYERS':inbound>0?'REVIEW_OPT_IN_INBOUND':blockers>0?'REPAIR_REVENUE_PIPELINE':'DISCOVER_AND_CONVERT_CUSTOMERS';
}
export function publicReadiness(data){return {version:'23.0.0',asOf:data.asOf,objective:data.objective,verifiedOrders:data.verifiedOrders,blockedCount:data.blockedCount,taskCounts:data.taskCounts,strategicTargetUsd:data.strategicMission?.targetUsd||1000000000000,nextMilestoneUsd:data.strategicMission?.nextMilestone?.usd||100,notice:'Successful software cycles are not customer revenue. No guarantee of profit.'}}
export async function snapshot(){
 const [s,g,l,i,f,db,sales,inbound]=await Promise.all([read(),growthState(),ledger(),Promise.resolve(readiness()),financeReport(),storeHealth(),salesOverview(),leadSummary()]);
 const paid=Object.values(l.orders||{}).filter(o=>o.captureId&&o.capturedAt);
 const interested=Object.values(g.prospects||{}).filter(p=>p.stage==='INTERESTED').length;
 const tasks=requiredStatus({integration:i,paidOrders:paid.length,accepted:Number(sales.metrics?.accepted||0),domainVerified:false,shopifyLive:false});
 const blockers=tasks.filter(x=>x.status.startsWith('BLOCKED_'));
 const taskCounts={blocked:blockers.length,needsEvidence:tasks.length-blockers.length,externallyVerified:0};
 const completion500=assessCompletion500({verifiedRevenueUsd:f.verifiedCaptureUsd||0,verifiedOrders:paid.length,interestedBuyers:interested,operatorTasks:tasks,providerReadiness:i,serviceHealth:db,ownerEvidence:s.v26Evidence||{}});
 const activation=activationPlan({integrations:i,paymentRuntime:{ok:process.env.PAYPAL_CLIENT_ID&&process.env.PAYPAL_CLIENT_SECRET&&process.env.PAYPAL_WEBHOOK_ID?true:false,apiAuthorized:false,webhookEndpointVerified:false},inbound,paidOrders:paid.length,unfulfilledPaidOrders:Number(sales.metrics?.outstandingDelivery||0),interestedBuyers:interested,verifiedRevenueUsd:f.verifiedCaptureUsd||0});
 return {version:'23.0.0',asOf:now(),objective:prioritize({paid:Number(sales.metrics?.outstandingDelivery||0),interested,inbound:inbound.new,blockers:blockers.length}),
 verifiedOrders:paid.length,interestedBuyers:interested,inboundLeads:inbound,activation,verifiedCapturedUsd:f.verifiedCaptureUsd||0,
 blockedCount:blockers.length,taskCounts,tasks,providerReadiness:i,db,
 lastCycle:s.lastCycle,cycleNumber:s.cycleNumber,recentCycles:s.history.slice(-12),
 ownerEvidenceCount:Object.keys(s.ownerEvidence||{}).length,completion500,
 safety:{automaticPaidAds:false,automaticFinancialTransfers:false,unapprovedExternalEmail:false,reportedRevenueIsNotCash:true},strategicMission:buildTrillionMission({verifiedRevenueUsd:f.verifiedCaptureUsd||0,paidOrders:paid.length,interestedBuyers:interested,blockedTasks:tasks})};
}
export async function cycle(){
 const old=await read(),latest=old.lastCycle?.at&&Date.parse(old.lastCycle.at)||0;
 if(Date.now()-latest<5*60000)return {status:'RECENTLY_CHECKED',at:old.lastCycle.at};
 let discovery={status:'NOT_ATTEMPTED'},flywheel={status:'NOT_ATTEMPTED'};
 try{discovery=await discoveryFallback()}catch(e){discovery={status:'ERROR',error:String(e.message||e).slice(0,140)}}
 try{flywheel=await salesCycle()}catch(e){flywheel={status:'ERROR',error:String(e.message||e).slice(0,140)}}
 const snap=await snapshot();
 const rec={at:now(),objective:snap.objective,strategicTargetUsd:snap.strategicMission.targetUsd,strategicMilestone:snap.strategicMission.nextMilestone.usd,mainframeDirective:snap.strategicMission.mainframeDirective,activation:{focus:snap.activation.focus,inboundReceived:snap.activation.firstPartyInbound.received,inboundNew:snap.activation.firstPartyInbound.new,sender:snap.activation.providerGates.sender.status,discovery:snap.activation.providerGates.discovery.status,actions:snap.activation.actions.slice(0,3).map(x=>x.key)},completion500:{registered:snap.completion500.registeredRequirements,evidenceVerified:snap.completion500.evidenceVerifiedCount,focus:snap.completion500.focus,topAction:snap.completion500.nextActions[0]||null,ownerApprovalsRequired:snap.completion500.requiresExternalAction.length},verifiedOrders:snap.verifiedOrders,blocked:snap.blockedCount,
 discovery,flywheel,dbOk:snap.db.ok};
 await mutateJson(KEY,init(),s=>{s.lastCycle=rec;s.cycleNumber++;s.history.push(rec);if(s.history.length>48)s.history=s.history.slice(-48);
 s.activeAlerts=Object.fromEntries(snap.tasks.filter(t=>t.status.startsWith('BLOCKED_')).map(t=>[t.id,{name:t.name,status:t.status,at:rec.at}]));
 s.v26WorkQueue=snap.completion500.safeResearchOrImplementationCandidates.map(x=>({...x,status:'PLANNED_NOT_EXECUTED',createdOrRefreshedAt:rec.at}));});
 return {status:'SUPERVISOR_CYCLE_RECORDED',...rec};
}
export async function registerOwnerEvidence({taskId,url,description}={}){
 const id=Number(taskId);
 if(!Number.isInteger(id)||id<1||id>30)throw Error('Known task ID required');
 if(typeof url!=='string'||!/^https:\/\/[^\s]+$/.test(url)||url.length>1000)throw Error('Public HTTPS evidence URL required');
 if(typeof description!=='string'||description.trim().length<8)throw Error('Meaningful owner evidence description required');
 await mutateJson(KEY,init(),s=>{s.ownerEvidence[id]={url,description:description.slice(0,500),recordedAt:now(),status:'OWNER_SUBMITTED_NOT_INDEPENDENTLY_VERIFIED'};});
 return {taskId:id,status:'OWNER_SUBMITTED_NOT_INDEPENDENTLY_VERIFIED'};
}

export async function register500Evidence(payload={}){
 const validated=validateCompletionEvidence(payload);
 await mutateJson(KEY,init(),s=>{s.v26Evidence??={};s.v26Evidence[validated.id]=validated;});
 return {id:validated.id,status:'OWNER_SUBMITTED_PENDING_INDEPENDENT_VERIFICATION',note:'Submitting a link does not complete a requirement.'};
}
