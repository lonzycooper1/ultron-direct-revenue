import {randomUUID} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
const KEY='continuous-operations-v1';
export const INTERVAL_MS=30*60*1000;
const LEASE_MS=5*60*1000;
export const freshContinuous=()=>({paused:false,running:null,runs:[],steps:{},nextRunAt:null});
const stamp=n=>new Date(n).toISOString();
export function continuousHealth(s,now=Date.now(),revision=null){
 const last=s.runs?.at(-1),age=last?Math.max(0,now-Date.parse(last.completedAt)):null;
 const expired=s.running&&Date.parse(s.running.until)<=now;
 const status=s.paused?'PAUSED':expired?'RECOVERY_REQUIRED':!last?'NOT_VERIFIED':age>INTERVAL_MS*2?'STALE':last.status==='COMPLETED'?'HEALTHY':'DEGRADED';
 return {status,revision,paused:s.paused,lastCompletedAt:last?.completedAt||null,ageSeconds:age===null?null:Math.floor(age/1000),
  nextRunAt:s.nextRunAt,scheduledRuns:s.runs?.filter(r=>r.trigger==='SCHEDULED'&&r.status==='COMPLETED'&&r.revision===revision).length||0,
  consecutiveSuccessfulRuns:(()=>{let n=0;for(const r of [...(s.runs||[])].reverse()){if(r.status!=='COMPLETED')break;n++}return n})(),
  consecutiveSuccessfulScheduledRuns:(()=>{let n=0;for(const r of [...(s.runs||[])].reverse()){if(r.status!=='COMPLETED')break;if(r.revision!==revision)break;if(r.trigger==='SCHEDULED')n++}return n})(),
  steps:s.steps,runs:s.runs?.slice(-10)||[],running:s.running?{startedAt:s.running.startedAt,until:s.running.until}:null,
  ownerAction:status==='HEALTHY'?null:status==='PAUSED'?'Review pause before resuming background research':'Inspect step health and feed diagnostics; scheduled work is not fully verified'};
}
export function createContinuousOperations({read=()=>getJson(KEY,freshContinuous()),mutate=fn=>mutateJson(KEY,freshContinuous(),fn),clock=Date.now,revision=process.env.RAILWAY_GIT_COMMIT_SHA||process.env.ULTRON_BOOTSTRAP_COMMIT||null}={}){
 async function run(steps,{trigger='SCHEDULED'}={}){
  if(!Object.keys(steps).length||!['SCHEDULED','STARTUP','CONTROLLED_TEST'].includes(trigger))throw Error('Valid nonempty scheduled steps required');
  const at=clock(),id=randomUUID();let claimed=false;
  await mutate(s=>{
   if(s.paused||s.running&&Date.parse(s.running.until)>at||s.nextRunAt&&Date.parse(s.nextRunAt)>at)return;
   if(s.running){s.runs.push({id:s.running.id,trigger:s.running.trigger,revision:s.running.revision,completedAt:stamp(at),status:'INTERRUPTED_REVIEW_REQUIRED'});s.runs=s.runs.slice(-20)}
   s.running={id,trigger,revision,startedAt:stamp(at),until:stamp(at+LEASE_MS)};claimed=true;
  });
  if(!claimed)return {status:'NOT_DUE_OR_RUNNING_OR_PAUSED'};
  const results={};
  for(const [name,operation] of Object.entries(steps)){
   // No Promise.race timeout: releasing a lease while an effect is still running
   // could duplicate work. Each provider operation has its own bounded timeout.
   let owned=false;await mutate(s=>{if(s.running?.id===id){owned=true;s.running.until=stamp(clock()+LEASE_MS);s.steps[name]={...s.steps[name],lastAttemptAt:stamp(clock()),status:'RUNNING'}}});
   if(!owned)return {status:'LEASE_LOST_REVIEW_REQUIRED'};
   let leaseHealthy=true;const renewal=setInterval(()=>{void mutate(s=>{if(s.running?.id===id)s.running.until=stamp(clock()+LEASE_MS);else leaseHealthy=false}).catch(()=>{leaseHealthy=false})},30000);renewal.unref?.();
   try{
    const value=await operation();
    if(!leaseHealthy)return {status:'LEASE_LOST_REVIEW_REQUIRED'};
    const status=value?.status||(value?.ok===true?'COMPLETED':'MISSING_RESULT');
    const ok=['COMPLETED','LIVE_PUBLIC_FEED','CYCLE_EXECUTED','RECONCILED','NO_NEW_VERIFIED_PUBLIC_SOURCE_OR_QUOTA','DRAFT_JOB_QUEUED','NO_PENDING_ASSETS','NOTHING_PENDING'].includes(status)||(status==='COOLDOWN'&&value.sourceStatus==='LIVE_PUBLIC_FEED')||value?.ok===true;
    results[name]={status,ok};
    await mutate(s=>{if(s.running?.id!==id)return;const old=s.steps[name];s.steps[name]={...old,status,ok,lastCompletedAt:stamp(clock()),...(ok?{lastSuccessAt:stamp(clock())}:{}),failure:ok?null:'STEP_REQUIRES_REVIEW'}});
   }catch{
    results[name]={status:'FAILED',ok:false};
    await mutate(s=>{if(s.running?.id===id)s.steps[name]={...s.steps[name],status:'FAILED',ok:false,lastCompletedAt:stamp(clock()),failure:'OPERATION_FAILED_INSPECT_AUTHORIZED_LOGS'}});
   }finally{clearInterval(renewal)}
  }
  let result={status:'LEASE_LOST_REVIEW_REQUIRED'};
  await mutate(s=>{if(s.running?.id!==id)return;result={id,trigger,revision,startedAt:s.running.startedAt,completedAt:stamp(clock()),status:Object.values(results).every(x=>x.ok)?'COMPLETED':'DEGRADED',steps:results};s.runs.push(result);s.runs=s.runs.slice(-20);s.running=null;s.nextRunAt=stamp(at+INTERVAL_MS)});
  return result;
 }
 async function control(action){if(!['pause','resume'].includes(action))throw Error('Choose pause or resume');await mutate(s=>{s.paused=action==='pause';s.controlChangedAt=stamp(clock())});return {paused:action==='pause',activeWorkInterrupted:false}}
 return {run,control,snapshot:async()=>continuousHealth(await read(),clock(),revision)};
}
export const continuousOperations=createContinuousOperations();
