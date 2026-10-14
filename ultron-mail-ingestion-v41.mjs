import {getJson,mutateJson} from './state-store.mjs';
import {safeRead} from './ultron-revenue-operations-v41.mjs';
import {growthState,receiveReply,receiveBounce,gmailToken} from './ultron-growth-runtime-v19.mjs';
const KEY='ultron-mail-ingestion-v41',fresh=()=>({seen:{},lastRun:null,lastStatus:'NOT_RUN'});
const email=x=>{const m=String(x||'').trim().toLowerCase().match(/^(?:[^<>]*<)?([a-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[a-z0-9.-]+\.[a-z]{2,})(?:>)?$/);return m?.[1]||null};
const headers=m=>Object.fromEntries((m.payload?.headers||[]).map(h=>[h.name.toLowerCase(),h.value]));
export function messageText(payload={}){
 let out='';if(payload.mimeType==='text/plain'&&payload.body?.data)out+=Buffer.from(payload.body.data,'base64url').toString('utf8');
 for(const p of payload.parts||[])out+=messageText(p);return out.slice(0,12000);
}
export function scopedIncoming(message,outbox=[],prospects={}){
 const h=headers(message),from=email(h.from),text=messageText(message.payload);
 const bounce=from==='mailer-daemon@googlemail.com'||from==='mailer-daemon@google.com';
 const candidate=outbox.find(o=>o.status==='SENT'&&o.ownerApprovedAt&&prospects[o.prospectId]&&
  (bounce?o.providerThreadId===message.threadId&&text.toLowerCase().includes(email(o.to)):email(o.to)===from));
 if(!message.id||!candidate||!message.labelIds?.includes('INBOX'))return null;
 if(candidate.providerThreadId&&candidate.providerThreadId!==message.threadId&&!/unsubscribe|remove me|stop emailing|do not contact|^\s*stop[.!]?\s*$/i.test(text))return null;
 if(!text.trim())return null;
 return {prospectId:candidate.prospectId,messageId:message.id,body:text,source:'GMAIL_API_READ',threadId:message.threadId,bounce};
}
/** Read only a bounded set of replies from already approved contacted prospects. Never sends. */
export async function ingestReplies({env=process.env,fetchImpl=fetch,stateRead=()=>getJson(KEY,fresh()),stateMutate=f=>mutateJson(KEY,fresh(),f),growthRead=growthState,onReply=receiveReply,onBounce=receiveBounce,getToken=gmailToken}={}){
 if(env.ULTRON_GMAIL_INGEST_ENABLED!=='true')return {status:'OWNER_ENABLE_REQUIRED',processed:0,sent:0};
 if(!env.ULTRON_GMAIL_REFRESH_TOKEN||!env.ULTRON_BUSINESS_SENDER)return {status:'AUTH_REQUIRED',processed:0,sent:0};
 const g=await growthRead(),outbox=Object.values(g.outbox||{}).filter(o=>o.status==='SENT'&&o.ownerApprovedAt&&email(o.to));
 const senders=[...new Set(outbox.map(o=>email(o.to)))].slice(0,20);
 if(!senders.length)return {status:'NO_APPROVED_CONTACTED_PROSPECTS',processed:0,sent:0};
 const token=await getToken();
 const read=async path=>safeRead(async()=>{const r=await fetchImpl('https://gmail.googleapis.com/gmail/v1/users/me/'+path,{headers:{authorization:'Bearer '+token},signal:AbortSignal.timeout(12000)});if(!r.ok){const e=Error('Gmail read failed '+r.status);e.retryable=r.status===429||r.status>=500;throw e}return r.json()});
 const profile=await read('profile');if(email(profile.emailAddress)!==email(env.ULTRON_BUSINESS_SENDER))throw Error('Gmail account does not match authorized sender');
 const q='in:inbox newer_than:7d {'+senders.map(a=>'from:'+a).join(' ')+' '+senders.map(a=>'(from:mailer-daemon@googlemail.com "'+a+'")').join(' ')+'}';
 const ids=(await read('messages?maxResults=20&q='+encodeURIComponent(q))).messages||[];
 let processed=0;const seen=(await stateRead()).seen||{};
 for(const m of ids.slice(0,20)){
  if(seen[m.id])continue;
  const full=await read('messages/'+encodeURIComponent(m.id)+'?format=full'),reply=scopedIncoming(full,outbox,g.prospects);
  if(!reply)continue;
  const result=reply.bounce?await onBounce(reply):await onReply(reply);
  await stateMutate(s=>{s.seen[m.id]={at:new Date().toISOString(),classification:result.classification};
   const keys=Object.keys(s.seen);for(const k of keys.slice(0,Math.max(0,keys.length-5000)))delete s.seen[k];});processed++;
 }
 await stateMutate(s=>{s.lastRun=new Date().toISOString();s.lastStatus='SCOPED_READ_COMPLETED';});
 return {status:'SCOPED_READ_COMPLETED',processed,sent:0,providerIdentityMatched:true,deliveryReceiptVerified:false};
}
