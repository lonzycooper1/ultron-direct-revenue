import test from 'node:test';import assert from 'node:assert/strict';
import {CHATGPT_BUSINESS_CASES,OWNER_OPERATING_CONTRACT,MASTERY_PRINCIPLES,scoreOpportunity,buildRevenuePortfolio,interpretOwnerDirective} from './chatgpt-business-mastery.mjs';

test('five documented business cases are encoded with evidence labels',()=>{
  assert.equal(CHATGPT_BUSINESS_CASES.length,5);
  for(const c of CHATGPT_BUSINESS_CASES){assert.ok(c.evidenceLevel);assert.ok(c.startToFinish.length>=5);assert.ok(c.reusableLessons.length>=4)}
});
test('owner stretch goal and deadline are explicit but not a guarantee',()=>{
  assert.equal(OWNER_OPERATING_CONTRACT.stretchObjective.verifiedRevenueUsd,1_000_000_000_000);
  assert.equal(OWNER_OPERATING_CONTRACT.stretchObjective.deadline,'2027-04-05');
  assert.match(OWNER_OPERATING_CONTRACT.stretchObjective.classification,/not a forecast or guarantee/);
});
test('mastery score rewards pain proof recurring value and operational readiness',()=>{
  const high=scoreOpportunity({signals:{pain:1,proof:1,speed:1,distribution:1,recurring:1,retention:1,feedback:1,offerLadder:1,unitEconomics:1,operations:1}});
  const low=scoreOpportunity({signals:{}});
  assert.equal(high.score,100);assert.equal(high.grade,'A');assert.ok(low.score<50);assert.equal(MASTERY_PRINCIPLES.reduce((s,x)=>s+x.weight,0),100);
});
test('revenue portfolio uses verified results and exposes multiple business engines',()=>{
  const p=buildRevenuePortfolio({verifiedRevenueUsd:15000,completedOrders:20});
  assert.equal(p.stage,'repeatability');assert.ok(p.engines.some(x=>x.id==='recurring-software-engine'));assert.ok(p.engines.some(x=>x.id==='service-cash-engine'));
});
test('owner directive interpretation preserves completion and autonomy intent without bypassing approval',()=>{
  const d=interpretOwnerDirective("Finish the revenue system, don't ask routine questions, master the business patterns and get real customers");
  assert.equal(d.wantsCompletion,true);assert.equal(d.wantsAutonomy,true);assert.equal(d.wantsRevenue,true);assert.equal(d.wantsMastery,true);assert.equal(d.executionContract.preserveHumanApprovalForConsequentialActions,true);
});
