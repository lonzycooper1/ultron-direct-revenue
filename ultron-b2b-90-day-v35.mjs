/**
 * ULTRON v35: 90-day B2B revenue-recovery campaign.
 * Research, internal qualification, demonstrations, owner-reviewed proposals,
 * partner capacity, actual-payment reconciliation, and honest progress reports.
 *
 * No cold emails, purchases, contracts, fabricated sales, provider bypass, or
 * external payments are performed by this module.
 */
import {randomUUID} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {ledger} from './ledger-store.mjs';

export const B2B_CAMPAIGN_VERSION='35.0.0';
export const B2B_SKU='b2b-revenue-recovery-implementation-60000';
export const B2B_START='2026-10-14';
export const B2B_END='2027-01-12';
export const B2B_GOAL_USD=1000000;
export const B2B_OFFER=Object.freeze({
 name:'Revenue Recovery & Automation System',
 segment:'Owner-led, established multi-location HVAC and plumbing operators',
 discovery:'Written measurement and workflow review before any paid proposal',
 priceUsd:60000,depositUsd:30000,balanceUsd:30000,
 billing:'Deposits and milestones require an individually approved written contract; no unconditional checkout.',
 scope:['permissioned workflow discovery','CRM and lead-intake design','missed-inquiry response automation','booking and dispatch handoff','QA, staff training and acceptance review'],
 exclusions:['guaranteed revenue','unauthorized phone/email sends','unapproved system access','identity verification by an agent']
});
export const COMMERCIAL_FUNCTIONS=Object.freeze([
 'Prospect research','Buyer qualification','Personalized demonstrations',
 'Deal and payment tracking','Delivery coordination'
]);
export const FIRST_PARTY_CANDIDATES=Object.freeze({
  "prospects": [
    {
      "company": "Air Tech of Houston",
      "website": "https://www.airtechofhouston.com/",
      "sourceUrl": "https://www.airtechofhouston.com/",
      "vertical": "hvac",
      "locations": 5,
      "researchContext": "Official site reports five locations; size, operational problem and intent not established"
    },
    {
      "company": "Kilgore Service",
      "website": "https://www.kilgoreservice.com/",
      "sourceUrl": "https://www.kilgoreservice.com/",
      "vertical": "hvac",
      "locations": 4,
      "researchContext": "Official site describes Houston, Austin, Dallas and San Antonio markets; no unmet demand established"
    },
    {
      "company": "J.B. Passmore, Inc.",
      "website": "https://passmoreinc.com/",
      "sourceUrl": "https://passmoreinc.com/",
      "vertical": "plumbing",
      "locations": 2,
      "researchContext": "Official site describes regional multi-site facility services; branch count and budget unverified"
    },
    {
      "company": "Direct Service, Construction & Design",
      "website": "https://www.directteam.com/",
      "sourceUrl": "https://www.directteam.com/",
      "vertical": "hvac",
      "locations": 1,
      "researchContext": "Official site describes its existing client portal; no evidence that systems are missing"
    },
    {
      "company": "HCL Mechanical Services",
      "website": "https://www.hclmechanicalservices.com/",
      "sourceUrl": "https://www.hclmechanicalservices.com/",
      "vertical": "hvac",
      "locations": 1,
      "researchContext": "Official site lists Houston office and fabrication facility, not proof of multi-branch service"
    },
    {
      "company": "ACIS Houston",
      "website": "https://acisinc.com/locations/houston/",
      "sourceUrl": "https://acisinc.com/locations/houston/",
      "vertical": "hvac",
      "locations": 1,
      "researchContext": "Official Houston office location; no confirmed buyer need"
    },
    {
      "company": "Kirlin-Way Mechanical",
      "website": "https://www.kirlinway.com/",
      "sourceUrl": "https://www.kirlinway.com/",
      "vertical": "plumbing",
      "locations": 8,
      "researchContext": "Official site lists multiple cities; likely larger enterprise than initial target"
    }
  ],
  "partners": [
    {
      "name": "Powerhouse Consulting Group, LLC",
      "sourceUrl": "https://www.servicetitan.com/certified-providers",
      "researchContext": "Listed in ServiceTitan Certified Providers directory; no partnership or availability confirmed"
    },
    {
      "name": "Team EASI",
      "sourceUrl": "https://www.teameasi.com/",
      "researchContext": "Houston Microsoft Dynamics 365 implementation firm; no subcontract or capacity commitment"
    }
  ],
  "policy": "Public website evidence supports candidate identity/sector only. These are NOT interested buyers, signed partners, consent to contact, verified $5M-30M revenue operators or proof of pain."
});
export const STEPS=Object.freeze([
 ['1','Defined high-ticket HVAC/plumbing offer','IMPLEMENTED_AS_PROPOSAL'],
 ['2','90-day goal, contract and cash arithmetic','IMPLEMENTED_AS_MODEL'],
 ['3','Fulfillment partner sourcing and capacity validation','WORKFLOW_READY_PARTNERS_UNSIGNED'],
 ['4','Working sample and factual proof-of-value','DEMO_SPEC_READY_REQUIRES_PARTNER_INSTALL'],
 ['5','Referral channel and partner onboarding','WORKFLOW_READY_PARTNERS_UNSIGNED'],
 ['6','Permissioned prospect research and outreach drafts','RESEARCH_READY_SENDING_NOT_AUTHORIZED'],
 ['7','Business diagnosis and transparent proposal','DRAFT_FACTORY_READY'],
 ['8','Legitimate deposit and implementation milestones','TRACKING_READY_NO_SIGNED_CONTRACT'],
 ['9','Repeatable customer onboarding and referrals','WORKFLOW_READY_NO_VERIFIED_BUYER'],
 ['10','90-day milestones and performance targets','IMPLEMENTED_AS_MODEL'],
 ['11','Evidence-gated operating dashboard','IMPLEMENTED'],
 ['12','Contingencies for no sales, no partners or capacity','IMPLEMENTED_AS_RULES'],
 ['13','Gross revenue, profit and cash separation','IMPLEMENTED_AS_MODEL']
]);
const KEY='ultron-b2b-90-day-v35';
const today=()=>new Date().toISOString();
const clean=(v,n=200)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const finite=(v,low,high,fallback)=>{const x=Number(v);return Number.isFinite(x)?Math.max(low,Math.min(high,x)):fallback};
const safeUrl=(v)=>{if(!v)return '';let u;try{u=new URL(String(v))}catch{throw Error('Valid public HTTPS source URL required')};if(u.protocol!=='https:'||u.username||u.password||u.port||!u.hostname.includes('.')||u.hostname==='localhost'||u.hostname.endsWith('.internal'))throw Error('Public HTTPS source URL required');return u.href.slice(0,500)};
const blank=()=>({version:B2B_CAMPAIGN_VERSION,createdAt:today(),research:[],partners:[],opportunities:[],activities:[],lastCycle:null,cycleCount:0});
export function qualification(input={}){
 const established=Number(input.annualRevenueUsd)>=5000000;
 const operator=['hvac','plumbing'].includes(clean(input.vertical,20).toLowerCase());
 const locations=Number(input.locations)>=2;
 const declaredNeed=clean(input.evidenceOfNeed,400).length>=18;
 const publicEvidence=Boolean(input.sourceUrl);
 const permission=input.contactPermission===true;
 const score=[established?20:0,operator?20:0,locations?15:0,declaredNeed?20:0,publicEvidence?15:0,permission?10:0].reduce((a,b)=>a+b,0);
 return {score,fit:score>=70?'RESEARCH_QUALIFIED':score>=40?'REVIEW_NEEDED':'LOW_EVIDENCE',
 contactAuthorized:permission,proofLevel:'OWNER_RESEARCH_INPUT_NOT_BUYER_VERIFIED',
 caution:'Public information and researcher opinions alone do not prove purchase intent.'};
}
export function scenario({signed=20,accepted=17,contractUsd=60000,depositPercent=50,marginPercent=55}={}){
 const s=Math.round(finite(signed,0,100000,20)),a=Math.min(s,Math.round(finite(accepted,0,100000,17)));
 const price=finite(contractUsd,0,10000000,60000),fraction=finite(depositPercent,0,100,50)/100;
 const margin=finite(marginPercent,0,100,55)/100;
 const contracted=s*price,collections=s*price*fraction+a*price*(1-fraction);
 return {signed:s,accepted:a,contractedUsd:contracted,modeledCollectionsUsd:collections,
 modeledOperatingProfitUsd:accepted*price*margin,cashGoalUsd:B2B_GOAL_USD,
 disclaimer:'Scenario only; does not represent signed agreements, actual deposits, accepted work, cash settlement or taxable profit.'};
}
export function demonstration(input={}){
 const company=clean(input.company||'Example company',100);
 return {company,kind:'UNDEPLOYED_PROOF_OF_VALUE_DRAFT',
 steps:['Inbound inquiry arrives','Permissioned intake captures minimum necessary details',
 'CRM case is opened with deduplication','Available appointment offered with human handoff',
 'Acceptance, outcomes and actual results measured'],
 required:['customer-approved scope','delivery partner demo account','verified access permissions','QA of failure and opt-out paths'],
 statement:'Demonstration is conceptual until independently tested on authorized systems; no outcome is guaranteed.'};
}
export function proposal(input={}){
 const name=clean(input.company||'Prospective buyer',120);
 const diag=clean(input.diagnosis||'To be determined by a consented discovery interview',300);
 return {title:'Draft scope — '+name,approval:'OWNER_AND_CUSTOMER_SIGNATURE_REQUIRED',
 priceUsd:B2B_OFFER.priceUsd,depositUsd:B2B_OFFER.depositUsd,balanceUsd:B2B_OFFER.balanceUsd,
 work:B2B_OFFER.scope,discoveryEvidence:diag,
 prerequisites:['written and agreed statement of work','appropriate privacy/security review','named capable fulfillment partner',
 'customer access permissions and change-control plan','acceptance tests and clear refund/cancellation terms'],
 timeline:'To be negotiated after partner confirms capacity',
 payment:'No deposit charged by this draft. Use approved payment method only after signed agreement.',
 roi:'Financial opportunity must be calculated from actual customer-provided metrics. No guarantee.',
 status:'NOT_AN_OFFER_OR_EXECUTED_CONTRACT'};
}
export function contingency({signed=0,day=1,partners=0,approvedDeliveryCapacity=0}={}){
 if(signed===0&&day>=14)return {priority:'REPAIR_ACQUISITION',action:'Review segment, real buyer objections, trust signals, pricing and demo. Consider scoped paid pilot; do not claim traction.'};
 if(partners===0)return {priority:'FULFILLMENT',action:'Do not promise live installations until at least one qualified vendor confirms realistic delivery capacity and terms.'};
 if(signed>approvedDeliveryCapacity)return {priority:'CAPACITY',action:'Stop signing new implementation dates until delivery capacity and customer promises are aligned.'};
 return {priority:'QUALIFIED_BUYERS',action:'Continue permissioned prospect research, partner introductions, and deliverable QA.'};
}
export function readiness(env={}){
 const present=k=>Boolean(env[k]);
 const domain=clean(env.PUBLIC_BASE_URL,200);
 return {
 runtimeDatabase:present('DATABASE_URL')?'CONFIGURED':'MISSING',
 providerCheckout:present('PAYPAL_CLIENT_ID')&&present('PAYPAL_CLIENT_SECRET')&&present('PAYPAL_WEBHOOK_ID')?'CREDENTIALS_PRESENT_NOT_PROOF_OF_60000_CHECKOUT':'NOT_CONFIGURED',
 brandedDomain:domain&&!domain.includes('.railway.app')?'CHECK_DNS_OWNERSHIP':'RAILWAY_DOMAIN_ONLY',
 buyerDiscovery:present('ULTRON_DISCOVERY_FEED_URL')?'FEED_CONFIGURED_NOT_INDEPENDENTLY_VERIFIED':'NOT_CONFIGURED',
 sender:present('ULTRON_GMAIL_REFRESH_TOKEN')&&present('ULTRON_BUSINESS_POSTAL_ADDRESS')?'RUNTIME_CREDENTIALS_PRESENT_TEST_REQUIRED':'RUNTIME_AUTH_OR_MAILING_ADDRESS_MISSING',
 crm:present('ULTRON_HUBSPOT_PRIVATE_APP_TOKEN')?'RUNTIME_CREDENTIAL_PRESENT_TEST_REQUIRED':'RAILWAY_RUNTIME_TOKEN_MISSING',
 calendar:present('ULTRON_GOOGLE_CALENDAR_REFRESH_TOKEN')?'RUNTIME_CREDENTIAL_PRESENT_TEST_REQUIRED':'RAILWAY_RUNTIME_TOKEN_MISSING'
 };
}
export function availableNextTasks({partners=0,prospects=0,qualified=0,agreements=0,accepted=0}={}){
 const tasks=[];
 if(!partners)tasks.push('Secure a capable implementation partner and written capacity commitments.');
 if(prospects<30)tasks.push('Research the first 30 legitimate multi-location HVAC/plumbing prospects and document sources.');
 if(qualified<3)tasks.push('Complete three consented diagnostic conversations using real buyer data.');
 if(!agreements)tasks.push('Secure one signed and legally reviewed $60,000 customer statement of work only if deliverable.');
 if(!accepted)tasks.push('Deliver an accepted pilot or implementation before expanding acquisition volume.');
 return tasks;
}
export async function recordResearch(raw={}){
 const company=clean(raw.company,110),website=safeUrl(raw.website),sourceUrl=safeUrl(raw.sourceUrl);
 if(company.length<2||!website||!sourceUrl)throw Error('Company, website and public evidence source are required');
 const vertical=clean(raw.vertical,20).toLowerCase();
 const row={id:randomUUID(),createdAt:today(),company,website,sourceUrl,vertical,locations:Math.round(finite(raw.locations,0,10000,0)),
 annualRevenueUsd:finite(raw.annualRevenueUsd,0,10000000000,0),evidenceOfNeed:clean(raw.evidenceOfNeed,400),
 contactPermission:raw.contactPermission===true,status:'RESEARCH_ONLY',source:clean(raw.source||'PUBLIC_RESEARCH',70)};
 row.qualification=qualification(row);
 await mutateJson(KEY,blank(),s=>{if(s.research.some(p=>p.website===row.website))throw Error('Research entry already exists');
  if(s.research.length>=5000)throw Error('Research capacity reached');
  s.research.unshift(row);s.activities.unshift({at:today(),type:'research_recorded',ref:row.id});s.activities=s.activities.slice(0,400)});
 return row;
}
export async function recordPartnerCandidate(raw={}){
 const name=clean(raw.name,110),sourceUrl=safeUrl(raw.sourceUrl);
 if(name.length<2||!sourceUrl)throw Error('Partner name and evidence URL required');
 const row={id:randomUUID(),createdAt:today(),name,sourceUrl,expertise:clean(raw.expertise,250),
 ownerReportedCapacity:Math.round(finite(raw.capacity,0,1000,0)),status:'CANDIDATE_UNCONTRACTED',
 proof:'No signed partnership, insurance, SLA or capacity verification recorded'};
 await mutateJson(KEY,blank(),s=>{if(s.partners.length>=1000)throw Error('Partner candidate capacity reached');
 s.partners.unshift(row);s.activities.unshift({at:today(),type:'partner_candidate_recorded',ref:row.id});s.activities=s.activities.slice(0,400)});
 return row;
}
export async function recordOpportunity(raw={}){
 const company=clean(raw.company,110);
 if(company.length<2)throw Error('Company required');
 const row={id:randomUUID(),createdAt:today(),company,stage:'DISCOVERY_DRAFT',notes:clean(raw.notes,400),
 sourceUrl:safeUrl(raw.sourceUrl),consented:raw.consented===true,events:[],
 priceUsd:B2B_OFFER.priceUsd,depositUsd:B2B_OFFER.depositUsd,
 signedContractVerified:false,depositProviderVerified:false,finalProviderVerified:false,acceptedByCustomerVerified:false};
 await mutateJson(KEY,blank(),s=>{if(s.opportunities.length>=1000)throw Error('Opportunity capacity reached');
 s.opportunities.unshift(row);s.activities.unshift({at:today(),type:'opportunity_recorded',ref:row.id});s.activities=s.activities.slice(0,400)});
 return row;
}
const ACTIONS=Object.freeze({
 PREPARE_DEMO:'DEMO_DRAFTED',DISCOVERY_COMPLETE:'DISCOVERY_OWNER_REPORTED',
 PROPOSAL_DRAFTED:'PROPOSAL_DRAFTED',CONTRACT_REPORTED:'CONTRACT_OWNER_REPORTED_UNVERIFIED',
 DEPOSIT_REPORTED:'DEPOSIT_OWNER_REPORTED_UNVERIFIED',IMPLEMENTATION_STARTED:'IMPLEMENTATION_OWNER_REPORTED',
 CUSTOMER_ACCEPTANCE_REPORTED:'ACCEPTANCE_OWNER_REPORTED_UNVERIFIED',FOLLOW_UP:'FOLLOW_UP_DRAFTED',
 LOST:'CLOSED_LOST',CANCELLED:'CANCELLED'});
