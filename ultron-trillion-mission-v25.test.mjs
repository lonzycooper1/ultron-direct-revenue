import test from 'node:test';
import assert from 'node:assert/strict';
import {TRILLION_MISSION,TRILLION_MILESTONES,VIDEO_RESEARCH,buildTrillionMission} from './ultron-trillion-mission-v25.mjs';

test('The mission is aspirational with a literal one-trillion target',()=>{
 assert.equal(TRILLION_MISSION.targetUsd,1_000_000_000_000);
 assert.equal(TRILLION_MISSION.classification,'LONG_HORIZON_STRETCH_GOAL_NOT_FORECAST');
 assert.equal(TRILLION_MILESTONES.at(-1).usd,TRILLION_MISSION.targetUsd);
 assert.ok(VIDEO_RESEARCH.length>=7);
});
test('No sale is invented from user-provided unlabeled numbers',()=>{
 const m=buildTrillionMission();
 assert.equal(m.currentEvidence.verifiedRevenueUsd,0);
 assert.equal(m.nextMilestone.usd,100);
 assert.ok(m.objective.priorNumbers.every(x=>x.verification==='UNVERIFIED'&&x.accountingUse==='NONE'));
 assert.ok(m.tasks.some(x=>x.mode==='APPROVAL_FOR_EXTERNAL_SEND'));
});
test('Verified revenue alone advances milestones',()=>{
 const m=buildTrillionMission({verifiedRevenueUsd:10_500,paidOrders:2,interestedBuyers:5,blockedTasks:[{id:2,name:'Business email',status:'BLOCKED_DOMAIN_OWNERSHIP'}]});
 assert.equal(m.nextMilestone.usd,100_000);
 assert.equal(m.bottleneck,'FULFILL_VERIFY_AND_RETAIN');
 assert.equal(m.externalBlockers.length,1);
 assert.ok(m.tasks.every(x=>x.priority>0&&x.doneWhen));
});
test('Incorrect or negative figures cannot create fictitious revenue',()=>{
 assert.equal(buildTrillionMission({verifiedRevenueUsd:-100}).currentEvidence.verifiedRevenueUsd,0);
 assert.equal(buildTrillionMission({verifiedRevenueUsd:'not a number'}).currentEvidence.verifiedRevenueUsd,0);
});
