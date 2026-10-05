import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';

const STATE_PATH=process.env.AGENT_STATE_PATH||'/data/agent-state.json';
const MAX_RUNS=200;
const TOPICS=[
 {slug:'missed-lead-response-system',title:'How to Build a Missed-Lead Response System',angle:'response speed, ownership and a clear next step'},
 {slug:'small-business-follow-up-checklist',title:'A Practical Follow-Up Checklist for Small Businesses',angle:'consistent follow-up without over-messaging prospects'},
 {slug:'booking-workflow-bottlenecks',title:'5 Booking Workflow Bottlenecks That Cost Time',angle:'intake, routing, confirmation, exceptions and measurement'},
 {slug:'lead-intake-questions',title:'What to Ask on a Lead Intake Form',angle:'collecting only the information needed to route an inquiry'},
 {slug:'sales-handoff-process',title:'A Simple Sales Handoff Process for Small Teams',angle:'making responsibility and next steps visible'},
 {slug:'appointment-confirmation-process',title:'How to Make Appointment Confirmations More Reliable',angle:'clear confirmation, reminders and exception handling'},
 {slug:'lead-response-metrics',title:'Lead Response Metrics Worth Tracking',angle:'first-response time, qualified inquiries, bookings and completed appointments'}
];

let saveQueue=Promise.resolve();
async function loadState(){
 try{return JSON.parse(await readFile(STATE_PATH,'utf8'))}
 catch{return {version:1,createdAt:new Date().toISOString(),runs:[],insights:[],campaignQueue:[],metrics:{cycles:0,insightsPublished:0,lastOrderCount:0,lastCompletedCount:0,lastRevenueUsd:0},agents:{}}}
}
async function saveState(state){
 saveQueue=saveQueue.then(async()=>{await mkdir(dirname(STATE_PATH),{recursive:true});await writeFile(STATE_PATH,JSON.stringify(state,null,2))});
 return saveQueue;
}
function money(v){const n=Number(v);return Number.isFinite(n)?n:0}
function snapshotLedger(ledger){
 const orders=Object.values(ledger?.orders||{});
 const completed=orders.filter(o=>String(o.status).toUpperCase()==='COMPLETED'||o.capturedAt);
 const revenue=completed.reduce((s,o)=>s+money(o.capturedAmount||o.amount),0);
 return {orders:orders.length,completed:completed.length,revenueUsd:Number(revenue.toFixed(2)),events:(ledger?.events||[]).length};
}
function chooseOffer(snap){
 if(snap.completed===0)return {product:'audit',reason:'Use the lowest-priced service as the primary entry offer until completed-order data exists.'};
 const avg=snap.revenueUsd/Math.max(1,snap.completed);
 if(avg>=1000)return {product:'full',reason:'Completed-order value supports emphasizing the higher-touch implementation offer.'};
 if(avg>=500)return {product:'lead',reason:'Completed-order value supports emphasizing the mid-tier implementation offer.'};
 return {product:'audit',reason:'Completed-order value currently favors the entry service.'};
}
function guardrail(text){
 const blocked=/guarantee(d)?\s+(revenue|sales|profit)|risk[- ]?free|instant money|100% guaranteed|spam|phish/i;
 return !blocked.test(text);
}
function article(topic,offer,baseUrl){
 const productNames={audit:'Workflow Audit',lead:'Lead System Setup',full:'Full Automation Setup'};
 const product=productNames[offer.product]||productNames.audit;
 const paragraphs=[
   `A reliable growth system starts with a process that a small team can actually follow. This guide focuses on ${topic.angle}.`,
   'Start by mapping where an inquiry arrives, who owns the first response, what information is required, and what counts as a confirmed next step. Measure the current process before automating it.',
   'Use one owner for each stage. If ownership is unclear, inquiries get duplicated, delayed or forgotten. Define an escalation path for missing information, unavailable appointment times and system outages.',
   'Automation should reduce repetitive work without pretending that every inquiry is qualified. Keep a visible human handoff for exceptions, pricing questions, refunds and unusual customer requests.',
   'Track a small set of metrics: inquiry volume, first-response time, qualified inquiries, confirmed bookings and completed appointments. Compare one change at a time so you can tell what improved the process.'
 ];
 const cta=`If your business needs a structured review, the ${product} is available at ${baseUrl}/#services.`;
 return {slug:topic.slug,title:topic.title,summary:`Practical guidance on ${topic.angle}.`,body:paragraphs,cta,product:offer.product};
}
function renderInsight(item){
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(item.title)+' | ULTRON Revenue Studio</title><meta name="description" content="'+esc(item.summary)+'"><style>body{margin:0;background:#090c10;color:#f6f8fb;font:17px/1.65 system-ui,sans-serif}.w{max-width:820px;margin:auto;padding:32px}a{color:#6ee77a}article{background:#141920;border:1px solid #29313b;border-radius:18px;padding:28px}h1{line-height:1.1}</style></head><body><main class="w"><p><a href="/">← ULTRON Revenue Studio</a></p><article><h1>'+esc(item.title)+'</h1><p>'+esc(item.summary)+'</p>'+item.body.map(p=>'<p>'+esc(p)+'</p>').join('')+'<p><b>'+esc(item.cta)+'</b></p><p><small>Published '+esc(item.publishedAt)+'. Educational content; no earnings guarantee.</small></p></article></main></body></html>';
}
export async function runAgentCycle({ledger,baseUrl}){
 const state=await loadState();
 const snap=snapshotLedger(ledger);
 const offer=chooseOffer(snap);
 const now=new Date();
 const day=now.toISOString().slice(0,10);
 const alreadyToday=state.insights.some(x=>String(x.publishedAt||'').startsWith(day));
 let published=null;
 if(!alreadyToday){
   const used=new Set(state.insights.map(x=>x.slug));
   const topic=TOPICS.find(t=>!used.has(t.slug))||TOPICS[state.metrics.cycles%TOPICS.length];
   const item={...article(topic,offer,baseUrl),publishedAt:now.toISOString(),publisher:'OwnedSitePublisherAgent'};
   if(guardrail(item.title+' '+item.summary+' '+item.cta)){state.insights.unshift(item);state.insights=state.insights.slice(0,100);state.metrics.insightsPublished=(state.metrics.insightsPublished||0)+1;published=item.slug}
 }
 const campaign={createdAt:now.toISOString(),status:'draft-owned-channel',channel:'owned-site',focusProduct:offer.product,headline:state.insights[0]?.title||'Improve your lead workflow',url:baseUrl+'/#services',note:'External social/email publishing is intentionally not performed without an authorized platform connection.'};
 state.campaignQueue.unshift(campaign);state.campaignQueue=state.campaignQueue.slice(0,50);
 state.metrics={...state.metrics,cycles:(state.metrics.cycles||0)+1,lastOrderCount:snap.orders,lastCompletedCount:snap.completed,lastRevenueUsd:snap.revenueUsd,lastCycleAt:now.toISOString()};
 state.agents={
   CommanderAgent:{status:'running',lastAction:'Coordinated cycle and selected offer '+offer.product},
   OpportunityAgent:{status:'running',lastAction:offer.reason},
   ContentAgent:{status:'running',lastAction:published?'Published '+published:'Daily owned-site publishing limit already satisfied'},
   ConversionAgent:{status:'running',lastAction:'Primary offer set to '+offer.product},
   PaymentAgent:{status:'running',lastAction:`Observed ${snap.completed} completed orders totaling $${snap.revenueUsd.toFixed(2)}`},
   AnalyticsAgent:{status:'running',lastAction:`Observed ${snap.orders} orders and ${snap.events} verified payment events`},
   GuardrailAgent:{status:'running',lastAction:'Checked generated owned-site copy for prohibited earnings claims and unsafe outreach patterns'}
 };
 state.runs.unshift({at:now.toISOString(),snapshot:snap,offer,published});state.runs=state.runs.slice(0,MAX_RUNS);
 await saveState(state);return state;
}
export async function agentState(){return loadState()}
export async function insightBySlug(slug){const s=await loadState();return s.insights.find(x=>x.slug===slug)||null}
export async function renderInsightsIndex(){
 const s=await loadState();const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const items=s.insights.map(x=>'<li><a href="/insights/'+encodeURIComponent(x.slug)+'">'+esc(x.title)+'</a><br><small>'+esc(x.summary)+'</small></li>').join('');
 return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Insights | ULTRON Revenue Studio</title><style>body{margin:0;background:#090c10;color:#f6f8fb;font:17px/1.6 system-ui,sans-serif}.w{max-width:850px;margin:auto;padding:32px}a{color:#6ee77a}li{margin:18px 0}</style></head><body><main class="w"><p><a href="/">← Home</a></p><h1>Lead & growth insights</h1><p>Automatically maintained educational content from the ULTRON agent runtime.</p><ul>'+items+'</ul></main></body></html>';
}
export {renderInsight};
