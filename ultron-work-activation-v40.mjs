/** ULTRON v40: evidence-gated activation and Work handoff capability registry.
 * Designed for autonomously prioritizing safe internal jobs, NOT granting external authority.
 * Provider verification is explicit; config presence alone never means an integration works.
 */
export const VERSION='40.0.0';
export const MISSION='FIRST_VERIFIED_UNRELATED_PAYING_CUSTOMER_THEN_REPEATABLE_SAFE_SCALE';
export const STATUS=Object.freeze({VERIFIED:'VERIFIED_END_TO_END',CONFIG:'CONFIG_PRESENT_TEST_NOT_PROVEN',BLOCKED:'OWNER_OR_PROVIDER_ACCESS_REQUIRED',PROOF:'REAL_WORLD_PROOF_REQUIRED'});
export const CAPABILITIES=Object.freeze([
 {id:'paypal',group:'revenue',priority:0,title:'PayPal live checkout and signed webhook',env:['PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_WEBHOOK_ID','PUBLIC_BASE_URL'],proof:'verifiedProviderPayment',next:'Check provider authorization and signed webhook delivery; do not count a checkout as a sale.'},
 {id:'buyer-feed',group:'sales',priority:0,title:'Authorized buyer discovery and fallback',env:['ULTRON_DISCOVERY_FEED_URL'],proof:'verifiedBuyerFeed',next:'Test actual lawful feed output, source permissions, buyer need and deduplication.'},
 {id:'business-email',group:'sales',priority:0,title:'Approved Gmail business sending and reply loop',env:['ULTRON_GMAIL_CLIENT_ID','ULTRON_GMAIL_CLIENT_SECRET','ULTRON_GMAIL_REFRESH_TOKEN','ULTRON_BUSINESS_SENDER','ULTRON_BUSINESS_POSTAL_ADDRESS','ULTRON_UNSUBSCRIBE_SECRET'],proof:'verifiedEmailRoundTrip',next:'Owner-authorize OAuth, nonresidential business mailing address, sender tests, bounce and opt-out suppression.'},
 {id:'crm',group:'sales',priority:0,title:'HubSpot runtime CRM sync',env:['ULTRON_HUBSPOT_PRIVATE_APP_TOKEN'],proof:'verifiedCrmRoundTrip',next:'Authorize scoped private app and reconcile one permitted record.'},
 {id:'calendar',group:'sales',priority:0,title:'Google Calendar availability and real appointment confirmation',env:['ULTRON_GOOGLE_CLIENT_ID','ULTRON_GOOGLE_CLIENT_SECRET','ULTRON_CALENDAR_REFRESH_TOKEN','ULTRON_CALENDAR_ID'],proof:'verifiedRealBooking',next:'Authorize scoped Calendar runtime and prove a real opted-in booking.'},
 {id:'commerce-approvals',group:'sales',priority:0,title:'Owner-reviewed pending commerce approvals',env:[],proof:'verifiedCommerceApprovalsResolved',next:'Review individually: store publishing, advertising and refund-related actions; do not auto-approve.'},
 {id:'first-sale',group:'revenue',priority:0,title:'Unrelated paid customer, delivered service and customer acceptance',env:[],proof:'verifiedFirstSale',next:'Verify independent buyer, payment capture, fulfillment QC, acceptance and provider records.'},
 {id:'bank-reconciliation',group:'revenue',priority:0,title:'PayPal fees, refunds and actual bank settlement',env:[],proof:'verifiedBankSettlement',next:'Match processor transaction, fees, refunds, payout and bank entry.'},
 {id:'domain',group:'identity',priority:1,title:'Owned branded domain, TLS and authenticated mail',env:['ULTRON_BRANDED_DOMAIN'],proof:'verifiedDomainAndDns',next:'Owner authorize any purchase; configure SPF/DKIM/DMARC and test DNS.'},
 {id:'alerts',group:'operations',priority:1,title:'Owner alert delivery and escalation',env:[],proof:'verifiedDeliveredAlert',next:'Enable task push/email notification settings and verify a received test alert.'},
 {id:'self-healing',group:'operations',priority:1,title:'Automatic bounded recovery with evidence',env:[],proof:'verifiedRecoveryDrill',next:'Inject reversible failures in test environment and verify retries, fallbacks and escalation.'},
 {id:'storage',group:'operations',priority:1,title:'Encrypted memory and proven backups',env:['DATABASE_URL'],proof:'verifiedBackupRestore',next:'Create encrypted backups, demonstrate restore and document retention.'},
 {id:'telephony',group:'expansion',priority:2,title:'Consented AI phone receptionist',env:[],proof:'verifiedPhoneCall',next:'Authorize telephony, business number, lawful recording notices, escalation, and a completed sample call.'},
 {id:'media',group:'expansion',priority:2,title:'Original content production and real social distribution',env:[],proof:'verifiedPublishedContent',next:'Approve accounts, usage rights and publication; verify live post and real analytics.'},
 {id:'newsletter',group:'expansion',priority:2,title:'Original Quantum-AI newsletter and subscriptions',env:[],proof:'verifiedNewsletter',next:'Authorize publisher, consented list and actual publication; verify subscription payment separately.'},
 {id:'digital-guide',group:'expansion',priority:2,title:'Quantum-AI digital product checkout and fulfillment',env:[],proof:'verifiedDigitalGuideSale',next:'Finalize guide, approve listing, verify real unrelated paid delivery.'},
 {id:'real-estate',group:'expansion',priority:2,title:'Permissioned property research and verified deal intelligence',env:[],proof:'verifiedPropertyData',next:'Connect lawful real-estate data; verify title, cost, assignability, licensing and source.'},
 {id:'quantum-hardware',group:'research',priority:2,title:'IBM Quantum QPU experimental hardware link',env:['IBM_QUANTUM_API_KEY','IBM_QUANTUM_CRN'],proof:'verifiedQpuJob',next:'Owner create IBM account; deploy isolated Python worker; approve quota; verify one hardware job.'},
 {id:'advanced-agents',group:'research',priority:2,title:'Scoped Claude/other hosted managed agents',env:[],proof:'verifiedManagedAgentSession',next:'Authorize provider, permissions, budgets, data boundaries and job-session evidence.'},
 {id:'trading',group:'research',priority:3,title:'Paper trading and strategy evaluation',env:[],proof:'verifiedPaperBacktest',next:'Verify licensed quotes, independent backtest, loss controls and paper-only execution; no live orders.'},
 {id:'shopify-pod',group:'expansion',priority:3,title:'Approved Shopify and POD supplier fulfillment',env:[],proof:'verifiedSupplierFulfillment',next:'Owner approve any plan cost, connect supplier, verify genuine order and shipped item.'},
 {id:'portable-apps',group:'expansion',priority:3,title:'Signed Mac and iPhone monitoring applications',env:[],proof:'verifiedDeviceApp',next:'Build and sign tested apps; authorized app distribution and owner notification verification.'}
]);
const has=(env,k)=>typeof env[k]==='string'?env[k].trim().length>0:Boolean(env[k]);
const truth=x=>x===true;
export function activationReport({env={},verified={},provider={},orders=[],now=''}={}){
 const orderRows=Array.isArray(orders)?orders:[];
 const realSale=orderRows.some(o=>o&&o.independentBuyerVerified===true&&o.customerAcceptanceVerified===true&&
  o.fulfillment?.token&&o.captureId&&String(o.status||'').toUpperCase()==='COMPLETED');
 const accepted={...verified,verifiedFirstSale:realSale};
 const paymentRuntime=provider.paypal?.ok===true&&provider.paypal?.apiAuthorized===true&&
  provider.paypal?.webhookEndpointVerified===true&&provider.paypal?.captureEventsSubscribed===true;
 const entries=CAPABILITIES.map(item=>{
  const missing=item.env.filter(k=>!has(env,k));
  const hasProof=truth(accepted[item.proof]);
  const verifiedProvider=item.id==='paypal'&&paymentRuntime;
  const status=item.id==='paypal'&&verifiedProvider?STATUS.VERIFIED:
   hasProof&&missing.length===0?STATUS.VERIFIED:
   missing.length>0?STATUS.BLOCKED:
   item.env.length>0?STATUS.CONFIG:STATUS.PROOF;
  return {id:item.id,title:item.title,group:item.group,priority:item.priority,
   status,missingVariableNames:missing,proofNeeded:item.proof,next:item.next,
   verificationClaim:status===STATUS.VERIFIED?'BOUNDED_PROOF_FOR_NAMED_CAPABILITY':'NOT_VERIFIED_END_TO_END',
   externalActionTaken:false};
 }).sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id));
 return {version:VERSION,mission:MISSION,asOf:now||new Date().toISOString(),ready:entries.filter(e=>e.status===STATUS.VERIFIED).length,
  total:entries.length,entries,
  operationalPolicy:{safeInternalDiagnostics:'AUTO',safeDraftsAndAnalysis:'AUTO_WITH_LIMITS',externalSending:'APPROVED_SCOPE_ONLY',
   credentials:'OWNER_PROVIDER_OAUTH_ONLY',paymentsContractsAdsDomainsRefunds:'SEPARATE_AUTHORIZED_APPROVAL',
   qpuJobs:'APPROVE_RESOURCE_QUOTA',trading:'PAPER_ONLY',fakedSales:false,securityBypasses:false},
  agentDirective:'Work through the queue in priority order; finish any safe reversible steps without repeated prompts. On a blocked action, record the exact owner/provider dependency and continue independent tasks. Never mark work complete until attributable end-to-end evidence exists.',
  noGuarantees:'Even all integrations working cannot force an unrelated customer to purchase.'};
}
