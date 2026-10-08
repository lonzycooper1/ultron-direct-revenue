// ULTRON v27: deterministic, evidence-constrained production activation decision engine.
// The free diagnostic is a voluntary first-party demand channel, NOT a Hunter substitute or proof of buyer interest.
export const ACTIVATION_VERSION='27.0.0';
const integer=n=>Number.isFinite(Number(n))?Math.max(0,Math.floor(Number(n))):0;
const gate=(ready,missing,proof)=>({status:ready?'CONFIGURED_NOT_INDEPENDENTLY_VERIFIED':'BLOCKED',missing:ready?null:missing,proof});
export function activationPlan({integrations={},paymentRuntime={},inbound={},paidOrders=0,unfulfilledPaidOrders=0,interestedBuyers=0,verifiedRevenueUsd=0,discoveryOutcome=null}={}){
 const paid=integer(paidOrders),unfulfilled=integer(unfulfilledPaidOrders),interested=integer(interestedBuyers);
 const submissions=integer(inbound.total),newScans=integer(inbound.new),high=integer(inbound.high);
 const gmail=integrations.gmail||{},discovery=integrations.discovery||{},calendar=integrations.calendar||{},crm=integrations.hubspot||{};
 const paypalVerified=paymentRuntime.ok===true&&paymentRuntime.apiAuthorized===true&&paymentRuntime.webhookEndpointVerified===true;
 const gates={
  discovery:gate(discovery.configured===true,'Authorize an external discovery feed (Hunter is not required if a permitted alternative is available)','Successful import with source provenance, uniqueness and buyer evidence'),
  firstPartyInbound:{status:'AVAILABLE_REQUIRES_DISTRIBUTION',submitted:submissions,newSubmissions:newScans,highSeveritySelfReported:high,note:'Voluntary diagnostics are candidates, not verified prospective buyers.'},
  sender:gate(gmail.configured===true,'Configure Railway Gmail OAuth, postal address, and unsubscribe secret for selected sender','Authenticated test of sender identity, compliant approved email and opt-out'),
  crm:gate(crm.configured===true,'Authorize HubSpot separately for the Railway runtime','Read/write a permitted record and verify reconciliation'),
  booking:gate(calendar.configured===true,'Authorize Railway Calendar and verify booking path','Free/busy and a permissioned real meeting'),
  payments:{status:paypalVerified?'PRODUCTION_PROVIDER_VERIFIED':'PROVIDER_VERIFICATION_REQUIRED',note:paypalVerified?'API and webhook readiness verified; not evidence of customer payment.':'Test production payment runtime; never self-pay or invent test revenue.'}
 };
 const focus=unfulfilled>0?'PAID_DELIVERY_FIRST':interested>0?'HUMAN_INTEREST_REPLY_FIRST':newScans>0?'REVIEW_VOLUNTARY_INBOUND':!discovery.configured?'FIRST_PARTY_DEMAND_FALLBACK':'VERIFY_DISCOVERED_BUSINESSES';
 const actions=[
  {key:'paid',priority:paid?120:0,action:'Verify paid orders, QA and deliver legitimate customer work',mode:'READ_AND_DRAFT',dependsOn:'Verified external payment and signed scope',status:paid?'ACT_NOW':'WAITING_FOR_VERIFIED_CUSTOMER'},
  {key:'interested',priority:interested?118:0,action:'Respond to genuinely interested buyers',mode:'OWNER_REVIEWED_REPLY',dependsOn:'Recorded real response and authorized sender',status:interested?'ACT_NOW':'WAITING_FOR_REPLY'},
  {key:'inbound',priority:submissions?112:94,action:'Review first-party free diagnostic leads and offer an evidence-based $500 audit',mode:'INTERNAL_TRIAGE',dependsOn:'Voluntary inbound response-gap scan; follow-up permission before contact',status:submissions?'READY_FOR_REVIEW':'PUBLISH_AND_DISTRIBUTE_LANDING_PAGE'},
  {key:'discovery',priority:90,action:'Find permitted secondary discovery feed; do not bypass restricted provider',mode:'OWNER_PROVIDER_AUTH',dependsOn:'Owner/provider connection and terms compliance',status:discovery.configured?'VERIFY_SOURCE':'BLOCKED_ACCOUNT_CONNECTION'},
  {key:'gmail',priority:88,action:'Authorize selected Gmail address for the independent Railway runtime',mode:'OWNER_GOOGLE_OAUTH',dependsOn:'Google Cloud OAuth client, consent, refresh token and unsubscribe policy',status:gmail.configured?'VERIFY_SENDER':'BLOCKED_OAUTH'},
  {key:'crm',priority:84,action:'Authorize HubSpot app token to reconcile prospect and deal records',mode:'OWNER_PROVIDER_AUTH',dependsOn:'Correct HubSpot account and least-privilege API token',status:crm.configured?'VERIFY_CRM':'BLOCKED_RAILWAY_TOKEN'},
  {key:'calendar',priority:80,action:'Authorize real calendar booking, confirmations and cancellation flow',mode:'OWNER_GOOGLE_OAUTH',dependsOn:'Google Calendar OAuth credentials and real availability',status:calendar.configured?'VERIFY_BOOKING':'BLOCKED_OAUTH'},
  {key:'checkout',priority:76,action:'Reconcile PayPal capture, independent buyer, invoice, refunds and bank settlement',mode:'READ_ONLY_EVIDENCE',dependsOn:'Real payment and settlement records; no circular payments',status:paid?'RECONCILE':'WAITING_FOR_CUSTOMER'},
  {key:'distribution',priority:74,action:'Promote the free diagnostic through authorized owned channels',mode:'CONTENT_DRAFT_ONLY',dependsOn:'Owner-approved publishing permissions',status:'PREPARE_NO_UNAUTHORIZED_POST'}
 ];
 actions.sort((a,b)=>b.priority-a.priority);
 return {version:ACTIVATION_VERSION,objective:'FIRST_VERIFIED_INDEPENDENT_PAYING_CUSTOMER',strategicTargetUsd:1_000_000_000_000,
  focus,verifiedRevenueUsd:Math.max(0,Number(verifiedRevenueUsd)||0),paidOrders:paid,interestedBuyers:interested,
  firstPartyInbound:{received:submissions,new:newScans,highSeveritySelfReported:high,qualifiedBuyerCountNotEstablished:true},
  providerGates:gates,latestDiscovery:discoveryOutcome?{status:String(discoveryOutcome.status||'UNKNOWN'),imported:integer(discoveryOutcome.imported)}:null,
  actions,automaticScope:['classify diagnostic submissions','prioritize real inbound','perform safe internal research','draft diagnostic follow-up','validate payment readiness','watch pending tasks'],
  ownerApprovedScope:['production credentials','contacting businesses','submitting CRM write records','accepting contracts','publishing media','spending','borrowing','live trading'],
  noFabrication:true,
  status:'INCREMENTAL_ACTIVATION_NOT_COMPLETE',
  note:'Existing services and a first-party inbound route do not demonstrate real customer traffic, completed sales, consented emails, or verified bank payout.'};
}
