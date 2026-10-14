import {createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {OPS_KEY,freshOps} from './ultron-revenue-operations-v41.mjs';
import {safeWebsite} from './ultron-growth-runtime-v19.mjs';
export async function dispatchOperationalAlerts({env=process.env,fetchImpl=fetch,validateUrl=safeWebsite,read=()=>getJson(OPS_KEY,freshOps()),mutate=f=>mutateJson(OPS_KEY,freshOps(),f)}={}){
 if(env.ULTRON_ALERTS_ENABLED!=='true'||!env.ULTRON_ALERT_WEBHOOK_URL)return {status:'OWNER_ALERT_DESTINATION_REQUIRED',submitted:0,received:0};
 const url=await validateUrl(env.ULTRON_ALERT_WEBHOOK_URL);
 const pending=Object.values((await read()).alerts||{}).filter(a=>a.status==='QUEUED_NOT_DELIVERED').slice(0,3);
 let submitted=0;
 for(const alert of pending){
  let claimed=false;await mutate(s=>{const a=s.alerts[alert.id];if(a?.status==='QUEUED_NOT_DELIVERED'){a.status='DISPATCHING_RECEIPT_UNCONFIRMED';a.dispatchAt=new Date().toISOString();claimed=true;}});
  if(!claimed)continue;
  const event={id:createHash('sha256').update(alert.id).digest('hex').slice(0,24),type:alert.kind,
   message:alert.overdue?'A paid audit is overdue and requires review.':'A paid audit requires review.',ownerAction:'Open ULTRON revenue operations. No customer details are included.'};
  try{
   const r=await fetchImpl(url,{method:'POST',redirect:'error',headers:{'content-type':'application/json'},body:JSON.stringify(event),signal:AbortSignal.timeout(10000)});
   await mutate(s=>{s.alerts[alert.id].status=r.ok?'PROVIDER_ACCEPTED_RECEIPT_UNCONFIRMED':'PROVIDER_REJECTED_REVIEW_REQUIRED';s.alerts[alert.id].httpStatus=r.status;});
   if(r.ok)submitted++;
  }catch{await mutate(s=>{s.alerts[alert.id].status='AMBIGUOUS_DISPATCH_RECONCILE_NO_AUTORETRY';});}
 }
 return {status:'BOUNDED_DISPATCH_COMPLETED',submitted,received:0,note:'HTTP acceptance is not proof the owner received a notification. No ambiguous POST is retried.'};
}
