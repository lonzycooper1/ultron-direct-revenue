/**
 * ULTRON V34: revenue-first autonomous operations.
 * Genuine third-party checkout and provider-verified capture only.
 * This code NEVER creates buyers, synthetic orders, unsolicited messages, refunds or transfers.
 */
import {getJson,mutateJson} from './state-store.mjs';
import {ledger} from './ledger-store.mjs';
import dns from 'node:dns/promises';
import https from 'node:https';
import {isIP} from 'node:net';

export const V34_SKU='instant-lead-audit-99';
export const V34_PRICE_USD=99;
export const V34_VERSION='34.0.0';
const KEY='ultron-autonomous-revenue-v34';
const now=()=>new Date().toISOString();
const clean=(x,n=250)=>String(x??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const integer=(v,low,high)=>{const n=Number(v);return Number.isFinite(n)?Math.max(low,Math.min(high,Math.round(n))):low};
export const DIRECTOR=Object.freeze({
 objective:'FIRST_INDEPENDENT_CUSTOMER_99_AUDIT',
 priority:['verified paid fulfillment','opted-in buyer inquiries','checkout reliability','evidence-based buyer research','product quality','owned-page visibility','experimentation'],
 roles:['RevenueDirector','BuyerIntentAnalyst','CompetitionResearcher','DigitalProductFactory','CheckoutCoordinator','DeliveryAgent','QualityControlAgent','ResilienceManager','ProfitAnalyst','ExperimentOptimizer','CustomerSuccessAgent','DelegationGovernor'],
 prohibited:['inventing customers','self-purchases masquerading as revenue','unauthorized payment capture','fake reviews','provider restriction bypass','impersonation','OTP or identity verification bypass','unsolicited mass mail']
});
const STATES={INITIAL:'RESEARCH_FIRST_REAL_BUYER',FULFILL:'DELIVER_VERIFIED_ORDERS',VALIDATE:'REPEAT_WITH_POSITIVE_UNIT_ECONOMICS',SCALE:'SCALE_PROVEN_CHANNELS'};

export function validateV34Intake(raw={}){
 const company=clean(raw.company,100),website=clean(raw.website,240);
 if(company.length<2)throw Error('Business name is required');
 let u;try{u=new URL(website)}catch{throw Error('A public HTTPS website is required')}
 if(u.protocol!=='https:'||u.username||u.password||!['','443'].includes(u.port)||isIP(u.hostname)||
 !u.hostname.includes('.')||/(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(u.hostname)||u.hostname.length>190)
 throw Error('A public HTTPS website is required');
 const industry=['hvac','plumbing','roofing','home-services','auto-repair','salon','professional-services','other'].includes(raw.industry)?raw.industry:'other';
 const volume=integer(raw.monthlyLeads,0,100000),missed=integer(raw.missedPercent,0,100),response=integer(raw.responseMinutes,0,10080);
 const booking=['phone','form','online-booking','social','mixed'].includes(raw.bookingMethod)?raw.bookingMethod:'mixed';
 const followup=['none','manual','inconsistent','automated'].includes(raw.followup)?raw.followup:'inconsistent';
 return {company,website:u.origin+u.pathname,industry,monthlyLeads:volume,missedPercent:missed,responseMinutes:response,
 bookingMethod:booking,followup,mainProblem:clean(raw.mainProblem,300),collectedAt:now(),evidence:'CUSTOMER_SELF_REPORT'};
}

function publicIPv4(ip){
 if(isIP(ip)!==4)return false;const [a,b,c,d]=ip.split('.').map(Number);
 if(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||
 a===192&&b===168||a===100&&b>=64&&b<=127||a===192&&b===0||a===198&&b>=18&&b<=19||
 a===192&&b===88&&c===99||a===198&&b===51&&c===100||a===203&&b===0&&c===113||
 a===255&&b===255&&c===255&&d===255)return false;
 return true;
}
/** One read-only public HTTPS homepage check: pinned DNS, no redirects, cookies or auth. */
export async function inspectV34Homepage(website){
 let u;try{u=new URL(website);if(u.protocol!=='https:'||u.username||u.password||u.port||isIP(u.hostname))throw Error('restricted')}catch{return {status:'UNAVAILABLE',reason:'invalid URL'};}
 let ips;try{ips=await dns.resolve4(u.hostname);if(!ips.length||!ips.every(publicIPv4))throw Error('restricted')}catch{return {status:'UNAVAILABLE',reason:'public DNS/IP check failed'};}
 return new Promise(resolve=>{
  let closed=false,size=0,html='';const done=x=>{if(!closed){closed=true;resolve(x)}};
  const req=https.get(u,{timeout:5000,lookup:(_h,_o,cb)=>cb(null,ips[0],4),headers:{'accept':'text/html','user-agent':'ULTRON-Audit/2.0 (single public homepage read)'}},res=>{
   if(res.statusCode!==200||!/^text\/html/i.test(String(res.headers['content-type']||''))){res.resume();return done({status:'UNAVAILABLE',reason:'not a public 200 HTML response'})}
   res.on('data',b=>{size+=b.length;if(size>200000){req.destroy();return done({status:'UNAVAILABLE',reason:'response size limit'})}html+=b.toString('utf8')});
   res.on('end',()=>done(inspectHtmlV34(html)));
   res.on('error',()=>done({status:'UNAVAILABLE',reason:'read error'}));
  });
  req.on('timeout',()=>{req.destroy();done({status:'UNAVAILABLE',reason:'timeout'})});
  req.on('error',()=>done({status:'UNAVAILABLE',reason:'network error'}));
 });
}
export function inspectHtmlV34(source=''){
 const s=String(source).slice(0,200000);
 return {status:'INSPECTED',title:(s.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/<[^>]+>/g,'').trim().slice(0,120),
 h1Count:(s.match(/<h1(?:\s|>)/gi)||[]).length,formCount:(s.match(/<form(?:\s|>)/gi)||[]).length,
 telLink:/href\s*=\s*['"]tel:/i.test(s),
 bookingText:/\b(book (?:now|online)|schedule (?:a |an )?appointment|request (?:a )?quote|get (?:a )?estimate)\b/i.test(s),
 limitation:'Only static homepage HTML was inspected, not conversion rates, JavaScript-rendered content, calls, other pages, SEO or mobile rendering.'};
}
export function buyerIntent(signal={}){
 const source=clean(signal.source,60).toUpperCase();
 const allowed=['CUSTOMER_INBOUND','AUTHORIZED_FEED','PUBLIC_REQUEST','REFERRAL'].includes(source);
 const url=clean(signal.evidenceUrl,280);const dated=Date.parse(signal.observedAt||'');
 const age=Number.isFinite(dated)?Math.max(0,(Date.now()-dated)/86400000):Infinity;
 const explicit=signal.explicitNeed===true;
 const optin=signal.contactPermission===true;
 const recent=age<=30;
 const score=(allowed?15:0)+(recent?20:0)+(url.startsWith('https://')?10:0)+(explicit?35:0)+(optin?20:0);
 return {score,qualified:allowed&&recent&&explicit&&score>=70,evidence:allowed&&recent?'PROSPECT_SIGNAL_ONLY':'INSUFFICIENT_EVIDENCE',
 contactAllowed:optin,reason:!allowed?'Unauthorized source':!recent?'Stale or undated':!explicit?'No demonstrated buying need':'Signal warrants qualification, not assumed purchase'};
}
export function competitorGaps(offers=[],needs=[]){
 const cleanNeeds=needs.map(x=>clean(x,90)).filter(Boolean).slice(0,12);
 return offers.slice(0,20).map(o=>{
  const stated=(o.capabilities||[]).map(x=>clean(x,90).toLowerCase());
  const missing=cleanNeeds.filter(n=>!stated.some(v=>v.includes(n.toLowerCase())));
  const evidenceUrl=clean(o.evidenceUrl,260);
  return {competitor:clean(o.name,90),evidenceUrl,unverified:!evidenceUrl.startsWith('https://'),
   potentialGaps:missing,qualification:'A missing claimed capability is a research hypothesis, not proof of competitor failure'};
 }).filter(x=>x.competitor);
}
/** Actual generated content, not just a catalog label. */
export function buildV34Report(input,site={status:'UNAVAILABLE',reason:'not inspected'}){
 const x=validateV34Intake(input),missed=Math.round(x.monthlyLeads*x.missedPercent/100);
 const steps=[];
 if(x.responseMinutes>60)steps.push('Assign immediate first-response ownership and set a one-hour alert');
 if(x.missedPercent>=10)steps.push('Capture missed inquiries in a single queue with timestamps');
 if(x.followup!=='automated')steps.push('Add one consent-aware follow-up and a stop-on-opt-out rule');
 if(site.status==='INSPECTED'){
  if(!site.telLink)steps.push('Check whether a phone link should appear prominently for mobile visitors');
  if(!site.bookingText)steps.push('Test a clear request-quote or booking call to action');
  if(!site.formCount)steps.push('Verify a simple inquiry channel is available');
 }
 steps.push('Measure inbound source, first-response latency and completed bookings weekly');
 const findings=site.status==='INSPECTED'?
  'Observed from static public homepage HTML only: title '+JSON.stringify(site.title||'(not detected)')+
  '; H1 count '+site.h1Count+'; form count '+site.formCount+'; phone link '+(site.telLink?'detected':'not detected')+
  '; booking words '+(site.bookingText?'detected':'not detected')+'. Absence in static HTML does not prove a live feature is missing.':
  'No independent homepage finding: '+clean(site.reason,120)+'. All business-process inputs are customer-provided and unverified.';
 const sections=[
  {title:'Scope and evidence',body:'Instant $99 digital decision-support audit for '+x.company+'. Inputs are customer self-reported, not verified revenue or performance facts. Homepage findings cover only public HTML, if accessible.'},
  {title:'Customer-supplied baseline',body:'Industry '+x.industry+'; '+x.monthlyLeads+' estimated monthly inquiries; '+x.missedPercent+'% estimated missed; '+x.responseMinutes+'-minute typical response; booking '+x.bookingMethod+'; follow-up '+x.followup+'. Implied missed inquiries approximately '+missed+' per month, conditional on supplied inputs; not proven lost sales.'},
  {title:'Public website observations',body:findings},
  {title:'Prioritized opportunities',body:steps.map((z,i)=>(i+1)+'. '+z).join(' ')},
  {title:'Initial response script',body:'Thanks for contacting '+x.company+'. What service do you need, and which time works for a response? We will confirm availability rather than promise what we have not checked.'},
  {title:'Permission-aware follow-up script',body:'Following up on your recent request to '+x.company+'. Would you still like assistance? No further messages if you decline or opt out. Use only with valid contact permission.'},
  {title:'7-day implementation checklist',body:'D1 record baseline and owners; D2 inspect booking and phone CTA; D3 set response target; D4 configure consent-aware follow-up; D5 test internally; D6 review missed inquiries; D7 improve one measured bottleneck.'},
  {title:'30-day KPI scorecard',body:'By week, count inbound leads, response time median and p90, follow-up permissions, qualified conversations, booked jobs, refunds and complaints. Compare consistent sources and periods; do not manufacture outcomes.'},
  {title:'Limits and handoff',body:'Digital analysis and scripts only. No customer CRM access, full-site technical audit, website changes, marketing sends or increased-sales guarantee. Verify recommendations before implementing.'}
 ];
 return {sections,siteEvidence:site.status,quality:qualityGate(sections),productId:V34_SKU};
}
export function artifactFactory(type='report',input={}){
 const company=clean(input.company||'Business',100);
 const typeId=['report','template','website','software-scaffold','followup-scripts'].includes(type)?type:'report';
 if(typeId==='website')return {kind:'website',editable:true,files:[{path:'index.html',content:'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+htmlEscape(company)+'</title><main><h1>'+htmlEscape(company)+'</h1><p>Contact us for availability and a quote.</p><a href="mailto:contact@example.com">Request information</a></main></html>'}],note:'Editable starting point, not deployed or connected to customer systems'};
 if(typeId==='software-scaffold')return {kind:'software-scaffold',editable:true,files:[{path:'README.md',content:'# '+company+' workflow\nDefine requirements, inputs, outputs, tests and integration permissions before deployment.'},{path:'workflow.mjs',content:'export function processLead(input){return {received:Boolean(input&&input.request),reviewRequired:true}}'}],note:'Source scaffold, not a production-ready installed application'};
 if(typeId==='followup-scripts')return {kind:'followup-scripts',editable:true,sections:buildV34Report({...input,website:input.website||'https://public-business.example.org'},{}).sections.slice(4,6),note:'Drafts for permissioned contexts only'};
 if(typeId==='template')return {kind:'template',editable:true,sections:[{title:'Lead log',body:'Date | source | inquiry | contact permission | owner | first response time | qualified | booked | disposition'},{title:'Weekly review',body:'Counts, gaps, corrective actions, responsible person, review date'}],note:'Editable worksheet'};
 return {kind:'report',editable:true,sections:buildV34Report(input,{}).sections,note:'Report based on self-reported inputs'};
}
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function qualityGate(sections=[]){
 const errors=[];if(!Array.isArray(sections)||sections.length<2)errors.push('missing substantive sections');
 for(const s of sections){if(!s?.title||!s?.body||String(s.body).length<40)errors.push('missing or shallow section');}
 const joined=sections.map(s=>s?.body||'').join(' ').toLowerCase();
 if(/\b(?:guaranteed [0-9]+%|guaranteed revenue|100% success)\b/.test(joined))errors.push('unfounded guarantee');
 if(!/self.report|customer.provided|customer.su/.test(joined))errors.push('no source qualification');
 return {passed:errors.length===0,errors};
}
export function delegatedAuthority(action,scope={}){
 const a=clean(action,60).toUpperCase();
 const autonomous=['READ_PUBLIC','QUALIFY_INTENT','ANALYZE_COMPETITOR','GENERATE_INTERNAL_PRODUCT','RUN_QUALITY_CHECK','RUN_SAFE_MONITOR','DRAFT_REPLY','RETRY_INTERNAL_READ','RECONCILE_RECEIPTS'];
 if(autonomous.includes(a))return {allowed:true,basis:'Routine internal and permitted read-only operation'};
 if(a==='FULFILL_CAPTURED_DIGITAL_PRODUCT')return {allowed:scope.captureVerified===true&&scope.productScope===V34_SKU,basis:'Verified third-party payment and fixed product scope required'};
 if(a==='PUBLISH_OWNED_PRODUCT_PAGE')return {allowed:scope.ownerStandingApproval===true&&scope.ownedDomain===true&&scope.productScope===V34_SKU,basis:'Specific owner-authorized publishing scope'};
 if(a==='SEND_CUSTOMER_EMAIL')return {allowed:scope.ownerStandingApproval===true&&scope.senderAuthorized===true&&scope.contactPermission===true&&scope.unsubscribeReady===true&&scope.validPostalAddress===true&&scope.recipientInScope===true,basis:'Explicitly scoped standing campaign authorization; no unapproved recipients'};
 return {allowed:false,basis:'Requires owner or provider authorization; no bypass or impersonation'};
}
export function retryPlan(job={}){
 const attempts=integer(job.attempts,0,99),kind=clean(job.kind,40).toUpperCase();
 const safe=['READ_FEED','HEALTH_CHECK','GENERATE_REPORT','UPDATE_INTERNAL_METRICS','INSPECT_PUBLIC_HTML'].includes(kind);
 return {safe,shouldRetry:safe&&attempts<3,backoffSeconds:Math.min(3600,30*Math.pow(2,attempts)),backupRole:safe&&attempts>=1?'ResilienceManager':null,
 reason:!safe?'Consequential or unknown external action cannot be blindly retried':attempts>=3?'Retry limit reached':'Bounded safe retry'};
}
export function reconcileVerifiedRevenue(orders=[],costEvents=[]){
 const paid=orders.filter(o=>o&&o.captureId&&o.capturedAt&&o.status==='COMPLETED');
 const unique=[...new Map(paid.map(o=>[o.captureId,o])).values()];
 const gross=unique.reduce((s,o)=>s+Number(o.capturedAmount||0),0);
 const refunds=unique.reduce((s,o)=>s+(Array.isArray(o.refunds)?o.refunds.reduce((t,r)=>t+Number(r.amount||0),0):Number(o.refundedAmount||0)),0);
 const hasFees=unique.every(o=>Number.isFinite(Number(o.paypalFeeUsd))&&o.paypalFeeSource==='PROVIDER');
 const fees=hasFees?unique.reduce((s,o)=>s+Number(o.paypalFeeUsd),0):null;
 const verifiedCosts=costEvents.filter(e=>e?.verified===true&&e?.source);
 const cost=verifiedCosts.reduce((s,e)=>s+Number(e.amountUsd||0),0);
 const costsComplete=costEvents.complete===true;
 const net=hasFees&&costsComplete?Math.round((gross-refunds-fees-cost)*100)/100:null;
 return {verifiedCaptures:unique.length,grossCapturedUsd:Math.round(gross*100)/100,refundsUsd:Math.round(refunds*100)/100,
 paypalFeesUsd:fees,recordedVerifiedCostsUsd:Math.round(cost*100)/100,netProfitUsd:net,
 netProfitStatus:net===null?'UNKNOWN_MISSING_COMPLETE_FEE_OR_COST_EVIDENCE':'RECONCILED_RECORDED_EVIDENCE',
 settledBankUsd:null,settlementStatus:'UNVERIFIED'};
}
export function experimentDecision({visits=0,paidOrders=0,contributionProfitUsd=null,refundRate=0}={}){
 if(visits<100||paidOrders<5)return {action:'COLLECT_EVIDENCE',reason:'Not enough independent demand and conversion samples'};
 if(contributionProfitUsd===null)return {action:'RECONCILE_COSTS',reason:'Cannot optimize on gross receipts alone'};
 if(contributionProfitUsd<=0||refundRate>.10)return {action:'IMPROVE_OFFER',reason:'Poor measured economics or high refunds'};
 return {action:'CONTROLLED_EXPANSION',reason:'Consider one bounded, authorized channel test'};
}
export function retentionOpportunity({paid=false,consent=false,delivered=false,qualityAccepted=false}={}){
 return {supportAllowed:paid,marketingContactAllowed:paid&&consent,upsellDraftAllowed:paid&&delivered&&qualityAccepted,
 next:'Offer relevant support and optional upgrade only when there is a legitimate delivery and contact basis'};
}
export function nextObjective(snapshot={}){
 if((snapshot.unfulfilledPaid||0)>0)return STATES.FULFILL;
 if((snapshot.verifiedPaid||0)===0)return STATES.INITIAL;
 if(snapshot.profitKnown!==true||snapshot.verifiedPaid<5)return STATES.VALIDATE;
 return STATES.SCALE;
}
const fresh=()=>({version:V34_VERSION,createdAt:now(),cycles:0,lastCycle:null,objective:DIRECTOR.objective,lastSnapshot:null,events:[],mode:'BOUND_AUTONOMOUS_RESEARCH_AND_VERIFIED_ORDER_FULFILLMENT'});
/** Safe director; reads actual ledger and records aggregate metrics; no external sends/spends. */
export async function runRevenueDirector(){
 const l=await ledger(),orders=Object.values(l.orders||{}),finance=reconcileVerifiedRevenue(orders);
 const target=orders.filter(o=>o.product===V34_SKU);
 const paid=target.filter(o=>o.status==='COMPLETED'&&o.captureId&&o.fulfillment?.token);
 const unfulfilled=target.filter(o=>o.captureId&&o.status==='COMPLETED'&&!o.fulfillment?.token);
 const snapshot={at:now(),sku:V34_SKU,initiated:target.length,verifiedFulfilled:paid.length,verifiedAllProducts:finance.verifiedCaptures,
  grossAllProductsUsd:finance.grossCapturedUsd,netProfitUsd:finance.netProfitUsd,
  objective:nextObjective({unfulfilledPaid:unfulfilled.length,verifiedPaid:paid.length,profitKnown:finance.netProfitUsd!==null}),
  required:['actual independent buyer','fully signed PayPal payment evidence','QA-delivered report','actual fee and cost reconciliation']};
 await mutateJson(KEY,fresh(),s=>{s.cycles=(s.cycles||0)+1;s.lastCycle=snapshot.at;s.lastSnapshot=snapshot;s.objective=snapshot.objective;});
 return snapshot;
}
export async function readRevenueDirector(){return getJson(KEY,fresh())}
/** Intentionally synthetic ONLY. Never persisted, passed to PayPal, or counted as sales. */
export function simulationCustomers(){
 const industries=['hvac','plumbing','roofing','home-services','auto-repair','salon','professional-services','other','hvac','plumbing'];
 return industries.map((industry,i)=>({id:'SIM-V34-'+String(i+1).padStart(2,'0'),company:'Simulation '+String(i+1)+' Business',
 website:'https://simulated'+(i+1)+'.example.org',industry,monthlyLeads:25+i*11,missedPercent:8+i*3,
 responseMinutes:10+i*17,bookingMethod:'mixed',followup:'manual',mainProblem:'Test data only',simulation:true,
 realCustomer:false,realSale:false,sendToPayPal:false,countAsRevenueUsd:0}));
}
export function publicV34Manifest(){
 return {version:V34_VERSION,priceUsd:V34_PRICE_USD,sku:V34_SKU,objective:DIRECTOR.objective,agentRoles:DIRECTOR.roles,
 capabilities:['buyer intent scoring','competitor hypotheses','digital artifact factory','self-service approved PayPal checkout',
 'verified captured payment fulfillment','quality review','safe limited retries','evidence-based financial reconciliation',
 'controlled experiments','legitimate retention support','scoped delegated authority','safe director heartbeat'],
 restrictions:DIRECTOR.prohibited,
 honestState:'These are implemented code capabilities, not proof of buyer traffic, profits, permissions, paid purchases or bank settlement'};
}
