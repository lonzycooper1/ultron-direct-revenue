import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import {guardedApproval,initializeSafety,stopExecution,validateRisk,reconcileProposal} from './crypto-order-gateway.mjs';
import {readExchangeRisk,reconcileExchangeOrder} from './crypto-exchange.mjs';
const risk=()=>({checkedAt:Date.now(),equity:10000,dailyPnlPct:0,availableUsd:10000,baseAvailable:1,exposureUsd:0,price:60000});
const order={instrument:'BTC-USD',side:'BUY',notional:25,price:60000,leverage:1};
function envelope(){const id=randomUUID();return {order,proposal:{id},approval:{proposalId:id,permission:'ONE_ORDER_ONLY',approvedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+120000).toISOString()}}}
test('risk rejects stale, missing, nonfinite, loss, aggregate exposure and funds',()=>{
  validateRisk(order,risk());
  for(const patch of [{checkedAt:Date.now()-6000},{dailyPnlPct:NaN},{dailyPnlPct:-.03},{equity:Infinity},{exposureUsd:499},{exposureUsd:-1},{availableUsd:25},{availableUsd:-1},{baseAvailable:-1},{price:59000}])assert.throws(()=>validateRisk(order,{...risk(),...patch}));
  assert.throws(()=>validateRisk({...order,side:'SELL'},{...risk(),baseAvailable:0}));
  for(const price of [undefined,NaN,0,-1,Infinity])assert.throws(()=>validateRisk({...order,price},risk()));
});
test('exchange read-only risk cannot substitute session P&L for daily P&L',async()=>{
  const old=[process.env.CRYPTOCOM_API_KEY,process.env.CRYPTOCOM_API_SECRET];
  process.env.CRYPTOCOM_API_KEY='mock';process.env.CRYPTOCOM_API_SECRET='mock';
  try{await assert.rejects(readExchangeRisk('BTC-USD',{transport:async()=>({ok:true,json:async()=>({code:0,result:{data:[{instrument_name:'USD',is_liquidating:false,total_initial_margin:'0',total_maintenance_margin:'0',total_cash_balance:'10000',total_session_realized_pnl:'0',position_balances:[{instrument_name:'USD',quantity:'9000',market_value:'9000'},{instrument_name:'BTC',quantity:'.01',market_value:'600'}]}]}})})}),/daily P&L/)}finally{for(const [i,k] of ['CRYPTOCOM_API_KEY','CRYPTOCOM_API_SECRET'].entries())if(old[i]===undefined)delete process.env[k];else process.env[k]=old[i]}
});
test('reconciliation checks identity and fills; never calls create-order',async()=>{
 const old=[process.env.CRYPTOCOM_API_KEY,process.env.CRYPTOCOM_API_SECRET];process.env.CRYPTOCOM_API_KEY='mock';process.env.CRYPTOCOM_API_SECRET='mock';
 const calls=[];let qty='.001',oid='client';
 const transport=async(url)=>{calls.push(url);assert.doesNotMatch(url,/create-order/);return {ok:true,json:async()=>({code:0,result:url.endsWith('get-order-detail')?{client_oid:oid,order_id:'1',instrument_name:'BTC_USD',side:'BUY',status:'FILLED',cumulative_quantity:'.001'}:{data:[{order_id:'1',traded_quantity:qty}]}})}};
 try{
  assert.equal((await reconcileExchangeOrder('client',order,{transport})).verified,true);
  qty='.0005';assert.equal((await reconcileExchangeOrder('client',order,{transport})).verified,false);
  oid='other';assert.equal((await reconcileExchangeOrder('client',order,{transport})).verified,false);
  assert.equal((await reconcileExchangeOrder('client',order,{transport:async()=>{throw Error('timeout')}})).verified,false);
 }finally{for(const [i,k] of ['CRYPTOCOM_API_KEY','CRYPTOCOM_API_SECRET'].entries())if(old[i]===undefined)delete process.env[k];else process.env[k]=old[i]}
});
test('PostgreSQL deployment controls: concurrency, restart persistence, ambiguity and fail-closed certification',async()=>{
 assert.ok(process.env.DATABASE_URL,'DATABASE_URL required for deployment safety test');
 const database=new URL(process.env.DATABASE_URL);
 assert.match(database.hostname,/^(localhost|127\.0\.0\.1)$/,'Integration tests require an isolated loopback database');
 assert.match(database.pathname,/test/i,'Integration tests require a test database');
 const pool=new Pool({connectionString:process.env.DATABASE_URL});
 try{
  await initializeSafety(pool);
  await pool.query('TRUNCATE crypto_order_ledger');
  await stopExecution(pool);
  await assert.rejects(guardedApproval(envelope(),{pool,readRisk:risk}),/emergency stop/);
  const second=new Pool({connectionString:process.env.DATABASE_URL});
  try{await assert.rejects(guardedApproval(envelope(),{pool:second,readRisk:risk}),/emergency stop/)}finally{await second.end()}
  // This isolated test database is the only place the stop is cleared.
  await pool.query('UPDATE crypto_execution_control SET stopped=false WHERE id=1');
  const env=envelope();
  const results=await Promise.allSettled(Array.from({length:8},()=>guardedApproval(env,{pool,readRisk:risk})));
  assert.equal(results.filter(x=>x.status==='fulfilled').length,0);
  const rows=(await pool.query('SELECT * FROM crypto_order_ledger')).rows;
  // This gate did not dispatch to an exchange. A blocked request MUST NOT
  // commit a phantom RESERVED row, even under concurrent approval retries.
  assert.equal(rows.length,0);
  assert.ok(results.every(x=>x.status==='rejected'&&/certification/.test(x.reason?.message)));
  await assert.rejects(reconcileProposal(env.approval.proposalId,{pool,lookup:async()=>({verified:false})}),/Order reservation missing/);
  await assert.rejects(guardedApproval(envelope(),{pool,readRisk:risk}),/certification/);
  // Legacy/uncertain reservations cannot be declared reconciled on partial
  // history, ACTIVE, canceled, or a rejected order with existing fills.
  const id=randomUUID();
  await pool.query("INSERT INTO crypto_order_ledger(proposal_id,client_oid,state) VALUES($1::uuid,$1::text,'SUBMISSION_UNKNOWN')",[id]);
  const evidence=(status,filledQuantity)=>({verified:true,clientOid:id,orderId:'exchange-test-1',status,filledQuantity});
  let state=await reconcileProposal(id,{pool,lookup:async()=>evidence('ACTIVE',0)});
  assert.equal(state.requiresInvestigation,true);
  assert.equal((await pool.query('SELECT state FROM crypto_order_ledger WHERE proposal_id=$1',[id])).rows[0].state,'SUBMISSION_UNKNOWN');
  state=await reconcileProposal(id,{pool,lookup:async()=>evidence('CANCELED',0)});
  assert.equal(state.requiresInvestigation,true);
  state=await reconcileProposal(id,{pool,lookup:async()=>evidence('REJECTED',0.01)});
  assert.equal(state.requiresInvestigation,true);
  state=await reconcileProposal(id,{pool,lookup:async()=>({...evidence('REJECTED',0),clientOid:'mismatched-id'})});
  assert.equal(state.requiresInvestigation,true);
  state=await reconcileProposal(id,{pool,lookup:async()=>evidence('REJECTED',0)});
  assert.equal(state.state,'REJECTED');
  state=await reconcileProposal(id,{pool,lookup:async()=>{throw Error('Final states must never be reopened')}});
  assert.equal(state.alreadyFinal,true);
  assert.equal((await pool.query('SELECT state FROM crypto_order_ledger WHERE proposal_id=$1',[id])).rows[0].state,'REJECTED');
  const secondId=randomUUID();
  await pool.query("INSERT INTO crypto_order_ledger(proposal_id,client_oid,state) VALUES($1::uuid,$1::text,'SUBMISSION_UNKNOWN')",[secondId]);
  state=await reconcileProposal(secondId,{pool,lookup:async()=>({verified:true,clientOid:secondId,orderId:'exchange-test-2',status:'FILLED',filledQuantity:0})});
  assert.equal(state.requiresInvestigation,true);
  state=await reconcileProposal(secondId,{pool,lookup:async()=>({verified:true,clientOid:secondId,orderId:'exchange-test-2',status:'FILLED',filledQuantity:0.001})});
  assert.equal(state.state,'RECONCILED');
  await assert.rejects(reconcileProposal('invalid-proposal-id',{pool,lookup:async()=>{throw Error('No external calls')}}),/Invalid proposal ID/);
  await stopExecution(pool);
 }finally{await pool.end()}
});