export async function updateOpportunity(raw={}){
 const id=clean(raw.id,80),action=clean(raw.action,60).toUpperCase();
 if(!ACTIONS[action])throw Error('Action not permitted');
 const evidenceUrl=safeUrl(raw.evidenceUrl),note=clean(raw.note,500);
 if(['CONTRACT_REPORTED','DEPOSIT_REPORTED','CUSTOMER_ACCEPTANCE_REPORTED'].includes(action)&&(!evidenceUrl||note.length<12))
 throw Error('Owner-reported milestone requires evidence URL and explanation; not provider verification');
 let updated;
 await mutateJson(KEY,blank(),s=>{
  const row=s.opportunities.find(o=>o.id===id);if(!row)throw Error('Unknown opportunity');
  if((action==='DEPOSIT_REPORTED'||action==='IMPLEMENTATION_STARTED')&&!row.events.some(e=>e.action==='CONTRACT_REPORTED'))
   throw Error('Record contract report before deposit or implementation');
  row.stage=ACTIONS[action];row.events.push({at:today(),action,evidenceUrl,note,verification:'OWNER_REPORTED_NOT_INDEPENDENTLY_VERIFIED'});
  row.events=row.events.slice(-70);updated=structuredClone(row);
  s.activities.unshift({at:today(),type:action,ref:row.id});s.activities=s.activities.slice(0,400);
 });return updated;
}
export function reconcileB2B(orders=[]){
 const candidate=orders.filter(o=>o?.product===B2B_SKU&&o?.status==='COMPLETED'&&
  o?.captureId&&o?.capturedAt&&Number(o.capturedAmount)>0);
 const unique=[...new Map(candidate.map(o=>[o.captureId,o])).values()];
 const gross=unique.reduce((s,o)=>s+Number(o.capturedAmount),0);
 return {providerCapturedCount:unique.length,providerCapturedUsd:Math.round(gross*100)/100,
  bankSettledUsd:null,bankSettlementVerified:false,profitUsd:null,
  note:'Only independently provider-captured B2B SKU payments are counted. Owner-reported deposits, signed drafts and unrelated $99 products count as $0.'};
}
export async function dashboard({privateView=false}={}){
 const [s,l]=await Promise.all([getJson(KEY,blank()),ledger()]);
 const payments=reconcileB2B(Object.values(l.orders||{}));
 const q=s.research.filter(x=>x.qualification?.fit==='RESEARCH_QUALIFIED');
 const model=scenario({});
 return {version:B2B_CAMPAIGN_VERSION,goalUsd:B2B_GOAL_USD,starts:B2B_START,ends:B2B_END,offer:B2B_OFFER,
 commercialFunctions:COMMERCIAL_FUNCTIONS,steps:STEPS.map(x=>({step:Number(x[0]),name:x[1],readiness:x[2]})),
 metrics:{researchEntries:s.research.length,researchQualified:q.length,partnerCandidates:s.partners.length,
 signedFulfillmentPartnersVerified:0,opportunities:s.opportunities.length,
 independentlyVerifiedContracts:0,providerCapturedUsd:payments.providerCapturedUsd,
 bankSettlementVerified:false,acceptedImplementationsVerified:0},
 payments,scenario:model,readiness:readiness(process.env),
 nextActions:availableNextTasks({partners:0,prospects:s.research.length,qualified:q.length,agreements:0,accepted:0}),
 lastCycle:s.lastCycle,cycleCount:s.cycleCount,
 ...(privateView?{research:s.research,partners:s.partners,opportunities:s.opportunities,activities:s.activities.slice(0,80)}:{}),
 truth:'Workflow readiness is not an actual sale, supplier commitment or delivery. Actual money requires provider evidence.'};
}
export async function cycle(){
 let result;
 await mutateJson(KEY,blank(),s=>{
 for(const p of FIRST_PARTY_CANDIDATES.prospects){
  if(s.research.some(r=>r.website===p.website))continue;
  const row={id:'research-seed-'+s.research.length,createdAt:today(),company:p.company,website:p.website,
   sourceUrl:p.sourceUrl,vertical:p.vertical,locations:p.locations,annualRevenueUsd:0,
   evidenceOfNeed:'',contactPermission:false,status:'PUBLIC_RESEARCH_ONLY_NOT_BUYER',
   source:'FIRST_PARTY_OFFICIAL_WEBSITE',researchContext:p.researchContext};
  row.qualification=qualification(row);s.research.push(row);
 }
 for(const p of FIRST_PARTY_CANDIDATES.partners){
  if(s.partners.some(r=>r.name===p.name))continue;
  s.partners.push({id:'partner-seed-'+s.partners.length,createdAt:today(),name:p.name,
   sourceUrl:p.sourceUrl,expertise:p.researchContext,ownerReportedCapacity:0,status:'CANDIDATE_UNCONTRACTED',
   proof:'No contract, qualification, insurance or capacity verification'});
 }
 s.lastCycle=today();s.cycleCount++;
 result={at:s.lastCycle,cycleCount:s.cycleCount,research:s.research.length,
  partnerCandidates:s.partners.length,opportunities:s.opportunities.length};
});
 return result;
}
export function publicLanding(){
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="description" content="ULTRON Revenue Recovery & Automation Systems for established HVAC and plumbing businesses. Discovery-first, custom scope, no revenue guarantees.">'+
 '<title>'+esc(B2B_OFFER.name)+' | ULTRON</title><style>body{margin:auto;max-width:970px;padding:24px;background:#070c12;color:#edf7ff;font:16px/1.55 system-ui}'+
 'h1{font-size:clamp(36px,6vw,66px);line-height:1.08}h2{margin-top:34px}a{color:#8fddff}.cta{display:inline-block;padding:13px 19px;color:#081724;background:#8fddff;border-radius:9px;font-weight:bold;text-decoration:none}'+
 '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:13px}.tile{background:#111e2b;border:1px solid #32465c;border-radius:14px;padding:17px}.muted{color:#b4c7d7}small{color:#9fbbcc}</style></head><body>'+
 '<nav><a href="/">ULTRON Home</a> · <a href="/flagship">Smaller diagnostic</a></nav><main><p class="muted">B2B OPERATIONS • HVAC + PLUMBING</p><h1>Recover lost opportunities in your customer inquiry workflow.</h1>'+
 '<p>ULTRON offers discovery-first implementation of permissioned lead response, CRM handoffs, booking and measurable service operations. We assess fit and partner capacity before agreeing to delivery.</p>'+
 '<p><a class="cta" href="https://payhip.com/LindaWorkflowStudio/contact">Request a private discovery conversation</a> &nbsp; <a href="/90-day-demo">Try the fictional workflow demo</a></p>'+
 '<div class="grid"><section class="tile"><h2>1. Diagnose</h2><p>Review your actual inquiry and booking process, with your consent.</p></section>'+
 '<section class="tile"><h2>2. Design</h2><p>Specify system architecture, vendor roles, privacy controls and acceptance tests.</p></section>'+
 '<section class="tile"><h2>3. Deliver</h2><p>Implement approved workflows, test failure paths and train staff.</p></section></div>'+
 '<h2>Illustrative implementation budget</h2><p><strong>$60,000</strong> project pricing model, subject to a signed statement of work and actual partner availability. A proposed 50% deposit is not charged on this page.</p>'+
 '<h2>What this is not</h2><p>No guaranteed customers, profits, AI autonomy claims, unapproved changes to your systems, or pre-agreement checkout.</p>'+
 '<p class="muted">We will not request passwords, bank credentials or other sensitive secrets through a public form. Technical capacity and legal terms are confirmed before contracting.</p></main>'+
 '<footer><small>ULTRON Revenue Studio · Independent services · <a href="/api/b2b-90-day">Campaign scope and current readiness</a></small></footer></body></html>';
}
