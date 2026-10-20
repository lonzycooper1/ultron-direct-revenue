import {timingSafeEqual} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {ledger,saveLedger} from './ledger-store.mjs';
import {V34_SKU,validateV34Intake,inspectV34Homepage,buildV34Report} from './ultron-autonomous-revenue-v34.mjs';
import {serviceDocument,digest} from './service-document.mjs';
const KEY='ultron-audit-delivery-v1',fresh=()=>({drafts:{}});
export function websiteObservations(site,url,at){
 if(site?.status!=='INSPECTED')throw Error('Public homepage evidence unavailable; checkout must remain blocked');
 const checks=[['Page title',Boolean(site.title),'Title detected: '+(site.title||'(none detected)'),'Review a descriptive page title'],['Main heading',site.h1Count===1,'Static H1 count: '+site.h1Count,'Review heading hierarchy'],['Phone link',site.telLink,'Static tel: link '+(site.telLink?'detected':'not detected'),'Verify a usable contact method on mobile'],['Inquiry form',site.formCount>0,'Static form count: '+site.formCount,'Verify a usable inquiry path'],['Booking wording',site.bookingText,'Booking/request wording '+(site.bookingText?'detected':'not detected'),'Test a clear next-step call to action']];
 return checks.map(([check,detected,evidence,next],i)=>({id:'homepage-'+(i+1),check,category:detected?'OBSERVATION':'REVIEW_OPPORTUNITY',evidence,next,source:url,observedAt:at,limitation:'Static HTML only. Absence does not establish a missing live feature or lost sales.'}));
}
export function createAuditDelivery({read=()=>getJson(KEY,fresh()),mutate=fn=>mutateJson(KEY,fresh(),fn),orders=ledger,mutateOrders=saveLedger,verify,inspect=inspectV34Homepage,clock=Date.now}={}){
 const at=()=>new Date(clock()).toISOString();
 async function prepare(input){
  if(input?.authorizationConfirmed!==true)throw Error('Authorization for supplied inputs required');for(const k of ['monthlyLeads','missedPercent','responseMinutes'])if(input[k]===null||input[k]===undefined||String(input[k]).trim()===''||!Number.isFinite(Number(input[k])))throw Error('Supplied measurements required');
  const x=validateV34Intake(input),site=await inspect(x.website),observedAt=at(),observations=websiteObservations(site,x.website,observedAt),report=buildV34Report(x,site);
  if(!report.quality.passed)throw Error('Audit quality gate failed');
  const title='Lead Conversion Audit - '+x.company;
  const sections=[...report.sections,{title:'Dated observation register',body:observations.map(o=>o.id+' | '+o.category+' | '+o.check+'\n'+o.evidence+'\nSource: '+o.source+'\nChecked: '+o.observedAt+'\nNext: '+o.next+'\n'+o.limitation).join('\n\n')},{title:'Scope and revision policy',body:'This fixed-price report covers supplied business-process inputs and one accessible public HTML page. It includes editable response drafts, priorities and an implementation checklist. It does not inspect a private CRM, test calls, measure conversions or promise increased revenue. Request correction of factual or rendering errors through support using the order reference. Implementation and additional pages require separately agreed scope. Refunds require individual review under the applicable service terms.'}];
  const r=await serviceDocument({title,sections,sources:[x.website+' | static HTML inspected '+observedAt+' | '+(site.sourceSha256?'SHA-256 '+site.sourceSha256:'source body hash unavailable'), 'Business-process inputs: CUSTOMER_SELF_REPORT; not independently verified.'],notice:'Customer-specific digital analysis. Review opportunities are hypotheses, not proven revenue losses.',createdAt:observedAt});
  const id=digest(r.pdf).slice(0,32),record={id,intake:x,sections,observations,manifest:r.manifest,pdf:r.pdf.toString('base64'),zip:r.zip.toString('base64'),markdown:r.markdown,zipSha256:r.zipSha256,status:'PREPARED_NOT_PAID',createdAt:observedAt};
  await mutate(s=>{if(!s.drafts[id]&&Object.keys(s.drafts).length>=100)throw Error('Audit storage capacity reached');s.drafts[id]=record});
  return {id,manifest:r.manifest,sections,observations};
 }
 async function get(id){if(!/^[a-f0-9]{32}$/.test(id||''))throw Error('Audit package missing');const d=(await read()).drafts[id];if(!d)throw Error('Audit package missing');return d}
 async function bind(orderId){
  const o=(await orders()).orders?.[orderId];if(!o||o.product!==V34_SKU||o.status!=='COMPLETED'||!o.captureId||o.refunds?.length)throw Error('Completed audit order required');
  const d=await get(o.auditPackageId);
  await mutate(s=>{const p=s.drafts[d.id];if(p.orderId&&(p.orderId!==orderId||p.captureId!==o.captureId))throw Error('Audit package already bound');p.orderId=orderId;p.captureId=o.captureId;p.status='PAID_PACKAGE_BOUND'});
  return {id:d.id,sha256:d.manifest.pdfSha256};
 }
 function matches(token,stored){return typeof stored==='string'&&/^[a-f0-9]{48}$/.test(stored)&&timingSafeEqual(Buffer.from(token,'hex'),Buffer.from(stored,'hex'))}
 async function checked(token){
  if(typeof token!=='string'||!/^[a-f0-9]{48}$/.test(token))throw Error('Delivery unavailable');
  const o=Object.values((await orders()).orders||{}).find(o=>matches(token,o.fulfillment?.token));
  if(!o||o.product!==V34_SKU||o.status!=='COMPLETED'||!o.captureId||o.refunds?.length||o.currency!=='USD'||String(o.amount)!=='99.00'&&Number(o.amount)!==99||Number(o.capturedAmount)!==99)throw Error('Delivery unavailable');
  if(!verify)throw Error('Provider verification unavailable');const remote=await verify(o);
  if(remote.orderId!==o.id||remote.capture?.id!==o.captureId||remote.capture.status!=='COMPLETED'||remote.capture.amount?.currency_code!=='USD'||Number(remote.capture.amount.value)!==99)throw Error('Provider capture mismatch');
  const d=await get(o.auditPackageId);if(d.orderId!==o.id||d.captureId!==o.captureId)throw Error('Audit binding mismatch');
  return {o,d};
 }
 async function review(id,input){const d=await get(id);if(input.sha256!==d.manifest.pdfSha256||input.allPagesReviewed!==true||input.factsChecked!==true||typeof input.reviewer!=='string'||!input.reviewer.trim()||input.reviewer.length>120)throw Error('Exact document review required');await mutate(s=>{s.drafts[id].review={sha256:d.manifest.pdfSha256,reviewer:input.reviewer.trim(),at:at()};if(input.releaseApproved===true)s.releaseReview={id,sha256:d.manifest.pdfSha256,at:at()}});return {id,reviewed:true}}
 async function status(token){const {o,d}=await checked(token);return {title:d.manifest.title,sha256:d.manifest.pdfSha256,pages:d.manifest.pages,scope:'Supplied inputs and one static public page',acceptedAt:o.auditDelivery?.acceptedAt||null,ownerReviewed:d.review?.sha256===d.manifest.pdfSha256,bankSettlementVerified:false}}
 async function artifact(token,format='pdf'){
  if(!['pdf','zip','md'].includes(format))throw Error('Unknown format');const {o,d}=await checked(token);
  if(d.review?.sha256!==d.manifest.pdfSha256)throw Error('Owner review pending');
  const bytes=format==='md'?Buffer.from(d.markdown):Buffer.from(d[format],'base64'),expected=format==='pdf'?d.manifest.pdfSha256:format==='zip'?d.zipSha256:d.manifest.editableSha256;
  if(digest(bytes)!==expected)throw Error('Artifact integrity failure');
  await mutateOrders(s=>{const current=s.orders[o.id];if(current.captureId!==o.captureId||current.refunds?.length||current.auditPackageId!==d.id)throw Error('Order changed');current.auditDelivery={...current.auditDelivery,downloadPreparedAt:at(),sha256:d.manifest.pdfSha256}});
  return {bytes,filename:'ultron-audit-'+d.id+'.'+format,contentType:format==='pdf'?'application/pdf':format==='zip'?'application/zip':'text/markdown; charset=utf-8'};
 }
 async function accept(token,input){
  const {o,d}=await checked(token);if(d.review?.sha256!==d.manifest.pdfSha256||input.accepted!==true||input.sha256!==d.manifest.pdfSha256)throw Error('Exact artifact acceptance required');
  await mutateOrders(s=>{const current=s.orders[o.id];if(current.captureId!==o.captureId||current.refunds?.length||current.auditPackageId!==d.id||current.auditDelivery?.sha256!==d.manifest.pdfSha256||!current.auditDelivery.downloadPreparedAt)throw Error('Download preparation and unchanged order required');current.auditDelivery.acceptedAt??=at()});return status(token);
 }
 async function salesReady(){const s=await read(),r=s.releaseReview,d=r&&s.drafts[r.id];return Boolean(d&&d.review?.sha256===r.sha256&&d.manifest.pdfSha256===r.sha256)}
 async function list(){return Object.values((await read()).drafts).map(({id,manifest,status,orderId,createdAt,review})=>({id,manifest,status,orderId,createdAt,review}))}
 async function ownerArtifact(id,format='pdf'){const d=await get(id);if(!['pdf','zip','md'].includes(format))throw Error('Unknown format');const bytes=format==='md'?Buffer.from(d.markdown):Buffer.from(d[format],'base64');if(digest(bytes)!==(format==='pdf'?d.manifest.pdfSha256:format==='zip'?d.zipSha256:d.manifest.editableSha256))throw Error('Artifact integrity failure');return {bytes,filename:'audit-preview-'+id+'.'+format,contentType:format==='pdf'?'application/pdf':format==='zip'?'application/zip':'text/markdown; charset=utf-8'}}
 return {prepare,get,bind,status,artifact,accept,list,ownerArtifact,review,salesReady};
}
