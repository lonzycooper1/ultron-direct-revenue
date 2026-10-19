import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import {initializeSafety,guardedApproval,persistLiveProposal,loadLiveProposal,stopExecution} from './crypto-order-gateway.mjs';
import {dispatchReservedOrder} from './crypto-reserved-dispatch.mjs';

test('committed dispatch boundary survives concurrency, timeout, restart and malformed acknowledgments',async()=>{
 assert.ok(process.env.DATABASE_URL,'Isolated test DATABASE_URL required');
 const url=new URL(process.env.DATABASE_URL);
 assert.match(url.hostname,/^(localhost|127\.0\.0\.1)$/);assert.match(url.pathname,/test/i);
 const schema='dispatch_test_'+randomUUID().replaceAll('-','');
 const admin=new Pool({connectionString:url.href});
 await admin.query(`CREATE SCHEMA ${schema}`);
 const options={connectionString:url.href,options:'-c search_path='+schema};
 const pool=new Pool(options);
 try{
  await initializeSafety(pool);
  const reserve=async()=>{
   const id=randomUUID();
   await pool.query("INSERT INTO crypto_order_ledger(proposal_id,client_oid,state,order_params) VALUES($1::uuid,$1::text,'RESERVED',$2)",[id,JSON.stringify({instrument:'BTC-USD'})]);
   return id;
  };
  // Exercise the complete approval gateway with a trusted risk fixture and a
  // mock exchange transport, using two clients against real PostgreSQL.
  const freshRisk=()=>({checkedAt:Date.now(),equity:10000,dailyPnlPct:0,availableUsd:10000,baseAvailable:1,exposureUsd:0,price:60000});
  const proposal={id:randomUUID(),instrument:'BTC-USD',side:'BUY',notional:25,price:60000,leverage:1,expiresAt:new Date(Date.now()+120000).toISOString()};
  await persistLiveProposal(proposal,{pool});
  const afterRestart=new Pool(options);
  try{assert.equal((await loadLiveProposal(proposal.id,{pool:afterRestart})).notional,25)}finally{await afterRestart.end()}
  await pool.query('UPDATE crypto_execution_control SET stopped=false WHERE id=1');
  const envelope={order:{instrument:'BTC-USD',side:'BUY',notional:25,price:60000,leverage:1},proposal:{id:proposal.id},approval:{proposalId:proposal.id,permission:'ONE_ORDER_ONLY',approvedAt:new Date().toISOString(),expiresAt:proposal.expiresAt}};
  const buildParams=e=>({client_oid:e.approval.proposalId,instrument_name:'BTC_USD',side:'BUY',notional:'25.00',spot_margin:'SPOT'});
  let gatewayCalls=0;
  const gatewayOptions={pool,readRisk:freshRisk,buildParams,call:async(method,p)=>{gatewayCalls++;assert.equal(p.spot_margin,'SPOT');return {code:0,result:{order_id:'122',client_oid:p.client_oid}}}};
  const changed=structuredClone(envelope);changed.order.notional=26;
  await assert.rejects(guardedApproval(changed,gatewayOptions),/Durable proposal/);
  const concurrent=await Promise.allSettled(Array.from({length:8},()=>guardedApproval(envelope,gatewayOptions)));
  assert.equal(gatewayCalls,1,JSON.stringify(concurrent.map(r=>r.reason?.message||r.value)));assert.equal(concurrent.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await loadLiveProposal(proposal.id,{pool})).status,'CONSUMED');
  await assert.rejects(guardedApproval(envelope,gatewayOptions),/reconciliation/);
  await stopExecution(pool);
  await assert.rejects(guardedApproval(envelope,gatewayOptions),/emergency stop/);
  await pool.query('TRUNCATE crypto_order_ledger,crypto_live_proposals');
  let calls=0;const id=await reserve();
  const call=async(method,p)=>{assert.equal(method,'private/create-order');calls++;await new Promise(r=>setTimeout(r,25));return {code:0,result:{order_id:'123',client_oid:p.client_oid}}};
  const results=await Promise.allSettled(Array.from({length:8},()=>dispatchReservedOrder(pool,id,{client_oid:id},{call})));
  assert.equal(calls,1);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await pool.query('SELECT state FROM crypto_order_ledger WHERE proposal_id=$1',[id])).rows[0].state,'ACCEPTED');
  const timeoutId=await reserve();let timeoutCalls=0;
  const uncertain=await dispatchReservedOrder(pool,timeoutId,{client_oid:timeoutId},{call:async()=>{timeoutCalls++;throw Error('timeout after exchange accepted')}});
  assert.equal(uncertain.state,'SUBMISSION_UNKNOWN');assert.equal(timeoutCalls,1);
  const restarted=new Pool(options);
  try{await assert.rejects(dispatchReservedOrder(restarted,timeoutId,{client_oid:timeoutId},{call:async()=>{throw Error('MUST NOT RESUBMIT')}}),/already claimed/)}finally{await restarted.end()}
  for(const response of [{code:0,result:{}},{code:0,result:{order_id:'123',client_oid:'different'}},{code:40003}]){
   const malformedId=await reserve();
   assert.equal((await dispatchReservedOrder(pool,malformedId,{client_oid:malformedId},{call:async()=>response})).state,'SUBMISSION_UNKNOWN');
  }
  const lostAck=await reserve();
  const unavailable={query:async(sql,args)=>{if(sql.includes("state='ACCEPTED'"))throw Error('database unavailable after exchange acceptance');return pool.query(sql,args)}};
  assert.equal((await dispatchReservedOrder(unavailable,lostAck,{client_oid:lostAck},{call:async()=>({code:0,result:{order_id:'123',client_oid:lostAck}})})).state,'SUBMISSION_UNKNOWN');
  assert.equal((await pool.query('SELECT state FROM crypto_order_ledger WHERE proposal_id=$1',[lostAck])).rows[0].state,'SUBMISSION_UNKNOWN');
  let preclaimCalls=0;
  await assert.rejects(dispatchReservedOrder({query:async()=>{throw Error('database down')}},randomUUID(),{client_oid:'unused'},{call:async()=>{preclaimCalls++}}),/database down/);
  assert.equal(preclaimCalls,0);
  const mismatch=await reserve();let dispatched=false;
  await assert.rejects(dispatchReservedOrder(pool,mismatch,{client_oid:'other'},{call:async()=>{dispatched=true}}),/identifier mismatch/);
  assert.equal(dispatched,false);
 }finally{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end()}
});
