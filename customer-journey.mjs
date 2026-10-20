import {createHash,timingSafeEqual} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {ledger} from './ledger-store.mjs';
import {printFactory} from './print-products.mjs';
import {qualifyLead} from './reference-workflows.mjs';
const KEY='customer-journey-v1',fresh=()=>({inquiries:{},proposals:{},audit:[]});
const hash=x=>createHash('sha256').update(x).digest('hex');
const text=(x,name,max)=>{if(typeof x!=='string'||!x.trim()||x.length>max)throw Error('Invalid '+name);return x.trim()};
const cents=x=>{if(!['number','string'].includes(typeof x)||!/^\d+(\.\d{1,2})?$/.test(String(x)))throw Error('Invalid monetary evidence');const n=Math.round(Number(x)*100);if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid monetary evidence');return n};
const publicProposal=p=>{const {accessHash,...rest}=p;return rest};
export function createCustomerJourney({read=()=>getJson(KEY,fresh()),mutate=fn=>mutateJson(KEY,fresh(),fn),orders=ledger,products=printFactory,catalog,verify,clock=Date.now}={}){
 const at=()=>new Date(clock()).toISOString(),audit=(s,type,id)=>{s.audit.unshift({type,id,at:at()});s.audit=s.audit.slice(0,1000)};
 async function inquiry(x={}){
  const requestId=text(x.requestId,'requestId',80);if(!/^[-a-zA-Z0-9_]+$/.test(requestId))throw Error('Invalid requestId');
  const email=text(x.email,'email',254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Invalid email');
  const problem=text(x.problem,'problem',3000),source=text(x.source,'source reference',500),consentReference=text(x.consentReference,'consent reference',500);
  const qualification=qualifyLead({...x.qualification,source,consent:x.consent,asOf:x.asOf});
  const evidence={email,problem,source,consentReference,qualification},digest=hash(JSON.stringify(evidence)),id=hash(requestId).slice(0,32);
  await mutate(s=>{if(s.inquiries[id]){if(s.inquiries[id].digest!==digest)throw Error('Request identity conflict');return}if(Object.keys(s.inquiries).length>=250)throw Error('Journey capacity reached');s.inquiries[id]={id,...evidence,digest,createdAt:at(),provenance:'OWNER_SUPPLIED_NOT_INDEPENDENTLY_VERIFIED'};audit(s,'INQUIRY_RECORDED',id)});return (await read()).inquiries[id];
 }
 async function proposal(x={}){
  const s=await read(),lead=s.inquiries[x.inquiryId];if(!lead||lead.qualification.consent!=='GRANTED'||lead.qualification.missing.length)throw Error('Consented complete inquiry required');
  const product=(await products.list()).find(p=>p.id===x.artifactId);if(product?.status!=='OWNER_REVIEWED_NOT_PUBLISHED'||product.review?.pdfSha256!==product.manifest.pdfSha256)throw Error('Exact reviewed artifact required');
  await products.artifact(product.id);
  const offer=catalog?.(x.catalogProductId);if(!offer)throw Error('Existing catalog product required');
  const priceCents=cents(offer.price);if(priceCents<=0||priceCents>9900)throw Error('Eligible digital catalog price required');
  const scopeReference=text(x.scopeReference,'customer scope agreement reference',500),scope=text(x.scope,'agreed scope',2000);
  const id=hash(JSON.stringify({inquiryId:lead.id,artifactId:product.id,sha:product.manifest.pdfSha256,catalogProductId:offer.id,priceCents,scopeReference,scope})).slice(0,32);
  await mutate(z=>{if(z.proposals[id])return;if(Object.keys(z.proposals).length>=250)throw Error('Journey capacity reached');z.proposals[id]={id,inquiryId:lead.id,artifactId:product.id,artifactSha256:product.manifest.pdfSha256,title:product.manifest.title,catalogProductId:offer.id,priceCents,currency:'USD',scopeReference,scope,status:'AWAITING_VERIFIED_EXISTING_ORDER',createdAt:at(),checkoutPath:'/buy?product='+encodeURIComponent(offer.id),agreementEvidence:'OWNER_RECORD_NOT_INDEPENDENTLY_VERIFIED'};audit(z,'PROPOSAL_PREPARED',id)});return publicProposal((await read()).proposals[id]);
 }
 async function checked(p){
  const o=(await orders()).orders?.[p.orderId];if(!o||o.status!=='COMPLETED'||!o.captureId||o.product!==p.catalogProductId||o.currency!=='USD'||cents(o.amount)!==p.priceCents||cents(o.capturedAmount)!==p.priceCents)throw Error('Verified matching capture required');
  if(p.captureId&&p.captureId!==o.captureId)throw Error('Provider capture identity mismatch');
  if(o.refunds?.length)throw Error('Refunded or unresolved order requires review');
  if(!/^[a-f0-9]{48}$/.test(o.fulfillment?.token||''))throw Error('Trusted delivery token required');
  if(!verify)throw Error('Provider verification unavailable');const remote=await verify(o);
  if(remote.orderId!==o.id||remote.capture?.id!==o.captureId||remote.capture?.status!=='COMPLETED'||remote.capture.amount?.currency_code!=='USD'||cents(remote.capture.amount.value)!==p.priceCents)throw Error('Provider capture identity mismatch');
  const lead=(await read()).inquiries[p.inquiryId];if(remote.email?.toLowerCase()!==lead?.email)throw Error('Provider buyer identity mismatch');
  const product=(await products.list()).find(a=>a.id===p.artifactId);if(product?.review?.pdfSha256!==p.artifactSha256||product.manifest.pdfSha256!==p.artifactSha256)throw Error('Artifact changed since agreement');
  return o;
 }
 async function bind(x={}){
  const p=(await read()).proposals[x.proposalId];if(!p)throw Error('Proposal not found');const orderId=text(x.orderId,'order ID',160),o=await checked({...p,orderId});
  await mutate(s=>{const p=s.proposals[x.proposalId];if(p.orderId&&p.orderId!==orderId)throw Error('Order binding conflict');if(Object.values(s.proposals).some(z=>z.id!==p.id&&z.orderId===orderId))throw Error('Order already bound');p.orderId=orderId;p.captureId=o.captureId;p.accessHash=hash(o.fulfillment.token);p.status=p.acceptedAt?'CUSTOMER_ACCEPTED':'PAYMENT_REVERIFIED';p.paymentVerifiedAt=at();audit(s,'PAYMENT_REVERIFIED',p.id)});return publicProposal((await read()).proposals[p.id]);
 }
 async function customer(token){
  if(typeof token!=='string'||!/^[a-f0-9]{48}$/.test(token))throw Error('Delivery unavailable');
  const digest=hash(token),p=Object.values((await read()).proposals).find(p=>p.accessHash&&timingSafeEqual(Buffer.from(p.accessHash,'hex'),Buffer.from(digest,'hex')));if(!p)throw Error('Delivery unavailable');const o=await checked(p);if(hash(o.fulfillment.token)!==digest)throw Error('Delivery unavailable');return p;
 }
 async function status(token){const p=await customer(token);return {id:p.id,title:p.title,scope:p.scope,status:p.status,sha256:p.artifactSha256,acceptedAt:p.acceptedAt||null,bankSettlementVerified:false}}
 async function download(token,format='pdf'){
  const p=await customer(token),artifact=await products.artifact(p.artifactId,format);
  await mutate(s=>{const current=s.proposals[p.id];current.downloadPreparedAt=at();current.downloadPreparedSha256=p.artifactSha256;audit(s,'ARTIFACT_DOWNLOAD_PREPARED',p.id)});
  return artifact;
 }
 async function accept(token,x={}){
  const p=await customer(token);if(x.accepted!==true||x.sha256!==p.artifactSha256)throw Error('Exact artifact acceptance required');
  await mutate(s=>{const current=s.proposals[p.id];if(current.downloadPreparedSha256!==p.artifactSha256)throw Error('Download must be prepared before acceptance');if(!current.acceptedAt){current.acceptedAt=at();current.status='CUSTOMER_ACCEPTED';audit(s,'CUSTOMER_ACCEPTANCE_RECORDED',p.id)}});return status(token);
 }
 async function snapshot(){
  const s=await read(),l=await orders();return {inquiries:Object.values(s.inquiries),proposals:Object.values(s.proposals).map(p=>{
   const o=l.orders?.[p.orderId];let capture=null,fees=null,costs=null;try{if(o?.status==='COMPLETED')capture=cents(o.capturedAmount);if(o?.paypalFeeSource==='PROVIDER')fees=cents(o.paypalFeeUsd);if(o?.costReview?.complete===true)costs=cents(o.costReview.amountUsd)}catch{}
   return {...publicProposal(p),finance:{capturedCents:capture,providerFeeCents:fees,reviewedCostCents:costs,contributionCents:capture!==null&&fees!==null&&costs!==null&&!o?.refunds?.length?capture-fees-costs:null,settlementRecorded:Boolean(o?.settlement?.bankReference&&o?.settlement?.payoutReference),bankSettlementIndependentlyVerified:false,independentBuyerVerified:o?.independentBuyerVerified===true}};
  }),audit:s.audit};
 }
 return {inquiry,proposal,bind,status,download,accept,snapshot};
}
