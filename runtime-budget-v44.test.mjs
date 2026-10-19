import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {admission,budgetPolicy,observedTokens} from './runtime-budget-v44.mjs';
import {createPayhipReceiver} from './payhip-runtime-v44.mjs';

test('worker token admission enforces daily reservations and UTC windows',()=>{
 const env={ULTRON_EXECUTIVE_DAILY_TOKEN_CAP:'20000',ULTRON_EXECUTIVE_TOKEN_RESERVATION:'10000',ULTRON_EXECUTIVE_WINDOW_START_UTC:'8',ULTRON_EXECUTIVE_WINDOW_END_UTC:'18'};
 assert.equal(admission({reservedTokens:10000},env,new Date('2026-10-18T12:00:00Z')).allowed,true);
 assert.equal(admission({reservedTokens:19000},env,new Date('2026-10-18T12:00:00Z')).reason,'DAILY_TOKEN_RESERVATIONS_EXHAUSTED');
 assert.equal(admission({},env,new Date('2026-10-18T01:00:00Z')).reason,'OUTSIDE_EXECUTION_WINDOW');
 assert.equal(budgetPolicy({}).monetaryHardCap,'PROVIDER_ACCOUNT_BILLING_REQUIRED');
 assert.equal(observedTokens({usage:{total_tokens:123}},{usage:{input_tokens:10,output_tokens:5}}),138);
});
test('Payhip event is recorded only as provisional evidence, deduped in durable ledger',async()=>{
 let state={transactions:{},events:{},receivedAt:null};
 const secret='ci-secret-only';
 const signature=createHash('sha256').update(secret).digest('hex');
 const adapter=createPayhipReceiver({env:{ULTRON_PAYHIP_API_KEY:secret},mutate:async cb=>{await cb(state);return state},read:async()=>state});
 const payload={id:'txn_1',signature,type:'paid',currency:'USD',price:900,date:1703693218,payhip_fee:33,stripe_fee:48};
 const first=await adapter.receive(payload),second=await adapter.receive(payload);
 assert.equal(first.disposition,'applied');assert.equal(second.disposition,'duplicate');
 assert.equal(first.automaticDelivery,false);assert.equal(first.providerPaymentVerified,false);
 assert.equal((await adapter.status()).transactionCount,1);
 assert.equal((await adapter.status()).bankSettlementVerified,false);
 await assert.rejects(adapter.receive({...payload,price:1000}),/Conflicting duplicate/);
 await assert.rejects(adapter.receive({...payload,signature:'00'.repeat(32)}),/Invalid signature/);
});
test('Payhip receiver must be explicitly authorized',async()=>{
 const adapter=createPayhipReceiver({env:{}});
 await assert.rejects(adapter.receive({}),/not configured/);
});
