import crypto from 'node:crypto';
import {appQuotation,verifyAppReadAccess,appRead} from './crypto-app.mjs';
import {LIVE_APPROVAL_RULES} from './crypto-live-approval.mjs';
import {initializeSafety,safetyPool} from './crypto-order-gateway.mjs';

const PROVIDER='crypto-com-app';
const S=10n**18n;
const units=value=>{
  if(typeof value!=='string'||!/^\d+(?:\.\d{1,18})?$/.test(value)||value.length>50)throw Error('Exact positive decimal string required');
  const [a,b='']=value.split('.');return BigInt(a)*S+BigInt(b.padEnd(18,'0'));
};
const fingerprint=()=>{
  if(!process.env.CDC_API_KEY)throw Error('App Agent Key required');
  return crypto.createHash('sha256').update(PROVIDER+'\0'+process.env.CDC_API_KEY).digest('hex');
};
// PostgreSQL jsonb reorders object keys. Hash a canonical representation so
// reloading an unchanged quote never invalidates its exact approval binding.
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
export const appQuoteDigest=value=>crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const uuid=id=>{if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id||''))throw Error('Invalid App proposal ID')};

export function appQuoteIntent(input){
  if(!input||!['BTC-USD','ETH-USD'].includes(input.instrument)||!LIVE_APPROVAL_RULES.instruments.includes(input.instrument)||!['BUY','SELL'].includes(input.side)||input.leverage!==undefined&&input.leverage!==1)throw Error('Only approved BTC/ETH spot trades at 1x are supported');
  // BUY amount is USD; SELL amount is the base asset quantity. No implicit
  // conversion from a browser-provided market price is ever allowed.
  const quantity=units(input.amount);
  if(quantity<=0n)throw Error('Positive quote amount required');
  if(input.side==='BUY'&&(quantity<S||quantity>units(String(LIVE_APPROVAL_RULES.maxOrderUsd))))throw Error('Quote violates server USD order limit');
  const base=input.instrument.slice(0,3),type=input.side==='BUY'?'purchase':'sale';
  const params={from_currency:type==='purchase'?'USD':base,to_currency:type==='purchase'?base:'USD',from_amount:input.amount,...(type==='sale'?{fixed_side:'from'}:{})};
  return {provider:PROVIDER,instrument:input.instrument,side:input.side,amount:input.amount,leverage:1,type,params};
}

export function bindAppQuotation(intent,result,{now=Date.now(),account=fingerprint()}={}){
  const q=result?.quotation;
  if(!q||typeof q.id!=='string'||!q.id||q.id.length>200||typeof q.countdown!=='number'||!Number.isFinite(q.countdown)||q.countdown<=0||q.countdown>600||!Number.isSafeInteger(result.requestedAt)||!Number.isSafeInteger(result.receivedAt)||result.receivedAt<result.requestedAt||result.receivedAt>now||now-result.receivedAt>5000)throw Error('Unverified App quote identity or expiry');
  if(q.from_amount?.currency!==intent.params.from_currency||q.to_amount?.currency!==intent.params.to_currency||units(q.from_amount?.amount)!==units(intent.amount)||units(q.to_amount?.amount)<=0n)throw Error('Provider quote does not match requested currencies and amount');
  const usd=intent.side==='BUY'?q.from_amount.amount:q.to_amount.amount;
  if(units(usd)<S||units(usd)>units(String(LIVE_APPROVAL_RULES.maxOrderUsd)))throw Error('Quoted USD value violates order policy');
  // Subtract the entire request duration plus a second, rather than restarting
  // a provider countdown when its response arrives.
  const expiresAt=Math.min(result.requestedAt+Math.floor(q.countdown*1000)-1000,now+LIVE_APPROVAL_RULES.approvalTtlSeconds*1000);
  if(expiresAt<=now)throw Error('App quote expired; request a new quotation');
  const binding={provider:PROVIDER,account,instrument:intent.instrument,side:intent.side,leverage:1,type:intent.type,quotationId:q.id,
    from:{currency:q.from_amount.currency,amount:q.from_amount.amount},to:{currency:q.to_amount.currency,amount:q.to_amount.amount},expiresAt};
  return {id:crypto.randomUUID(),status:'AWAITING_HUMAN_APPROVAL',binding,digest:appQuoteDigest(binding),createdAt:now,
    execution:'NOT_SUBMITTED',fees:'UNVERIFIED',slippage:'EXACT_QUOTED_AMOUNTS_ONLY',liveOrders:false};
}

