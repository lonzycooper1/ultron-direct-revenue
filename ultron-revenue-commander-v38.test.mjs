import test from 'node:test';
import assert from 'node:assert/strict';
import {VERSION,UPGRADES,classifyAction,commanderSnapshot} from './ultron-revenue-commander-v38.mjs';
const env={
 ULTRON_DISCOVERY_FALLBACK_URL:'https://feed.example.org/allowed.json',
 ULTRON_BUSINESS_SENDER:'sales@example.org'
};
test('screen recording maps all sixteen prioritized upgrades',()=>{
 assert.equal(VERSION,'38.0.0');
 assert.equal(UPGRADES.length,16);
 assert.equal(UPGRADES.filter(x=>x.phase==='P0').length,5);
 assert.equal(new Set(UPGRADES.map(x=>x.id)).size,16);
});
test('missing provider credentials are not treated as connected',()=>{
 const d=commanderSnapshot({env,payment:{ok:true,apiAuthorized:true,webhookEndpointVerified:true,captureEventsSubscribed:true}});
 assert.equal(d.providerGates.find(x=>x.id==='gmail').status,'BLOCKED_RUNTIME_AUTH');
 assert.equal(d.providerGates.find(x=>x.id==='buyers').status,'NOT_PROVEN');
 assert.equal(d.providerGates.find(x=>x.id==='payments').status,'PROVIDER_READY_NOT_A_SALE');
 assert.equal(d.metrics.independentAcceptedCustomersWithExplicitProof,0);
 assert.equal(d.providerGates.find(x=>x.id==='brand').status,'NO_CUSTOM_DOMAIN');
 assert.equal(d.now.id,'gmail-auth');
});
test('actual opted-in leads beat provider setup; unconsented scans do not',()=>{
 const opt=commanderSnapshot({env,inbound:{total:5,consentedOpen:2}});
 assert.equal(opt.now.id,'opted-in-inbox');
 const no=commanderSnapshot({env,inbound:{total:5,consentedOpen:0}});
 assert.equal(no.now.id,'gmail-auth');
});
test('recorded captured order does not imply independent accepted customer',()=>{
 const d=commanderSnapshot({orders:{o1:{status:'COMPLETED',captureId:'provider-capture',fulfillment:{token:'secret'}}}});
 assert.equal(d.metrics.capturedOrderRecords,1);
 assert.equal(d.metrics.deliveredCapturedRecords,1);
 assert.equal(d.metrics.independentAcceptedCustomersWithExplicitProof,0);
 assert.equal(JSON.stringify(d).includes('secret'),false);
});
test('unfinished paid order outranks all acquisition work',()=>{
 const d=commanderSnapshot({orders:{o1:{status:'COMPLETED',captureId:'capture1'}},inbound:{total:2,consentedOpen:2}});
 assert.equal(d.now.id,'paid-delivery');
});
test('pending commerce approvals are never auto-approved',()=>{
 const d=commanderSnapshot({commerce:{approvals:[{status:'pending',action:'publish store'},{status:'approved'}]}});
 assert.equal(d.metrics.pendingCommerceApprovals,1);
 assert.equal(d.queue.find(x=>x.id==='commerce-approvals').mode,'OWNER_ONLY');
 assert.equal(d.policy.autonomousUnapprovedExternalActions,false);
});
test('classification rejects provider bypass, MFA impersonation and spending',()=>{
 assert.equal(classifyAction('bypass Hunter restriction').mode,'PROHIBITED');
 assert.equal(classifyAction('enter my MFA OTP').mode,'OWNER_ONLY');
 assert.equal(classifyAction('buy a domain').mode,'APPROVED_EXTERNAL');
 assert.equal(classifyAction('research qualified businesses').mode,'SAFE_INTERNAL');
 assert.equal(classifyAction('undocumented unknown intent').mode,'REVIEW_REQUIRED');
});
test('public report contains no provided provider credentials or contact details',()=>{
 const d=commanderSnapshot({env:{...env,ULTRON_GMAIL_CLIENT_SECRET:'dont-print-this',ULTRON_GMAIL_REFRESH_TOKEN:'dont-print-either'},growth:{prospects:{p1:{email:'private@example.org'}},replies:{}},inbound:{total:1,consentedOpen:1}});
 const json=JSON.stringify(d);
 assert.equal(json.includes('dont-print-this'),false);
 assert.equal(json.includes('dont-print-either'),false);
 assert.equal(json.includes('private@example.org'),false);
});
test('external confirmation is required for stronger gate statuses',()=>{
 const configured={...env,ULTRON_GMAIL_CLIENT_ID:'1',ULTRON_GMAIL_CLIENT_SECRET:'2',ULTRON_GMAIL_REFRESH_TOKEN:'3',ULTRON_BUSINESS_POSTAL_ADDRESS:'commercial location',ULTRON_UNSUBSCRIBE_SECRET:'4'};
 const first=commanderSnapshot({env:configured});
 assert.equal(first.providerGates.find(x=>x.id==='gmail').status,'CONFIGURED_TEST_REQUIRED');
 const second=commanderSnapshot({env:configured,externalProof:{gmailRoundTripVerified:true}});
 assert.equal(second.providerGates.find(x=>x.id==='gmail').status,'VERIFIED');
});
