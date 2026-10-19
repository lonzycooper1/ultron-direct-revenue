// ULTRON Mainframe v44: unified, evidence-aware runtime facade.
// Reuses the deployed PostgreSQL state store, verified payment lifecycle and executive queue.
// No customer data or generated assets are public. No outbound action is implied by a draft.
import crypto from 'node:crypto';
import {mkdir,open,readFile,unlink,access} from 'node:fs/promises';
import path from 'node:path';
import {getJson,mutateJson,storeHealth} from './state-store.mjs';
import {captureLead,leadSummary} from './acquisition-funnel.mjs';
import {ledger} from './ledger-store.mjs';
import {executive,readiness as executiveReadiness} from './executive-runtime.mjs';
import {agentOfAgentsState} from './agent-of-agents.mjs';
import {validateBrief,buildProduct} from './factory-new/product-factory.mjs';

const KEY='ultron-mainframe-v44';
const fresh=()=>({drafts:{},submittedLeadHashes:{},events:[],updatedAt:null});
const max=(s,n)=>String(s??'').trim().slice(0,n);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const folder=(env)=>env.ULTRON_ARTIFACT_DIR||'/data/ultron-artifacts-v44';

export function providerReadiness(env=process.env){
  const gmail=Boolean(env.ULTRON_GMAIL_CLIENT_ID&&env.ULTRON_GMAIL_CLIENT_SECRET&&env.ULTRON_GMAIL_REFRESH_TOKEN&&env.ULTRON_BUSINESS_SENDER&&env.ULTRON_BUSINESS_POSTAL_ADDRESS&&env.ULTRON_UNSUBSCRIBE_SECRET);
  return {
    openai:{configured:executiveReadiness(env).configured.openai,verified:'CHECK_EXECUTIVE_RECEIPTS'},
    anthropic:{configured:Boolean(env.ANTHROPIC_API_KEY&&env.ULTRON_CLAUDE_MODEL),verified:false},
    paypal:{configured:Boolean(env.PAYPAL_CLIENT_ID&&env.PAYPAL_CLIENT_SECRET&&env.PAYPAL_WEBHOOK_ID),verified:'CHECK_SIGNED_CAPTURE_AND_DELIVERY'},
    gmail:{configured:gmail,verified:false,automaticSendingAllowed:false},
    crm:{configured:Boolean(env.ULTRON_HUBSPOT_PRIVATE_APP_TOKEN),verified:false},
    calendar:{configured:Boolean(env.ULTRON_CALENDAR_REFRESH_TOKEN&&env.ULTRON_CALENDAR_ID&&env.ULTRON_GOOGLE_CLIENT_ID&&env.ULTRON_GOOGLE_CLIENT_SECRET),verified:false},
    payhip:{configured:Boolean(env.ULTRON_PAYHIP_API_KEY),verified:false,mode:'EVENT_ONLY_NOT_PAYPAL_CAPTURE'},
    mcp:{configured:Boolean(env.ULTRON_MCP_GATEWAY_URL&&env.ULTRON_MCP_GATEWAY_TOKEN),verified:false,executionAllowed:false},
    vercel:{configured:Boolean(env.ULTRON_VERCEL_TOKEN&&env.ULTRON_VERCEL_PROJECT_ID),verified:false,previewOnly:true},
    alerts:{configured:env.ULTRON_ALERTS_ENABLED==='true'&&Boolean(env.ULTRON_ALERT_WEBHOOK_URL),receiptVerified:false},
    artifactStore:{pathConfigured:Boolean(env.ULTRON_ARTIFACT_DIR),expectedPath:folder(env),verification:'CHECK_MOUNTED_DISK'},
    security:{dailyJobLimit:Number(env.ULTRON_EXECUTIVE_DAILY_LIMIT||4),humanApprovalRequired:true,automaticAdSpendUsd:0,automaticLiveTrading:false}
  };
}
export function validateInbound(body={}){
  if(!body||typeof body!=='object'||Array.isArray(body))throw Error('JSON object required');
  if(body.website_url||body.websiteUrl||body.honeypot)throw Error('Submission rejected');
  const company=max(body.company,160);
  const email=max(body.email,254).toLowerCase();
  if(company.length<2)throw Error('Company required');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Valid email required');
  if(body.followupConsent!==true&&body.followupConsent!==false&&body.followupConsent!==undefined)throw Error('Explicit boolean consent required');
  return {
    company,email,niche:max(body.niche||'services',40),
    source:'mainframe-v44-first-party-intake',followupConsent:body.followupConsent===true,
    monthlyLeads:body.monthlyLeads,responseMinutes:body.responseMinutes,missedCallRate:body.missedCallRate,
    followup:max(body.followup,120),notes:max(body.notes,1000)
  };
}
// Exact address or request IP is not persisted. Hash is used solely for daily abuse throttling.
export function createMainframe44({
 env=process.env, capture=captureLead,read=()=>getJson(KEY,fresh()),mutate=fn=>mutateJson(KEY,fresh(),fn),
 readLedger=ledger,readLeads=leadSummary,readExecutive=()=>executive.status(false),
 readAgents=agentOfAgentsState,health=storeHealth,writeFile=null
}={}){
 async function publicIntake(body){
  const input=validateInbound(body),date=new Date().toISOString().slice(0,10);
  const emailHash=sha(date+':'+input.email);
  let allowed=false;
  await mutate(s=>{
    const r=s.submittedLeadHashes||={};const count=r[emailHash]||0;
    if(count>=5)return;
    r[emailHash]=count+1;allowed=true;
    if(Object.keys(r).length>6000)for(const k of Object.keys(r).slice(0,2000))delete r[k];
  });
  if(!allowed)throw Error('Daily submission limit reached');
  // Capture is committed by the existing Postgres-backed intake module.
  const result=await capture(input);
  await mutate(s=>{s.events.unshift({kind:'FIRST_PARTY_INBOUND',idHash:sha(result.leadId),at:new Date().toISOString(),consented:input.followupConsent});s.events=s.events.slice(0,200);s.updatedAt=new Date().toISOString()});
  return result;
 }
 async function saveProductDraft(brief){
  validateBrief(brief);
  const built=buildProduct(brief),id=crypto.randomUUID();
  const directory=folder(env),filename=id+'.html',file=path.join(directory,filename);
  if(!path.isAbsolute(directory))throw Error('Absolute artifact path required');
  const bytes=Buffer.from(built.html,'utf8');
  if(bytes.length>1024*1024)throw Error('Draft exceeds 1 MiB');
  await mkdir(directory,{recursive:true,mode:0o700});
  const writer=writeFile||(async(p,data)=>{const fh=await open(p,'wx',0o600);try{await fh.writeFile(data)}finally{await fh.close()}});
  await writer(file,bytes);
  try{
   await mutate(s=>{
    s.drafts[id]={id,filename,sha256:sha(bytes),bytes:bytes.length,createdAt:new Date().toISOString(),status:'DRAFT_OWNER_REVIEW_REQUIRED',manifest:built.manifest};
    const ids=Object.keys(s.drafts);
    if(ids.length>200)throw Error('Draft quota reached; archive only after owner review');
    s.updatedAt=new Date().toISOString();
   });
  }catch(e){await unlink(file).catch(()=>{});throw e}
  return {id,status:'DRAFT_OWNER_REVIEW_REQUIRED',sha256:sha(bytes),bytes:bytes.length,published:false,paymentCaptured:false,customerAccepted:false};
 }
 async function getProductDraft(id){
  if(!/^[0-9a-f-]{36}$/i.test(String(id)))throw Error('Invalid artifact id');
  const s=await read(),rec=s.drafts?.[id];
  if(!rec)throw Error('Artifact not found');
  const file=path.join(folder(env),rec.filename);
  const data=await readFile(file);
  if(data.length!==rec.bytes||sha(data)!==rec.sha256)throw Error('Artifact digest mismatch');
  return {id,data,filename:rec.filename,sha256:rec.sha256};
 }
 async function snapshot(privateView=false){
  const [db,leads,orders,exec,agents,local]=await Promise.all([
   health(),readLeads(),readLedger(),readExecutive(),readAgents(),read()
  ]);
  let disk=false;try{await access(folder(env));disk=true}catch{}
  const captured=Object.values(orders?.orders||{}).filter(x=>x.status==='COMPLETED'&&x.captureId);
  const verified=Object.values(orders?.orders||{}).filter(x=>x.acceptance?.accepted===true&&x.captureId);
  const approvals=(agents?.approvals||[]).filter(x=>x.status==='pending');
  return {
   version:'44.0.0',database:db.ok?'POSTGRES_CONNECTED':'DATABASE_UNAVAILABLE',artifactStorage:disk?'DIRECTORY_ACCESSIBLE':'MOUNT_NOT_VERIFIED',
   liveWorker:{configured:env.ULTRON_EXECUTIVE_ENABLED==='true',jobCounts:exec.counts,hostedAccess:exec.hostedAgentsAccess||'UNVERIFIED'},
   inbound:{firstPartyTotal:leads.total||0,consentedForReply:leads.consentedForOneToOneFollowup||0},
   orders:{signedCaptureRecords:captured.length,acceptedRecordsRequireVerification:verified.length,bankSettlement:'NOT_VERIFIED_BY_MAINFRAME'},
   productFactory:{durableDrafts:Object.keys(local.drafts||{}).length,autoPublish:false,ownerReviewRequired:true},
   approvals:{pending:approvals.length,noBlanketAuthorization:true},
   providers:providerReadiness(env),
   limits:{noAutomaticTrades:true,noAutomaticAds:true,noUnapprovedOutbound:true,noSimulatedSales:true},
   ...(privateView?{drafts:Object.values(local.drafts||{}).map(({filename,...rest})=>rest),pendingApprovals:approvals.map(x=>({id:x.id,action:x.action,createdAt:x.createdAt})),lastEvents:(local.events||[]).slice(0,20)}:{})
  };
 }
 return {publicIntake,saveProductDraft,getProductDraft,snapshot};
}
export const mainframe44=createMainframe44();
