import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import net from 'node:net';
import {getJson,mutateJson} from './state-store.mjs';

const KEY='ultron-growth-v19';
const when=()=>new Date().toISOString();
const money=n=>Math.round(Number(n||0)*100)/100;
const uid=()=>crypto.randomUUID();
const init=()=>({
  version:'19.0.0', mode:'ZERO_SPEND_FIRST_CUSTOMER',
  dailyTarget:{min:25,max:50,source:'external provider or approved candidate import; never simulate'}, 
  lastDiscoveryDate:null, sourceStatus:'NOT_CHECKED',
  prospects:{},demonstrations:{},proposals:{},outbox:{},replies:{},meetings:{},
  checkouts:{},orders:{},fulfillment:{},testimonials:{},referrals:{},experiments:{},
  spend:[],campaigns:[],contentQueue:[],events:[],suppression:{},
  policy:{maxOutboundPerDay:10,maxTouchesPer14Days:3,minSatisfiedIndependentCustomers:3,
    maxAutomaticSpendUsd:0,automaticRealTrades:false,allowUnauditedClaims:false},
  emailSentByDate:{},errors:[],jobs:{},updatedAt:null
});
const mutate=fn=>mutateJson(KEY,init(),s=>{fn(s);s.updatedAt=when()});
export const growthState=()=>getJson(KEY,init());
const clean=x=>String(x||'').trim().slice(0,1000);
const html=x=>clean(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function publicIp(ip){
  if(net.isIP(ip)===4){const a=ip.split('.').map(Number);return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===192&&a[1]===168||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]===192&&a[1]===0||a[0]===198&&a[1]>=18&&a[1]<=19);}
  if(net.isIP(ip)===6){const t=ip.toLowerCase();return !(t==='::1'||t==='::'||t.startsWith('fe80:')||t.startsWith('fc')||t.startsWith('fd')||t.startsWith('::ffff:'));}
  return false;
}
export async function safeWebsite(site){
  const u=new URL(site);
  if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||u.hostname.endsWith('.local')||u.hostname==='localhost')throw Error('public HTTPS website required');
  const ips=await dns.lookup(u.hostname,{all:true,verbatim:true});
  if(!ips.length||!ips.every(x=>publicIp(x.address)))throw Error('not a public destination');
  u.hash='';return u.toString();
}
const robotsDisallowed=(txt,path)=>{let active=false;for(const line of txt.split(/\r?\n/)){
  const t=line.split('#')[0].trim(),m=t.match(/^([^:]+):\s*(.*)$/);if(!m)continue;
  if(m[1].toLowerCase()==='user-agent'){active=m[2]==='*'||m[2].toLowerCase()==='ultron-audit';}
  if(active&&m[1].toLowerCase()==='disallow'&&m[2]&&path.startsWith(m[2]))return true;
}return false};
async function boundedFetch(url,max=240000){
  const r=await fetch(url,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(9000),headers:{'user-agent':'ULTRON-Audit/1.0 (public site analysis; contact site operator for removal)','accept':'text/html,text/plain;q=0.8'}});
  if(r.status>=300&&r.status<400)throw Error('redirect requires separate verification');
  if(!r.ok)throw Error('HTTP '+r.status);
  const typ=r.headers.get('content-type')||'';
  if(!/text\/html|text\/plain/.test(typ))throw Error('not an HTML page');
  const reader=r.body.getReader();let count=0,chunks=[];
  try{while(true){const x=await reader.read();if(x.done)break;count+=x.value.byteLength;if(count>max)throw Error('page over crawl limit');chunks.push(x.value);}}finally{await reader.cancel().catch(()=>{});}
  return new TextDecoder().decode(Buffer.concat(chunks.map(x=>Buffer.from(x))));
}
export function inspectHtml(source,url){
  const s=String(source||'').slice(0,240000),l=s.toLowerCase(),find=[];
  const meta=/<meta[^>]+name\s*=\s*["']description["'][^>]*>/i.test(s);
  const viewport=/name\s*=\s*["']viewport["']/i.test(s);
  const title=/<title[^>]*>([^<]+)<\/title>/i.exec(s)?.[1]?.trim()||'';
  const cta=/(book now|book online|schedule|request quote|get a quote|contact us|call now|free estimate|buy now|reserve)/i.test(s);
  const form=/<form[\s>]/i.test(s);
  const phone=/(href\s*=\s*["']tel:)/i.test(s);
  const booking=/(calendly|acuityscheduling|squareup\.com\/appointments|booksy|setmore|appointy)/i.test(s);
  const noIndex=/(noindex)/i.test(s);
  if(!title)find.push('Missing page title');
  if(!meta)find.push('Missing or undetected search description');
  if(!viewport)find.push('Mobile viewport tag not detected');
  if(!cta)find.push('Prominent booking or quote call-to-action not detected in HTML');
  if(!form&&!booking&&!phone)find.push('No obvious inquiry, booking or direct-call route detected');
  if(noIndex)find.push('Page appears to request noindex');
  return {url,observedAt:when(),evidence:{title:clean(title),metaDescriptionTag:meta,mobileViewport:viewport,callToActionText:cta,formDetected:form,clickToCall:phone,thirdPartyBooking:booking,noIndex},findings:find,limitations:['Heuristics cannot prove missed leads, conversion rates, customer demand or mobile performance.','Dynamic JavaScript content may not appear in fetched HTML.','Speed, accessibility and booking completion require separate measurements.'],score:Math.max(0,100-find.length*15)};
}
export async function crawlWebsite(site){
  const url=await safeWebsite(site),u=new URL(url);
  try{const rt=await boundedFetch(u.origin+'/robots.txt',50000);if(robotsDisallowed(rt,u.pathname||'/'))return {url,status:'ROBOTS_DISALLOWED',observedAt:when()};}
  catch(e){if(!/HTTP 404/.test(String(e.message)))return {url,status:'ROBOTS_CHECK_FAILED',observedAt:when(),reason:clean(e.message)};}
  const source=await boundedFetch(url);return {...inspectHtml(source,url),status:'SCANNED'};
}
function keyFor(x){const site=clean(x.website||'');if(site){try{return new URL(site).hostname.toLowerCase().replace(/^www\./,'')}catch{}}
  return clean(x.name).toLowerCase().replace(/[^a-z0-9]+/g,'-')+'|'+clean(x.city).toLowerCase();}
function grade(x){const evidence=(x.audit?.findings||[]).length;const fit=Number(x.fit||0);return Math.max(0,Math.min(100,Math.round(fit*.6+Math.min(40,evidence*8))))}
export async function importProspects(items=[],origin='OWNER_RESEARCH'){
  if(!Array.isArray(items)||items.length>50)throw Error('batch must contain 0-50 businesses');
  const today=when().slice(0,10);let inserted=0;
  const result=await mutate(s=>{for(const row of items){
    if(!row||!clean(row.name)||!clean(row.website))continue;
    const key=keyFor(row);if(s.suppression[key])continue;
    const old=s.prospects[key];if(old){old.lastSeenAt=when();continue;}
    const email=clean(row.email).toLowerCase();
    const trustedContact=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&Boolean(row.contactSource)&&Boolean(row.contactRole);
    s.prospects[key]={id:key,name:clean(row.name),website:clean(row.website),city:clean(row.city),vertical:clean(row.vertical)||'services',
      fit:Math.max(0,Math.min(100,Number(row.fit||55))),source:clean(row.source)||origin,
      decisionMaker:{name:clean(row.contactName),role:clean(row.contactRole),email:trustedContact?email:null,
        source:trustedContact?clean(row.contactSource):null,status:trustedContact?'SOURCED_NOT_DELIVERABILITY_VERIFIED':'NEEDS_VERIFICATION'},
      audit:null,stage:'DISCOVERED',optOut:false,touches:[],createdAt:when(),lastSeenAt:when()};inserted++;
  }s.events.push({at:when(),type:'PROSPECT_IMPORT',count:inserted,origin,today});});
  return {imported:inserted,total:Object.keys(result.prospects).length,source:origin,truth:'sourced candidates, not verified buyers'};
}
export async function auditProspect(id,{crawl=crawlWebsite}={}){
  const s=await growthState(),p=s.prospects[id];if(!p)throw Error('prospect not found');
  const a=await crawl(p.website);
  await mutate(z=>{const q=z.prospects[id];if(!q)return;q.audit=a;q.score=grade({...q,audit:a});q.stage=a.status==='SCANNED'?'RESEARCHED':'REQUIRES_REVIEW';});
  return a;
}
export function makeProposal(p,offer='mini'){
  const offers={mini:{name:'Missed Lead Mini Audit',priceUsd:99,path:'/buy?product=missed-lead-mini-audit-99',scope:['Public customer-path diagnostic','Booking and response opportunity report','Three prioritized improvements']},
    audit:{name:'AI Revenue Audit',priceUsd:500,path:'/buy?product=ai-revenue-audit-500',scope:['Expanded conversion review','Response and booking workflow design','Prioritized implementation roadmap']},
    implementation:{name:'Lead Recovery Implementation',priceUsd:2500,path:'/buy?product=lead-recovery-implementation-2500',scope:['Scoped conversion and follow-up implementation','Quality assurance and handoff']}}
  const o=offers[offer];if(!o)throw Error('unknown offer');if(!p.audit||p.audit.status!=='SCANNED')throw Error('current website evidence required');
  return {id:uid(),prospectId:p.id,company:p.name,offer:o.name,priceUsd:o.priceUsd,checkout:o.path,
    observedProblems:p.audit.findings.slice(0,5),sourceUrl:p.audit.url,observedAt:p.audit.observedAt,
    scope:o.scope,limits:'These are public-page observations, not proof of lost revenue or a guaranteed ROI.',
    status:'DRAFT_NOT_SENT',createdAt:when()};
}
export async function prepareSales(id,offer='mini'){
  const s=await growthState(),p=s.prospects[id];if(!p)throw Error('unknown prospect');
  const proposal=makeProposal(p,offer);const demoId=uid();
  const d={id:demoId,prospectId:id,name:p.name,problem:proposal.observedProblems[0]||'Unverified conversion opportunity',status:'SIMULATION_NOT_CUSTOMER_RESULTS',
    flow:['Clear customer offer','Request a quote','Confirmation response','Appointment request','Follow-up subject to consent'],createdAt:when()};
  await mutate(z=>{z.proposals[proposal.id]=proposal;z.demonstrations[demoId]=d;
    const prev=Object.values(z.outbox).find(v=>v.prospectId===id&&v.status!=='SENT');if(!prev){
      const o={id:uid(),prospectId:id,to:p.decisionMaker.email,subject:'Website booking-flow question for '+p.name,
        body:'Hello,\n\nI reviewed the public customer journey at '+p.website+'. I noticed: '+(proposal.observedProblems[0]||'a possible booking conversion improvement')+'.\n\nI prepared a short, clearly labeled demonstration and can share a fixed-scope mini audit if useful. There are no promised revenue outcomes.\n\nIf this is not relevant, reply stop and I will not contact you again.',
        demoId,status:p.decisionMaker.email?'OWNER_APPROVAL_REQUIRED':'NEEDS_VERIFIED_BUSINESS_CONTACT',
        createdAt:when()};z.outbox[o.id]=o;}z.prospects[id].stage='PROPOSAL_DRAFTED';
  });
  return {proposal,demo:d};
}
export function demoHtml(d){
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private ULTRON Demonstration</title>'+
  '<style>body{background:#09131d;color:#edf7ff;font:16px system-ui;margin:auto;padding:25px;max-width:750px}section{padding:20px;background:#183043;border-radius:16px;margin:16px 0}a{color:#8cefd2}.banner{background:#69370f;padding:12px;border-radius:12px}</style>'+
  '<h1>ULTRON Customer Conversion Demo</h1><p class="banner">SIMULATION ONLY — NOT A LIVE CUSTOMER WEBSITE OR VERIFIED RESULTS</p><h2>'+html(d.name)+'</h2>'+
  '<p>Hypothesis to investigate: '+html(d.problem)+'</p>'+
  d.flow.map((x,i)=>'<section><b>Step '+(i+1)+'</b><p>'+html(x)+'</p></section>').join('')+
  '<p>This is a concept demonstration; actual integration requires business authorization and testing.</p><a href="/solutions/ai-implementation">View real fixed-scope services</a></html>';
}
export async function approveOutbox(ids,owner){
  if(!Array.isArray(ids)||!ids.length||ids.length>10)throw Error('approve 1-10 message IDs');
  await mutate(s=>{for(const id of ids){const m=s.outbox[id],p=m&&s.prospects[m.prospectId];if(!m||!p||!m.to||p.optOut||s.suppression[p.id])throw Error('unverified or suppressed recipient');
    if(m.status!=='OWNER_APPROVAL_REQUIRED'&&m.status!=='APPROVED_PENDING_SENDER')throw Error('message not awaiting approval');
    m.status='APPROVED_PENDING_SENDER';m.ownerApprovedAt=when();m.approvedBy=clean(owner)||'owner';
  }});
  return {approved:ids.length,actualSend:false,requires:'Runtime Gmail OAuth, verified business identity, sending policy and applicable legal disclosures'};
}
export function classifyIncoming(body=''){
  const t=String(body).toLowerCase();if(/unsubscribe|remove me|stop emailing|do not contact/.test(t))return 'OPT_OUT';
  if(/\b(not interested|no thanks|pass)\b/.test(t))return 'DECLINE';
  if(/\b(book|call|interested|schedule|yes|demo)\b/.test(t))return 'INTERESTED';
  return 'QUESTION';
}
export async function receiveReply({prospectId,messageId,body}){
  if(!prospectId||!messageId||!body)throw Error('prospect, provider message and text required');
  const category=classifyIncoming(body);await mutate(s=>{if(s.replies[messageId])return;const p=s.prospects[prospectId];if(!p)throw Error('unknown prospect');
    s.replies[messageId]={prospectId,category,at:when(),snippet:clean(body).slice(0,450)};
    if(category==='OPT_OUT'||category==='DECLINE'){p.optOut=true;s.suppression[prospectId]=category;}
    else p.stage=category==='INTERESTED'?'INTERESTED':'REPLIED';
    if(category==='INTERESTED')s.meetings['reply-'+messageId]={prospectId,status:'READY_TO_OFFER_AVAILABLE_TIMES',createdAt:when()};
  });
  return {classification:category,sent:false,meetingConfirmed:false};
}
function configuredEmail(){return Boolean(process.env.ULTRON_GMAIL_CLIENT_ID&&process.env.ULTRON_GMAIL_CLIENT_SECRET&&process.env.ULTRON_GMAIL_REFRESH_TOKEN&&process.env.ULTRON_BUSINESS_SENDER&&process.env.ULTRON_BUSINESS_POSTAL_ADDRESS);}
async function gmailToken(){
  const form=new URLSearchParams({client_id:process.env.ULTRON_GMAIL_CLIENT_ID,client_secret:process.env.ULTRON_GMAIL_CLIENT_SECRET,refresh_token:process.env.ULTRON_GMAIL_REFRESH_TOKEN,grant_type:'refresh_token'});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:form,signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw Error('Gmail OAuth token refresh failed');
  const j=await r.json();if(!j.access_token)throw Error('Gmail OAuth response missing access token');return j.access_token;
}
function unsubscribeToken(id){const secret=process.env.ULTRON_UNSUBSCRIBE_SECRET||'';if(secret.length<32)throw Error('unsubscribe key not configured');return crypto.createHmac('sha256',secret).update(id).digest('hex');}
export async function unsubscribe(id,token){
  const expected=unsubscribeToken(id),got=String(token||'');
  if(got.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(got)))throw Error('invalid link');
  await mutate(s=>{s.suppression[id]='UNSUBSCRIBED';if(s.prospects[id])s.prospects[id].optOut=true;});
  return {unsubscribed:true};
}
export async function sendApproved(max=10){
  if(!configuredEmail()||!process.env.ULTRON_UNSUBSCRIBE_SECRET||!process.env.PUBLIC_BASE_URL)
    return {sent:0,status:'SENDER_NOT_CONFIGURED',note:'No email sent; ChatGPT Gmail connection is separate from Railway runtime OAuth'};
  const day=when().slice(0,10),s=await growthState(),remaining=Math.max(0,s.policy.maxOutboundPerDay-(s.emailSentByDate[day]||0));if(remaining===0)return {sent:0,status:'DAILY_LIMIT_REACHED'};
  const allowed=Object.values(s.outbox).filter(m=>m.status==='APPROVED_PENDING_SENDER'&&m.ownerApprovedAt).slice(0,Math.min(max,remaining));
  if(!allowed.length)return {sent:0,status:'NO_APPROVED_RECIPIENTS'};
  const t=await gmailToken();let sent=0,failed=0;
  for(const m of allowed){
    const current=await growthState(),p=current.prospects[m.prospectId];
    if(!p||p.optOut||current.suppression[p.id])continue;
    if((p.touches||[]).filter(x=>Date.now()-Date.parse(x)<14*86400e3).length>=current.policy.maxTouchesPer14Days)continue;
    const link=String(process.env.PUBLIC_BASE_URL).replace(/\/$/,'')+'/unsubscribe/v19/'+encodeURIComponent(p.id)+'?token='+unsubscribeToken(p.id);
    const from=process.env.ULTRON_BUSINESS_SENDER,postal=process.env.ULTRON_BUSINESS_POSTAL_ADDRESS;
    const mime=['From: '+from,'To: '+m.to,'Subject: '+m.subject.replace(/[\r\n]/g,' '),'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8',
      'List-Unsubscribe: <'+link+'>','',m.body,'','Business mailing address: '+postal,'Unsubscribe: '+link].join('\r\n');
    try{
      const r=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',
        headers:{authorization:'Bearer '+t,'content-type':'application/json'},
        body:JSON.stringify({raw:Buffer.from(mime).toString('base64url')}),signal:AbortSignal.timeout(10000)});
      const j=await r.json().catch(()=>({}));if(!r.ok||!j.id)throw Error('Gmail did not confirm message delivery handoff');
      await mutate(z=>{const item=z.outbox[m.id];if(item.status!=='APPROVED_PENDING_SENDER')return;
        item.status='SENT';item.sentAt=when();item.providerId=j.id;const lead=z.prospects[item.prospectId];
        lead.touches.push(item.sentAt);lead.stage='CONTACTED';z.emailSentByDate[day]=(z.emailSentByDate[day]||0)+1;});sent++;
    }catch(e){failed++;await mutate(z=>{z.errors.push({kind:'GMAIL_SEND_FAILURE',message:clean(e.message),at:when()});z.errors=z.errors.slice(-100);});break;}
  }
  return {sent,failed,status:failed?'PARTIAL':'COMPLETE',proof:'Gmail provider message IDs stored; not proof of recipient reading or payment'};
}
export async function onVerifiedCapture(x){
  if(!x.orderId||!x.captureId||x.status!=='COMPLETED'||!(Number(x.amountUsd)>0))throw Error('trusted completed PayPal capture required');
  const amount=money(x.amountUsd);
  const s=await mutate(z=>{if(Object.values(z.orders).some(o=>o.captureId===x.captureId))return;
    z.orders[x.orderId]={orderId:x.orderId,captureId:x.captureId,amountUsd:amount,customerId:clean(x.customerId)||null,offerId:clean(x.offerId),status:'CAPTURE_VERIFIED',at:when()};
    z.fulfillment[x.orderId]={orderId:x.orderId,status:'PAID_DIGITAL_FULFILLMENT_PENDING_QC',createdAt:when(),requiresCustomerDeliveryEvidence:true};
    z.events.push({type:'VERIFIED_PAYPAL_CAPTURE',orderId:x.orderId,captureId:x.captureId,amountUsd:amount,at:when()});});
  return {recorded:Boolean(s.orders[x.orderId]),captureId:x.captureId,truth:'credited only after existing PayPal verification'};
}
export async function markFulfilled({orderId,receiptRef,qcPassed}){
  if(!orderId||!receiptRef||qcPassed!==true)throw Error('quality check and delivery evidence required');
  const s=await mutate(z=>{const order=z.orders[orderId];if(!order)throw Error('verified order not found');
    const task=z.fulfillment[orderId];task.status='FULFILLED';task.evidence=clean(receiptRef);task.at=when();order.status='FULFILLED';});
  return s.fulfillment[orderId];
}
export async function customerProof({orderId,satisfied,independentCustomer,permission,quote,evidence}){
  if(!orderId||!evidence||typeof satisfied!=='boolean')throw Error('verified customer satisfaction evidence required');
  const s=await mutate(z=>{const order=z.orders[orderId];if(!order||order.status!=='FULFILLED')throw Error('verified fulfilled order required');
    order.satisfied=satisfied;order.independentCustomer=independentCustomer===true;
    if(satisfied&&permission===true&&quote){z.testimonials[orderId]={quote:clean(quote),evidence:clean(evidence),permission:true,at:when()};}
  });return {count:Object.values(s.orders).filter(x=>x.satisfied&&x.independentCustomer).length};
}
export async function expense(x){
  if(!x.receiptRef||!(Number(x.amountUsd)>0)||!x.category)throw Error('real expense and receipt required');
  const s=await mutate(z=>{z.spend.push({id:uid(),category:clean(x.category),amountUsd:money(x.amountUsd),receiptRef:clean(x.receiptRef),at:when()});});
  return {count:s.spend.length};
}
export async function queueExperiment(x){
  if(!x.name||!x.hypothesis||!x.primaryMetric)throw Error('experiment needs hypothesis and metric');
  const id=uid();await mutate(s=>{s.experiments[id]={id,name:clean(x.name),hypothesis:clean(x.hypothesis),primaryMetric:clean(x.primaryMetric),status:'DRAFT_NEEDS_BASELINE',at:when()};});
  return {id,status:'DRAFT_NEEDS_BASELINE'};
}
export async function proposeContent(x){
  if(!x.title||!x.body||!x.channel)throw Error('content title/body/channel required');
  const s=await mutate(z=>{z.contentQueue.push({id:uid(),title:clean(x.title),body:clean(x.body),channel:clean(x.channel),status:'REQUIRES_PUBLISHING_AUTHORIZATION_AND_EDITORIAL_REVIEW',at:when()});});
  return {count:s.contentQueue.length,published:false};
}
export const UPGRADE_REGISTRY=[
  ['customer-hunter','ADAPTER_REQUIRES_DISCOVERY_FEED'],['decision-maker-finder','SOURCE_VALIDATION_ENABLED'],['website-crawler','LIVE_PUBLIC_WEBSITE_SCANNER'],['personalized-proposals','ACTIVE'],['demo-builder','ACTIVE_PRIVATE_SIMULATION'],
  ['branded-domain-email','DOMAIN_OWNERSHIP_DNS_ACTION_REQUIRED'],['gmail-bridge','RUNTIME_OAUTH_REQUIRED'],['sales-agent','REPLY_CLASSIFIER_APPROVAL_GATED'],['appointment-booking','CALENDAR_RUNTIME_OAUTH_REQUIRED'],
  ['conversion-sales-pages','EXISTING_PAYPAL_STORE'],['verified-paypal','EXISTING_LIVE_WEBHOOK'],['three-customer-gate','ACTIVE'],
  ['digital-product-factory','EXISTING_GENERATOR_QC_REQUIRED'],['fulfillment','EXISTING_DELIVERY_PLUS_QC_QUEUE'],['independent-qc','REQUIRES_DELIVERY_EVIDENCE'],
  ['recurring-subscriptions','EXISTING_PAYPAL_PLAN'],['upsells','RECOMMENDATION_ONLY'],['retention','CUSTOMER_EVENT_QUEUE'],['referrals','VERIFIED_CAPTURE_ONLY'],
  ['testimonials','PERMISSION_REQUIRED'],['checkout-recovery','CONSENT_BASED_QUEUE'],['seo','SITEMAPS_EXIST_CONTENT_REVIEW_REQUIRED'],['multichannel','PUBLISH_AUTH_REQUIRED'],['marketplace-optimizer','VERIFIED_MARGIN_ONLY'],
  ['ceo-orchestrator','EXISTING_V18_GOVERNOR'],['event-driven','PAYPAL_HOOK_ACTIVE'],['shared-business-memory','POSTGRES_STATE'],['self-healing','MONITORING_ADAPTER_REQUIRED'],['cost-optimizer','ACTUAL_EXPENSES_FIRST'],
  ['experimentation','EVIDENCE_GATED'],['profit-allocator','METRICS_AVAILABLE'],['owner-dashboard','ACTIVE'],['security-fraud','OWNER_AUTH_AND_VERIFIED_PAYMENTS'],
  ['routine-support','EXISTING_SUPPORT_AGENT'],['revenue-intelligence','VERIFIED_EVENTS_ONLY'],['reinvestment','OWNER_BUDGET_REQUIRED'],['lender-readiness','EXISTING_FINANCIAL_VAULT'],
  ['business-credit-compliance','DOCUMENTED_VENDOR_EVENTS_ONLY'],['white-label','LICENSING_CONTRACTS_REQUIRED'],['partner-distribution','PARTNER_APPROVAL_REQUIRED']
].map(([id,status])=>({id,status}));
export async function dashboard(){
  const s=await growthState(),o=Object.values(s.orders),sales=o.reduce((n,x)=>n+x.amountUsd,0);
  const costs=s.spend.reduce((n,x)=>n+x.amountUsd,0),fulfilled=o.filter(x=>x.status==='FULFILLED').length;
  const satisfied=new Set(o.filter(x=>x.satisfied&&x.independentCustomer).map(x=>x.customerId||x.orderId)).size;
  const pending=Object.values(s.outbox).filter(x=>x.status==='OWNER_APPROVAL_REQUIRED').length;
  return {version:s.version,mode:s.mode,target:s.dailyTarget,
    providers:{websiteCrawler:'ACTIVE',discovery:process.env.ULTRON_DISCOVERY_FEED_URL?'CONFIGURED_REQUIRES_VERIFICATION':'NOT_CONFIGURED',
      gmail:configuredEmail()&&process.env.ULTRON_UNSUBSCRIBE_SECRET?'RUNTIME_CONFIGURED':'RUNTIME_OAUTH_NOT_CONFIGURED',
      calendar:'NEEDS_RUNTIME_OAUTH',domain:process.env.ULTRON_BRANDED_DOMAIN||'NOT_CONFIGURED',
      paypal:'CHECK_SEPARATELY_USING_PAYMENT_STATUS'},
    metrics:{researched:Object.values(s.prospects).filter(x=>x.audit?.status==='SCANNED').length,
      candidateBusinesses:Object.keys(s.prospects).length,contactReady:Object.values(s.prospects).filter(x=>x.decisionMaker.email).length,
      pendingOwnerApprovals:pending,providerConfirmedEmails:Object.values(s.outbox).filter(x=>x.status==='SENT').length,
      replies:Object.keys(s.replies).length,verifiedPayPalOrders:o.length,verifiedRevenueUsd:money(sales),
      recordedExpensesUsd:money(costs),contributionAfterRecordedExpensesUsd:money(sales-costs),
      fulfilledOrders:fulfilled,independentSatisfiedCustomers:satisfied,
      scaleAllowed:satisfied>=s.policy.minSatisfiedIndependentCustomers&&sales>costs},
    recentErrors:s.errors.slice(-8),lastDiscoveryDate:s.lastDiscoveryDate,sourceStatus:s.sourceStatus,
    upgrades:UPGRADE_REGISTRY,disclaimers:['Unrecorded costs are excluded; revenue is not profit.','A candidate business is not a qualified customer or sale.','Google connector access in ChatGPT does not grant the deployed app OAuth credentials.']};
}
export async function dailyRun(){
  const today=when().slice(0,10),s=await growthState();if(s.lastDiscoveryDate===today)return {status:'ALREADY_RAN',date:today};
  if(!process.env.ULTRON_DISCOVERY_FEED_URL){await mutate(z=>{z.lastDiscoveryDate=today;z.sourceStatus='DISCOVERY_PROVIDER_NOT_CONFIGURED';});return {status:'PROVIDER_NOT_CONFIGURED',imported:0};}
  let businesses=[];
  try{
    const url=await safeWebsite(process.env.ULTRON_DISCOVERY_FEED_URL);
    const r=await fetch(url,{headers:{authorization:'Bearer '+(process.env.ULTRON_DISCOVERY_FEED_TOKEN||'')},signal:AbortSignal.timeout(12000),redirect:'error'});
    if(!r.ok)throw Error('discovery provider '+r.status);
    const body=await r.json();businesses=Array.isArray(body.businesses)?body.businesses.slice(0,50):[];
    const added=await importProspects(businesses,'EXTERNAL_DISCOVERY_FEED');
    await mutate(z=>{z.lastDiscoveryDate=today;z.sourceStatus='RECEIVED_'+businesses.length+'_CANDIDATES';});
    return {status:'IMPORTED',...added,target:s.dailyTarget};
  }catch(e){await mutate(z=>{z.errors.push({at:when(),kind:'DISCOVERY_FAILURE',message:clean(e.message)});z.errors=z.errors.slice(-100);z.sourceStatus='ERROR';});return {status:'ERROR',reason:clean(e.message)};}
}
export async function backgroundTick(){
  const discovered=await dailyRun();const s=await growthState(),candidates=Object.values(s.prospects)
    .filter(x=>x.stage==='DISCOVERED'&&x.website).sort((a,b)=>b.fit-a.fit).slice(0,5);
  let audited=0,prepared=0;
  for(const p of candidates){try{const x=await auditProspect(p.id);if(x.status==='SCANNED'){audited++;await prepareSales(p.id);prepared++;}}
    catch(e){await mutate(z=>{if(z.prospects[p.id])z.prospects[p.id].stage='REQUIRES_REVIEW';z.errors.push({kind:'AUDIT_FAILED',prospectId:p.id,message:clean(e.message),at:when()});z.errors=z.errors.slice(-100);});}}
  const email=await sendApproved(5);
  return {discovery:discovered,audited,prepared,email,mode:'OWNER_APPROVAL_AND_ZERO_SPEND_GUARDS'};
}
