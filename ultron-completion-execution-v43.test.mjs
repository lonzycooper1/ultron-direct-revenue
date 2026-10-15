import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPLETION_ITEMS} from './ultron-500-completion-v26.mjs';
import {completionExecution,classifyAction,EXECUTION_VERSION} from './ultron-completion-execution-v43.mjs';

const NOW=Date.parse('2026-10-14T23:00:00Z');
test('v43 includes every original requirement and no speculative completions',()=>{
 const r=completionExecution({now:NOW});
 assert.equal(r.version,EXECUTION_VERSION);
 assert.equal(r.totalRequirements,500);
 assert.equal(r.workstreamCount,20);
 assert.equal(r.requirements.length,COMPLETION_ITEMS.length);
 assert.deepEqual(new Set(r.requirements.map(x=>x.id)).size,500);
 assert.equal(r.verifiedRequirements,0);
 assert.equal(r.requirements.every(x=>x.status==='NOT_VERIFIED'),true);
 assert.equal(r.policy.fakePurchases,'FORBIDDEN');
 assert.equal(r.customerAcceptanceEvidenceRecorded,0);
 assert.equal(r.providerCapturedOrdersRecorded,0);
});
test('configured provider and fake ledger event do not constitute an unrelated paid customer',()=>{
 const secrets={PAYPAL_CLIENT_ID:'CLIENT_SECRET_NEVER_ECHO',PAYPAL_CLIENT_SECRET:'SECRET_SHOULD_NOT_APPEAR',PAYPAL_WEBHOOK_ID:'fake-config',PUBLIC_BASE_URL:'https://example.test',
  ULTRON_GMAIL_CLIENT_ID:'client',ULTRON_GMAIL_CLIENT_SECRET:'SECRET_SHOULD_NOT_APPEAR',ULTRON_GMAIL_REFRESH_TOKEN:'TOKEN_SHOULD_NOT_APPEAR',
  ULTRON_BUSINESS_SENDER:'business@example.test',ULTRON_BUSINESS_POSTAL_ADDRESS:'NONPUBLIC_ADDRESS_SHOULD_NOT_APPEAR',ULTRON_UNSUBSCRIBE_SECRET:'private',ULTRON_BUSINESS_POSTAL_ADDRESS_APPROVED:'false'};
 const r=completionExecution({env:secrets,now:NOW,payment:{ok:true,apiAuthorized:true,webhookEndpointVerified:true,captureEventsSubscribed:true},
  orders:[{id:'sample',status:'COMPLETED',captureId:'fake',capturedAt:'2026-10-14T22:00:00Z',webhookEvidence:{signatureVerified:false}}]});
 assert.equal(r.providerPayPalConfigurationVerified,true);
 assert.equal(r.providerCapturedOrdersRecorded,0);
 assert.equal(r.customerAcceptanceEvidenceRecorded,0);
 assert.equal(r.blockers.find(x=>x.id==='business-email').status,'BUSINESS_SENDER_AUTH_OR_ADDRESS_REQUIRED');
 const s=JSON.stringify(r);
 for(const sensitive of ['SECRET_SHOULD_NOT_APPEAR','TOKEN_SHOULD_NOT_APPEAR','NONPUBLIC_ADDRESS_SHOULD_NOT_APPEAR'])assert.equal(s.includes(sensitive),false);
});
test('all 22 original external capabilities have precise fallback or next action',()=>{
 const r=completionExecution({now:NOW});
 assert.equal(r.blockers.length,22);
 assert.equal(r.blockers.every(x=>x.manualFallback&&x.ownerAction&&x.actionUrl.startsWith('https://')),true);
 assert.equal(r.blockers.every(x=>x.externalActionTaken===false),true);
 assert.equal(r.nineGates.length,9);
});
test('heartbeat recency is strict and never guessed',()=>{
 const recent=completionExecution({now:NOW,supervisor:{lastHeartbeat:'2026-10-14T22:41:00Z'},verifier:{lastRun:'2026-10-14T22:40:00Z'}});
 assert.equal(recent.heartbeat.supervisorRecent,true);
 assert.equal(recent.heartbeat.verifierRecent,true);
 const stale=completionExecution({now:NOW,supervisor:{lastHeartbeat:'2026-10-14T22:39:00Z'},verifier:{}});
 assert.equal(stale.heartbeat.supervisorRecent,false);
 assert.equal(stale.heartbeat.verifierRecent,false);
 assert.equal(stale.heartbeat.verifierAgeMinutes,null);
});
test('owner approvals and actual potentially paid work outrank speculative discovery',()=>{
 const r=completionExecution({now:NOW,commerce:{approvals:[{status:'pending'},{status:'denied'},{status:'pending'}]},
  growth:{sourceStatus:'ERROR',errors:[{kind:'DISCOVERY_FAILURE'}]},ops:{alerts:{a:{status:'QUEUED_NOT_DELIVERED'}}}});
 assert.equal(r.pendingCommerceOwnerApprovals,2);
 assert.equal(r.ownerAlertsUnacknowledged,1);
 assert.equal(r.blockers.find(x=>x.id==='buyer-feed').status,'FEED_FAILURE_CANDIDATES_NOT_BUYERS');
 assert.equal(r.critical[0].id,'paid-fulfillment');
 assert.equal(r.critical[1].id,'interested-replies');
});
test('task authority never grants identity, spending, credit or contract actions',()=>{
 for(const phrase of ['verify bank ownership','send live trades','sign customer contract','purchase domain','credit application','refund customer'])
  assert.equal(classifyAction(phrase),'EXPLICIT_OWNER_APPROVAL_REQUIRED',phrase);
 assert.equal(classifyAction('analyze public HTML'),'SAFE_INTERNAL_READ_OR_DRAFT');
});
test('owner-submitted evidence is queued, not marked independently verified',()=>{
 const r=completionExecution({now:NOW,evidence:{C001:{url:'https://example.test/evidence'}}});
 assert.equal(r.ownerSubmittedEvidenceCount,1);
 assert.equal(r.requirements.find(x=>x.id==='C001').status,'EVIDENCE_SUBMITTED_AWAITING_INDEPENDENT_REVIEW');
 assert.equal(r.verifiedRequirements,0);
});
