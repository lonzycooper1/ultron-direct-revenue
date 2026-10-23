import {createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
const fail=m=>{throw Error('Invalid '+m)};
const str=(v,n,max=4000)=>typeof v==='string'&&v.trim()&&v.length<=max?v.trim():fail(n);
const num=(v,n,min=0,max=1e12)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max?v:fail(n);
const id=v=>typeof v==='string'&&/^[-a-zA-Z0-9_]{1,80}$/.test(v||'')&&!['__proto__','constructor','prototype'].includes(v)?v:fail('record ID');
const date=(v,n)=>{const t=Date.parse(v);return Number.isFinite(t)?t:fail(n)};
const list=(v,n,min=1,max=100)=>Array.isArray(v)&&v.length>=min&&v.length<=max&&v.every(x=>x&&typeof x==='object'&&!Array.isArray(x))?v:fail(n);
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fresh=()=>({sessions:{},assessments:{},packages:{},research:{}});
export const tutorGuidance={focused:'Practice the smallest useful task first. Use the allotted minutes and check the supplied answer.',mistake:'Attempt the realistic scenario first. After an error, use the hint to locate the mistake and retry.',analogy:'Explain the core idea in everyday terms before answering the diagnostic question. The stored explanation supplies an analogy when authored.', 'personal-path':'Work through the sourced exercises in order; the plan divides available time across them.',gap:'Answer diagnostic questions one at a time; missed answers identify practice gaps, not a general intelligence score.', 'teach-back':'Explain the concept in your own words, then answer its concrete check. Exact-match grading cannot assess the quality of the free-form explanation.'};
const modes=Object.keys(tutorGuidance);
export const evidenceCurriculum=[
 {prompt:'Does a configured PayPal credential prove that a customer paid? Answer yes or no.',reference:'ULTRON mission: provider configuration and verified captures are distinct',answer:'no',hint:'Configuration is readiness evidence, not a capture receipt.',explanation:'Verify an independent customer payment against the actual provider capture record.'},
 {prompt:'If the provider fee is missing, is contribution profit known or unknown?',reference:'ULTRON cost evidence policy: missing fees remain unknown',answer:'unknown',hint:'A blank fee must not silently become zero.',explanation:'Keep contribution profit unknown until all material costs are evidenced.'},
 {prompt:'Does a planning budget authorize spending? Answer yes or no.',reference:'ULTRON source-lab experiment authorization rules',answer:'no',hint:'A budget describes a plan; a consequential action still needs authority.',explanation:'A bounded experiment records assumptions and limits without granting new action permissions.'}
];

const mean=x=>x.reduce((a,b)=>a+b,0)/x.length;
const variance=x=>x.length>1?x.reduce((s,v)=>s+(v-mean(x))**2,0)/(x.length-1):0;
function bars(rows){let prior=-Infinity;return list(rows,'price history',4,2000).map(r=>{const at=date(r.at,'bar time');if(at<=prior)fail('strictly ordered unique bars');prior=at;return {at,close:num(r.close,'positive close',Number.MIN_VALUE)}})}
function returns(rows){return rows.slice(1).map((r,i)=>r.close/rows[i].close-1)}
export function marketResearch(b,now=Date.now()){
 const series=list(b.series,'series',1,30).map(s=>({symbol:str(s.symbol,'symbol',24),source:str(s.source,'source',1000),sectorId:s.assetType==='CRYPTO'?null:str(s.sectorId,'sector',2),assetType:s.assetType,weight:num(s.weight,'portfolio weight',0,1),bars:bars(s.bars)}));
 const sectorIds=['45','35','40','25','30','10','20','15','55','60','50'];
 if(series.some(s=>!['EQUITY','CRYPTO'].includes(s.assetType)||s.assetType==='EQUITY'&&!sectorIds.includes(s.sectorId)))fail('classification');
 if(new Set(series.map(s=>s.symbol)).size!==series.length||series.reduce((a,s)=>a+s.weight,0)>1+1e-9)fail('symbols or weights');
 const reference=series[0].bars.map(r=>r.at);if(series.some(s=>s.bars.length!==reference.length||s.bars.some((r,i)=>r.at!==reference[i]))||reference.at(-1)>now)fail('aligned historical timestamps');
 const annualPeriods=num(b.annualPeriods,'annual periods',1,366),freshnessHours=num(b.freshnessHours,'freshness hours',1,8760);
 const result=series.map(s=>({...s,bars:undefined,periodStart:new Date(reference[0]).toISOString(),asOf:new Date(reference.at(-1)).toISOString(),totalReturn:s.bars.at(-1).close/s.bars[0].close-1,annualizedVolatility:Math.sqrt(variance(returns(s.bars))*annualPeriods),stale:now-reference.at(-1)>freshnessHours*3600000,classificationVerified:false}));
 const correlations=series.flatMap((s,i)=>series.slice(i+1).map(t=>{const a=returns(s.bars),c=returns(t.bars),den=Math.sqrt(variance(a)*variance(c));return {a:s.symbol,b:t.symbol,value:den?a.reduce((sum,v,j)=>sum+(v-mean(a))*(c[j]-mean(c)),0)/(a.length-1)/den:null}}));
 const exposure={};for(const s of series){const key=s.assetType==='CRYPTO'?'CRYPTO':s.sectorId;exposure[key]=(exposure[key]||0)+s.weight}
 return {type:'HISTORICAL_OWNER_SUPPLIED_RESEARCH',series:result,correlations,exposure,cashWeight:Math.max(0,1-series.reduce((a,s)=>a+s.weight,0)),signal:result.some(s=>s.stale)?'ABSTAIN_STALE_DATA':'RESEARCH_ONLY',liveProviderVerified:false};
}
export function riskPreview(b,now=Date.now()){
 const p=b.proposal||{},s=b.state||{},l=b.limits||{},reasons=[];
 const reject=x=>reasons.push(x);
 if(!['BUY','SELL','HOLD'].includes(p.action)||!/^[-A-Z0-9_/]{1,30}$/.test(p.instrument||''))reject('MALFORMED_PROPOSAL');
 for(const k of ['horizon','rationale'])if(typeof p[k]!=='string'||!p[k].trim()||p[k].length>2000)reject('MISSING_'+k.toUpperCase());
 if(typeof p.confidence!=='number'||!Number.isFinite(p.confidence)||p.confidence<0||p.confidence>1)reject('INVALID_CONFIDENCE');
 if(!Number.isFinite(Date.parse(p.expiresAt))||Date.parse(p.expiresAt)<=now)reject('EXPIRED_DECISION');
 if(typeof p.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(p.id))reject('MISSING_PROPOSAL_ID');
 if(!Array.isArray(b.seenIds)||b.seenIds.length>10000)reject('MISSING_DUPLICATE_EVIDENCE');else if(b.seenIds.includes(p.id))reject('DUPLICATE_PROPOSAL');
 const numeric=(o,k)=>typeof o[k]==='number'&&Number.isFinite(o[k])&&o[k]>=0;
 if(!['notionalUsd','slippageBps'].every(k=>numeric(p,k))||!['exposureUsd','liquidityUsd','spreadBps','dailyLossUsd'].every(k=>numeric(s,k))||!['maxOrderUsd','maxExposureUsd','maxSpreadBps','maxSlippageBps','maxDailyLossUsd','maxAgeMs','minLiquidityUsd'].every(k=>numeric(l,k)))reject('RISK_DATA_UNAVAILABLE');
 else{
  if(p.notionalUsd>l.maxOrderUsd)reject('ORDER_LIMIT');
  if(s.exposureUsd+p.notionalUsd>l.maxExposureUsd)reject('EXPOSURE_LIMIT');
  if(s.liquidityUsd<Math.max(l.minLiquidityUsd,p.notionalUsd))reject('INSUFFICIENT_LIQUIDITY');
  if(s.spreadBps>l.maxSpreadBps||p.slippageBps>l.maxSlippageBps)reject('COST_LIMIT');
  if(s.dailyLossUsd>=l.maxDailyLossUsd)reject('DAILY_LOSS_LIMIT');
  const at=Date.parse(s.asOf);if(!Number.isFinite(at)||at>now||now-at>l.maxAgeMs)reject('STALE_MARKET_STATE');
 }
 if(p.action==='HOLD')reject('ABSTAIN');
 return {stage:'DETERMINISTIC_RISK_PREVIEW',decision:reasons.length?'REJECT':'ELIGIBLE_FOR_EXISTING_OWNER_REVIEW',reasons,confidenceCalibrated:false,executionAuthorized:false,orderSubmitted:false,limitsSource:'OWNER_SUPPLIED_NOT_PRODUCTION_LIMITS',next:'/crypto'};
}
export function arbitrageResearch(b,now=Date.now()){
 const q=list(b.routes,'round-trip routes',1,50).map(r=>{
  const token=str(r.tokenMint,'base token mint',100),at=date(r.asOf,'quote date');
  if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(token)||r.returnTokenMint!==token)fail('matching Solana base token identity');
  const decimals=num(r.decimals,'token decimals',0,18);if(!Number.isInteger(decimals))fail('token decimals');
  for(const k of ['amountInRaw','amountOutRaw'])if(typeof r[k]!=='string'||!/^\d{1,35}$/.test(r[k]))fail('raw token amount');
  const input=BigInt(r.amountInRaw),output=BigInt(r.amountOutRaw);if(input<=0n)fail('positive input');
  const baseUsd=num(r.baseTokenUsd,'base token USD',Number.MIN_VALUE),liquidityUsd=num(r.liquidityUsd,'liquidity USD');
  const principal=Number(input)/10**decimals*baseUsd,gross=Number(output-input)/10**decimals*baseUsd;
  const costs=Object.fromEntries(['exchangeFeesUsd','networkFeesUsd','priceImpactUsd','slippageUsd','latencyBufferUsd','failureCostUsd'].map(k=>[k,num(r[k],k)]));
  const net=gross-Object.values(costs).reduce((a,v)=>a+v,0),reasons=[];
  if(at>now||now-at>num(b.maxAgeMs,'quote max age',1,60000))reasons.push('STALE_QUOTE');
  if(liquidityUsd<principal)reasons.push('INSUFFICIENT_LIQUIDITY');
  if(net<=0)reasons.push('UNPROFITABLE_AFTER_COSTS');
  return {route:str(r.route,'route',400),source:str(r.source,'quote source',1000),tokenMint:token,decimals,asOf:new Date(at).toISOString(),principalUsd:principal,grossUsd:gross,costs,netEstimateUsd:net,decision:reasons.length?'REJECT':'REPLAY_CANDIDATE',reasons};
 });return {type:'OWNER_SUPPLIED_QUOTE_REPLAY',routes:q,walletEnabled:false,executionAuthorized:false,executableProfitVerified:false};
}
export function strategyResearch(b,now=Date.now()){
 const strategies=['value','growth','macro','reflexivity','mean-reversion'];if(!strategies.includes(b.strategy))fail('strategy');
 const history=bars(b.bars),benchmark=bars(b.benchmark),window=num(b.window??20,'window',2,200);if(!Number.isInteger(window)||history.length<=window+2)fail('history length or window');
 if(history.at(-1).at>now)fail('future historical bars');
 if(history.length!==benchmark.length||history.some((r,i)=>r.at!==benchmark[i].at))fail('aligned benchmark');
 const costs=num(b.costBps,'transaction cost bps',0,1000)/10000,source=str(b.source,'historical source',1000),benchmarkSource=str(b.benchmarkSource,'benchmark source',1000);
 const observations=list(b.observations??[],'point-in-time observations',0,2000).map(x=>({...x,at:date(x.at,'observation'),availableAt:date(x.availableAt,'availability')}));
 if(observations.some(x=>x.availableAt<x.at))fail('availability precedes observation');
 const split=num(b.splitIndex,'out-of-sample split',window+1,history.length-2);if(!Number.isInteger(split))fail('split index');
 const threshold=num(b.threshold??.02,'threshold',0,1);let equity=1,bench=1,peak=1,maxDrawdown=0,trades=0,previous=0;const points=[];
 for(let i=split;i<history.length-1;i++){
  const past=history.slice(i-window+1,i+1),current=history[i];let weight=0;
  const point=observations.filter(x=>x.at<=current.at&&x.availableAt<=current.at).sort((a,c)=>c.at-a.at)[0];
  if(b.strategy==='mean-reversion')weight=current.close<mean(past.map(r=>r.close))*(1-threshold)?1:0;
  else if(point){
   const valid=k=>typeof point[k]==='number'&&Number.isFinite(point[k]);
   if(b.strategy==='value')weight=['roe','debtToEquity','freeCashFlow','discount'].every(valid)&&point.roe>=.15&&point.debtToEquity<=.5&&point.freeCashFlow>0&&point.discount>=threshold?1:0;
   if(b.strategy==='growth')weight=['revenueGrowth','earningsGrowth','peg','debtToEquity'].every(valid)&&point.revenueGrowth>=.15&&point.earningsGrowth>=.15&&point.peg>0&&point.peg<=1&&point.debtToEquity<=.5?1:0;
   if(b.strategy==='macro')weight=valid('allocation')?num(point.allocation,'macro allocation',0,1):0;
   if(b.strategy==='reflexivity')weight=valid('sentiment')&&point.sentiment>0&&current.close>past[0].close*(1+threshold)?1:0;
  }
  const turnover=Math.abs(weight-previous),cost=turnover*costs,ret=history[i+1].close/current.close-1;equity*=1+weight*ret-cost;bench*=benchmark[i+1].close/benchmark[i].close;peak=Math.max(peak,equity);maxDrawdown=Math.max(maxDrawdown,1-equity/peak);if(turnover)trades++;
  points.push({decisionAt:new Date(current.at).toISOString(),returnAt:new Date(history[i+1].at).toISOString(),weight,periodReturn:weight*ret-cost,equity,benchmark:bench,turnover});previous=weight;
 }
 // Liquidate final research position and include the closing transaction cost.
 if(previous){equity*=1-previous*costs;trades++;maxDrawdown=Math.max(maxDrawdown,1-equity/peak)}
 return {type:'OUT_OF_SAMPLE_OWNER_SUPPLIED_REPLAY',strategy:b.strategy,source,benchmarkSource,parameters:{window,threshold,costBps:b.costBps,splitIndex:split},totalReturn:equity-1,benchmarkReturn:bench-1,maxDrawdown,trades,sampleSize:points.length,turnover:points.reduce((a,p)=>a+p.turnover,0)+previous,points,proprietaryMethod:false,corporateActions:b.corporateActionsAdjusted===true?'OWNER_ATTESTED_ADJUSTED':'UNVERIFIED',productionEligible:false,limitation:'Small research sample; no statistical confidence or future profit claim. Macro allocations and fundamental data are supplied observations, not a licensed feed.'};
}
export function businessAssessment(b){
 const evidence=list(b.evidence,'evidence',1,40).map(x=>({skill:str(x.skill,'skill',200),reference:str(x.reference,'evidence reference',1000),customerProblem:str(x.customerProblem,'customer problem',1000)}));
 const hours=num(b.hoursAvailable,'available hours',0,168),hourly=num(b.hourlyCostUsd,'hourly cost',0,100000);
 const offers=list(b.offers,'candidate offers',1,12).map(o=>{const index=num(o.evidenceIndex,'evidence index',0,evidence.length-1);if(!Number.isInteger(index))fail('evidence index');const price=num(o.priceUsd,'price'),cash=num(o.cashCostUsd,'cash cost'),delivery=num(o.deliveryHours,'delivery hours',0,10000),demand=str(o.demandReference,'demand reference',1000),distribution=str(o.distribution,'distribution access',1000);const fees=o.feesUsd===null||o.feesUsd===undefined?null:num(o.feesUsd,'fees');return {name:str(o.name,'offer name',180),customer:str(o.customer,'defined customer',300),deliverable:str(o.deliverable,'deliverable'),evidence:evidence[index],demandReference:demand,distribution,priceHypothesisUsd:price,cashCostUsd:cash,deliveryHours:delivery,feesUsd:fees,contributionEstimateUsd:fees===null?null:price-cash-delivery*hourly-fees,feasible:delivery<=hours,validation:str(o.validation,'validation experiment',2000),scopeStatus:'DRAFT_OWNER_REPORTED_NOT_PUBLISHED',intake:['Customer goal and source records','Authorization and desired deliverables','Deadline and acceptance criteria'],deliveryChecks:['Verify source records','Produce scoped deliverable','Review calculations and claims','Deliver through existing private customer journey'],checkout:'/service-studio'};}).sort((a,c)=>Number(c.feasible)-Number(a.feasible)||Number(c.contributionEstimateUsd!==null)-Number(a.contributionEstimateUsd!==null)||(c.contributionEstimateUsd??0)-(a.contributionEstimateUsd??0));
 const leverage={labor:str(b.leverage?.labor,'labor'),capital:str(b.leverage?.capital,'capital'),code:str(b.leverage?.code,'code'),media:str(b.leverage?.media,'media')};
 return {evidence,offers,leverage,hoursAvailable:hours,hourlyCostUsd:hourly,feesIncluded:offers.every(o=>o.feesUsd!==null),profitVerified:false,paymentProvider:'PayPal',catalogUpdated:false,next:'Owner review against existing service catalog before checkout activation'};
}
export function contentPackage(b,now=Date.now()){
 const title=str(b.title,'video title',180),audience=str(b.audience,'audience',400),niche=str(b.niche,'niche',400),demand=str(b.demandReference,'demand source',1000);
 const competitors=list(b.competitors,'competitor evidence',1,10).map(x=>({channel:str(x.channel,'channel',200),source:str(x.source,'channel source',1000),observedAt:new Date(date(x.observedAt,'observation date')).toISOString(),gap:str(x.gap,'original content gap',1000)}));
 if(competitors.some(c=>Date.parse(c.observedAt)>now))fail('future competitor observation');
 const scenes=list(b.scenes,'scenes',1,30).map((x,i)=>({scene:i+1,seconds:num(x.seconds,'scene seconds',1,120),narration:str(x.narration,'original narration',2000),visual:str(x.visual,'visual brief',1000),rightsReference:str(x.rightsReference,'rights reference',1000),caption:str(x.caption,'caption',500)}));
 if(b.originalityConfirmed!==true)fail('originality confirmation');let time=0;for(const s of scenes){s.startSeconds=time;time+=s.seconds;s.endSeconds=time}
 const start=date(b.startAt,'calendar start');const calendar=Array.from({length:8},(_,i)=>({week:i+1,draftDueAt:new Date(start+i*7*86400000).toISOString(),experiment:i%2?'Test an original thumbnail against prior CTR':'Test an opening hook against prior retention',metric:i%2?'Click-through rate with impressions':'First-30-second retention with sample size',publishing:'NOT_AUTHORIZED'}));
 return {title,audience,niche,demandReference:demand,competitors,scenes,durationSeconds:time,script:scenes.map(s=>s.narration).join('\n\n'),thumbnailBrief:str(b.thumbnailBrief,'thumbnail brief',1000),scriptReview:{hookSeconds:scenes[0].seconds,hookWithinSourceGuidance:scenes[0].seconds>=5&&scenes[0].seconds<=10,checklist:['Verify factual claims against listed sources','Use an honest opening hook','Remove repetition','Review transitions and conclusion','Use a natural call to action'],source:'https://www.instagram.com/p/Des9pWboJYF/?img_index=4'},calendar,production:['Record authorized narration','Create or license listed visuals','Edit scenes to timestamps','Add and verify captions','Inspect rendered video and audio','Owner review before publishing'],monetization:{status:'UNVERIFIED',officialRequirements:'https://support.google.com/youtube/answer/72851',revenueGuaranteed:false},renderedVideo:false,published:false};
}
export function eventResearch(b,now=Date.now()){
 const events=list(b.events,'events',1,100).map(x=>{const at=date(x.at,'event date');if(at>now)fail('future historical event');return {at:new Date(at).toISOString(),symbol:str(x.symbol,'symbol',24),source:str(x.source,'source',1000),changePct:num(x.changePct,'change percent',-100,10000),claim:str(x.claim,'event claim',2000),verification:'OWNER_REPORTED',historical:now-at>86400000}}).sort((a,c)=>a.at.localeCompare(c.at));
 const threshold=num(b.thresholdPct,'alert threshold',0,100);return {events,alerts:events.filter(x=>Math.abs(x.changePct)>=threshold).map(x=>({...x,delivery:'RECORDED_ONLY_NOT_SENT'})),asOf:new Date(now).toISOString(),currentMarketStatus:'UNVERIFIED'};
}
export function createSourceWorkflows({read=()=>getJson('source-workflows-v1',fresh()),mutate=fn=>mutateJson('source-workflows-v1',fresh(),fn),clock=Date.now}={}){
 async function save(collection,b,value){const key=id(b.id),hash=digest(value);let result;await mutate(s=>{s[collection]??={};const old=s[collection][key];if(old?.digest===hash){result=old;return}if(old&&old.version!==b.expectedVersion)throw Error('Conflict: reload record');if(!old&&b.expectedVersion!==undefined)fail('missing record');if(!old&&Object.keys(s[collection]).length>=250)fail('record limit');result={id:key,value,digest:hash,version:(old?.version||0)+1,updatedAt:new Date(clock()).toISOString()};s[collection][key]=result});return result}
 async function startTutor(b){if(!modes.includes(b.mode))fail('tutor mode');const deadline=date(b.deadline,'learning deadline');if(deadline<=clock())fail('future learning deadline');const questions=list(b.questions??evidenceCurriculum,'sourced exercises',1,30).map(q=>({prompt:str(q.prompt,'exercise prompt',2000),reference:str(q.reference,'exercise source',1000),answer:str(q.answer,'answer',2000),hint:str(q.hint,'hint',1000),explanation:str(q.explanation,'explanation',2000)}));
  const plan={goal:str(b.goal,'learning goal',1000),baseline:str(b.baseline,'learning baseline',1000),minutes:num(b.minutes,'learning time',5,1440),deadline:new Date(deadline).toISOString(),mode:b.mode,questions,index:0,attempts:[],status:'ACTIVE',guidance:tutorGuidance[b.mode],plan:questions.map((q,i)=>({step:i+1,minutes:Math.max(1,Math.floor(b.minutes/questions.length)),reference:q.reference})),grading:'NORMALIZED_EXACT_MATCH_NOT_SEMANTIC_MASTERY'};
  const saved=await save('sessions',b,plan);return publicSession(saved);
 }
 const publicSession=row=>{const v=row.value,q=v.questions[v.index];return {id:row.id,version:row.version,goal:v.goal,baseline:v.baseline,mode:v.mode,status:v.status,minutes:v.minutes,deadline:v.deadline,index:v.index,total:v.questions.length,guidance:v.guidance,plan:v.plan,grading:v.grading,prompt:q?.prompt??null,reference:q?.reference??null,attempts:v.attempts,progress:v.index/v.questions.length}};
 async function answerTutor(b){const key=id(b.id),answer=str(b.answer,'answer',4000);let result;await mutate(s=>{const row=s.sessions[key];if(!row)fail('missing tutor session');if(row.version!==b.expectedVersion)throw Error('Conflict: reload record');const v=row.value;if(v.status!=='ACTIVE')fail('completed tutor session');if(v.attempts.length>=120)fail('attempt limit');const q=v.questions[v.index],normalize=x=>x.toLowerCase().replace(/\s+/g,' ').trim(),correct=normalize(answer)===normalize(q.answer),tries=v.attempts.filter(a=>a.index===v.index).length+1;
  const attempt={index:v.index,answer,...(b.explanation?{teachBack:str(b.explanation,'teach-back',4000),teachBackAssessment:'REQUIRES_HUMAN_REVIEW'}:{}),correct,feedback:correct?q.explanation:tries<2?q.hint:'Expected answer: '+q.answer+'. '+q.explanation,at:new Date(clock()).toISOString(),assessment:'EXACT_MATCH_ONLY'};v.attempts.push(attempt);if(correct){v.index++;if(v.index===v.questions.length)v.status='COMPLETE'}row.version++;row.digest=digest(v);row.updatedAt=new Date(clock()).toISOString();result={...publicSession(row),feedback:attempt.feedback}});return result}
 async function snapshot(){const s=await read();return {...s,sessions:Object.fromEntries(Object.entries(s.sessions).map(([k,row])=>[k,publicSession(row)])),asOf:new Date(clock()).toISOString(),liveMarketFeed:{status:'UNAVAILABLE',asOf:null},executionAuthorized:false}}
 return {startTutor,answerTutor,snapshot,assess:async b=>save('assessments',b,businessAssessment(b)),packageContent:async b=>save('packages',b,contentPackage(b,clock())),market:async b=>save('research',b,marketResearch(b,clock())),risk:async b=>save('research',b,riskPreview(b,clock())),arbitrage:async b=>save('research',b,arbitrageResearch(b,clock())),strategy:async b=>save('research',b,strategyResearch(b,clock())),events:async b=>save('research',b,eventResearch(b,clock()))};
}
export const sourceWorkflows=createSourceWorkflows();