export async function initializeAppApprovals(pool=safetyPool()){
  await initializeSafety(pool);
  await pool.query(`CREATE TABLE IF NOT EXISTS crypto_app_proposals(
    id uuid PRIMARY KEY,account_fingerprint text NOT NULL,quotation_id text NOT NULL,
    payload jsonb NOT NULL,digest text NOT NULL,status text NOT NULL CHECK(status IN ('AWAITING_HUMAN_APPROVAL','REVIEWED_BLOCKED')),
    expires_at timestamptz NOT NULL,reviewed_at timestamptz,
    UNIQUE(account_fingerprint,quotation_id));`);
}
export async function persistAppQuote(proposal,{pool=safetyPool()}={}){
  await initializeAppApprovals(pool);
  const {rows}=await pool.query(`INSERT INTO crypto_app_proposals(id,account_fingerprint,quotation_id,payload,digest,status,expires_at)
    VALUES($1,$2,$3,$4,$5,'AWAITING_HUMAN_APPROVAL',$6) ON CONFLICT DO NOTHING RETURNING id`,
    [proposal.id,proposal.binding.account,proposal.binding.quotationId,JSON.stringify(proposal),proposal.digest,new Date(proposal.binding.expiresAt)]);
  if(rows.length!==1)throw Error('Quote already recorded; never reuse a provider quotation');
  return publicAppQuote(proposal);
}
export function publicAppQuote(proposal){
  const {account,...binding}=proposal.binding;
  return {id:proposal.id,status:proposal.status,binding,digest:proposal.digest,createdAt:proposal.createdAt,
    execution:'NOT_SUBMITTED',fees:'UNVERIFIED',slippage:proposal.slippage,liveOrders:false};
}
export async function createAppQuote(input,{pool=safetyPool(),quote=appQuotation}={}){
  const intent=appQuoteIntent(input);
  const account=fingerprint();
  const result=await quote(intent.type,intent.params);
  // Key rotation while a request was in flight requires a fresh quote.
  if(account!==fingerprint())throw Error('App account configuration changed');
  return persistAppQuote(bindAppQuotation(intent,result,{account}),{pool});
}
export async function loadAppQuote(id,{pool=safetyPool()}={}){
  uuid(id);await initializeAppApprovals(pool);
  const row=(await pool.query('SELECT payload,status,account_fingerprint FROM crypto_app_proposals WHERE id=$1',[id])).rows[0];
  if(!row||row.account_fingerprint!==fingerprint())return null;
  return publicAppQuote({...row.payload,status:row.status});
}

// Atomic, persisted approval-boundary rehearsal. This deliberately CANNOT
// dispatch an order, clear a stop, or turn an approval into a future permission.
// A fresh quote and a separate reviewed dispatch implementation are necessary
// once production accounting and recovery capabilities have been certified.
export async function reviewAppQuote(id,confirmation,{pool=safetyPool()}={}){
  uuid(id);await initializeAppApprovals(pool);
  if(confirmation?.approved!==true||confirmation?.confirmation!==id||typeof confirmation.digest!=='string')throw Error('Explicit matching owner confirmation and quote digest required');
  const c=await pool.connect();
  try{
    await c.query('BEGIN');
    await c.query('SELECT id FROM crypto_execution_control WHERE id=1 FOR UPDATE');
    const row=(await c.query('SELECT * FROM crypto_app_proposals WHERE id=$1 FOR UPDATE',[id])).rows[0];
    if(!row||row.status!=='AWAITING_HUMAN_APPROVAL')throw Error('App quote missing or already reviewed');
    const p=row.payload,b=p.binding;
    if(row.account_fingerprint!==fingerprint()||b.account!==row.account_fingerprint||b.provider!==PROVIDER||row.quotation_id!==b.quotationId||row.digest!==appQuoteDigest(b)||row.digest!==confirmation.digest||p.digest!==row.digest)throw Error('App quote binding changed');
    if(new Date(row.expires_at).getTime()!==b.expiresAt||b.expiresAt<=Date.now())throw Error('App quote expired; new quote and approval required');
    const stop=(await c.query('SELECT stopped FROM crypto_execution_control WHERE id=1')).rows;
    const legacy=(await c.query("SELECT proposal_id FROM crypto_order_ledger WHERE state NOT IN ('REJECTED','RECONCILED') LIMIT 1")).rows;
    const blockers=[...(!stop.length||stop[0].stopped!==false?['PERSISTENT_EMERGENCY_STOP']:[]),
      ...(legacy.length?['UNRESOLVED_EXISTING_ORDER']:[]),...appCertificationBlockers()];
    await c.query("UPDATE crypto_app_proposals SET status='REVIEWED_BLOCKED',reviewed_at=now() WHERE id=$1",[id]);
    await c.query('COMMIT');
    return {id,status:'REVIEWED_BLOCKED',ownerConfirmationRecorded:true,executionPermission:false,liveOrders:false,orderSubmitted:false,blockers};
  }catch(error){await c.query('ROLLBACK').catch(()=>{});throw error}finally{c.release()}
}

export function appCertificationBlockers(){
  return ['APP_DAILY_ACCOUNTING_ADAPTER_UNVERIFIED','APP_QUOTE_FEES_UNVERIFIED','APP_TRANSACTION_RECOVERY_UNVERIFIED','APP_DISPATCH_NOT_CERTIFIED'];
}
export async function appReadiness({transport=fetch}={}){
  const authentication=await verifyAppReadAccess({transport});
  let budgetReadVerified=false;
  if(authentication.verified){
    try{
      const data=await appRead('/v1/api-keys/current',{transport}),key=data.api_key;
      const limit=units(key?.weekly_trading_limit_in_usd),remaining=units(key?.remaining_weekly_trading_limit_in_usd);
      budgetReadVerified=limit>=0n&&remaining>=0n&&remaining<=limit;
    }catch{/* Missing/malformed budget evidence is never substituted with zero. */}
  }
  return {provider:PROVIDER,authentication,budgetReadVerified,permissions:'UNVERIFIED',liveOrders:false,
    blockers:[...(!authentication.verified?['APP_READ_AUTHENTICATION_UNVERIFIED']:[]),...(!budgetReadVerified?['APP_BUDGET_UNVERIFIED']:[]),...appCertificationBlockers()]};
}
