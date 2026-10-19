// Shared, fail-closed gate for every HTTP approval route. No activation API.
import {Pool} from 'pg';
import {installSafetySchema,setEmergencyStop,assertNotStopped,reserveOrder} from './crypto-durable-safety.mjs';
import {LIVE_APPROVAL_RULES} from './crypto-live-approval.mjs';
import {readExchangeRisk,reconcileExchangeOrder} from './crypto-exchange.mjs';
let singleton;
export function safetyPool(){
  if(!process.env.DATABASE_URL)throw Error('PostgreSQL safety database required');
  return singleton ||= new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:3000,query_timeout:10000});
}
export async function initializeSafety(pool=safetyPool()){
  await installSafetySchema(pool);
  await pool.query(`ALTER TABLE crypto_order_ledger ADD COLUMN IF NOT EXISTS evidence jsonb;
    ALTER TABLE crypto_order_ledger ADD COLUMN IF NOT EXISTS order_params jsonb;`);
}
export async function stopExecution(pool=safetyPool()){
  await initializeSafety(pool);
  await setEmergencyStop(pool);
}
export async function trustedProposalRisk(instrument){return readExchangeRisk(instrument)}
export async function guardedApproval(envelope,{pool=safetyPool(),readRisk=readExchangeRisk}={}){
  await initializeSafety(pool);
  const c=await pool.connect();
  try{
    await c.query('BEGIN');
    // All orders and the durable stop serialize on the same control row.
    await c.query('SELECT id FROM crypto_execution_control WHERE id=1 FOR UPDATE');
    await assertNotStopped(c);
    const id=envelope?.approval?.proposalId;
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id||''))throw Error('Invalid proposal ID');
    if(envelope.approval.permission!=='ONE_ORDER_ONLY'||envelope.proposal?.id!==id)throw Error('Matching one-order approval required');
    const approved=Date.parse(envelope.approval.approvedAt),expiry=Date.parse(envelope.approval.expiresAt);
    if(!Number.isFinite(approved)||!Number.isFinite(expiry)||approved>Date.now()||expiry<=Date.now()||Date.now()-approved>LIVE_APPROVAL_RULES.approvalTtlSeconds*1000)throw Error('Approval expired or invalid');
    // Any unresolved earlier order blocks every new proposal, including after restart.
    const pending=await c.query("SELECT proposal_id FROM crypto_order_ledger WHERE state<>'REJECTED' LIMIT 1");
    if(pending.rows.length)throw Error('Existing order requires reconciliation and risk review');
    const order=envelope.order||{},notional=Number(order.notional);
    if(!LIVE_APPROVAL_RULES.instruments.includes(order.instrument)||!['BUY','SELL'].includes(order.side)||order.leverage!==1||!Number.isFinite(notional)||notional<1||notional>LIVE_APPROVAL_RULES.maxOrderUsd)throw Error('Order violates server policy');
    const risk=await readRisk(order.instrument);
    validateRisk(order,risk);
    await reserveOrder(c,id,id);
    await c.query('UPDATE crypto_order_ledger SET evidence=$2,order_params=$3 WHERE proposal_id=$1',[id,JSON.stringify(risk),JSON.stringify(order)]);
    // Certification is not complete and NO exchange dispatch will occur.
    // Reject within the transaction so its speculative reservation is rolled
    // back. Committing a RESERVED row when no order was submitted creates a
    // phantom unresolved order and permanently blocks future approvals.
    // When a reviewed dispatch path is built, it must commit its reservation
    // before any exchange request, with durable uncertainty handling.
    throw Error('Live order execution blocked: deployment safety certification pending');
  }catch(error){await c.query('ROLLBACK').catch(()=>{});throw error}finally{c.release()}
}
export function validateRisk(order,risk,now=Date.now()){
  const finite=v=>typeof v==='number'&&Number.isFinite(v);
  if(!risk||!finite(risk.checkedAt)||now-risk.checkedAt>5000||risk.checkedAt>now||!finite(risk.equity)||risk.equity<=0||!finite(risk.dailyPnlPct)||!finite(risk.availableUsd)||risk.availableUsd<0||!finite(risk.baseAvailable)||risk.baseAvailable<0||!finite(risk.exposureUsd)||risk.exposureUsd<0||!finite(risk.price)||risk.price<=0)throw Error('Trusted risk data missing, stale or invalid');
  if(risk.dailyPnlPct<=-LIVE_APPROVAL_RULES.maxDailyLossPct)throw Error('Daily loss limit reached');
  const n=Number(order.notional);
  if(n/risk.equity>LIVE_APPROVAL_RULES.maxPositionPct||(order.side==='BUY'&&(risk.exposureUsd+n)/risk.equity>LIVE_APPROVAL_RULES.maxPositionPct))throw Error('Aggregate position limit reached');
  if(order.side==='BUY'&&n*1.01>risk.availableUsd)throw Error('Insufficient unreserved cash including fee buffer');
  if(order.side==='SELL'&&n/risk.price>risk.baseAvailable)throw Error('Insufficient unreserved spot holdings');
  if(!Number.isFinite(Number(order.price))||Number(order.price)<=0)throw Error('Approved reference price invalid');
  if(Math.abs(Number(order.price)/risk.price-1)>.01)throw Error('Approved reference price moved; new approval required');
}
export async function reconcileProposal(id,{pool=safetyPool(),lookup=reconcileExchangeOrder}={}){
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id||''))throw Error('Invalid proposal ID');
  await initializeSafety(pool);
  const {rows}=await pool.query('SELECT * FROM crypto_order_ledger WHERE proposal_id=$1',[id]);
  if(rows.length!==1)throw Error('Order reservation missing');
  const row=rows[0];
  // Terminal records cannot be rewritten by a stale read or later lookup.
  if(['REJECTED','RECONCILED'].includes(row.state))return {state:row.state,alreadyFinal:true};
  // Reconciliation queries the exchange only. Unknown/missing/partial history
  // must never be interpreted as rejection or proof of final settlement.
  const evidence=await lookup(row.client_oid,row.order_params);
  if(!evidence?.verified||evidence.clientOid!==row.client_oid||!String(evidence.orderId||'')||!Number.isFinite(evidence.filledQuantity)||evidence.filledQuantity<0)return {state:row.state,requiresInvestigation:true};
  // ACTIVE, CANCELED and EXPIRED may still have fills or unresolved settlement.
  // Reject only a fully verified zero-fill rejection. A FILLED status requires
  // positive independently matched fills. All other statuses stay unresolved.
  const finalState=evidence.status==='REJECTED'&&evidence.filledQuantity===0?'REJECTED':
    evidence.status==='FILLED'&&evidence.filledQuantity>0?'RECONCILED':null;
  if(!finalState)return {state:row.state,requiresInvestigation:true,evidence};
  // Compare-and-swap ensures concurrent reconciliation cannot overwrite
  // a terminal decision or a more recent ledger state.
  const updated=await pool.query(`UPDATE crypto_order_ledger SET state=$2,evidence=COALESCE(evidence,'{}'::jsonb)||$3::jsonb,updated_at=now() WHERE proposal_id=$1 AND state=$4 RETURNING state`,
    [id,finalState,JSON.stringify({reconciliation:evidence}),row.state]);
  if(updated.rows.length!==1)return {state:row.state,requiresInvestigation:true,concurrentChange:true};
  return {state:finalState,evidence};
}
