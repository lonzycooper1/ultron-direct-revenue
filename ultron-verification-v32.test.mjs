import test from 'node:test';
import assert from 'node:assert/strict';
import {OWNER_MISSION,classifyAction,evaluate,publicVerifier} from './ultron-verification-v32.mjs';
test('mission knows business goal without private identity',()=>{assert.equal(OWNER_MISSION.offer.auditUsd,500);assert.ok(OWNER_MISSION.goals.length>=4);assert.ok(!JSON.stringify(OWNER_MISSION).includes('password:'))});
test('unreachable owner does not grant identity or payment permission',()=>{
 assert.equal(classifyAction('verify MFA 2FA code').permission,'OWNER_ONLY');
 for(const a of ['send outreach email','refund a customer','place a live trade','sign contract','authorize wire transfer'])assert.equal(classifyAction(a).permission,'OWNER_APPROVAL_REQUIRED');
 assert.equal(classifyAction('review evidence').permission,'AUTO_INTERNAL_ONLY');
 assert.equal(classifyAction('unknown procedure').permission,'REVIEW_REQUIRED');
});
test('missing providers cannot be marked connected or claim sales',()=>{
 const checks=evaluate({supervisor:{lastHeartbeat:new Date().toISOString()},ledgerOrders:[]});
 const g=id=>checks.find(x=>x.id===id);
 assert.equal(g('CAPTURE_EVIDENCE').status,'NO_VERIFIED_EXTERNAL_CUSTOMER');
 assert.equal(g('GMAIL_SENDING').status,'OWNER_ACTION_REQUIRED');
 assert.equal(g('PAYPAL_RUNTIME').status,'NOT_VERIFIED');
 assert.equal(g('DISCOVERY_SOURCE').status,'OWNER_ACTION_REQUIRED');
});
test('provider ready does not verify paying customer',()=>{
 const checks=evaluate({supervisor:{lastHeartbeat:new Date().toISOString()},payment:{ok:true,apiAuthorized:true,webhookEndpointVerified:true,captureEventsSubscribed:true}});
 assert.equal(checks.find(x=>x.id==='PAYPAL_RUNTIME').status,'VERIFIED_PROVIDER_CONFIG');
 assert.equal(checks.find(x=>x.id==='CAPTURE_EVIDENCE').status,'NO_VERIFIED_EXTERNAL_CUSTOMER');
});
test('public response does not leak owner business profile',()=>{
 const out=publicVerifier({ownerBusinessProfile:{instructions:'private note 123'},checks:[{id:'a',status:'x',why:'safe'}]});
 assert.ok(!JSON.stringify(out).includes('private note 123'));
});
