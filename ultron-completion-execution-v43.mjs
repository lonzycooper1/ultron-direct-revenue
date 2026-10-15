// ULTRON v43 — evidence-gated execution register. Pure, read-only, no provider writes.
// A registered task, configured token, prepared plan or internal test is NEVER a real sale.
import {COMPLETION_ITEMS,COMPLETION_GROUPS} from './ultron-500-completion-v26.mjs';
import {CAPABILITIES,activationReport} from './ultron-work-activation-v40.mjs';
import {independentSale,publicOperations} from './ultron-revenue-operations-v41.mjs';

export const EXECUTION_VERSION='43.0.0';
const ROOT='https://ultron-direct-revenue-production.up.railway.app';
const GITHUB='https://github.com/lonzycooper1/ultron-direct-revenue';
const present=(e,key)=>Boolean(typeof e[key]==='string'?e[key].trim():e[key]);
const mins=(v,now)=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.round((now-t)/60000):null};
const ready=(state)=>state==='VERIFIED_END_TO_END';
const PROOFS=Object.freeze([
  ['DEMAND','buyer-feed','Evidence of authorized, recent buyers expressing specific commercial demand'],
  ['EMAIL','business-email','Matched authorized sender, delivered and received email, opt-out and bounce reconciliation'],
  ['CRM','crm','Authorized server-side read/write and verified CRM record'],
  ['BOOKING','calendar','Confirmed live free/busy, booking, invite, cancellation and reminder'],
  ['TERMS','first-sale','Current consented scope and customer acceptance of terms'],
  ['PAID_CUSTOMER','first-sale','Independent payer and provider-signed capture plus customer-specific delivery and acceptance'],
  ['FINANCE','bank-reconciliation','Provider fees, refunds, costs and actual bank settlement'],
  ['ALERTS','alerts','Notification received and owner acknowledged'],
  ['RESTORE','storage','Durable retained encrypted backup and isolated full restore drill']
]);
const FALLBACKS=Object.freeze({
 'buyer-feed':'Use owned consent-based diagnostic and manually review properly sourced published RFPs; do not call them buyers before interest is expressed.',
 'business-email':'Keep automated sending disabled. Use opt-in web intake and manually respond from a correctly authorized account only with a lawful approved nonresidential mailing address.',
 'crm':'Keep an owner-reviewed, timestamped manual HubSpot record; status remains OWNER_REPORTED until provider round-trip is verified.',
 'calendar':'Arrange appointments manually through an owner-authorized calendar. Do not announce an unconfirmed booking.',
 'first-sale':'Use the existing published PayPal direct checkout for real buyers. No internal/self-funded verification transaction counts.',
 'bank-reconciliation':'Record independent payment processor statements and bank confirmations manually in the protected owner workflow. Unknown fees or settlement remain unknown.',
 'domain':'Use existing HTTPS Railway URL without pretending a custom domain exists. Purchase or DNS change is owner-only.',
 'alerts':'Review owner dashboard and existing ChatGPT scheduled checks; these do not substitute for received push/email or approved server alert webhook.',
 'storage':'Retain current Postgres persistence; schedule encrypted offsite backup only after securely supplied key, storage approval, and isolated restore target.',
 'commerce-approvals':'Review store publishing, ad-budget and refund approval records separately; never accept blanket approval.',
 'shopify-pod':'Use existing independent PayPal consulting checkout; leave physical products unsold until supplier and Shopify are authorized.',
 'quantum-hardware':'Continue the bounded classical simulator; it is not an IBM hardware QPU.',
 'media':'Prepare original drafts and browser demos without pretending licensed footage, cinematic rendering, publication or paid delivery exists.',
 'portable-apps':'Use responsive HTTPS owner console until signed iOS/Mac apps are distributed and tested.',
 'trading':'Keep actual orders disabled; paper-only strategy research with fees, slippage and evidence.',
 'telephony':'Use the owner-approved human response path until lawful telephony and booking are proven.',
 'advanced-agents':'Keep existing bounded roles and evaluations; do not claim external managed agents are connected.',
 'newsletter':'Draft original content without sending to unconsented recipients.',
 'digital-guide':'Retain drafts until editorial review, authorized listing and genuine delivery evidence.',
 'real-estate':'Use hypothetical property calculations only; no claims of available title or committed buyers.'
});
const LINKS=Object.freeze({
 'buyer-feed':ROOT+'/free-response-gap-scan',
 'business-email':ROOT+'/inbound-inbox',
 'crm':'https://app.hubspot.com/',
 'calendar':'https://calendar.google.com/',
 'first-sale':ROOT+'/flagship',
 'bank-reconciliation':ROOT+'/revenue-operations',
 'commerce-approvals':ROOT+'/owner-actions',
 'domain':'https://railway.com/project/2e0b0216-9aba-4ff3-bf10-e1f5b44d28e3',
 'alerts':ROOT+'/revenue-operations',
 'storage':GITHUB+'/blob/main/ULTRON_V41_REVENUE_COMPLETION.md',
 'shopify-pod':'https://admin.shopify.com/',
 'quantum-hardware':'https://quantum.cloud.ibm.com/',
 'media':ROOT+'/video-lab',
 'portable-apps':GITHUB+'/tree/main/apps',
 'trading':ROOT+'/mission-control'
});
const RELEASE_PROOF='GitHub CI, successful Railway deploy, and a live permitted end-to-end test for the named capability';
const AUTHORITY=Object.freeze({
 safe:'SAFE_INTERNAL_READ_OR_DRAFT',consequential:'EXPLICIT_OWNER_APPROVAL_REQUIRED',provider:'OWNER_OR_PROVIDER_AUTHORIZATION_REQUIRED',external:'REAL_WORLD_INDEPENDENT_EVIDENCE_REQUIRED'
});
export function classifyAction(title=''){
 const s=String(title).toLowerCase();
 if(/identity|kyc|otp|mfa|verify.*bank|sign.*contract|loan|refund|spend|paid advert|transfer|credit application|live trad|register.*domain|upgrade|purchase/.test(s))
  return AUTHORITY.consequential;
 if(/connect|authoriz|oauth|provider|mailbox|email.send|signed.*app|app.store|social.publish|supplier|calendar/.test(s))
  return AUTHORITY.provider;
 if(/customer|sale|paid.order|settle|delivered|accepted|conversion|renewal|profit|real.*buyer|actual.*order/.test(s))
  return AUTHORITY.external;
 return AUTHORITY.safe;
}
const priorityCode=t=> t.tier==='P0'?0:t.tier==='P1'?1:2;
const summarizeTasks=(tasks)=>COMPLETION_GROUPS.map(([name,tier],index)=>{
 const group=tasks.filter(t=>t.workstreamIndex===index);
 return {name,tier,total:group.length,verified:group.filter(t=>t.status==='VERIFIED_END_TO_END').length,
  evidenceRequired:group.filter(t=>t.status!=='VERIFIED_END_TO_END').length};
});
export function completionExecution({env={},payment={},commerce={},supervisor={},verifier={},growth={},ops={},orders=[],now=Date.now(),evidence={}}={}){
 const allOrders=Array.isArray(orders)?orders:[];
 const paymentsReady=payment.ok===true&&payment.apiAuthorized===true&&payment.webhookEndpointVerified===true&&payment.captureEventsSubscribed===true;
 const activation=activationReport({env,provider:{paypal:payment},orders:allOrders,now:new Date(now).toISOString()});
 const byId=Object.fromEntries(activation.entries.map(x=>[x.id,x]));
 const pendingApprovals=(commerce.approvals||[]).filter(x=>x.status==='pending').length;
 const p=(x)=>present(env,x);
 const emailReady=['ULTRON_GMAIL_CLIENT_ID','ULTRON_GMAIL_CLIENT_SECRET','ULTRON_GMAIL_REFRESH_TOKEN','ULTRON_BUSINESS_SENDER','ULTRON_BUSINESS_POSTAL_ADDRESS','ULTRON_UNSUBSCRIBE_SECRET']
  .every(p)&&env.ULTRON_BUSINESS_POSTAL_ADDRESS_APPROVED==='true';
 const mailIngest=emailReady&&env.ULTRON_GMAIL_INGEST_ENABLED==='true';
 const feedConfigured=p('ULTRON_DISCOVERY_FEED_URL')||p('ULTRON_DISCOVERY_FALLBACK_URL');
 const feedFailed=growth.sourceStatus==='ERROR'||(growth.errors||[]).slice(-5).some(x=>x.kind==='DISCOVERY_FAILURE');
 const signedCaptured=allOrders.filter(o=>o.status==='COMPLETED'&&o.captureId&&o.capturedAt&&o.webhookEvidence?.signatureVerified===true&&o.webhookEvidence.captureId===o.captureId).length;
 const accepted=allOrders.filter(independentSale).length;
 const hb=mins(supervisor.lastHeartbeat,now);
 const va=mins(verifier.lastRun,now);
 const runtimeSources={
  'buyer-feed':feedFailed?'FEED_FAILURE_CANDIDATES_NOT_BUYERS':feedConfigured?'CONFIG_PRESENT_BUYER_PROOF_MISSING':'AUTH_SOURCE_REQUIRED',
  'business-email':!emailReady?'BUSINESS_SENDER_AUTH_OR_ADDRESS_REQUIRED':mailIngest?'INGEST_CONFIGURED_ROUND_TRIP_REQUIRED':'REPLY_INGEST_DISABLED',
  'crm':p('ULTRON_HUBSPOT_PRIVATE_APP_TOKEN')?'PROVIDER_CONFIG_ROUND_TRIP_REQUIRED':'MANUAL_FALLBACK_AUTH_REQUIRED',
  'calendar':['ULTRON_GOOGLE_CLIENT_ID','ULTRON_GOOGLE_CLIENT_SECRET','ULTRON_CALENDAR_REFRESH_TOKEN','ULTRON_CALENDAR_ID'].every(p)?'PROVIDER_CONFIG_ROUND_TRIP_REQUIRED':'MANUAL_FALLBACK_AUTH_REQUIRED',
  'paypal':paymentsReady?'PROVIDER_CONFIG_VERIFIED_NOT_A_SALE':'PROVIDER_RUNTIME_NOT_VERIFIED',
  'first-sale':accepted>0?'INTERNAL_ACCEPTANCE_EVIDENCE_NEEDS_PROVIDER_CROSSCHECK':'NO_INDEPENDENT_ACCEPTED_CUSTOMER',
  'bank-reconciliation':'EXTERNAL_PROVIDER_AND_BANK_PROOF_REQUIRED',
  'commerce-approvals':pendingApprovals?'OWNER_DECISIONS_PENDING':'OWNER_APPROVAL_QUEUE_CLEAR_NOT_PAYMENT_PROOF',
  'domain':p('ULTRON_BRANDED_DOMAIN')?'DNS_AND_EMAIL_PROOF_REQUIRED':'RAILWAY_DOMAIN_ONLY',
  'alerts':env.ULTRON_ALERTS_ENABLED==='true'&&p('ULTRON_ALERT_WEBHOOK_URL')?'ALERT_RECEIPT_NOT_PROVEN':'DESTINATION_AND_RECEIPT_REQUIRED',
  'storage':p('ULTRON_BACKUP_KEY_BASE64')?'RETENTION_AND_RESTORE_PROOF_REQUIRED':'ENCRYPTED_BACKUP_KEY_AND_RESTORE_PROOF_REQUIRED',
  'shopify-pod':'STORE_PLAN_AND_SUPPLIER_EVIDENCE_REQUIRED'
 };
 const blockers=CAPABILITIES.map(cap=>{
  const base=byId[cap.id],state=runtimeSources[cap.id]||'EXTERNAL_END_TO_END_PROOF_REQUIRED';
  return {id:cap.id,title:cap.title,priority:cap.priority,providerStatus:base.status,
    status:state,missingVariableNames:base.missingVariableNames,
    proofNeeded:cap.proof,ownerAction:cap.next,manualFallback:FALLBACKS[cap.id]||'Continue safe internal drafting until authenticated external proof exists.',
    actionUrl:LINKS[cap.id]||ROOT+'/activation-center',verifiedEndToEnd:ready(base.status),externalActionTaken:false};
 }).sort((a,b)=>a.priority-b.priority);
 const requirements=COMPLETION_ITEMS.map(t=>{
  const id=t.id,submitted=Boolean(evidence[id]&&evidence[id].url);
  return {id,title:t.title,workstream:t.group,workstreamIndex:Math.floor((t.number-1)/25),tier:t.tier,
   authority:classifyAction(t.title),
   status:submitted?'EVIDENCE_SUBMITTED_AWAITING_INDEPENDENT_REVIEW':'NOT_VERIFIED',
   proofReference:submitted?'OWNER_SUBMITTED_PENDING_REVIEW':null,
   externalActionTaken:false};
 }).sort((a,b)=>priorityCode(a)-priorityCode(b)||a.id.localeCompare(b.id));
 const alerts=Object.values(ops.alerts||{}),ownerAlerts=alerts.filter(a=>a.status!=='OWNER_ACKNOWLEDGED_RECEIPT').length;
 const critical=[
  {id:'paid-fulfillment',priority:0,status:publicOperations(allOrders,ops,env).pendingAuditReviews?'PAID_REVIEW_WORK_POSSIBLE':'NO_PAID_REVIEW_FOUND_IN_LEDGER',ownerAction:'Review protected paid-audit queue before new sales research',actionUrl:ROOT+'/revenue-operations'},
  {id:'interested-replies',priority:1,status:Object.keys(growth.replies||{}).length?'REPLIES_RECORDED_REVIEW_PRIVATE':'NO_REPLIES_RECORDED',ownerAction:'Review authenticated consented replies and opt-outs; do not automatically respond',actionUrl:ROOT+'/inbound-inbox'},
  {id:'feed-failure',priority:2,status:runtimeSources['buyer-feed'],ownerAction:'Repair or replace authorized source, use owned opt-in intake, never evade Hunter restriction',actionUrl:ROOT+'/free-response-gap-scan'},
  {id:'email-auth',priority:3,status:runtimeSources['business-email'],ownerAction:'Owner authorize correct sender and approved separate business postal address',actionUrl:ROOT+'/activation-center'},
  {id:'first-sale',priority:4,status:runtimeSources['first-sale'],ownerAction:'Secure unrelated paid buyer and obtain signed capture, QC, acceptance',actionUrl:ROOT+'/flagship'},
  {id:'alerts',priority:5,status:runtimeSources.alerts,ownerAction:'Configure destination; prove actual owner receipt, not HTTP acceptance',actionUrl:ROOT+'/revenue-operations'},
  {id:'recovery',priority:6,status:runtimeSources.storage,ownerAction:'Provide separate backup key and storage; test isolated restore',actionUrl:LINKS.storage}
 ];
 return {version:EXECUTION_VERSION,asOf:new Date(now).toISOString(),mission:'FIRST_VERIFIED_UNRELATED_CUSTOMER_THEN_REPEATABLE_PROFITABLE_SCALE',
  totalRequirements:requirements.length,workstreamCount:COMPLETION_GROUPS.length,
  requirementStatus:'EVERY_REQUIREMENT_REQUIRES_INDEPENDENT_EVIDENCE_UNTIL_VERIFIED',
  verifiedRequirements:0,ownerSubmittedEvidenceCount:requirements.filter(x=>x.status.startsWith('EVIDENCE_SUBMITTED')).length,
  providerCapturedOrdersRecorded:signedCaptured,customerAcceptanceEvidenceRecorded:accepted,
  customerRevenueClaim:'NO_INDEPENDENT_PROVIDER_CUSTOMER_PAYMENT_CLAIM_FROM_LOCAL_LEDGER_ONLY',
  providerPayPalConfigurationVerified:paymentsReady,shopifyProviderSaleClaim:false,
  heartbeat:{supervisorAgeMinutes:hb,verifierAgeMinutes:va,supervisorRecent:hb!==null&&hb>=0&&hb<=20,verifierRecent:va!==null&&va>=0&&va<=20,reviewRolesNotSeparateModels:true},
  pendingCommerceOwnerApprovals:pendingApprovals,ownerAlertsUnacknowledged:ownerAlerts,
  nineGates:PROOFS.map(([id,cap,proof])=>({id,capability:cap,proof,status:runtimeSources[cap]||'PROOF_REQUIRED'})),
  blockers,critical,groups:summarizeTasks(requirements),
  requirements,protectedRecordsOmitted:true,
  policy:{externalSends:'OWNER_APPROVED_SCOPE_ONLY',contractsAndSpending:'OWNER_ONLY',identityAndOtp:'OWNER_ONLY',liveTrading:'DISABLED',fakePurchases:'FORBIDDEN',providerRestrictions:'DO_NOT_BYPASS'},
  definitionOfDone:RELEASE_PROOF,
  note:'An executable evidence register and authorized fallback guide—not 500 completed integrations, not guaranteed customer demand, and not proof of bank settlement.'};
}
