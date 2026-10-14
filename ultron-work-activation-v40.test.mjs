import test from 'node:test';
import assert from 'node:assert/strict';
import {activationReport,STATUS,CAPABILITIES} from './ultron-work-activation-v40.mjs';
test('no credentials: no external integration is verified',()=>{
 const r=activationReport({env:{}});
 assert.equal(r.ready,0);
 assert.equal(r.entries.find(x=>x.id==='business-email').status,STATUS.BLOCKED);
 assert.equal(r.entries.find(x=>x.id==='quantum-hardware').status,STATUS.BLOCKED);
 assert.equal(r.entries.find(x=>x.id==='first-sale').status,STATUS.PROOF);
 assert.equal(r.entries.length,CAPABILITIES.length);
});
test('configured Gmail without delivery test remains unverified',()=>{
 const env=Object.fromEntries(CAPABILITIES.find(x=>x.id==='business-email').env.map(k=>[k,'configured']));
 assert.equal(activationReport({env}).entries.find(x=>x.id==='business-email').status,STATUS.CONFIG);
});
test('signed PayPal provider runtime does not prove first sale',()=>{
 const r=activationReport({provider:{paypal:{ok:true,apiAuthorized:true,webhookEndpointVerified:true,captureEventsSubscribed:true}}});
 assert.equal(r.entries.find(x=>x.id==='paypal').status,STATUS.PROVIDER);
 assert.notEqual(r.entries.find(x=>x.id==='first-sale').status,STATUS.VERIFIED);
});
test('self-reported sale flag without independent completed order never passes',()=>{
 const r=activationReport({verified:{verifiedFirstSale:true}});
 assert.notEqual(r.entries.find(x=>x.id==='first-sale').status,STATUS.VERIFIED);
});
test('independently evidenced paid-delivered-accepted order is eligible',()=>{
 const r=activationReport({orders:[{independentBuyerVerified:true,customerAcceptanceVerified:true,
 id:'o1',capturedAt:'2026-10-14T12:00:00Z',fulfillmentCompletedAt:'2026-10-14T13:00:00Z',customerAcceptanceEvidence:{at:'2026-10-14T14:00:00Z'},independentBuyerEvidence:{source:'PAYPAL_ORDER_READ_AND_OWNER_REVIEW',orderId:'o1'},webhookEvidence:{signatureVerified:true,eventId:'ev1',captureId:'provider-capture'},fulfillment:{token:'id',review:{qualityApproved:true}},captureId:'provider-capture',status:'COMPLETED'}]});
 assert.equal(r.entries.find(x=>x.id==='first-sale').status,STATUS.VERIFIED);
});
test('some config must never leak values',()=>{
 const secret='do-not-display';
 const r=activationReport({env:{ULTRON_GMAIL_CLIENT_ID:secret}});
 assert.equal(JSON.stringify(r).includes(secret),false);
 assert.equal(r.entries[0].priority,0);
});
