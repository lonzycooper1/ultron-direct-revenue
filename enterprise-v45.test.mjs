import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {verifyStripeEvent} from './payment-runtime.mjs';
import {turnSignalIntoBrief,createEnterpriseCycle} from './enterprise-cycle-v45.mjs';
import {smtpReadiness,eligibleDigitalDelivery,deliverVerifiedDigitalOrder} from './enterprise-mail-v45.mjs';
import {enqueueEnterpriseJob,claimEnterpriseJob,finishEnterpriseJob,appendEnterpriseAudit,enterpriseStoreHealth} from './enterprise-store-v45.mjs';
import {createEnterpriseGateway} from './enterprise-gateway-v45.mjs';
const key='whsec_12345678901234567890123';
function signedStripe(at=Date.now()){
 const body=Buffer.from(JSON.stringify({id:'evt_123abc',type:'checkout.session.completed',data:{object:{id:'cs_live_abcd',payment_status:'paid'}}}));
 const t=Math.floor(at/1000);
 const h=crypto.createHmac('sha256',key).update(t+'.').update(body).digest('hex');
 return {body,header:'t='+t+',v1='+h};
}
test('Stripe rejects tampered payloads and expired signatures',()=>{
 const a=signedStripe();
 assert.equal(verifyStripeEvent(a.body,a.header,key).id,'evt_123abc');
 assert.throws(()=>verifyStripeEvent(Buffer.from('bad'),a.header,key),/Invalid Stripe signature/);
 assert.throws(()=>verifyStripeEvent(a.body,a.header,key,{clock:()=>Date.now()+600000}),/Expired/);
});
test('email sender requires real configured transport and never counts consulting intake as shipped',async()=>{
 assert.equal(smtpReadiness({}),false);
 assert.equal(eligibleDigitalDelivery({status:'COMPLETED',captureId:'x',product:'audit',auditIntake:{},fulfillment:{token:'a'.repeat(48)}}),false);
 assert.equal((await deliverVerifiedDigitalOrder({order:{status:'CREATED'},buyerEmail:'test@example.org'})).status,'NOT_AUTOMATICALLY_DELIVERABLE');
});
test('research signals generate valid original first-party draft specifications, not customer claims',()=>{
 const brief=turnSignalIntoBrief({category:'booking-operations',title:'Booking Follow Up Improvement Workbook',
 audience:'Local service owners with appointment workflows',
 problem:'Potential customers receive slow responses when a booking request is submitted',
 objective:'Create a measurable appointment-response process and test its reliability',
 successCriterion:'Measure the first reply time of incoming booking inquiries',
 priceCents:2900,evidence:[
  {label:'A public process overview',url:'https://example.com/a',relevance:'Provides a reference about appointment flow and response steps',observedAt:'2022-01-01T00:00:00Z'},
  {label:'A distinct source document',url:'https://example.org/b',relevance:'Describes a second independent scheduling workflow reference',observedAt:'2022-01-02T00:00:00Z'}
 ]});
 assert.equal(brief.category,'booking-operations');
 assert.throws(()=>turnSignalIntoBrief({category:'crypto-trading',evidence:[]}),/Unsupported/);
});
test('continuous loop processes one claimed vetted draft without publishing or accounting fake revenue',async()=>{
 const draft=turnSignalIntoBrief({category:'booking-operations',title:'Booking Follow Up Improvement Workbook',
 audience:'Local service owners with appointment workflows',
 problem:'Potential customers receive slow responses when a booking request is submitted',
 objective:'Create a measurable appointment-response process and test its reliability',
 successCriterion:'Measure the first reply time of incoming booking inquiries',
 priceCents:2900,evidence:[
  {label:'A public process overview',url:'https://example.com/a',relevance:'Provides a reference about appointment flow and response steps',observedAt:'2022-01-01T00:00:00Z'},
  {label:'A distinct source document',url:'https://example.org/b',relevance:'Describes a second independent scheduling workflow reference',observedAt:'2022-01-02T00:00:00Z'}]});
 let captured;
 const e=createEnterpriseCycle({
  env:{ULTRON_ENTERPRISE_ENABLED:'true',ULTRON_EXECUTIVE_ENABLED:'false'},
  readSignals:async()=>({signals:[],sourceStatus:'NO_AUTHORIZED_FEED'}),
  enqueue:async()=>({}),claim:async()=>({id:'job',lease_id:'lease',payload:{brief:draft}}),
  finish:async(j,x)=>{captured=x;return x},
  product:async()=>({id:'draft-unit',sha256:'a'.repeat(64)})
 });
 const result=await e.pulse();assert.equal(result.generated,1);
 assert.equal(captured.status,'DONE');assert.equal(captured.result.revenueUsd,0);
 assert.equal(result.automaticPublishing,false);
});
test('normalized PostgreSQL database leases jobs and deduplicates concurrent claims',async t=>{
 if(!process.env.DATABASE_URL){t.skip('Database URL not supplied');return}
 const health=await enterpriseStoreHealth();assert.equal(health.ok,true);
 const marker=crypto.randomUUID();const one=await enqueueEnterpriseJob({kind:'RESEARCH',dedupeKey:'v45-test:'+marker,payload:{q:'test'}});
 const two=await enqueueEnterpriseJob({kind:'RESEARCH',dedupeKey:'v45-test:'+marker,payload:{q:'test'}});
 assert.equal(one.id,two.id);
 const lease=await claimEnterpriseJob({kinds:['RESEARCH']});assert.ok(lease?.id);
 const result=await finishEnterpriseJob(lease,{status:'DONE',result:{ok:true}});assert.equal(result.status,'DONE');
 await assert.rejects(finishEnterpriseJob(lease,{status:'DONE'}),/already handled|expired/);
});
test('audited events are cryptographically chained and idempotent',async t=>{
 if(!process.env.DATABASE_URL){t.skip('Database URL not supplied');return}
 process.env.ULTRON_EVENT_HMAC_SECRET='v45-ci-only-not-a-production-secret-12345';
 const eventId='test:'+crypto.randomUUID();
 const one=await appendEnterpriseAudit({eventId,kind:'TEST_EVENT',payload:{ok:true}});
 const two=await appendEnterpriseAudit({eventId,kind:'TEST_EVENT',payload:{ok:true}});
 assert.equal(one.duplicate,false);assert.equal(two.duplicate,true);
 assert.equal(one.signature.length,64);
});
test('Express enterprise status is truthful and does not leak credentials',async()=>{
 const app=createEnterpriseGateway({env:{STRIPE_SECRET_KEY:'hidden'},
  storeHealth:async()=>({ok:true,backend:'postgres'})});
 const server=app.listen(0,'127.0.0.1');
 try{
  const port=server.address().port;
  const r=await fetch('http://127.0.0.1:'+port+'/api/enterprise/v45/health');
  assert.equal(r.status,200);const body=await r.text();
  assert.match(body,/OWNER_AUTH_REQUIRED/);assert.equal(body.includes('hidden'),false);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
