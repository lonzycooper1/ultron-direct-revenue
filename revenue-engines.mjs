import {createHash} from 'node:crypto';

const CHANNELS=Object.freeze({
 digitalProduct:'marketplace-queue',
 leadGen:'authorized-outreach-queue',
 affiliate:'approved-affiliate-content-queue',
 microSaas:'owned-api',
 dataResearch:'owned-reporting',
 marketResearch:'simulation-only'
});

const safe=(v,max=500)=>String(v??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max);
const slug=safe=>String(safe).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,80);
const now=()=>new Date().toISOString();
const id=(prefix,payload)=>prefix+'-'+createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0,12);

export function buildDigitalProductAgent({theme='small-business automation',baseUrl=''}={}){
 const title=`Automation Quickstart: ${safe(theme,80)}`;
 const payload={theme:safe(theme,120),title,createdAt:now()};
 return {agent:'DigitalProductBot',channel:CHANNELS.digitalProduct,status:'ready',artifact:{
  id:id('dp',payload),type:'digital-guide',title,priceExperimentUsd:[9,19,29],delivery:'automatic-after-verified-payment',
  outline:['Problem checklist','Setup worksheet','Implementation steps','QA checklist','Metrics tracker'],
  landingUrl:baseUrl?baseUrl+'/bot-products/'+slug(title):null
 },capabilities:['research-brief-generation','original-digital-product-drafting','pricing-experiments','delivery-manifest','listing-copy'],constraint:'Marketplace publication requires an authorized marketplace connection.'};
}

export function buildLeadGenAgent({vertical='local service businesses',baseUrl=''}={}){
 const payload={vertical:safe(vertical,100),createdAt:now()};
 return {agent:'LeadGenBot',channel:CHANNELS.leadGen,status:'ready',campaign:{
  id:id('lead',payload),vertical:safe(vertical,100),qualification:['public business presence','clear service offer','contact channel published by business','relevant automation pain point'],
  outreachTemplate:'I noticed your business handles customer inquiries online. I built a workflow audit that identifies missed follow-up and booking bottlenecks. If useful, I can send the details.',
  destination:baseUrl?baseUrl+'/#services':null
 },capabilities:['lead-qualification-schema','personalization-briefs','outreach-drafts','follow-up-queue','conversion-attribution'],constraint:'No unsolicited bulk sending. Delivery requires an authorized messaging/email connection and applicable consent/compliance.'};
}

export function buildAffiliateAgent({topic='business software',approvedPrograms=[]}={}){
 const programs=(approvedPrograms||[]).filter(x=>x&&x.name&&x.url).slice(0,20).map(x=>({name:safe(x.name,80),url:safe(x.url,300)}));
 return {agent:'AffiliateContentBot',channel:CHANNELS.affiliate,status:programs.length?'ready':'waiting-for-approved-program',topic:safe(topic,100),
  contentPlan:['comparison article','how-to tutorial','use-case guide','FAQ','short-form script'],
  approvedPrograms:programs,
  capabilities:['content-briefs','comparison-frameworks','disclosure-insertion','link-attribution','performance-feedback'],
  constraint:'Only approved affiliate programs and truthful disclosures may be used; no fabricated affiliate links.'};
}

export function buildMicroSaasAgent({baseUrl=''}={}){
 const tools=[
  {slug:'roi-estimator',name:'Automation ROI Estimator',input:['monthlyLeads','closeRate','averageSale','hoursSaved'],output:'estimated-value-range'},
  {slug:'followup-audit',name:'Follow-up Workflow Audit',input:['leadSources','responseMinutes','followups','bookingRate'],output:'workflow-score-and-actions'},
  {slug:'offer-pricer',name:'Service Offer Pricing Helper',input:['deliveryHours','softwareCost','targetMargin'],output:'price-floor-and-scenarios'}
 ];
 return {agent:'MicroSaaSBot',channel:CHANNELS.microSaas,status:'ready',tools:tools.map(t=>({...t,url:baseUrl?baseUrl+'/api/tools/'+t.slug:null})),capabilities:['instant-calculation','usage-tracking-ready','paywall-ready','API-delivery'],constraint:'Paid access requires a verified payment/subscription gate before premium results.'};
}

