import test from 'node:test';import assert from 'node:assert/strict';
import {EXPANSION_VIDEO_SYSTEMS,AI_MARKET_EXPANSION_SQUADS,CRYPTO_RESEARCH_EXPANSION_SQUADS,expansionManifest,contentMission,businessOpportunityMission,cryptoResearchMission} from './video-expansion-pack.mjs';
test('five added video systems are represented',()=>assert.equal(EXPANSION_VIDEO_SYSTEMS.length,5));
test('10x squad rule is implemented across new capability families',()=>{for(const s of Object.values(AI_MARKET_EXPANSION_SQUADS))assert.equal(s.length,10);for(const s of Object.values(CRYPTO_RESEARCH_EXPANSION_SQUADS))assert.equal(s.length,10)});
test('content pipeline includes research creation compliance distribution and learning',()=>{const m=contentMission({});for(const k of ['research','create','gate','distribute','learn'])assert.ok(Array.isArray(m.stages[k]))});
test('business opportunity mission stays evidence-driven',()=>{const m=businessOpportunityMission({budget:0});assert.ok(m.channels.includes('digital products'));assert.ok(m.scoring.includes('evidence of demand'))});
test('crypto research uses backtesting and approval-gated proposals',()=>{const m=cryptoResearchMission({instrument:'BTC-USD'});assert.ok(m.stages.includes('walk-forward backtest'));assert.match(expansionManifest().crypto.realMoneyExecution,/approval-gated/)});
