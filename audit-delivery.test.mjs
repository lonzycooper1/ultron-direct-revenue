import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from 'node:http';import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';import {randomUUID} from 'node:crypto';
import {createAuditDelivery,websiteObservations} from './audit-delivery.mjs';import {auditDeliveryRoute} from './audit-delivery-http.mjs';import {serviceDocument} from './service-document.mjs';import {inspectHtmlV34,V34_SKU} from './ultron-autonomous-revenue-v34.mjs';import {getJson,mutateJson} from './state-store.mjs';
const input={authorizationConfirmed:true,company:'Synthetic Plumbing',website:'https://example.org/',industry:'plumbing',monthlyLeads:40,missedPercent:10,responseMinutes:90,bookingMethod:'phone',followup:'manual'};
const html='<title>Fixture business</title><h1>Contact us</h1><form></form><a href="tel:555">Phone</a>Request a quote';
function memory(seed){let s=seed;return {read:async()=>structuredClone(s),mutate:async fn=>{const n=structuredClone(s);await fn(n);s=n}}}
async function fixture(store=memory({drafts:{}})){
 const orderStore=memory({orders:{}});let fail=false,calls=0;const options={...store,orders:orderStore.read,mutateOrders:orderStore.mutate,inspect:async()=>inspectHtmlV34(html),verify:async o=>{calls++;if(fail)throw Error('Fixture outage');return {orderId:o.id,capture:{id:'CAPTURE-FIXTURE',status:'COMPLETED',amount:{value:'99.00',currency_code:'USD'}}}}};const d=createAuditDelivery(options),p=await d.prepare(input),token='a'.repeat(48),o={id:'ORDER-FIXTURE',status:'COMPLETED',product:V34_SKU,currency:'USD',amount:'99.00',capturedAmount:99,captureId:'CAPTURE-FIXTURE',auditPackageId:p.id,fulfillment:{token}};
 await orderStore.mutate(s=>s.orders[o.id]=o);await d.bind(o.id);return {d,p,token,options,store,orderStore,setFailure:x=>fail=x,calls:()=>calls};
}
test('five observations do not manufacture five defects and inaccessible evidence blocks preparation',async()=>{
 const all=websiteObservations(inspectHtmlV34(html),input.website,new Date().toISOString());assert.equal(all.length,5);assert.equal(all.filter(x=>x.category==='REVIEW_OPPORTUNITY').length,0);assert.ok(all.every(x=>x.limitation.includes('does not establish')));
 await assert.rejects(createAuditDelivery({inspect:async()=>({status:'UNAVAILABLE'})}).prepare(input),/evidence unavailable/);
});
test('real PDF, editable source and ZIP preserve text, provenance and page count',async()=>{
 const f=await fixture(),dir=await mkdtemp(join(tmpdir(),'ultron-audit-'));
 try{const a=await f.d.ownerArtifact(f.p.id),z=await f.d.ownerArtifact(f.p.id,'zip');await writeFile(join(dir,'report.pdf'),a.bytes);await writeFile(join(dir,'report.zip'),z.bytes);
 const info=execFileSync('pdfinfo',[join(dir,'report.pdf')],{encoding:'utf8'});assert.match(info,new RegExp('Pages:\\s+'+f.p.manifest.pages+'\\b'));execFileSync('pdftotext',[join(dir,'report.pdf'),join(dir,'report.txt')]);const t=await readFile(join(dir,'report.txt'),'utf8');assert.match(t,/Synthetic Plumbing/);assert.match(t,/CUSTOMER_SELF_REPORT/);assert.match(t,/Dated observation register/);assert.match(t,/SHA-256/);assert.match(execFileSync('unzip',['-t',join(dir,'report.zip')],{encoding:'utf8'}),/No errors/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('owner review, fresh PayPal verification and exact downloaded version are required for acceptance',async()=>{
 const f=await fixture();assert.equal(await f.d.salesReady(),false);assert.equal((await f.d.status(f.token)).ownerReviewed,false);await assert.rejects(f.d.artifact(f.token),/review pending/);await assert.rejects(f.d.review(f.p.id,{sha256:'other',allPagesReviewed:true,factsChecked:true,reviewer:'Fixture'}),/review required/);
 await f.d.review(f.p.id,{sha256:f.p.manifest.pdfSha256,allPagesReviewed:true,factsChecked:true,reviewer:'Fixture verification',releaseApproved:true});assert.equal(await f.d.salesReady(),true);
 await assert.rejects(f.d.accept(f.token,{accepted:true,sha256:f.p.manifest.pdfSha256}),/Download/);assert.equal((await f.d.artifact(f.token)).bytes.subarray(0,4).toString(),'%PDF');
 await assert.rejects(f.d.accept(f.token,{accepted:true,sha256:'wrong'}),/Exact/);const a=await f.d.accept(f.token,{accepted:true,sha256:f.p.manifest.pdfSha256});assert.ok(a.acceptedAt);assert.equal(a.bankSettlementVerified,false);assert.equal((await createAuditDelivery(f.options).accept(f.token,{accepted:true,sha256:f.p.manifest.pdfSha256})).acceptedAt,a.acceptedAt);assert.ok(f.calls()>=6);
});
test('provider outages, wrong tokens, refunds, changed capture and tampering fail closed',async()=>{
 const f=await fixture();await f.d.review(f.p.id,{sha256:f.p.manifest.pdfSha256,allPagesReviewed:true,factsChecked:true,reviewer:'Fixture'});
 f.setFailure(true);await assert.rejects(f.d.artifact(f.token),/outage/);f.setFailure(false);await assert.rejects(f.d.status('b'.repeat(48)),/unavailable/);
 await f.orderStore.mutate(s=>s.orders['ORDER-FIXTURE'].refunds=[{id:'REFUND'}]);await assert.rejects(f.d.artifact(f.token),/unavailable/);await f.orderStore.mutate(s=>{s.orders['ORDER-FIXTURE'].refunds=[];s.orders['ORDER-FIXTURE'].captureId='REPLACED'});await assert.rejects(f.d.artifact(f.token),/mismatch/);
 await f.orderStore.mutate(s=>s.orders['ORDER-FIXTURE'].captureId='CAPTURE-FIXTURE');await f.store.mutate(s=>s.drafts[f.p.id].pdf=Buffer.from('tampered').toString('base64'));await assert.rejects(f.d.artifact(f.token),/integrity/);
});
test('HTTP owner authentication precedes storage; customer artifacts are private',async()=>{
 const f=await fixture();let reads=0;const delivery={...f.d,list:async()=>{reads++;return f.d.list()}};const app=createServer(async(req,res)=>{const json=(n,x)=>{res.writeHead(n,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(x))};if(!await auditDeliveryRoute(req,res,new URL(req.url,'http://local'),{authorized:()=>req.headers.authorization==='Bearer fixture-owner',json,delivery}))json(404,{})});await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 try{assert.equal((await fetch(base+'/api/audit-delivery/owner')).status,403);assert.equal(reads,0);const r=await fetch(base+'/api/audit-delivery/owner/artifact?id='+f.p.id,{headers:{authorization:'Bearer fixture-owner'}});assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'private,no-store');assert.equal(r.headers.get('referrer-policy'),'no-referrer');assert.equal((await fetch(base+'/api/audit-delivery/artifact')).status,403)}finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
test('isolated PostgreSQL retains review and rejects conflicting capture binding after restart',async()=>{
 const key='audit-fixture-'+randomUUID(),seed=()=>({drafts:{}}),f=await fixture({read:()=>getJson(key,seed()),mutate:fn=>mutateJson(key,seed(),fn)});await f.d.review(f.p.id,{sha256:f.p.manifest.pdfSha256,allPagesReviewed:true,factsChecked:true,reviewer:'Fixture'});
 assert.equal((await createAuditDelivery(f.options).status(f.token)).ownerReviewed,true);await f.orderStore.mutate(s=>s.orders.OTHER={...s.orders['ORDER-FIXTURE'],id:'OTHER'});await assert.rejects(f.d.bind('OTHER'),/already bound/);
});
test('document factory rejects unsupported glyphs rather than silently corrupting customer text',async()=>{await assert.rejects(serviceDocument({title:'Example',sections:[{title:'Source',body:'漢字'},{title:'Scope',body:'Fixture'}]}),/glyph/)});