export function buildDataResearchAgent({baseUrl=''}={}){
 return {agent:'DataResearchBot',channel:CHANNELS.dataResearch,status:'ready',reports:[
  {slug:'revenue-pipeline',name:'Revenue Pipeline Report',source:'verified internal order/payment ledger'},
  {slug:'content-performance',name:'Content Performance Report',source:'ULTRON owned-site activity'},
  {slug:'opportunity-scorecard',name:'Opportunity Scorecard',source:'ULTRON agent scoring state'}
 ].map(r=>({...r,url:baseUrl?baseUrl+'/api/reports/'+r.slug:null})),capabilities:['aggregation','trend-detection','report-generation','alert-ready','feedback-loop'],constraint:'External datasets must come from lawful, authorized sources.'};
}

export function buildMarketResearchAgent(){
 return {agent:'MarketResearchBot',channel:CHANNELS.marketResearch,status:'ready',mode:'SIMULATION_ONLY',
  capabilities:['signal-research','scenario-analysis','paper-trade-evaluation','risk-scoring','performance-journaling'],
  constraint:'No live-money execution. Market activity remains research/backtest/paper-only.'};
}

export function buildRevenueBotSuite({baseUrl='',theme,vertical,affiliatePrograms=[]}={}){
 const bots=[
  buildDigitalProductAgent({theme,baseUrl}),
  buildLeadGenAgent({vertical,baseUrl}),
  buildAffiliateAgent({approvedPrograms:affiliatePrograms}),
  buildMicroSaasAgent({baseUrl}),
  buildDataResearchAgent({baseUrl}),
  buildMarketResearchAgent()
 ];
 return {version:1,createdAt:now(),bots,summary:{total:bots.length,ready:bots.filter(b=>b.status==='ready').length,waiting:bots.filter(b=>b.status!=='ready').length},principle:'Bots convert research, software and distribution into legitimate value; revenue is never guaranteed.'};
}

export function runMicroTool(name,input={}){
 const n=k=>Number(input[k]||0);
 if(name==='roi-estimator'){
  const leads=Math.max(0,n('monthlyLeads')),close=Math.max(0,Math.min(100,n('closeRate')))/100,sale=Math.max(0,n('averageSale')),hours=Math.max(0,n('hoursSaved'));
  return {tool:name,monthlySalesValue:Number((leads*close*sale).toFixed(2)),hoursSaved:hours,notice:'Illustrative estimate, not guaranteed revenue.'};
 }
 if(name==='followup-audit'){
  const response=Math.max(0,n('responseMinutes')),followups=Math.max(0,n('followups')),booking=Math.max(0,Math.min(100,n('bookingRate')));
  let score=100-Math.min(40,response/3)-Math.max(0,20-Math.min(20,followups*7))-Math.max(0,25-booking/4);
  score=Math.max(0,Math.min(100,Math.round(score)));
  return {tool:name,score,actions:[response>30?'Reduce first-response time':'Maintain response speed',followups<2?'Add a structured follow-up sequence':'Keep follow-up ownership clear',booking<20?'Review qualification and booking friction':'Measure booked-to-completed rate']};
 }
 if(name==='offer-pricer'){
  const hours=Math.max(0,n('deliveryHours')),cost=Math.max(0,n('softwareCost')),margin=Math.max(1,Math.min(95,n('targetMargin')||40))/100;
  const labor=Math.max(0,n('hourlyRate')||50)*hours;const floor=cost+labor;const price=floor/(1-margin);
  return {tool:name,costFloor:Number(floor.toFixed(2)),suggestedPrice:Number(price.toFixed(2)),notice:'Pricing scenario only; validate demand and local requirements.'};
 }
 throw Error('Unknown tool');
}
