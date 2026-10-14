/**
 * ULTRON Revenue Commander v38
 * Converts the 2026-10-14 screen recording's requested outcomes into an
 * evidence-gated, first-customer priority queue. No provider bypass, impersonation,
 * unsolicited messages, spending, signatures, lending or trading.
 */
export const VERSION='38.0.0';
export const GOAL='FIRST_GENUINE_INDEPENDENT_CUSTOMER_DELIVER_AND_REPEAT';
export const ULTIMATE_GOAL='ASPIRATIONAL_ONE_TRILLION_CUMULATIVE_EXTERNAL_REVENUE';
export const UPGRADES=Object.freeze([
 {id:'conversion',phase:'P0',name:'First-customer conversion engine',proof:'Independent buyer, provider-completed payment, delivered work and acceptance'},
 {id:'discovery',phase:'P0',name:'Authorized buyer discovery and fallback',proof:'Qualified sourced company records and documented intent; not invented demand'},
 {id:'gmail',phase:'P0',name:'Runtime business-email execution bridge',proof:'Authorized Gmail sender, tested real send, reply ingestion, opt-out and bounce controls'},
 {id:'booking',phase:'P0',name:'Reply-to-booking and CRM reconciliation',proof:'Confirmed attendee booking and authorized HubSpot read/write reconciliation'},
 {id:'fulfillment',phase:'P0',name:'Verified payment-to-delivery loop',proof:'Signed processor capture, deliverable QA, customer acceptance and settlement reconciliation'},
 {id:'demos',phase:'P1',name:'Personalized proof-of-value demos',proof:'Customer-relevant accurate demo, clearly labeled assumptions and approval'},
 {id:'resilience',phase:'P1',name:'Self-healing integration supervisor',proof:'Failure injection, bounded retry, fallback and reliable owner escalation'},
 {id:'identity',phase:'P1',name:'Branded domain and authenticated mail',proof:'Domain ownership, verified DNS, SPF/DKIM/DMARC and permitted postal address'},
 {id:'notifications',phase:'P1',name:'Owner alerts and approval escalation',proof:'A real delivered alert about actual reply, payment, fault or approval request'},
 {id:'quality',phase:'P1',name:'Customer fulfillment, QA and support',proof:'Tested scoped implementation, recorded quality review and customer signoff'},
 {id:'metrics',phase:'P2',name:'Revenue intelligence and independent evidence',proof:'Linked lead-to-deal/order, processor capture, fees, refunds, payouts and costs'},
 {id:'retention',phase:'P2',name:'Customer success, referrals and upsell',proof:'Real satisfied customer and permission-aware follow-up'},
 {id:'distribution',phase:'P2',name:'Content distribution and attribution',proof:'Authorized live public post and attributable qualified traffic'},
 {id:'finance',phase:'P2',name:'Business bookkeeping and lender readiness',proof:'Verified legal business records, actual financial statements and owner approval'},
 {id:'marketplace',phase:'P3',name:'Vetted partner and seller marketplace',proof:'Real approved suppliers, compliant payments, qualified demand and fulfillment'},
 {id:'jarvis',phase:'P3',name:'Secure advanced JARVIS and portable apps',proof:'Demonstrated safe reasoning evaluations, app builds and tested production releases'}
]);
const isReady=v=>typeof v==='string'?v.trim().length>0:Boolean(v);
const n=v=>Number.isFinite(Number(v))?Math.max(0,Math.floor(Number(v))):0;
const present=(env,keys)=>keys.every(key=>isReady(env[key]));
const count=x=>Array.isArray(x)?x.length:(x&&typeof x==='object'?Object.keys(x).length:0);
function gate(id,status,next,proof,ownerRequired=true){
 return {id,status,next,proof,ownerRequired};
}
export function classifyAction(action=''){
 const a=String(action).toLowerCase().slice(0,300);
 if(/(?:bypass|evad|forge|impersonat|fake customer|fake payment|fake review|steal|circumvent)/i.test(a))
  return {mode:'PROHIBITED',reason:'Never evade access controls, invent a sale or impersonate anyone'};
 if(/(?:otp|mfa|password|kyc|identity|biometric|captcha)/i.test(a))
  return {mode:'OWNER_ONLY',reason:'Identity and security challenges require a real authorized person'};
 if(/(?:send|message|publish|post|advertis|spend|charge|refund|transfer|payout|withdraw|trade|sign|contract|loan|credit|purchase|upgrade|oauth|token|permission|connect account)/i.test(a))
  return {mode:'APPROVED_EXTERNAL',reason:'Real account permission and action-specific authority required'};
 if(/(?:read|audit|draft|analy|research|rank|monitor|check|review|inspect|score|reconcile|report|triage|test|compare)/i.test(a))
  return {mode:'SAFE_INTERNAL',reason:'Read-only or internal non-consequential work'};
 return {mode:'REVIEW_REQUIRED',reason:'Unclassified action must not execute automatically'};
}
export function commanderSnapshot({env={},payment={},growth={},inbound={},commerce={},orders={},serviceOnline=true,externalProof={}}={}){
 const rows=Object.values(orders||{}).filter(x=>x&&typeof x==='object');
 const captured=rows.filter(x=>x.captureId&&String(x.status||'').toUpperCase()==='COMPLETED');
 const delivered=captured.filter(x=>x.fulfillment?.token);
 const unpaidDelivery=captured.filter(x=>!x.fulfillment?.token);
 const independent=delivered.filter(x=>x.independentBuyerVerified===true&&x.customerAcceptanceVerified===true);
 const consented=n(inbound.consentedOpen);
 const inquiries=n(inbound.total);
 const candidateCount=count(growth.prospects);
 const replyRecords=count(growth.replies);
 const pending=(Array.isArray(commerce.approvals)?commerce.approvals:[]).filter(x=>x.status==='pending').length;
 const paypal=payment.ok===true&&payment.apiAuthorized===true&&payment.webhookEndpointVerified===true&&payment.captureEventsSubscribed===true;
 const discovery=present(env,['ULTRON_DISCOVERY_FEED_URL'])||present(env,['ULTRON_DISCOVERY_FALLBACK_URL']);
 const gmail=present(env,['ULTRON_GMAIL_CLIENT_ID','ULTRON_GMAIL_CLIENT_SECRET','ULTRON_GMAIL_REFRESH_TOKEN','ULTRON_BUSINESS_SENDER','ULTRON_BUSINESS_POSTAL_ADDRESS','ULTRON_UNSUBSCRIBE_SECRET']);
 const crm=present(env,['ULTRON_HUBSPOT_PRIVATE_APP_TOKEN']);
 const calendar=present(env,['ULTRON_GOOGLE_CLIENT_ID','ULTRON_GOOGLE_CLIENT_SECRET','ULTRON_CALENDAR_REFRESH_TOKEN','ULTRON_CALENDAR_ID']);
 const domain=isReady(env.ULTRON_BRANDED_DOMAIN);
 const cash=externalProof.bankSettlementVerified===true;
 const buyerFeedVerified=externalProof.buyerFeedVerified===true;
 const gmailSendVerified=externalProof.gmailRoundTripVerified===true;
 const bookingVerified=externalProof.bookingVerified===true;
 const crmVerified=externalProof.crmWriteVerified===true;
 const gates=[
  gate('payments',paypal?'PROVIDER_READY_NOT_A_SALE':'BLOCKED_PROVIDER','Verify PayPal API and signed completed-capture webhook; reconcile actual customer transactions','Independent customer capture and refund/fee evidence'),
  gate('buyers',buyerFeedVerified?'SOURCE_VERIFIED':'NOT_PROVEN',discovery?'Validate configured authorized feed and actual purchase intent':'Use the owned opt-in diagnostic until an authorized feed is connected','Real imported qualified buyer records'),
  gate('gmail',gmail?(gmailSendVerified?'VERIFIED':'CONFIGURED_TEST_REQUIRED'):'BLOCKED_RUNTIME_AUTH','Complete Railway OAuth, nonresidential permitted business mailing address, opt-outs, and approved message scope','Sender round trip, delivery failure and suppression tests'),
  gate('crm',crm?(crmVerified?'VERIFIED':'CONFIGURED_TEST_REQUIRED'):'BLOCKED_RUNTIME_AUTH','Authorize Railway HubSpot app and test one approved CRM record','Real sourced record read/write'),
  gate('calendar',calendar?(bookingVerified?'VERIFIED':'CONFIGURED_TEST_REQUIRED'):'BLOCKED_RUNTIME_AUTH','Authorize Railway Calendar and test free/busy plus a genuine confirmed booking','Permissioned invite and confirmation'),
  gate('brand',domain?'DNS_PROOF_REQUIRED':'NO_CUSTOM_DOMAIN','Verify owned domain, TLS and mail DNS; not required for first PayPal sale','Domain ownership and SPF/DKIM/DMARC',true),
  gate('commerce',pending?'OWNER_APPROVAL_REQUIRED':'NO_QUEUED_APPROVALS',pending?'Review each pending launch/advertising/refund action individually':'Prioritize direct service checkout while store eligibility is unresolved','Decisions recorded with correct owner authorization',Boolean(pending)),
  gate('customer',independent.length?'VERIFIED_RECORD_REQUIRES_PROVIDER_RECONCILIATION':'NO_INDEPENDENT_SALE_PROVEN','Reach, convert, serve and verify a genuinely unrelated customer','Signed buyer proof, completed capture, accepted work and payout'),
  gate('settlement',cash?'BANK_EVIDENCE_RECORDED':'NO_BANK_SETTLEMENT_PROOF','Match the PayPal settlement statement to the real bank credit; do not assume capture equals cash','Provider and bank statements'),
 ];
 const queue=[];
 function task(id,priority,action,mode,why,proof){queue.push({id,priority,action,mode,why,proof,state:'RECOMMENDED_NOT_EXECUTED'})}
 if(unpaidDelivery.length)task('paid-delivery',150,'QC and fulfill paid orders whose captures have been recorded','SAFE_INTERNAL_WITH_CUSTOMER_SCOPE','Real paid work takes precedence over generating products','Accepted deliverable with order and signed capture');
 if(consented)task('opted-in-inbox',140,'Review opt-in diagnostic leads and draft the requested follow-up','SAFE_INTERNAL','Voluntary requests can be handled without a discovery provider','Owner-approved reply to valid consented lead');
 if(replyRecords)task('reply-review',130,'Verify recorded responses and prioritize genuinely interested buyers','SAFE_INTERNAL','A reply record requires human interest classification, not inference','Validated interested buyer and authorized follow-up');
 if(!gmail)task('gmail-auth',120,'Obtain legitimate Railway Gmail API authorization and complete compliance prerequisites','OWNER_ONLY','ChatGPT Gmail connection does not authorize the deployed runtime','Sender verification and real round-trip test');
 if(!buyerFeedVerified)task('buyer-feed',110,discovery?'Verify real authorized feed data and buyer intent':'Promote owned diagnostic; connect an authorized buyer source when available','SAFE_INTERNAL_AND_OWNER_PROVIDER','A configured feed is not a verified prospect or purchase intent','Sourced leads, valid permissions, recorded buyer evidence');
 if(!crm)task('crm-auth',100,'Connect an authorized Railway HubSpot private app','OWNER_ONLY','CRM code cannot act with missing production credentials','Actual scoped read/write reconciliation');
 if(!calendar)task('calendar-auth',95,'Connect authorized Railway Calendar access','OWNER_ONLY','A booking flow needs verified live availability and invitations','Confirmed real attendee booking');
 if(pending)task('commerce-approvals',90,'Review each pending commerce approval; do not auto-approve','OWNER_ONLY','Spending, publishing, refunds and contracts need scoped permission','Recorded separate decision per request');
 if(!paypal)task('paypal-runtime',88,'Investigate PayPal provider/webhook readiness','SAFE_INTERNAL','Payment provider readiness must be checked before directing buyer to checkout','Provider authenticated health and webhook validation');
 if(!independent.length)task('first-customer',85,'Promote the $200 scoped lead-intake pilot and working PayPal audit offer; follow permitted leads','SAFE_INTERNAL_AND_APPROVED_OUTREACH','No independent paid customer is established by a deployed storefront','External accepted scope, payment, delivery and acceptance');
 if(!cash)task('cash-reconciliation',70,'Reconcile first actual capture, fees, refunds, costs and bank settlement when evidence exists','READ_ONLY_EVIDENCE','Revenue, gross capture, profit and settled cash differ','Provider settlement plus bank evidence');
 if(!domain)task('brand-domain',50,'Prepare legitimate company domain and authenticated mailbox plan','OWNER_PURCHASE_AND_DNS','Credibility upgrade; not a prerequisite for a direct PayPal service sale','Owner-controlled domain and verified DNS');
 task('loop-health',40,'Monitor existing bounded resilience and verification cycles, escalate real failures','SAFE_INTERNAL','Runtime health does not prove successful external business actions','Recorded recovery test and delivered owner alert');
 queue.sort((a,b)=>b.priority-a.priority);
 const phase=independent.length?'DELIVER_RETENTION_AND_REPEAT':'VALIDATE_FIRST_CUSTOMER';
 return {
  version:VERSION,at:new Date().toISOString(),objective:GOAL,longHorizon:ULTIMATE_GOAL,phase,
  serviceOnline:Boolean(serviceOnline),policy:{autonomousInternalReads:true,autonomousUnapprovedExternalActions:false,providerBypass:false,identityImpersonation:false,syntheticRevenue:false},
  metrics:{prospectCandidates:candidateCount,replyRecordsUnverified:replyRecords,inboundDiagnostics:inquiries,consentedInbound:consented,pendingCommerceApprovals:pending,capturedOrderRecords:captured.length,deliveredCapturedRecords:delivered.length,independentAcceptedCustomersWithExplicitProof:independent.length,bankSettlementEvidence:cash},
  providerGates:gates,now:queue[0]||null,queue,upgrades:UPGRADES,
  cautions:['Historical outreach send counts are not confirmations that recipients read, replied or purchased.',
  'Recorded capture IDs require provider reconciliation; independent buyers require distinct evidence.',
  'Configuring a feed or OAuth variables is not proof of authorized end-to-end execution.',
  'Read-only fallback to owned opt-in forms is permitted; evading blocked providers is not.',
  'This dashboard classifies work but cannot grant OAuth permissions, spend money or make someone buy.']
 };
}
