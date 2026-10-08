import {getJson,mutateJson} from './state-store.mjs';
import {crawlWebsite,safeWebsite} from './ultron-growth-runtime-v19.mjs';
import {overview as salesOverview} from './ultron-sales-v22.mjs';
import {readiness} from './ultron-integration-v21.mjs';
import {cycle as supervisorCycle} from './ultron-operator-v23.mjs';

export const V24='24.0.0';
export const ROLES=[
 {id:'ceo',job:'Prioritize paid deliveries and interested buyers'},
 {id:'research',job:'Source and inspect public websites'},
 {id:'sales',job:'Draft evidence-backed offers for owner review'},
 {id:'fulfillment',job:'Quality-check real paid orders'},
 {id:'capital',job:'Assess eligibility and document readiness'},
 {id:'market',job:'Validate sourced quotes, never place orders'},
 {id:'operations',job:'Repair only low-risk reversible processes'}
];
const KEY='ultron-v24-video';
const stamp=()=>new Date().toISOString();
const fresh=()=>({scans:[],browser:[],copy:[],grants:[],markets:[],cycles:[]});
const clip=(x,n=500)=>String(x??'').trim().slice(0,n);
async function keep(bucket,item){
 await mutateJson(KEY,fresh(),state=>{state[bucket].push(item);state[bucket]=state[bucket].slice(-100)});
}
export const GRANTS=[{id:'verizon-2026',name:'Verizon Small Business Digital Ready',amountUsd:10000,
 officialUrl:'https://pilot-digitalready.verizonwireless.com/funding',checkedDate:'2026-10-08',
 criteria:'For-profit business in US/PR/USVI, applicant 18+, and two qualifying 2026 courses/events.',
 note:'Preliminary rules only; current terms, selection, and applicant evidence must be checked before owner applies.'}];
export function grantCheck(input={}){
 const missing=[];
 if(!['US','USA','PR','USVI','PUERTO RICO'].includes(clip(input.region,50).toUpperCase()))missing.push('Document eligible business region');
 if(!Number.isFinite(Number(input.age))||Number(input.age)<18)missing.push('Confirm applicant age >= 18');
 if(input.forProfit!==true)missing.push('Verify for-profit entity status');
 if(!Number.isFinite(Number(input.completedCourses))||Number(input.completedCourses)<2)missing.push('Complete two qualifying 2026 courses or events');
 return {grantId:GRANTS[0].id,status:missing.length?'MISSING_PRELIMINARY_EVIDENCE':'PRELIMINARY_MATCH_NOT_VERIFIED',
 missing,verifiedEligible:false,applied:false,awarded:false,awardUsd:0,source:GRANTS[0].officialUrl};
}
const OFFERS={audit:{label:'AI Revenue Leak Audit',usd:500},automation:{label:'Automation Sprint',usd:2500},
 operations:{label:'Revenue Operations',usd:7500},businessos:{label:'Business OS',usd:10000}};
