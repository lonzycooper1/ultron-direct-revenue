import test from 'node:test';import assert from 'node:assert/strict';
import {MILLIONAIRE_SPRINT,sprintPace,sprintPlan,scenarioMath} from './millionaire-sprint.mjs';
import {marketProduct,featuredProducts,marketStats} from './ai-market.mjs';

test('end-of-year sprint is explicit stretch target with verified-payment accounting',()=>{
  assert.equal(MILLIONAIRE_SPRINT.targetUsd,1_000_000);
  assert.equal(MILLIONAIRE_SPRINT.deadline,'2026-12-31');
  assert.match(MILLIONAIRE_SPRINT.classification,/not a forecast or guarantee/);
  assert.equal(MILLIONAIRE_SPRINT.accounting,'verified-external-captured-payments-only');
});
test('pace uses remaining verified revenue rather than projections',()=>{
  const p=sprintPace({verifiedRevenueUsd:100_000,now:new Date('2026-10-05T17:30:00-05:00')});
  assert.equal(p.remainingUsd,900_000);
  assert.ok(p.requiredPerDay>10_000);
  assert.ok(p.daysRemaining>=87&&p.daysRemaining<=88);
});
test('high-ticket sprint offers are actually sellable catalog products',()=>{
  for(const [id,price] of [['ai-revenue-audit-500',500],['ai-automation-sprint-2500',2500],['ai-revenue-ops-7500',7500],['ai-business-os-10000',10000],['ai-optimization-1500',1500]]){
    const p=marketProduct(id);assert.ok(p,id);assert.equal(p.price,price);
  }
  assert.ok(featuredProducts().length>=6);
  assert.equal(marketStats().products,700000000);
});
test('sprint plan prioritizes proof then repeatability then expansion and scale',()=>{
  const p=sprintPlan({verifiedRevenueUsd:0,completedOrders:0});
  assert.equal(p.stage,'prove-first-sale');
  assert.deepEqual(p.focusSequence.map(x=>x.phase),['1. Prove','2. Repeat','3. Expand','4. Scale']);
});
test('scenario math is labeled scenario rather than forecast',()=>{
  const s=scenarioMath();assert.equal(s.length,3);for(const x of s){assert.equal(x.revenue,1_000_000);assert.match(x.classification,/not a forecast/)}
});
