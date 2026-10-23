import {continuousOperations} from './continuous-operations.mjs';
import crypto from 'node:crypto';
import {enqueueEnterpriseJob,claimEnterpriseJob,finishEnterpriseJob,enterpriseStoreHealth} from './enterprise-store-v45.mjs';
import {executive} from './executive-runtime.mjs';
import {mainframe44} from './ultron-mainframe-v44.mjs';
import {safeWebsite} from './ultron-growth-runtime-v19.mjs';
import {validateBrief} from './factory-new/product-factory.mjs';
import {liveDemandListener} from './live-demand-v46.mjs';
import {demandAssetFactory} from './demand-asset-v46.mjs';
let interval,busy=false;
const clean=(x,n=600)=>String(x??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
const https=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password?u.toString():null}catch{return null}};
export function turnSignalIntoBrief(signal){
 if(!signal||signal.category!=='booking-operations'||!Array.isArray(signal.evidence))throw Error('Unsupported demand signal');
 const evidence=signal.evidence.slice(0,5).map(x=>({
  label:clean(x.label,150),url:https(x.url),relevance:clean(x.relevance,500),
  observedAt:clean(x.observedAt,40)}));
 if(evidence.length<2||evidence.some(x=>!x.url))throw Error('Two public evidence references required');
 const brief={category:'booking-operations',title:clean(signal.title,100),
  audience:clean(signal.audience,250),problem:clean(signal.problem,800),
  objective:clean(signal.objective,800),successCriterion:clean(signal.successCriterion,500),
  priceCents:Number(signal.priceCents||2900),originalityAcknowledged:true,evidence};
 validateBrief(brief);return brief;
}
export async function readAuthorizedSignals(env=process.env,request=fetch){
 const source=env.ULTRON_DISCOVERY_FEED_URL;
 if(!source)return {signals:[],sourceStatus:'NO_AUTHORIZED_FEED'};
 // Independently sourced demand intelligence is not permission to send unsolicited email.
 const safe=await safeWebsite(source);
 const response=await request(safe,{headers:{accept:'application/json','user-agent':'ULTRON-Research/45 (+reviewed business analytics)'},redirect:'error',signal:AbortSignal.timeout(8000)});
 if(!response.ok||!String(response.headers.get('content-type')||'').includes('json'))throw Error('Discovery feed must be a successful JSON response');
 const bytes=await response.arrayBuffer();if(bytes.byteLength>128*1024)throw Error('Discovery feed too large');
 const input=JSON.parse(Buffer.from(bytes).toString('utf8'));
 const list=Array.isArray(input.signals)?input.signals:Array.isArray(input)?input:[];
 return {signals:list.slice(0,20),sourceStatus:'EXTERNAL_UNVERIFIED_INTELLIGENCE',source:safe};
}
export function createEnterpriseCycle({env=process.env,readSignals=()=>readAuthorizedSignals(env),
 enqueue=enqueueEnterpriseJob,claim=claimEnterpriseJob,finish=finishEnterpriseJob,
 product=brief=>mainframe44.saveProductDraft(brief),enqueueResearch=job=>executive.enqueue(job)}={}){
 let lastStatus='NOT_RUN';
 async function pulse(at=new Date()){
  if(env.ULTRON_ENTERPRISE_ENABLED!=='true')return {status:'DISABLED'};
  const health=await enterpriseStoreHealth();if(!health.ok)return {status:'DATABASE_UNAVAILABLE'};
  const date=at.toISOString().slice(0,10);
  let research='RESEARCH_QUEUE_UNAVAILABLE';
  if(env.ULTRON_EXECUTIVE_ENABLED==='true'){
   try{
    await enqueueResearch({kind:'research',idempotencyKey:'enterprise:market:'+date,
     prompt:'Research public, permitted B2B booking operations demand in home services. Find current independently sourceable problems, competing prices, and two concrete published evidence URLs. Produce a SHORT opportunity brief as research only. Do not claim leads, send messages, publish, buy ads or infer sales. UTC date '+date});
    research='QUEUED_OR_ALREADY_PRESENT';
   }catch(e){research='QUEUE_REQUIRES_REVIEW'}
  }
  let incoming=0,ignored=0,discovery='NOT_RUN';
  try{
   const feed=await readSignals();discovery=feed.sourceStatus;
   for(const candidate of feed.signals.slice(0,2)){
    try{
     const brief=turnSignalIntoBrief(candidate);
     const fingerprint=crypto.createHash('sha256').update(JSON.stringify(brief)).digest('hex').slice(0,32);
     await enqueue({kind:'PRODUCT_DRAFT',dedupeKey:'enterprise:draft:'+fingerprint,payload:{brief,sourceStatus:feed.sourceStatus}});
     incoming++;
    }catch{ignored++}
   }
  }catch{discovery='DISCOVERY_SOURCE_REVIEW_REQUIRED'}
  const job=await claim({kinds:['PRODUCT_DRAFT'],leaseSeconds:300});
  let generated=0;
  if(job){
   try{
    const draft=await product(job.payload.brief);
    await finish(job,{status:'DONE',result:{draftId:draft.id,sha256:draft.sha256,approved:false,published:false,revenueUsd:0}});
    generated=1;
   }catch(e){
    await finish(job,{status:'REVIEW_REQUIRED',result:{error:clean(e.message,160),published:false,revenueUsd:0}}).catch(()=>{});
   }
  }
  lastStatus=discovery==='DISCOVERY_SOURCE_REVIEW_REQUIRED'?'DISCOVERY_SOURCE_REVIEW_REQUIRED':'CYCLE_EXECUTED';
  return {status:lastStatus,research,discovery,queued:incoming,ignored,generated,automaticPublishing:false,
   moneyMovedUsd:0,unsafeBulkOutbound:false};
 }
 return {pulse,status:()=>({status:lastStatus,enabled:env.ULTRON_ENTERPRISE_ENABLED==='true'})};
}
export const enterpriseCycle=createEnterpriseCycle();
export function startEnterpriseCycle(){
 if(interval||process.env.ULTRON_ENTERPRISE_ENABLED!=='true')return false;
 const run=async(trigger='SCHEDULED')=>{if(busy)return;busy=true;try{
  const result=await continuousOperations.run({
   publicFeeds:()=>liveDemandListener.poll(),
   artifactReconciliation:()=>demandAssetFactory.reconcile(),
   draftScheduling:()=>demandAssetFactory.schedule(),
   enterprise:()=>enterpriseCycle.pulse()
  },{trigger});
  console.log('ULTRON continuous operations',JSON.stringify({status:result.status,id:result.id||null,steps:result.steps||{}}));
 }catch{console.error('ULTRON continuous operations unavailable; inspect authorized status')}finally{busy=false}};
 void run('STARTUP');interval=setInterval(()=>run('SCHEDULED'),30*60*1000);interval.unref();return true;
}
