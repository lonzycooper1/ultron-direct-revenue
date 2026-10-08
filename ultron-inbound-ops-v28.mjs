// ULTRON v28: secure operator workflow for voluntary first-party inquiries.
// Sending remains a separate authorization and actual provider action.
import {getJson,mutateJson} from './state-store.mjs';
const KEY='acquisition-leads-v1';
const fallback=()=>({leads:[]});
const now=()=>new Date().toISOString();
const statuses=new Set(['new','reviewed','qualified','closed','suppressed']);
const safe=(v,n=200)=>String(v??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
export function scoreInboundLead(x={}){
 const score=Math.max(0,Math.min(100,Number(x.score)||0));
 const optIn=x.followupConsent===true&&x.consentScope==='REQUESTED_ONE_TO_ONE_DIAGNOSTIC_FOLLOWUP';
 const stage=statuses.has(x.status)?x.status:'new';
 const isOpen=!['closed','suppressed'].includes(stage);
 return {score:Math.round(score+(optIn?15:0)+(stage==='qualified'?10:0)),contactPermitted:optIn&&isOpen,urgency:stage==='qualified'?'QUALIFIED_FOR_REVIEW':stage==='new'&&optIn?'CONSENTED_NEW_REQUEST':stage==='new'?'UNCONSENTED_DIAGNOSTIC':'EXISTING_REVIEW'};
}
export function inboundDraft(x={}){
 const e=String(x.email||'').trim();
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))throw Error('Valid submitted business email required');
 const rank=scoreInboundLead(x);
 if(!rank.contactPermitted)throw Error('One-to-one diagnostic follow-up consent required');
 const company=safe(x.company,100)||'your business';
 const subject='Your requested response-gap diagnostic';
 const body='Hello,\n\nThanks for using the ULTRON free response-gap diagnostic for '+company+'. Based on your self-reported answers, the diagnostic estimated a '+safe(x.severity,12)+' response-gap category. This is an estimate from submitted information, not a measured revenue loss.\n\nIf useful, I can review the customer inquiry and booking process with you and explain the scope of our optional $500 Revenue Leak Audit. There is no obligation to purchase.\n\nIf you no longer want a reply, simply let me know.\n\nULTRON Revenue Team';
 return {to:e,subject,body,status:'DRAFT_NOT_SENT',scope:'REQUESTED_ONE_TO_ONE_DIAGNOSTIC_FOLLOWUP',sourceLeadId:x.id};
}
export async function inboundWorkQueue(limit=100){
 const n=Math.max(1,Math.min(100,Number(limit)||100));
 const state=await getJson(KEY,fallback());
 const list=(state.leads||[]).map(x=>({id:x.id,createdAt:x.createdAt,company:x.company,email:x.email,niche:x.niche,severity:x.severity,score:x.score,
  status:x.status||'new',followupConsent:x.followupConsent===true,consentScope:x.consentScope,source:x.source,lastScanAt:x.lastScanAt||null,
  reviewAt:x.reviewAt||null,reviewNotes:x.reviewNotes||null,...scoreInboundLead(x)}));
 list.sort((a,b)=>(b.status==='new'?1:0)-(a.status==='new'?1:0)||b.score-a.score||String(b.createdAt).localeCompare(String(a.createdAt)));
 return {total:list.length,consentedOpen:list.filter(x=>x.contactPermitted).length,newRequests:list.filter(x=>x.status==='new').length,
  items:list.slice(0,n),notice:'Only owner-authenticated callers can access personal data. Self-reported diagnostic is not proof of business need.'};
}
export async function draftInboundById(id){
 const record=(await getJson(KEY,fallback())).leads?.find(x=>x.id===id);
 if(!record)throw Error('Lead not found');
 return inboundDraft(record);
}
export async function reviewInbound({id,status,notes}={}){
 const stage=safe(status,20);
 if(!statuses.has(stage)||stage==='new')throw Error('Select reviewed, qualified, closed or suppressed');
 if(!/^lead-[a-zA-Z0-9-]{8,90}$/.test(String(id||'')))throw Error('Invalid lead identifier');
 if(typeof notes!=='undefined'&&String(notes).length>500)throw Error('Review notes too long');
 let result=null;
 await mutateJson(KEY,fallback(),state=>{
  const row=(state.leads||[]).find(x=>x.id===id);
  if(!row)throw Error('Lead not found');
  if(row.status==='suppressed'&&stage!=='suppressed')throw Error('Suppressed contact cannot be reopened without fresh consent');
  if(stage==='qualified'&&(!row.followupConsent||row.consentScope!=='REQUESTED_ONE_TO_ONE_DIAGNOSTIC_FOLLOWUP'))throw Error('Qualification for contact requires explicit follow-up consent');
  row.status=stage;row.reviewAt=now();row.reviewNotes=safe(notes,500);
  if(stage==='suppressed'){row.followupConsent=false;row.consentScope='SUPPRESSED_NO_CONTACT';}
  row.reviewHistory??=[];row.reviewHistory.push({at:row.reviewAt,status:stage});if(row.reviewHistory.length>30)row.reviewHistory=row.reviewHistory.slice(-30);
  result={id:row.id,status:row.status,reviewAt:row.reviewAt,followupConsent:row.followupConsent,recordedOnly:true};
 });
 return result;
}
