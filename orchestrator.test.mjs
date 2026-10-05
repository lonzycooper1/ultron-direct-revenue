import test from 'node:test';import assert from 'node:assert/strict';
import {scoreOpportunity,riskReview,buildAgentPlan,paperTrade,performanceSummary} from './orchestrator.mjs';

test('low confidence opportunities are rejected',()=>{assert.equal(scoreOpportunity({confidence:.2,riskScore:10}).decision,'REJECT')});
test('market opportunities remain simulation only',()=>{const r=riskReview({kind:'market-research',title:'setup',confidence:.9,riskScore:20},{equityUsd:10000});assert.equal(r.approved,true);assert.equal(r.executionMode,'SIMULATION_ONLY');assert.equal(r.maxNotionalUsd,200)});
test('daily loss circuit breaker blocks activity',()=>{const r=riskReview({kind:'revenue',confidence:.9,riskScore:10},{dailyPnlPct:-4});assert.equal(r.approved,false)});
test('plan separates revenue and market research',()=>{const p=buildAgentPlan({opportunities:[{id:'r',kind:'revenue',confidence:.9},{id:'m',kind:'market-research',confidence:.9}]});assert.equal(p.revenue.queue.length,1);assert.equal(p.market.queue.length,1);assert.equal(p.market.mode,'SIMULATION_ONLY')});
test('paper trade calculates results',()=>{const t=paperTrade({symbol:'ABC',entry:100,exit:110,quantity:2,fees:1});assert.equal(t.netPnlUsd,19);assert.equal(t.mode,'PAPER');const s=performanceSummary([t]);assert.equal(s.netPnlUsd,19);assert.equal(s.winRate,100)});
