import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyExchangeReadAccess,executeApprovedSpotOrder} from './crypto-exchange.mjs';
import {reserveOrder,assertNotStopped,setEmergencyStop} from './crypto-durable-safety.mjs';

test('missing credentials fail closed',async()=>{
  const a=process.env.CRYPTOCOM_API_KEY,b=process.env.CRYPTOCOM_API_SECRET;
  delete process.env.CRYPTOCOM_API_KEY;delete process.env.CRYPTOCOM_API_SECRET;
  try{assert.equal((await verifyExchangeReadAccess()).verified,false)}finally{
    if(a===undefined)delete process.env.CRYPTOCOM_API_KEY;else process.env.CRYPTOCOM_API_KEY=a;
    if(b===undefined)delete process.env.CRYPTOCOM_API_SECRET;else process.env.CRYPTOCOM_API_SECRET=b;
  }
});
test('read-only verifier uses v1 wallet balance, never order endpoint',async()=>{
  const a=process.env.CRYPTOCOM_API_KEY,b=process.env.CRYPTOCOM_API_SECRET;
  process.env.CRYPTOCOM_API_KEY='test-key';process.env.CRYPTOCOM_API_SECRET='test-secret';
  let count=0;
  try{
    const result=await verifyExchangeReadAccess({transport:async(url)=>{
      count++;assert.match(url,/private\/user-balance$/);
      return {ok:true,json:async()=>({code:0,result:{data:[{instrument_name:'USD'}]}})};
    }});
    assert.equal(result.verified,true);assert.equal(count,1);
  }finally{
    if(a===undefined)delete process.env.CRYPTOCOM_API_KEY;else process.env.CRYPTOCOM_API_KEY=a;
    if(b===undefined)delete process.env.CRYPTOCOM_API_SECRET;else process.env.CRYPTOCOM_API_SECRET=b;
  }
});
test('live order submission remains blocked regardless of toggles',async()=>{
  await assert.rejects(executeApprovedSpotOrder({}),/Live order execution blocked/);
});
test('persistent stop fails closed on missing row',async()=>{
  await assert.rejects(assertNotStopped({query:async()=>({rows:[]})}),/emergency stop active/);
});
test('duplicate reservation fails and cannot retry',async()=>{
  const db={query:async()=>({rows:[]})};
  await assert.rejects(reserveOrder(db,'11111111-1111-4111-8111-111111111111','order-1'),/Duplicate or ambiguous/);
});
test('emergency stop cannot be disabled by this module',async()=>{
  await assert.rejects(setEmergencyStop({query:async()=>{}},false),/separate audited activation/);
});
