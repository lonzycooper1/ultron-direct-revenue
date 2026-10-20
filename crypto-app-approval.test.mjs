import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {Pool} from 'pg';
import {appQuoteIntent,appQuoteDigest,bindAppQuotation,persistAppQuote,loadAppQuote,reviewAppQuote,appReadiness} from './crypto-app-approval.mjs';
import {appQuotation,appRequestHeaders} from './crypto-app.mjs';

process.env.CDC_API_KEY='isolated-app-key';process.env.CDC_API_SECRET='isolated-app-secret';
const intent=()=>appQuoteIntent({instrument:'BTC-USD',side:'BUY',amount:'10.00'});
const result=(patch={})=>({requestedAt:Date.now()-20,receivedAt:Date.now()-10,quotation:{id:crypto.randomUUID(),countdown:15,from_amount:{currency:'USD',amount:'10'},to_amount:{currency:'BTC',amount:'0.0001'},...patch}});
const proposal=()=>bindAppQuotation(intent(),result());

test('App quote request binds exact decimals, allowed assets, direction and expiry',()=>{
  const p=proposal();assert.equal(p.binding.from.amount,'10');assert.equal(p.binding.to.currency,'BTC');
  const reordered=Object.fromEntries(Object.entries(p.binding).reverse());
  reordered.from={amount:p.binding.from.amount,currency:p.binding.from.currency};
  assert.equal(appQuoteDigest(reordered),p.digest,'database object key order must not change approval identity');
  assert.ok(p.binding.expiresAt<Date.now()+15000);assert.equal(p.liveOrders,false);
  for(const input of [
    {instrument:'CRO-USD',side:'BUY',amount:'10'},
    {instrument:'BTC-USD',side:'BUY',amount:10},
    {instrument:'BTC-USD',side:'BUY',amount:'10',leverage:2},
    {instrument:'BTC-USD',side:'BUY',amount:'0'},
    {instrument:'BTC-USD',side:'BUY',amount:'100000'},
    {instrument:'BTC-USD',side:'BUY',amount:'1e2'}
  ])assert.throws(()=>appQuoteIntent(input));
  for(const q of [
    {countdown:0},{countdown:Infinity},{countdown:'15'},
    {from_amount:{currency:'EUR',amount:'10'}},
    {from_amount:{currency:'USD',amount:'10.000000000000000001'}},
    {to_amount:{currency:'ETH',amount:'0.0001'}},
    {to_amount:{currency:'BTC',amount:'0'}}
  ])assert.throws(()=>bindAppQuotation(intent(),result(q)));
  const expired=result();expired.requestedAt=Date.now()-16000;
  assert.throws(()=>bindAppQuotation(intent(),expired),/expired/);
  const sell=appQuoteIntent({instrument:'ETH-USD',side:'SELL',amount:'0.001'});
  assert.equal(sell.params.fixed_side,'from');
  assert.throws(()=>bindAppQuotation(sell,result({from_amount:{currency:'ETH',amount:'0.001'},to_amount:{currency:'USD',amount:'100001'}})),/USD value/);
});

test('App quote POST signs exactly the sent body and never accepts an order endpoint',async()=>{
  const body=intent().params;
  const h=appRequestHeaders('POST','/v1/crypto-purchase/quotations',body,1700000000000);
  assert.equal(h['Cdc-Api-Signature'],crypto.createHmac('sha256','isolated-app-secret').update('1700000000000POST/v1/crypto-purchase/quotations'+JSON.stringify(body)).digest('base64'));
  for(const path of ['/v1/crypto-purchase/orders','/v1/crypto-sales/orders','/v1/crypto-exchange/orders','/v1/api-keys/self-revoke','/v1/withdrawals'])assert.throws(()=>appRequestHeaders('POST',path,{}),/Unsupported/);
  let calls=0;
  const r=await appQuotation('purchase',body,{transport:async(url,options)=>{
    calls++;assert.equal(url,'https://wapi.crypto.com/v1/crypto-purchase/quotations');assert.equal(options.method,'POST');assert.equal(options.body,JSON.stringify(body));assert.equal(options.redirect,'error');
    return {ok:true,json:async()=>({ok:true,quotation:result().quotation})};
  }});assert.ok(r.quotation.id);assert.equal(calls,1);
  await assert.rejects(appQuotation('purchase',body,{transport:async()=>{calls++;throw Error('timeout')}}),/timeout/);
  assert.equal(calls,2,'uncertain quotation requests are not retried');
});

