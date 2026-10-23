import crypto from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';

const KEY='ultron-live-demand-v46';
const fresh=()=>({lastStartedAt:null,lastCompletedAt:null,signals:{},counts:{},lastError:null,sourceStatus:'NOT_RUN'});
const clip=(s,n=600)=>String(s??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
const stableId=(url)=>crypto.createHash('sha256').update(url).digest('hex').slice(0,32);
const COOL_DOWN_MS=30*60*1000;
const queries=Object.freeze(['appointment scheduling automation','missed customer leads','manual customer follow up']);
const targets=Object.freeze([
 {name:'hacker-news',host:'hn.algolia.com'},
 {name:'github-issues',host:'api.github.com'}
]);
function publicHttps(value,expectedHost){
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname===expectedHost&&(!u.port||u.port==='443')}
 catch{return false}
}
function normalizeSignal(item,source,now){
 const title=clip(item.title,180),problem=clip(item.problem,800),url=String(item.url||'');
 if(title.length<15||problem.length<30||!publicHttps(url,source==='hacker-news'?'news.ycombinator.com':'github.com'))return null;
 const lower=(title+' '+problem).toLowerCase();
 const keywords=['booking','appointment','customer','lead','follow up','follow-up','automate','manual','scheduling','service','workflow','crm','calendar','support','email'];
 if(!keywords.some(k=>lower.includes(k)))return null;
 const created=Date.parse(item.createdAt||'');
 if(!Number.isFinite(created)||now-created>60*24*3600*1000||created>now+3600*1000)return null;
 const publicUrl=new URL(url);publicUrl.hash='';
 if(source==='hacker-news'){
  const itemId=publicUrl.searchParams.get('id');
  if(publicUrl.pathname!=='/item'||!/^\d+$/.test(itemId||''))return null;
  publicUrl.search='';publicUrl.searchParams.set('id',itemId);
 }else publicUrl.search='';
 return {id:stableId(source+':'+publicUrl.href),source,url:publicUrl.href,title,problem,
  observedAt:new Date(now).toISOString(),sourceCreatedAt:new Date(created).toISOString(),
  classification:'UNVERIFIED_PUBLIC_DISCUSSION_NOT_BUYER_INTENT',permissionToContact:false,
  independentlyVerifiedBuyer:false};
}
async function limitedJson(url,host,request){
 if(!publicHttps(url,host))throw Error('Demand feed host not permitted');
 const r=await request(url,{redirect:'error',signal:AbortSignal.timeout(9000),headers:{
  accept:'application/json','user-agent':'ULTRON-PublicMarketResearch/46 (public metadata only)'
 }});
 if(!r.ok)throw Error('Demand feed unavailable HTTP '+r.status);
 const type=r.headers.get('content-type')||'';
 if(!type.includes('json'))throw Error('JSON demand feed required');
 if(Number(r.headers.get('content-length')||0)>150000)throw Error('Feed too large');
 let bytes;
 if(r.body?.getReader){
  const reader=r.body.getReader(),chunks=[];let size=0;
  try{
   while(true){const {done,value}=await reader.read();if(done)break;
    size+=value.byteLength;
    if(size>150000){await reader.cancel();throw Error('Feed exceeds ingestion limit')}
    chunks.push(value);
   }
   bytes=Buffer.concat(chunks,size);
  }finally{reader.releaseLock()}
 }else{
  bytes=await r.arrayBuffer();
  if(bytes.byteLength>150000)throw Error('Feed exceeds ingestion limit');
 }
 return JSON.parse(Buffer.from(bytes).toString('utf8'));
}
export async function fetchPublicDemand({request=fetch,now=Date.now(),sources=targets}={}){
 const results=[],errors=[];
 for(const source of sources.slice(0,2)){
  try{
   if(source.name==='hacker-news'){
    const url='https://hn.algolia.com/api/v1/search_by_date?tags=ask_hn&query='+encodeURIComponent(queries[1])+'&hitsPerPage=20';
    const payload=await limitedJson(url,'hn.algolia.com',request);
    for(const hit of (Array.isArray(payload.hits)?payload.hits:[]).slice(0,20)){
     const x=normalizeSignal({title:hit.title||hit.story_title,problem:hit.story_text||hit.comment_text||hit.title,
      url:'https://news.ycombinator.com/item?id='+encodeURIComponent(hit.objectID||''),
      createdAt:hit.created_at},source.name,now);
     if(x)results.push(x);
    }
   }else if(source.name==='github-issues'){
    const q='is:issue is:open '+queries[0];
    // Issue bodies can be large: keep this one bounded request small rather
    // than discarding a whole 12-item response at the ingestion limit.
    const url='https://api.github.com/search/issues?q='+encodeURIComponent(q)+'&sort=created&order=desc&per_page=3';
    const payload=await limitedJson(url,'api.github.com',request);
    for(const issue of (Array.isArray(payload.items)?payload.items:[]).slice(0,12)){
     if(issue.pull_request)continue;
     const x=normalizeSignal({title:issue.title,problem:issue.body||issue.title,
      url:issue.html_url,createdAt:issue.created_at},source.name,now);
     if(x)results.push(x);
    }
   }
  }catch(e){errors.push({source:source.name,reason:clip(e.message,80)})}
 }
 const unique=[...new Map(results.map(x=>[x.id,x])).values()].slice(0,25);
 return {signals:unique,checkedAt:new Date(now).toISOString(),sourcesChecked:sources.length,
  partial:errors.length>0,errors};
}
export function createLiveDemandListener({env=process.env,read=()=>getJson(KEY,fresh()),
 mutate=fn=>mutateJson(KEY,fresh(),fn),search=fetchPublicDemand,clock=Date.now}={}){
 async function poll(){
  if(env.ULTRON_LIVE_DEMAND_ENABLED!=='true')return {status:'DISABLED',signals:[]};
  const at=clock(),timestamp=new Date(at).toISOString();
  let allowed=false;
  await mutate(s=>{
   const last=Date.parse(s.lastStartedAt||'');
   if(Number.isFinite(last)&&at-last<COOL_DOWN_MS)return;
   s.lastStartedAt=timestamp;allowed=true;
  });
  if(!allowed)return {status:'COOLDOWN',signals:[],minIntervalMinutes:30};
  try{
   const result=await search({now:at});
   await mutate(s=>{
    for(const x of result.signals||[]){
     if(!x?.id||!x.url||!['github-issues','hacker-news'].includes(x.source))continue;
     s.signals[x.id]=x;
    }
    const sorted=Object.values(s.signals).sort((a,b)=>b.observedAt.localeCompare(a.observedAt)).slice(0,100);
    s.signals=Object.fromEntries(sorted.map(x=>[x.id,x]));
    s.lastCompletedAt=timestamp;
    s.sourceStatus=result.errors?.length?'PARTIAL_PUBLIC_FEED':'LIVE_PUBLIC_FEED';
    s.lastError=(result.errors||[]).map(e=>e.source+': '+e.reason).join('; ').slice(0,220)||null;
   });
   return {status:result.errors?.length?'PARTIAL':'COMPLETED',
    fetched:result.signals?.length||0,errors:result.errors||[],minIntervalMinutes:30};
  }catch(e){
   await mutate(s=>{s.sourceStatus='FAILED_RETRY_AFTER_COOLDOWN';s.lastError=clip(e.message,180)});
   return {status:'FEED_UNAVAILABLE',minIntervalMinutes:30};
  }
 }
 async function snapshot(privateView=false){
  const s=await read(),signals=Object.values(s.signals||{}).sort((a,b)=>b.observedAt.localeCompare(a.observedAt));
  return {sourceStatus:s.sourceStatus,lastStartedAt:s.lastStartedAt,lastCompletedAt:s.lastCompletedAt,
   signalCount:signals.length,minIntervalMinutes:30,
   signals:privateView?signals.slice(0,20):signals.slice(0,5).map(x=>({source:x.source,url:x.url,title:x.title,classification:x.classification})),
   lastError:privateView?s.lastError:null};
 }
 return {poll,snapshot};
}
export const liveDemandListener=createLiveDemandListener();
