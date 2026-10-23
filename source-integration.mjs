import {createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';

export const sources={optimism:'https://www.instagram.com/p/DehA61ckoJh/',sectors:'https://www.instagram.com/p/DexM5YOjNaG/',classification:'https://www.msci.com/indexes/index-resources/gics'};
const rows=[
 ['45','Information Technology','Software, hardware, semiconductors','Innovation and capital investment','Valuation and obsolescence'],
 ['35','Health Care','Care providers, equipment, pharmaceuticals, biotechnology','Demand for care and research','Clinical, reimbursement and regulatory risk'],
 ['40','Financials','Banks, insurance, capital markets, financial services','Credit, fees and interest margins','Credit losses and liquidity'],
 ['25','Consumer Discretionary','Autos, leisure, restaurants, discretionary retail','Household income and spending','Cyclical demand and competition'],
 ['30','Consumer Staples','Food, beverages, household products, essential retail','Recurring household consumption','Input costs and margin pressure'],
 ['10','Energy','Oil, gas, fuels, equipment and services','Commodity supply and demand','Commodity prices and geopolitics'],
 ['20','Industrials','Capital goods, professional services, transportation','Investment and business activity','Order cycles and execution'],
 ['15','Materials','Chemicals, metals, paper, packaging','Industrial and construction demand','Commodity and input prices'],
 ['55','Utilities','Electric, gas, water, renewable power generation','Essential services and regulated returns','Rates, regulation and capital costs'],
 ['60','Real Estate','Property operations, services, equity REITs','Occupancy, rents and credit','Refinancing and vacancy'],
 ['50','Communication Services','Telecom, media, entertainment, content platforms','Subscriptions, advertising and audience','Competition and content costs']
];
export const sectors=rows.map(([id,name,industries,drivers,risks],i)=>({id,name,industries,drivers,risks,sourceSlide:i+3,classificationSource:sources.classification,commentary:'Drivers and risks are ULTRON research context, not forecasts.'}));
export const sourceMap=[
 ...['Introduction to six thinking practices','Unreasonable optimism','Pattern recognition','Quiet discernment','Deep curiosity','Strategic detachment','Metacognition','Follow-page invitation'].map((title,i)=>({id:'A'+(i+1),slide:i+1,title,source:sources.optimism,disposition:i===0||i===7?'Context only; no separate feature': 'Experiment planning, evidence, review and stop conditions'})),
 ...['Sector introduction','Eleven-sector pie chart',...sectors.map(s=>s.name),'Bitcoin bonus','Sector research reminder'].map((title,i)=>({id:'B'+(i+1),slide:i+1,title,source:sources.sectors,disposition:i===1?'Undated weights excluded':i===13?'Separate crypto topic; not a GICS sector':i===14?'Research notes and watchlist':i===0?'Unsupported loss claim excluded':'Sector directory and comparison'}))
];
export const sourceReview={coverage:{A:'8/8 original carousel slides visually inspected',B:'15/15 original carousel slides visually inspected',recordings:'Recording visual timelines reviewed; see /api/source-workflows/coverage for full ledger, silent second recording and unresolved first-recording audio'},corrections:['Undated pie weights are not current market allocations.','Company lists are unranked source claims, not verified top-ten rankings.','Meta is duplicated across source categories; do not infer company classifications from these lists.','Renewable electricity generation belongs in Utilities under the referenced GICS definition; renewable technology manufacturers may belong elsewhere.','Bitcoin is a cryptoasset, not a twelfth GICS equity sector.','Metacognition is used as decision review, not a claim of AI consciousness.'],marketData:{status:'UNAVAILABLE',provider:null,asOf:null,reason:'No licensed live sector feed configured by this integration.'},sources,items:sourceMap};
const blank=()=>({experiments:{},watchlist:{},notes:{}});
const text=(v,n,max=2000)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw Error('Invalid '+n);return v.trim()};
const key=v=>{if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(v)||['constructor','prototype','__proto__'].includes(v))throw Error('Invalid ID');return v};
const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function createSourceIntegration({read=()=>getJson('source-integration',blank()),mutate=fn=>mutateJson('source-integration',blank(),fn),clock=Date.now}={}){
 async function saveExperiment(b){
  const id=key(b.id),deadline=Date.parse(b.deadline);
  if(!Number.isFinite(deadline)||deadline<=clock())throw Error('Invalid future deadline');
  if(typeof b.budgetUsd!=='number'||!Number.isFinite(b.budgetUsd)||b.budgetUsd<0||b.budgetUsd>100000)throw Error('Invalid budget');
  const x={id,title:text(b.title,'title',180),hypothesis:text(b.hypothesis,'hypothesis'),customerBenefit:text(b.customerBenefit,'customer benefit'),firstAction:text(b.firstAction,'first action'),metric:text(b.metric,'metric'),baseline:text(b.baseline,'baseline'),success:text(b.success,'success criterion'),stopCondition:text(b.stopCondition,'stop condition'),observations:text(b.observations,'observations'),deadline:new Date(deadline).toISOString(),budgetUsd:b.budgetUsd,links:{}};
  for(const type of ['offer','task','delivery','revenue'])if(b.links?.[type])x.links[type]=text(b.links[type],type+' reference',180);
  x.linksStatus='OWNER_SUPPLIED_REFERENCES_NOT_VERIFIED';
  let result;await mutate(s=>{const old=s.experiments[id],hash=digest(x);if(old?.digest===hash){result=old;return}if(old&&b.expectedVersion!==old.version)throw Error('Conflict: reload experiment');if(!old&&b.expectedVersion!==undefined)throw Error('Experiment not found');if(!old&&Object.keys(s.experiments).length>=500)throw Error('Experiment limit');result={...x,digest:hash,version:(old?.version||0)+1,status:'DRAFT',spendAuthorized:false,externalActionsAuthorized:false,review:old?.review||null,reviews:old?.reviews||[],updatedAt:new Date(clock()).toISOString()};s.experiments[id]=result;});return result;
 }
 async function reviewExperiment(b){
  const id=key(b.id),decision=text(b.decision,'decision',20);if(!['CONTINUE','STOP','REVISE'].includes(decision))throw Error('Invalid decision');
  const review={decision,result:text(b.result,'result'),evidence:text(b.evidence,'evidence'),counterEvidence:text(b.counterEvidence,'counter evidence'),nextAction:text(b.nextAction,'next action'),evidenceType:'OWNER_REPORTED',at:new Date(clock()).toISOString()};
  let result;await mutate(s=>{const x=s.experiments[id];if(!x)throw Error('Experiment not found');if(b.expectedVersion!==x.version)throw Error('Conflict: reload experiment');if(decision==='CONTINUE'&&Date.parse(x.deadline)<=clock())throw Error('Invalid expired experiment: revise deadline before continuing');x.reviews??=[];x.reviews.push(review);x.review=review;x.status=decision==='STOP'?'STOPPED':decision==='REVISE'?'REVISION_REQUIRED':'REVIEWED';x.version++;x.updatedAt=review.at;result=x;});return result;
 }
 async function saveResearch(b){
  const id=key(b.id),sectorId=b.sectorId===null?null:text(b.sectorId,'sector',2);if(sectorId!==null&&!sectors.some(s=>s.id===sectorId))throw Error('Invalid sector');
  const assetType=b.assetType;if(!['EQUITY','CRYPTO'].includes(assetType)||assetType==='CRYPTO'&&sectorId!==null||assetType==='EQUITY'&&sectorId===null)throw Error('Invalid asset classification');
  const observed=Date.parse(b.observedAt);if(!Number.isFinite(observed)||observed>clock())throw Error('Invalid observation time');
  const x={id,symbol:text(b.symbol,'symbol',24).toUpperCase(),company:text(b.company,'company',180),sectorId,assetType,source:text(b.source,'source',1000),observedAt:new Date(observed).toISOString(),note:text(b.note,'note',4000),evidenceType:'OWNER_REPORTED',classificationVerified:false};
  let result;await mutate(s=>{const old=s.watchlist[id],hash=digest(x);if(old?.digest===hash){result=old;return}if(old&&b.expectedVersion!==old.version)throw Error('Conflict: reload research');if(!old&&b.expectedVersion!==undefined)throw Error('Research not found');if(!old&&Object.keys(s.watchlist).length>=500)throw Error('Watchlist limit');result={...x,digest:hash,version:(old?.version||0)+1};s.watchlist[id]=result;});return result;
 }
 async function snapshot(){const s=await read();return {...s,watchlist:Object.fromEntries(Object.entries(s.watchlist).map(([id,x])=>[id,{...x,stale:clock()-Date.parse(x.observedAt)>30*86400000}])),marketData:sourceReview.marketData}}
 return {saveExperiment,reviewExperiment,saveResearch,snapshot};
}
export const sourceIntegration=createSourceIntegration();