test('readiness cannot certify trading from valid balance and budget reads',async()=>{
  const r=await appReadiness({transport:async url=>({ok:true,status:200,json:async()=>url.endsWith('/current')?{ok:true,api_key:{weekly_trading_limit_in_usd:'1000',remaining_weekly_trading_limit_in_usd:'900'}}:{ok:true,account:{balances:[],wallets:[]}}})});
  assert.equal(r.authentication.verified,true);assert.equal(r.budgetReadVerified,true);assert.equal(r.liveOrders,false);
  assert.ok(r.blockers.includes('APP_DAILY_ACCOUNTING_ADAPTER_UNVERIFIED'));assert.ok(r.blockers.includes('APP_TRANSACTION_RECOVERY_UNVERIFIED'));
  assert.doesNotMatch(JSON.stringify(r),/isolated-app|900|1000/);
});

test('PostgreSQL App quotes persist, bind confirmation, consume once and preserve stops and unknown orders',async()=>{
  assert.ok(process.env.DATABASE_URL,'Isolated PostgreSQL test database required');
  const url=new URL(process.env.DATABASE_URL);assert.match(url.hostname,/^(localhost|127\.0\.0\.1)$/);assert.match(url.pathname,/test/i);
  const bootstrap=new Pool({connectionString:process.env.DATABASE_URL});
  const schema='app_test_'+crypto.randomUUID().replaceAll('-','');
  await bootstrap.query('CREATE SCHEMA '+schema);
  const options='-c search_path='+schema;
  const pool=new Pool({connectionString:process.env.DATABASE_URL,options});
  try{
    const p=proposal();const saved=await persistAppQuote(p,{pool});
    assert.equal(saved.binding.account,undefined);
    await assert.rejects(persistAppQuote(p,{pool}),/already recorded/);
    const restarted=new Pool({connectionString:process.env.DATABASE_URL,options});
    try{assert.equal((await loadAppQuote(p.id,{pool:restarted})).digest,p.digest)}finally{await restarted.end()}
    await assert.rejects(reviewAppQuote(p.id,{approved:true,confirmation:p.id,digest:'wrong'},{pool}),/binding/);
    assert.equal((await loadAppQuote(p.id,{pool})).status,'AWAITING_HUMAN_APPROVAL');
    const ack={approved:true,confirmation:p.id,digest:p.digest};
    const replies=await Promise.allSettled(Array.from({length:8},()=>reviewAppQuote(p.id,ack,{pool})));
    assert.equal(replies.filter(r=>r.status==='fulfilled').length,1,JSON.stringify(replies.map(r=>r.status==='fulfilled'?r.value.status:r.reason?.message)));
    const review=replies.find(r=>r.status==='fulfilled').value;
    assert.equal(review.orderSubmitted,false);assert.equal(review.executionPermission,false);
    assert.equal(review.status,'REVIEWED_BLOCKED');
    await assert.rejects(reviewAppQuote(p.id,ack,{pool}),/already reviewed/);
    const expired=proposal();expired.binding.expiresAt=Date.now()-1000;
    expired.digest=appQuoteDigest(expired.binding);
    await persistAppQuote(expired,{pool});
    await assert.rejects(reviewAppQuote(expired.id,{approved:true,confirmation:expired.id,digest:expired.digest},{pool}),/expired/);
    const rotated=proposal();await persistAppQuote(rotated,{pool});
    process.env.CDC_API_KEY='rotated-key';
    try{await assert.rejects(reviewAppQuote(rotated.id,{approved:true,confirmation:rotated.id,digest:rotated.digest},{pool}),/binding/);assert.equal(await loadAppQuote(rotated.id,{pool}),null)}finally{process.env.CDC_API_KEY='isolated-app-key'}
    // Snapshot the existing global state instead of clearing the stop or
    // truncating another test's ledger; rehearsal must not mutate either.
    const check=proposal();await persistAppQuote(check,{pool});
    const stopBefore=(await pool.query('SELECT stopped FROM crypto_execution_control WHERE id=1')).rows[0].stopped;
    const unknown=crypto.randomUUID();
    await pool.query("INSERT INTO crypto_order_ledger(proposal_id,client_oid,state) VALUES($1,$2,'SUBMISSION_UNKNOWN')",[unknown,unknown]);
    try{
      const r=await reviewAppQuote(check.id,{approved:true,confirmation:check.id,digest:check.digest},{pool});
      assert.ok(r.blockers.includes('UNRESOLVED_EXISTING_ORDER'));assert.equal(r.orderSubmitted,false);
      assert.equal((await pool.query('SELECT stopped FROM crypto_execution_control WHERE id=1')).rows[0].stopped,stopBefore);
      assert.equal((await pool.query('SELECT state FROM crypto_order_ledger WHERE proposal_id=$1',[unknown])).rows[0].state,'SUBMISSION_UNKNOWN');
    }finally{await pool.query('DELETE FROM crypto_order_ledger WHERE proposal_id=$1',[unknown])}
  }finally{await pool.end();await bootstrap.query('DROP SCHEMA '+schema+' CASCADE');await bootstrap.end()}
});
