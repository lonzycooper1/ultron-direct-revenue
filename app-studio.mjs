import {competitorEvidence,compareTravelQuotes,messageRiskTriage} from './source-business-tools.mjs';
import {createHash} from 'node:crypto';import JSZip from 'jszip';import {getJson,mutateJson} from './state-store.mjs';
import {appDocument} from './app-studio-templates.mjs';
const KEY='original-app-studio-v1',fresh=()=>({apps:{}}),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const id=x=>typeof x==='string'&&/^[-a-zA-Z0-9_]{1,64}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
const text=(x,n)=>typeof x==='string'&&x.trim()&&x.length<=n;
export const appSchemas={crm:['company','stage','source','nextAction'],board:['task','status','reference'],budget:['label','kind','basis','amountCents','date','reference'],resume:[],image:[],game:[]};
export function budgetSummary(rows){
 const result={actualIncomeCents:0,actualExpenseCents:0,estimatedIncomeCents:0,estimatedExpenseCents:0,unknownAmounts:0};
 for(const r of rows){const k=(r.basis==='ACTUAL'?'actual':'estimated')+(r.kind==='INCOME'?'IncomeCents':'ExpenseCents');if(r.amountCents===null){result[k]=null;result.unknownAmounts++}else if(result[k]!==null)result[k]+=r.amountCents}
 result.recordedActualNetCents=result.actualIncomeCents===null||result.actualExpenseCents===null?null:result.actualIncomeCents-result.actualExpenseCents;return {...result,source:'Owner supplied records, not provider reconciliation',bankSettlementVerified:false};
}
export function validateAppRecord(kind,input){
 if(!input||typeof input!=='object'||Array.isArray(input)||!appSchemas[kind]?.length)throw Error('Invalid app record');
 const r={};for(const k of appSchemas[kind]){if(k==='amountCents'){if(input[k]!==null&&(!Number.isSafeInteger(input[k])||input[k]<0||input[k]>100000000000))throw Error('Invalid amount: integer cents or null required');r[k]=input[k]}else{if(!text(input[k],1000))throw Error('Invalid '+k);r[k]=input[k].trim()}}
 if(kind==='crm'&&!['NEW','REVIEWED','QUALIFIED','CLOSED'].includes(r.stage))throw Error('Invalid CRM stage');
 if(kind==='board'&&!['TODO','DOING','DONE','BLOCKED'].includes(r.status))throw Error('Invalid task status');
 if(kind==='budget'&&(!['INCOME','EXPENSE'].includes(r.kind)||!['ACTUAL','ESTIMATE'].includes(r.basis)||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))))throw Error('Invalid budget record');
 return r;
}
export function createAppStudio({read=()=>getJson(KEY,fresh()),mutate=f=>mutateJson(KEY,fresh(),f),clock=Date.now}={}){
 async function create(b){
  if(!id(b.id)||!text(b.title,100)||!text(b.brief,4000)||!Object.hasOwn(appSchemas,b.kind)||b.originalityConfirmed!==true)throw Error('Invalid original app brief');
  const spec={id:b.id,title:b.title.trim(),brief:b.brief.trim(),kind:b.kind},digest=hash(spec);let result;
  await mutate(s=>{const old=s.apps[b.id];if(old){if(old.digest!==digest)throw Error('Conflict: app identity already used');result=old;return}if(Object.keys(s.apps).length>=40)throw Error('App capacity reached');result=s.apps[b.id]={...spec,digest,createdAt:new Date(clock()).toISOString(),records:{},version:1,status:'PRIVATE_WORKING_TEMPLATE',nativeStorePublished:false,paymentProvider:'EXISTING_PAYPAL_NOT_AUTOMATICALLY_BOUND'};});return result;
 }
 async function save(b){
  if(!id(b.appId)||!id(b.recordId))throw Error('Invalid app or record identity');let result;
  await mutate(s=>{const a=s.apps[b.appId];if(!a)throw Error('Invalid app identity');const data=validateAppRecord(a.kind,b.data),old=a.records[b.recordId],digest=hash(data);if(old?.digest===digest){result=old;return}if(b.expectedVersion!==(old?.version||0))throw Error('Conflict: record changed');if(!old&&(Object.keys(a.records).length>=200||Object.values(s.apps).reduce((n,x)=>n+Object.keys(x.records).length,0)>=1000))throw Error('Record capacity reached');result=a.records[b.recordId]={id:b.recordId,data,digest,version:(old?.version||0)+1,updatedAt:new Date(clock()).toISOString()};a.version++;});return result;
 }
 async function bundle(appId){if(!id(appId))throw Error('Invalid app identity');const a=(await read()).apps[appId];if(!a)throw Error('Invalid app identity');const zip=new JSZip(),doc=appDocument(a),manifest={name:a.title,short_name:'ULTRON app',start_url:'./',display:'standalone',background_color:'#101725',theme_color:'#101725',icons:[{src:'icon.svg',sizes:'any',type:'image/svg+xml'}]};
  zip.file('index.html',doc);zip.file('manifest.webmanifest',JSON.stringify(manifest,null,2));zip.file('icon.svg','<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192"><rect width="192" height="192" rx="30" fill="#101725"/><text x="96" y="133" text-anchor="middle" font-size="110" fill="#9be4ce">U</text></svg>');
  zip.file('sw.js',"self.addEventListener('install',e=>e.waitUntil(caches.open('ultron-template-v1').then(c=>c.addAll(['./','./manifest.webmanifest','./icon.svg']))));self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});");
  zip.file('README.txt','Original ULTRON '+a.kind+' mobile web template. Open index.html locally or host these files on authorized HTTPS hosting. Export contains no saved server records. Device-only data is separate from the protected PostgreSQL records in ULTRON App Studio. Not a native store app, generative image service, activated subscription or published business. Existing PayPal integration is retained; do not add client secrets or collect card data. Review privacy, rights, accessibility and scope before external release.\nBrief: '+a.brief);
  const bytes=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});return {bytes,sha256:createHash('sha256').update(bytes).digest('hex'),filename:'ultron-'+a.id+'.zip'};
 }
 async function analyze(b){if(!b.input||typeof b.input!=='object'||Array.isArray(b.input))throw Error('Invalid analysis input');if(!id(b.id))throw Error('Invalid analysis identity');const methods={competitors:competitorEvidence,travel:compareTravelQuotes,message:messageRiskTriage};if(!Object.hasOwn(methods,b.kind))throw Error('Invalid analysis kind');const value=methods[b.kind](b.input,clock()),digest=hash(b.input);let result;await mutate(s=>{s.analyses??={};const old=s.analyses[b.id];if(old){if(old.digest!==digest||old.kind!==b.kind)throw Error('Conflict: analysis identity already used');result=old;return}if(Object.keys(s.analyses).length>=100)throw Error('Analysis capacity reached');result=s.analyses[b.id]={id:b.id,kind:b.kind,digest,value,createdAt:new Date(clock()).toISOString()}});return result}
 async function snapshot(){const s=await read();return {analyses:Object.values(s.analyses||{}),apps:Object.values(s.apps).map(a=>({...a,summary:a.kind==='budget'?budgetSummary(Object.values(a.records).map(x=>x.data)):null})),source:'original-app-studio-v1',externalActions:0}}
 return {create,save,bundle,snapshot,analyze};
}
export const appStudio=createAppStudio();