export function evidenceCopy({company,website,observations=[],offer='audit'}={}){
 if(!clip(company)||!clip(website)||!Array.isArray(observations)||!observations.length)throw Error('Real company, site, and observations required');
 const u=new URL(website);
 if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443')throw Error('public HTTPS URL required');
 const observationsClean=observations.map(x=>clip(x,200)).filter(Boolean).slice(0,4),product=OFFERS[offer];
 if(!observationsClean.length||!product)throw Error('Known offer and evidence required');
 const message='Hello, I reviewed the public website of '+clip(company,90)+'. I observed: '+observationsClean.join('; ')+'. These are public-page observations, not proven lost revenue. ULTRON offers a $'+product.usd+' '+product.label+' to investigate and outline improvements. Would a scope overview be useful?';
 return {status:'DRAFT_NOT_SENT',company:clip(company,90),website:clip(website,400),observations:observationsClean,
 offer:product,message,automaticSend:false,predictedResults:null,customerResultsClaimed:false};
}
export function marketQuote(x={}){
 const symbol=clip(x.symbol,30).toUpperCase(),price=Number(x.price),provider=clip(x.provider,80),ts=Date.parse(x.asOf);
 if(!/^[A-Z0-9:/_.-]{1,30}$/.test(symbol)||!Number.isFinite(price)||price<=0||!provider||!Number.isFinite(ts))throw Error('Source, symbol, positive price, timestamp required');
 const age=Date.now()-ts;if(age< -60000)throw Error('future timestamp rejected');
 return {symbol,price,currency:clip(x.currency||'USD',10),provider,asOf:new Date(ts).toISOString(),
  ageSeconds:Math.round(age/1000),status:age>900000?'STALE':'RECENT_SOURCE_NOT_EXCHANGE_VERIFIED',
  action:'RESEARCH_ONLY',liveOrderAllowed:false,profitGuaranteed:false};
}
export function priority({paid=0,interested=0,blocked=0}={}){
 return paid>0?'DELIVER_TO_PAYING_CUSTOMER':interested>0?'RESPOND_TO_INTERESTED_BUYER':blocked>0?'REPAIR_REVENUE_PIPELINE':'FIND_REAL_BUYERS';
}
export function integrationStates(env=process.env){
 const i=readiness(env);
 return {
  website:{state:'ACTIVE_READ_ONLY_ROBOTS_AWARE'},
  browser:{state:env.ULTRON_BROWSER_API_URL&&env.ULTRON_BROWSER_API_TOKEN&&env.ULTRON_BROWSER_ALLOWLIST?'CONFIGURED_UNVERIFIED':'NOT_CONNECTED'},
  coolify:{state:'COMPOSE_PREPARED_NOT_DEPLOYED'},
  assistants:{state:'SEVEN_BOUNDED_ROLES_SOFTWARE'},
  sales:{state:'DRAFTS_ONLY',email:i.gmail.status},
  grants:{state:'ELIGIBILITY_CHECKER_READY_NOT_APPLIED'},
  markets:{state:env.ULTRON_MARKET_DATA_URL?'CONFIGURED_UNVERIFIED':'NOT_CONNECTED',realTrades:false}
 };
}
export async function inspect({website}={}){
 const report=await crawlWebsite(website);
 await keep('scans',{at:stamp(),url:report.url,status:report.status,findings:report.findings||[]});
 return {report,truth:'PUBLIC_WEBSITE_OBSERVATIONS_ONLY'};
}
export async function browserRead({website}={},env=process.env){
 if(!website)throw Error('website required');
 const host=new URL(website).hostname.toLowerCase();
 const allow=clip(env.ULTRON_BROWSER_ALLOWLIST,2000).split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 if(!allow.includes(host))throw Error('Exact target hostname must be explicitly allowlisted');
 const target=await safeWebsite(website);
 if(!env.ULTRON_BROWSER_API_URL||!env.ULTRON_BROWSER_API_TOKEN)throw Error('Read-only browser provider not connected');
 const endpoint=await safeWebsite(env.ULTRON_BROWSER_API_URL);
 const response=await fetch(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),
  headers:{authorization:'Bearer '+env.ULTRON_BROWSER_API_TOKEN,'content-type':'application/json'},
  body:JSON.stringify({action:'extract',url:target,allowClicks:false,allowLogin:false,allowForms:false})});
 if(!response.ok)throw Error('Browser provider HTTP '+response.status);
 const raw=await response.text();if(raw.length>60000)throw Error('Response limit exceeded');
 let output;try{output=JSON.parse(raw)}catch{throw Error('Provider must return JSON')}
 await keep('browser',{at:stamp(),url:target,state:'PROVIDER_RESPONSE_NEEDS_REVIEW'});
 return {status:'PROVIDER_RESPONSE_NEEDS_REVIEW',target,output,allowed:'read-only extract'};
}
export async function marketResearch(env=process.env){
 if(!env.ULTRON_MARKET_DATA_URL)throw Error('Owner-authorized quote feed required');
 const url=await safeWebsite(env.ULTRON_MARKET_DATA_URL);
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(12000),
  headers:{accept:'application/json',...(env.ULTRON_MARKET_DATA_TOKEN?{authorization:'Bearer '+env.ULTRON_MARKET_DATA_TOKEN}:{})}});
 if(!response.ok)throw Error('Market HTTP '+response.status);
 const raw=await response.text();if(raw.length>120000)throw Error('Quote payload too large');
 let data;try{data=JSON.parse(raw)}catch{throw Error('JSON quotes required')}
 if(!Array.isArray(data.quotes))throw Error('Expected quotes array');
 const quotes=data.quotes.slice(0,75).map(marketQuote);
 await keep('markets',{at:stamp(),source:url,quotes:quotes.length,stale:quotes.filter(x=>x.status==='STALE').length});
 return {quotes,source:url,asOf:stamp(),tradesPlaced:0};
}
export async function writeCopy(input){
 const draft=evidenceCopy(input);
 await keep('copy',{at:stamp(),company:draft.company,offer:draft.offer.label,state:draft.status});
 return draft;
}
export async function reviewGrant(input){
 const reviewed=grantCheck(input);
 await keep('grants',{at:stamp(),grantId:reviewed.grantId,status:reviewed.status,ownerEvidenceNotVerified:true});
 return reviewed;
}
export async function pulse(){
 const s=await salesOverview();
 const blocker=Object.values(integrationStates()).filter(x=>x.state==='NOT_CONNECTED'||x.state?.includes('NOT_DEPLOYED')).length;
 const work=priority({paid:s.metrics.outstandingDelivery,interested:s.metrics.interestedBuyers,blocked:blocker});
 const supervisor=await supervisorCycle();
 const result={at:stamp(),priority:work,supervisor:supervisor.status,emailsSent:0,tradesPlaced:0,applicationsSent:0,spentUsd:0};
 await keep('cycles',result);return result;
}
export async function status(){
 const [history,sales]=await Promise.all([getJson(KEY,fresh()),salesOverview()]);
 return {version:V24,generatedAt:stamp(),roles:ROLES,integrations:integrationStates(),grants:GRANTS,
 sales:{verifiedOrders:sales.metrics.verifiedPaidOrders,outstandingDelivery:sales.metrics.outstandingDelivery},
 activity:Object.fromEntries(Object.entries(history).map(([k,v])=>[k,v.length])),lastCycle:history.cycles.at(-1)||null,
 caveat:'Code modules do not prove external browser, provider, Coolify, bank, customer or grant activation'};
}
