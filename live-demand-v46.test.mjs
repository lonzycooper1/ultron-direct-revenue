import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fetchPublicDemand,createLiveDemandListener} from './live-demand-v46.mjs';
import {createDemandAssetFactory,demandPrompt,verifyMarkdown} from './demand-asset-v46.mjs';
import {confirmCapturedOrderForDelivery} from './payment-runtime.mjs';
import {issueCatalogCheckout} from './paypal-business-billing.mjs';
import {createApp} from './server.js';

const time=Date.parse('2026-10-18T23:00:00Z');
const githubUrl='https://github.com/community/example/issues/123';
const sample={id:'a'.repeat(32),title:'How can local services automate appointment reminders?',
 problem:'Every appointment in our small practice is tracked manually and follow ups keep getting delayed while customers wait.',
 source:'github-issues',url:githubUrl,sourceCreatedAt:'2026-10-18T20:00:00Z',classification:'UNVERIFIED_PUBLIC_DISCUSSION_NOT_BUYER_INTENT'};
const response=data=>({ok:true,headers:new Headers({'content-type':'application/json'}),
 arrayBuffer:async()=>new TextEncoder().encode(JSON.stringify(data)).buffer});
test('Live discovery accepts public API sources but never labels a poster a paying customer',async()=>{
 const calls=[];
 const request=async url=>{
  calls.push(url);
  if(url.startsWith('https://hn.algolia.com/'))return response({hits:[{
   objectID:'21333333',title:sample.title,story_text:sample.problem,created_at:'2026-10-18T20:00:00Z'}]});
  if(url.startsWith('https://api.github.com/'))return response({items:[{
   title:sample.title,body:sample.problem,html_url:githubUrl,created_at:'2026-10-18T20:00:00Z'}]});
  throw Error('Untrusted destination');
 };
 const result=await fetchPublicDemand({request,now:time});
 assert.equal(calls.length,2);
 assert.equal(result.signals.length,2);
 assert.ok(result.signals.every(x=>x.permissionToContact===false&&x.independentlyVerifiedBuyer===false));
});
test('Listener enforces persisted 30 minute limit and exactly once processing within interval',async()=>{
 let state={lastStartedAt:null,signals:{},sourceStatus:'NOT_RUN'},checks=0;
 const listener=createLiveDemandListener({env:{ULTRON_LIVE_DEMAND_ENABLED:'true'},clock:()=>time,
  read:async()=>structuredClone(state),
  mutate:async fn=>{const next=structuredClone(state);await fn(next);state=next},
  search:async()=>{checks++;return {signals:[sample],errors:[]}}});
 const first=await listener.poll(),second=await listener.poll();
 assert.equal(first.status,'COMPLETED');assert.equal(second.status,'COOLDOWN');assert.equal(checks,1);
 assert.equal((await listener.snapshot(true)).signalCount,1);
});
test('Listener fails closed on disabled mode',async()=>{
 const listener=createLiveDemandListener({env:{}});
 assert.equal((await listener.poll()).status,'DISABLED');
});
test('Demand factory writes uniquely attributed, SHA256-checked original Markdown to private disk',async()=>{
 const folder=await mkdtemp(path.join(tmpdir(),'ultron-demand-v46-'));
 let state={assets:{}},enqueued;
 const demand={snapshot:async()=>({signals:[sample]})};
 const queue=async job=>{enqueued=job;return {id:'job_1'}};
 const markdown='# Original Booking Workflow\n\n'+('Implementation checklists and specific workflow steps for local service scheduling. '.repeat(35))+
  '\n## Practical Steps\nDocument the owner and response flow.\n## QA Checks\nVerify sample reminders.\n## Privacy and Support\nLimit personal data.\nSource: '+githubUrl;
 const factory=createDemandAssetFactory({env:{ULTRON_LIVE_DEMAND_ENABLED:'true',ULTRON_DEMAND_FACTORY_ENABLED:'true',
  ULTRON_DEMAND_ARTIFACT_DIR:folder},clock:()=>time,dir:env=>env.ULTRON_DEMAND_ARTIFACT_DIR,
  read:async()=>structuredClone(state),mutate:async fn=>{const next=structuredClone(state);await fn(next);state=next},
  queue,demand,jobs:async()=>({jobs:[{id:'job_1',status:'DRAFT_READY',result:{text:markdown}}]})});
 try{
  assert.equal((await factory.schedule()).status,'DRAFT_JOB_QUEUED');
  assert.ok(enqueued.prompt.includes(githubUrl));
  assert.equal((await factory.reconcile()).created,1);
  const x=await factory.getArtifact(sample.id);
  assert.equal(x.bytes.toString('utf8'),markdown);
  assert.equal((await factory.status()).ready,1);
  assert.equal((await factory.schedule()).status,'NO_NEW_VERIFIED_PUBLIC_SOURCE_OR_QUOTA');
 }finally{await rm(folder,{recursive:true,force:true})}
});
test('Guide validator rejects short/inaccurately attributed model output',()=>{
 assert.throws(()=>verifyMarkdown('# Hi',sample),/minimum actionable content/);
 assert.ok(demandPrompt(sample).includes('not a verified paid order'));
});
test('Confirmed provider capture must match ledger amount and buyer email',async()=>{
 const order={id:'ORDER12345',status:'COMPLETED',captureId:'CAPTURE1',amount:'99.00',currency:'USD'};
 const remote={purchase_units:[{payments:{captures:[{id:'CAPTURE1',status:'COMPLETED',amount:{currency_code:'USD',value:'99.00'}}]}}],
  payer:{email_address:'buyer@example.com'}};
 const ok=await confirmCapturedOrderForDelivery(async()=>remote,order);
 assert.equal(ok.email,'buyer@example.com');assert.equal(ok.bankSettlementVerified,false);
 await assert.rejects(confirmCapturedOrderForDelivery(async()=>({
  ...remote,purchase_units:[{payments:{captures:[{id:'CAPTURE1',status:'COMPLETED',amount:{currency_code:'USD',value:'9.00'}}]}}]
 }),order),/mismatch/);
});
test('Real PayPal Orders helper uses authoritative catalog product price',async()=>{
 let seen=null;
 const paypal=async(endpoint,method,body,requestId)=>{
  seen={endpoint,method,body,requestId};
  return {id:'ORDER12345',status:'CREATED',links:[{rel:'payer-action',href:'https://www.paypal.com/checkoutnow?token=ORDER12345'}]};
 };
 const result=await issueCatalogCheckout(paypal,{product:{id:'missed-lead-recovery-99',price:99,name:'Missed Lead',storeId:'local'},
  returnUrl:'https://merchant.example/paypal/return',cancelUrl:'https://merchant.example/paypal/cancel',requestId:'client-unique'});
 assert.equal(seen.endpoint,'/v2/checkout/orders');assert.equal(seen.body.purchase_units[0].amount.value,'99.00');
 assert.equal(result.orderId,'ORDER12345');
 assert.ok(result.approvalUrl.includes('paypal.com'));
});

test('Live PayPal receiver rejects missing signatures before provider calls',async()=>{
 const server=createApp().listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 try{
  const r=await fetch('http://127.0.0.1:'+server.address().port+'/api/checkout-webhook',{
   method:'POST',headers:{'content-type':'application/json'},body:'{}'});
  assert.equal(r.status,400);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
