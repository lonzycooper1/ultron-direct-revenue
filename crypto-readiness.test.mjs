import test from 'node:test';
import assert from 'node:assert/strict';
import {checkReadOnlyStartup} from './crypto-readiness.mjs';
import {verifyExchangeReadAccess} from './crypto-exchange.mjs';

test('startup logs only bounded authentication evidence, never balances or arbitrary provider text',async()=>{
 for(const result of [{verified:true,balance:1000,secret:'PRIVATE',tradePermission:'ENABLED'},
  {verified:false,reason:'READ_ONLY_VERIFICATION_FAILED',providerCode:40101,detail:'PRIVATE'}]){
  const logs=[];const summary=await checkReadOnlyStartup({verify:async()=>result,log:(...args)=>logs.push(args.join(' '))});
  assert.equal(summary.liveOrders,false);assert.equal(summary.tradePermission,'UNVERIFIED');
  assert.equal(logs.length,1);assert.doesNotMatch(logs[0],/PRIVATE|1000|ENABLED/);
 }
 const logs=[];assert.equal((await checkReadOnlyStartup({verify:async()=>{throw Error('PRIVATE')},log:(...x)=>logs.push(x.join(' '))})).verified,false);
 assert.doesNotMatch(logs[0],/PRIVATE/);
});
test('read authentication distinguishes funds evidence and cannot certify trading permissions',async()=>{
 const old=[process.env.CRYPTOCOM_API_KEY,process.env.CRYPTOCOM_API_SECRET];
 process.env.CRYPTOCOM_API_KEY='fixture';process.env.CRYPTOCOM_API_SECRET='fixture';
 try{
  for(const [quantity,reserved,expected] of [['50','10',true],['10','10',false],['',0,null],[null,0,null],['50',undefined,null]]){
   const result=await verifyExchangeReadAccess({transport:async url=>{
    assert.equal(url,'https://api.crypto.com/exchange/v1/private/user-balance');
    return {ok:true,json:async()=>({code:0,result:{data:[{instrument_name:'USD',position_balances:[{instrument_name:'USD',quantity,reserved_qty:reserved}]}]}})};
   }});
   assert.equal(result.verified,true);assert.equal(result.usdFundsAvailable,expected);assert.equal(result.tradePermission,'UNVERIFIED');
   assert.equal(result.accountEligibility,'UNVERIFIED');assert.equal(result.currentServerRequestAccepted,true);
  }
  const rejected=await verifyExchangeReadAccess({transport:async()=>({ok:true,json:async()=>({code:40101,message:'PRIVATE'})})});
  assert.equal(rejected.verified,false);assert.equal(rejected.providerCode,40101);assert.doesNotMatch(JSON.stringify(rejected),/PRIVATE/);
 }finally{for(const [i,key] of ['CRYPTOCOM_API_KEY','CRYPTOCOM_API_SECRET'].entries())if(old[i]===undefined)delete process.env[key];else process.env[key]=old[i]}
});
