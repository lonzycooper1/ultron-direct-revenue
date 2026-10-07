import test from 'node:test';import assert from 'node:assert/strict';import {autonomyManifest} from './ultron-autonomy-v12.mjs';

test('autonomy manifest contains all 50 requested capabilities',()=>{
 const m=autonomyManifest();
 assert.equal(m.agents.length,50);
 const ids=new Set(m.agents.map(x=>x.id));
 for(const id of ['ceo-orchestrator','opportunity-hunter','market-validation','product-factory','offer-architect','pricing','website-factory','conversion-optimization','prospect-discovery','prospect-intelligence','personalization','outbound-sales','inbound-lead','ai-sales-rep','crm-manager','follow-up','payment-verification','order-router','fulfillment-manager','quality-control','customer-success','retention','referral','content-factory','distribution-manager','seo','advertising-research','ad-optimization','creative-testing','financial-controller','profitability','cash-allocation','fraud-risk','compliance','security-supervisor','credential-vault','approval-gateway','agent-auditor','evidence','experiment-manager','winner-replication','failure-analysis','knowledge-graph','event-bus','job-queue','revenue-attribution','executive-dashboard','daily-planning','continuous-improvement','emergency-stop'])assert.ok(ids.has(id),id);
});
test('high-impact actions remain approval gated',()=>{const m=autonomyManifest();for(const a of ['spend_money','move_funds','real_trade','sign_contract','change_bank'])assert.ok(m.highImpactActions.includes(a));assert.equal(m.safety.realMoneyTrading,'APPROVAL_REQUIRED')});
test('architecture and revenue loop are explicit',()=>{const m=autonomyManifest();assert.match(m.architecture,/CEO/);assert.deepEqual(m.revenueLoop.slice(0,3),['discover demand','validate','build offer'])});
