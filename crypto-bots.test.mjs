import test from 'node:test';
import assert from 'node:assert/strict';
import {CRYPTO_BOT_RULES,CRYPTO_AGENTS,analyzePrices,riskGate,simulateExecution,runPaperDecision} from './crypto-bots.mjs';

test('crypto stack is paper-only',()=>{
 assert.equal(CRYPTO_BOT_RULES.mode,'paper-trading');
 assert.equal(CRYPTO_BOT_RULES.liveOrders,false);
 assert.equal(CRYPTO_BOT_RULES.withdrawals,false);
 assert.ok(CRYPTO_AGENTS.includes('CryptoRiskAgent'));
 assert.ok(CRYPTO_AGENTS.includes('CryptoExecutionSimAgent'));
});

test('analyzes trend and gates risk',()=>{
 const prices=[100,101,102,103,104,105,106,107,108,109,110,112,114,116,118];
 const a=analyzePrices(prices);
 assert.ok(['BUY','HOLD'].includes(a.signal));
 const r=riskGate({signal:'BUY',confidence:.9,price:118,equity:10000,positionUsd:0});
 assert.equal(r.approved,true);
 assert.ok(r.notional<=200);
});

test('execution is simulated and bounded',()=>{
 const x=simulateExecution({instrument:'BTC-USD',signal:'BUY',price:50000,notional:100});
 assert.equal(x.mode,'paper');
 assert.equal(x.status,'SIMULATED');
 assert.equal(x.notional,100);
});

test('full decision never creates live order',()=>{
 const prices=[100,101,102,103,104,105,106,107,108,109,110,112,114,116,118];
 const d=runPaperDecision({instrument:'BTC-USD',prices,equity:10000,positionUsd:0});
 assert.equal(d.mode,'paper-trading');
 if(d.execution) assert.equal(d.execution.status,'SIMULATED');
});
