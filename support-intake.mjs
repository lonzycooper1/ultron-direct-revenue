import {createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {OPS_KEY,freshOps} from './ultron-revenue-operations-v41.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const clean=(x,n)=>String(x??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
export function createSupportIntake({read=()=>getJson(OPS_KEY,freshOps()),mutate=f=>mutateJson(OPS_KEY,freshOps(),f),clock=Date.now}={}){
 async function submit(input={}){
  const email=clean(input.email,254).toLowerCase(),message=clean(input.message,1500),reference=clean(input.orderReference,160),kind=input.kind;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10||!['QUESTION','DELIVERY','REFUND_REVIEW'].includes(kind)||!/^[a-zA-Z0-9-]{16,80}$/.test(input.requestId||'')||input.serviceContactConsent!==true)throw Error('Valid support details and service contact consent required');
  if(/(?:sk-[A-Za-z0-9_-]{15,}|password\s*[:=]|api.?key\s*[:=]|\b\d{12,19}\b)/i.test(message))throw Error('Do not submit credentials or payment account details');
  const id='support-'+hash(input.requestId+':'+email).slice(0,24),fingerprint=hash(JSON.stringify({email,message,reference,kind})),at=new Date(clock()).toISOString();
  await mutate(s=>{s.supportRequests??={};const old=s.supportRequests[id];
   if(old){if(old.fingerprint!==fingerprint)throw Error('Request identity conflict');return}
   const rows=Object.values(s.supportRequests);if(rows.length>=1000)throw Error('Support capacity reached; owner review required');
   if(rows.filter(r=>r.email===email&&r.createdAt.slice(0,10)===at.slice(0,10)).length>=3)throw Error('Daily support limit reached; retain your existing reference');
   s.supportRequests[id]={id,email,message,orderReference:reference,kind,fingerprint,createdAt:at,status:'QUEUED_NOT_RESOLVED',source:'UNVERIFIED_PUBLIC_SUPPORT_REQUEST',consentScope:'REQUESTED_SERVICE_RESPONSE_ONLY'};
   s.tasks??={};s.tasks[id]={id,type:kind==='REFUND_REVIEW'?'REFUND_REVIEW':'SUPPORT',reference:id,status:'OWNER_ACTION_REQUIRED',providerVerified:false,updatedAt:at,notes:'Review the private support request. Public order references are not payment or buyer proof.'};
  });return {ticketId:id,status:'QUEUED_NOT_RESOLVED',message:'Your request is saved for owner review. No reply, refund or resolution is confirmed. Retain this reference.'};
 }
 async function review({id,status,reference}={}){
  if(!['OWNER_REVIEWED','OWNER_REPORTED_RESOLVED'].includes(status)||clean(reference,500).length<5)throw Error('Review status and evidence reference required');
  await mutate(s=>{const r=s.supportRequests?.[id];if(!r)throw Error('Support request not found');r.reviewHistory??=[];r.reviewHistory.push({status,reference:clean(reference,500),at:new Date(clock()).toISOString()});r.reviewHistory=r.reviewHistory.slice(-30);r.status=status;r.reviewReference=clean(reference,500);r.reviewedAt=new Date(clock()).toISOString();s.tasks[id].status=status==='OWNER_REPORTED_RESOLVED'?'OWNER_REPORTED_COMPLETE':'OWNER_ACTION_REQUIRED';});
  return {id,status,replySent:false,refundIssued:false};
 }
 return {submit,review,snapshot:async()=>Object.values((await read()).supportRequests||{}).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,100).map(({fingerprint,...r})=>r)};
}
export const supportIntake=createSupportIntake();
