import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPLETION_GROUPS,COMPLETION_ITEMS,COMPLETION_TOTAL,assessCompletion500,validateCompletionEvidence} from './ultron-500-completion-v26.mjs';

test('500 distinct, individually named requirements exist',()=>{
 assert.equal(COMPLETION_TOTAL,500);
 assert.equal(COMPLETION_GROUPS.length,20);
 assert.ok(COMPLETION_GROUPS.every(x=>x[2].length===25));
 assert.equal(COMPLETION_ITEMS.length,500);
 assert.equal(new Set(COMPLETION_ITEMS.map(x=>x.id)).size,500);
 assert.equal(new Set(COMPLETION_ITEMS.map(x=>x.title.toLowerCase())).size,500);
 assert.equal(COMPLETION_ITEMS[0].id,'C001');
 assert.equal(COMPLETION_ITEMS.at(-1).id,'C500');
});
test('The plan never claims implementation or payments without evidence',()=>{
 const report=assessCompletion500();
 assert.equal(report.goalUsd,1_000_000_000_000);
 assert.equal(report.registeredRequirements,500);
 assert.equal(report.evidenceVerifiedCount,0);
 assert.equal(report.statuses.NOT_VERIFIED,500);
 assert.equal(report.verifiedRevenueUsd,0);
 assert.equal(report.verifiedOrders,0);
 assert.equal(report.focus,'ACTIVATE_REAL_BUYER_DISCOVERY');
 assert.ok(report.tasks.every(x=>x.status==='NOT_VERIFIED'));
});
test('Real paid work changes priority without fabricating implementation',()=>{
 const report=assessCompletion500({verifiedRevenueUsd:500,verifiedOrders:1,interestedBuyers:1});
 assert.equal(report.focus,'FULFILL_PAID_CUSTOMERS');
 assert.equal(report.verifiedRevenueUsd,500);
 assert.equal(report.evidenceVerifiedCount,0);
});
test('Blockers propagate and consented internal tasks remain separate',()=>{
 const report=assessCompletion500({operatorTasks:[{id:1,name:'Acquisition feed',status:'BLOCKED_NO_AUTHORIZED_FEED'},{id:2,name:'Ready',status:'READY'}]});
 assert.equal(report.criticalBlockers.length,1);
 assert.ok(report.requiresExternalAction.length>0);
 assert.ok(report.safeResearchOrImplementationCandidates.length>0);
 assert.ok(report.safeResearchOrImplementationCandidates.every(x=>x.action==='RESEARCH_OR_BUILD_DRAFT'));
 assert.ok(report.tasks.some(x=>x.authority==='HUMAN_APPROVAL_OR_EXTERNAL_PROOF'));
});
test('Owner-submitted evidence is not counted as independently verified',()=>{
 const e=validateCompletionEvidence({id:'C001',url:'https://example.org/proof',description:'Provider onboarding screen from owner'});
 const report=assessCompletion500({ownerEvidence:{C001:e}});
 assert.equal(report.ownerEvidenceSubmittedCount,1);
 assert.equal(report.evidenceVerifiedCount,0);
 assert.equal(report.statuses.EVIDENCE_SUBMITTED_PENDING_INDEPENDENT_VERIFICATION,1);
});
test('Evidence validator rejects untrusted or nonspecific claims',()=>{
 assert.throws(()=>validateCompletionEvidence({id:'C900',url:'https://example.org/proof',description:'Documentation available'}));
 assert.throws(()=>validateCompletionEvidence({id:'C001',url:'http://example.org',description:'Documentation available'}));
 assert.throws(()=>validateCompletionEvidence({id:'C001',url:'https://example.org/proof',description:'ok'}));
});
