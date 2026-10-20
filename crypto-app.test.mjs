import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {appReadHeaders,appRead,verifyAppReadAccess} from './crypto-app.mjs';
import {liveExecutionConfig,verifyProviderReadAccess,readProviderRisk,reconcileProviderOrder,executeApprovedSpotOrder} from './crypto-provider.mjs';

test('App signs the documented payload and never accepts an arbitrary endpoint',()=>{
  process.env.CDC_API_KEY='app-fixture';process.env.CDC_API_SECRET='app-secret';
  const h=appReadHeaders('/v1/crypto-account',1700000000000);
  assert.equal(h['Cdc-Api-Signature'],crypto.createHmac('sha256','app-secret').update('1700000000000GET/v1/crypto-account').digest('base64'));
  assert.throws(()=>appReadHeaders('/v1/trade'),/Unsupported/);
  process.env.CDC_API_SECRET=' bad ';
  assert.throws(()=>appReadHeaders('/v1/crypto-account'),/format/);
});

test('App selection ignores Exchange keys and cannot enable live dispatch',async()=>{
  process.env.CRYPTO_PROVIDER='crypto-com-app';
  delete process.env.CDC_API_KEY;delete process.env.CDC_API_SECRET;
  process.env.CRYPTOCOM_API_KEY='exchange-fixture';process.env.CRYPTOCOM_API_SECRET='exchange-secret';
  process.env.CRYPTOCOM_LIVE_TRADING='true';
  assert.equal(liveExecutionConfig().apiConfigured,false);
  assert.equal(liveExecutionConfig().liveTradingEnabled,false);
  assert.equal((await verifyProviderReadAccess()).reason,'CREDENTIALS_MISSING');
  assert.throws(()=>readProviderRisk('BTC-USD'),/certification/);
  await assert.rejects(executeApprovedSpotOrder({approval:{permission:'ONE_ORDER_ONLY'}}),/blocked/);
  assert.equal((await reconcileProviderOrder('old-exchange-order',{})).verified,false);
});

test('read verification uses only App GETs and returns no balances or credentials',async()=>{
  process.env.CDC_API_KEY='app-fixture';process.env.CDC_API_SECRET='app-secret';
  const calls=[];
  const result=await verifyAppReadAccess({transport:async(url,options)=>{
    calls.push(url);assert.equal(options.method,'GET');assert.equal(options.redirect,'error');
    assert.equal(options.headers['Cdc-Api-Key'],'app-fixture');
    return {ok:true,status:200,json:async()=>({ok:true,account:{balances:[{amount:'PRIVATE'}],wallets:[{balance:'PRIVATE'}]}})};
  }});
  assert.equal(result.verified,true);assert.equal(calls.length,2);
  assert.ok(calls.every(u=>u.startsWith('https://wapi.crypto.com/v1/')));
  assert.doesNotMatch(JSON.stringify(result),/PRIVATE|app-secret|app-fixture/);
});

test('malformed, rejected and network responses fail closed without leaking provider errors',async()=>{
  for(const response of [
    {ok:true,status:200,json:async()=>({ok:true,account:{}})},
    {ok:false,status:401,json:async()=>({ok:false,message:'SECRET'})},
    {ok:true,status:200,json:async()=>{throw Error('SECRET')}}
  ]){
    const result=await verifyAppReadAccess({transport:async()=>response});
    assert.equal(result.verified,false);assert.doesNotMatch(JSON.stringify(result),/SECRET/);
  }
  await assert.rejects(appRead('/v1/crypto-account',{transport:async()=>{throw Error('network')}}),/network/);
  process.env.CRYPTO_PROVIDER='typo';
  assert.throws(()=>liveExecutionConfig(),/Unsupported/);
});
