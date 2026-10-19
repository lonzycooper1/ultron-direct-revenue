import test from 'node:test';
import assert from 'node:assert/strict';
import {checkReadOnlyStartup} from './crypto-readiness.mjs';
import {verifyExchangeReadAccess,privateCall} from './crypto-exchange.mjs';

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

test('HTTP authentication diagnostics retain only status, reason code and bounded category',async()=>{
 const old=[process.env.CRYPTOCOM_API_KEY,process.env.CRYPTOCOM_API_SECRET];
 process.env.CRYPTOCOM_API_KEY='fixture';process.env.CRYPTOCOM_API_SECRET='fixture';
 try{
  for(const [status,code,category] of [[401,40101,'KEY_OR_SIGNATURE_REJECTED'],[401,40103,'IP_NOT_ALLOWLISTED'],[400,40102,'TIMESTAMP_REJECTED'],[403,undefined,'HTTP_ACCESS_DENIED'],[400,202,'ACCOUNT_SUSPENDED']]){
   const result=await verifyExchangeReadAccess({transport:async()=>({ok:false,status,json:async()=>({code,message:'PRIVATE',original:'SECRET'})})});
   assert.equal(result.verified,false);assert.equal(result.httpStatus,status);assert.equal(result.diagnostic,category);
   const logs=[];await checkReadOnlyStartup({verify:async()=>result,log:(...args)=>logs.push(args.join(' '))});
   assert.match(logs[0],new RegExp(category));assert.doesNotMatch(JSON.stringify(result)+logs[0],/PRIVATE|SECRET|fixture/);
  }
  process.env.CRYPTOCOM_API_SECRET=' fixture ';
  let calls=0;
  const result=await verifyExchangeReadAccess({transport:async()=>{calls++;throw Error('should not send malformed credentials')}});
  assert.equal(calls,0);assert.equal(result.diagnostic,'CREDENTIAL_FORMAT_INVALID');
 }finally{for(const [i,key] of ['CRYPTOCOM_API_KEY','CRYPTOCOM_API_SECRET'].entries())if(old[i]===undefined)delete process.env[key];else process.env[key]=old[i]}
});

test('signed transport forbids financial transfers and binds create-order response identity',async()=>{
 const old=[process.env.CRYPTOCOM_API_KEY,process.env.CRYPTOCOM_API_SECRET];process.env.CRYPTOCOM_API_KEY='fixture';process.env.CRYPTOCOM_API_SECRET='fixture';
 try{
  let count=0;
  const transport=async(url,options)=>{count++;const request=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({id:request.id,method:request.method,code:0,result:{order_id:'123'}})}};
  for(const method of ['private/create-withdrawal','private/create-subaccount-transfer','private/change-account-leverage'])await assert.rejects(privateCall(method,{},{transport}),/prohibited/);
  assert.equal(count,0);
  assert.equal((await privateCall('private/create-order',{},{transport})).result.order_id,'123');
  await assert.rejects(privateCall('private/create-order',{},{transport:async()=>({ok:true,json:async()=>({code:0,result:{order_id:'123'}})})}),/identity mismatch/);
 }finally{for(const [i,key] of ['CRYPTOCOM_API_KEY','CRYPTOCOM_API_SECRET'].entries())if(old[i]===undefined)delete process.env[key];else process.env[key]=old[i]}
});
