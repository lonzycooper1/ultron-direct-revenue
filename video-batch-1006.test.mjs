import test from 'node:test';
import assert from 'node:assert/strict';
import {valuationRequirement,economicAgentDecision,institutionalReadinessScore,capitalReadinessPlan,oct06Mission} from './video-batch-1006.mjs';

test('billion-dollar scenario math is explicit',()=>{
  const v=valuationRequirement({targetValuation:1_000_000_000,revenueMultiple:10});
  assert.equal(v.requiredAnnualRevenue,100_000_000);
  assert.equal(v.requiredMonthlyRevenue,8_333_333.33);
});

test('economic agents scale only on positive economics',()=>{
  const good=economicAgentDecision({verifiedRevenue:100,grossProfit:80,computeCost:5,toolCost:5,acquisitionCost:10});
  assert.equal(good.mode,'scale');
  const bad=economicAgentDecision({verifiedRevenue:100,grossProfit:30,computeCost:20,toolCost:10,acquisitionCost:20});
  assert.equal(bad.mode,'pause-and-redesign');
});

test('institutional readiness remains a heuristic',()=>{
  const s=institutionalReadinessScore({recurringRevenue:90,grossMargin:80,growthRate:70,retention:90,auditedOrReviewedFinancials:true,cleanCapTable:true,governance:true,contractedBacklog:70,concentrationRisk:20,dataRoomComplete:true});
  assert.ok(s.score>70);
  assert.match(s.note,/not a lender approval model/i);
});

test('capital plan includes anti-fabrication principle and approval gates',()=>{
  const p=capitalReadinessPlan();
  assert.equal(p.phases.length,3);
  const m=oct06Mission();
  assert.equal(m.gates.borrowOrApplyForCredit,'owner-approval');
  assert.equal(m.gates.realMoneyTrading,'owner-approval-per-order');
});
