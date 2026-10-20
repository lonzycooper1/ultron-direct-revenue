import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from 'node:http';
import {createCustomerJourney} from './customer-journey.mjs';import {customerJourneyRoute} from './customer-journey-http.mjs';import {createPrintFactory} from './print-products.mjs';import {confirmCapturedOrderForDelivery} from './payment-runtime.mjs';import {getJson,mutateJson} from './state-store.mjs';import {randomUUID} from 'node:crypto';
const input={email:'buyer@example.test',problem:'A printable workflow journal',source:'Synthetic fixture inquiry',consent:'GRANTED',consentReference:'Fixture consent record',asOf:'2026-10-20T12:00:00Z',requestId:'fixture-inquiry',qualification:{problemConfirmed:true,decisionMaker:true,budgetConfirmed:true,timelineConfirmed:true}};
function memory(seed){let s=seed;return {read:async()=>structuredClone(s),mutate:async fn=>{const next=structuredClone(s);await fn(next);s=next}}}
async function fixture(store=memory({inquiries:{},proposals:{},audit:[]})){
 const products=createPrintFactory(memory({products:{}})),p=await products.create({type:'journal',pages:3,title:'Fixture journal',audience:'Synthetic customer',source:'Original fixture',requestId:'fixture-print'});
 await products.review(p.id,{reviewer:'Synthetic test assertion',pdfSha256:p.manifest.pdfSha256,allPagesReviewed:true,rightsConfirmed:true});
 const order={id:'ORDER-FIXTURE',status:'COMPLETED',product:'fixture-guide',currency:'USD',amount:'29.00',capturedAmount:29,captureId:'CAPTURE-FIXTURE',fulfillment:{token:'a'.repeat(48)}};
 let providerFail=false,providerEmail=input.email;const remote=()=>({purchase_units:[{payments:{captures:[{id:order.captureId,status:'COMPLETED',amount:{value:'29.00',currency_code:'USD'}}]}}],payer:{email_address:providerEmail}});
 const options={...store,orders:async()=>({orders:{[order.id]:structuredClone(order)}}),products,catalog:id=>id==='fixture-guide'?{id,price:29}:null,verify:o=>confirmCapturedOrderForDelivery(async()=>{if(providerFail)throw Error('Fixture outage');return remote()},o)};const j=createCustomerJourney(options);
 const inquiry=await j.inquiry(input),proposal=await j.proposal({inquiryId:inquiry.id,artifactId:p.id,catalogProductId:'fixture-guide',scope:'Original journal PDF and ZIP',scopeReference:'Fixture scope agreement'});
 return {j,options,products,p,inquiry,proposal,order,setFailure:v=>providerFail=v,setEmail:v=>providerEmail=v};
}
test('isolated technical journey preserves provenance, exact artifacts, acceptance and unknown profit',async()=>{
 const f=await fixture();assert.equal((await f.j.inquiry(input)).id,f.inquiry.id);
 await assert.rejects(f.j.inquiry({...input,problem:'Changed inquiry'}),/identity/);
 const bound=await f.j.bind({proposalId:f.proposal.id,orderId:f.order.id});assert.equal(bound.status,'PAYMENT_REVERIFIED');assert.equal('accessHash' in bound,false);
 await assert.rejects(f.j.accept(f.order.fulfillment.token,{accepted:true,sha256:f.proposal.artifactSha256}),/Download/);
 const a=await f.j.download(f.order.fulfillment.token,'pdf');assert.equal(a.bytes.subarray(0,4).toString(),'%PDF');
 await assert.rejects(f.j.accept(f.order.fulfillment.token,{accepted:true,sha256:'different'}),/Exact/);
 const accepted=await f.j.accept(f.order.fulfillment.token,{accepted:true,sha256:f.proposal.artifactSha256});assert.equal(accepted.status,'CUSTOMER_ACCEPTED');assert.equal(accepted.bankSettlementVerified,false);
 const s=await f.j.snapshot();assert.equal(s.proposals[0].finance.contributionCents,null);assert.equal(s.proposals[0].finance.independentBuyerVerified,false);
 f.order.paypalFeeSource='PROVIDER';f.order.paypalFeeUsd=0;f.order.costReview={complete:true,amountUsd:0};assert.equal((await f.j.snapshot()).proposals[0].finance.contributionCents,2900);
 assert.equal((await f.j.accept(f.order.fulfillment.token,{accepted:true,sha256:f.proposal.artifactSha256})).acceptedAt,accepted.acceptedAt);
});
test('provider failure, buyer mismatch, refunds and changed captures block delivery',async()=>{
 const f=await fixture();f.setEmail('someone-else@example.test');await assert.rejects(f.j.bind({proposalId:f.proposal.id,orderId:f.order.id}),/buyer identity/);f.setEmail(input.email);
 await f.j.bind({proposalId:f.proposal.id,orderId:f.order.id});f.setFailure(true);await assert.rejects(f.j.download(f.order.fulfillment.token),/outage/);f.setFailure(false);
 f.order.refunds=[{amountUsd:1,source:'PAYPAL_SIGNED_EVENT'}];await assert.rejects(f.j.download(f.order.fulfillment.token),/Refunded/);f.order.refunds=[];
 f.order.captureId='REPLACED';await assert.rejects(f.j.download(f.order.fulfillment.token),/capture identity/);
 await assert.rejects(f.j.status('b'.repeat(48)),/unavailable/);
});
test('missing consent or incomplete qualification cannot become a proposal',async()=>{
 const f=await fixture(),lead=await f.j.inquiry({...input,requestId:'no-consent',consent:'UNKNOWN'});
 await assert.rejects(f.j.proposal({inquiryId:lead.id,artifactId:f.p.id,catalogProductId:'fixture-guide',scope:'scope',scopeReference:'reference'}),/Consented/);
});
test('HTTP denies unauthorized owner access and returns private customer bytes',async()=>{
 const f=await fixture();await f.j.bind({proposalId:f.proposal.id,orderId:f.order.id});const app=createServer(async(req,res)=>{const json=(s,d)=>{res.writeHead(s,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(d))};if(!await customerJourneyRoute(req,res,new URL(req.url,'http://local'),{authorized:()=>req.headers.authorization==='Bearer fixture-owner',json,journey:f.j}))json(404,{})});await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 try{assert.equal((await fetch(base+'/api/customer-journey/owner')).status,403);assert.equal((await fetch(base+'/api/customer-journey/buyer')).status,403);const r=await fetch(base+'/api/customer-journey/buyer/artifact',{headers:{authorization:'Bearer '+f.order.fulfillment.token}});assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'private,no-store');assert.equal(Buffer.from(await r.arrayBuffer()).subarray(0,4).toString(),'%PDF')}
 finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
test('PostgreSQL restart retains acceptance and serializes conflicting order bindings',async()=>{
 const key='journey-fixture-'+randomUUID(),seed=()=>({inquiries:{},proposals:{},audit:[]}),store={read:()=>getJson(key,seed()),mutate:fn=>mutateJson(key,seed(),fn)},f=await fixture(store);
 const p2=await f.j.proposal({inquiryId:f.inquiry.id,artifactId:f.p.id,catalogProductId:'fixture-guide',scope:'Another scope',scopeReference:'Another fixture agreement'});
 const results=await Promise.allSettled([f.proposal.id,p2.id].map(proposalId=>f.j.bind({proposalId,orderId:f.order.id})));assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 await f.j.download(f.order.fulfillment.token);await f.j.accept(f.order.fulfillment.token,{accepted:true,sha256:f.proposal.artifactSha256});
 const restarted=createCustomerJourney(f.options);assert.equal((await restarted.status(f.order.fulfillment.token)).status,'CUSTOMER_ACCEPTED');
});
