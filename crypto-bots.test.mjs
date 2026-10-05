import test from 'node:test';import assert from 'node:assert/strict';
import {CRYPTO_BOT_RULES,CRYPTO_AGENTS,analyzePrices,researchDecision,cryptoCapabilityManifest} from './crypto-bots.mjs';

test('crypto stack uses live market research without autonomous orders',()=>{
 assert.equal(CRYPTO_BOT_RULES.mode,'live-market-research');
 assert.equal(CRYPTO_BOT_RULES.liveOrders,false);
 assert.equal(CRYPTO_BOT_RULES.withdrawals,false);
 assert.ok(CRYPTO_AGENTS.includes('CryptoBacktestAgent'));
 assert.ok(CRYPTO_AGENTS.includes('CryptoExecutionProposalAgent'));
});
test('analyzes multi-signal market structure',()=>{
 const prices=Array.from({length:30},(_,i)=>100+i+(i%3)*.1);
 const a=analyzePrices(prices);assert.ok(['BULLISH','BEARISH','NEUTRAL'].includes(a.signal));assert.ok(a.regime);assert.ok(a.ensemble);
});
test('research decision never represents a live order',()=>{
 const prices=Array.from({length:30},(_,i)=>50000+i*100);
 const d=researchDecision({instrument:'BTC-USD',prices});
 assert.equal(d.mode,'live-market-research');assert.equal(d.realMoneyAction.available,false);assert.ok(Array.isArray(d.evidence));
});
test('manifest includes backtest evidence and approval-gated research',()=>{const m=cryptoCapabilityManifest();assert.ok(m.expansion.workers>=40);assert.match(m.expansion.realMoneyExecution,/approval-gated/)});
