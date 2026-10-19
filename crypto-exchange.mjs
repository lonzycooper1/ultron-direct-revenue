import crypto from 'node:crypto';
import {readCompleteTradeHistory,tradeTimeNs,fillQuantitiesMatch} from './crypto-trade-history.mjs';

const API_BASE='https://api.crypto.com/exchange/v1';
const INSTRUMENT_MAP=Object.freeze({'BTC-USD':'BTC_USD','ETH-USD':'ETH_USD'});

function truthy(v){return /^(1|true|yes|on)$/i.test(String(v||''))}
function objectToString(obj){
  if(obj==null)return '';
  if(Array.isArray(obj))return obj.map(v=>typeof v==='object'?objectToString(v):String(v)).join('');
  if(typeof obj==='object')return Object.keys(obj).sort().map(k=>k+(typeof obj[k]==='object'?objectToString(obj[k]):String(obj[k]))).join('');
  return String(obj);
}

export function liveExecutionConfig(){
  return {
    provider:'Crypto.com Exchange',
    apiConfigured:Boolean(process.env.CRYPTOCOM_API_KEY&&process.env.CRYPTOCOM_API_SECRET),
    liveTradingEnabled:truthy(process.env.CRYPTOCOM_LIVE_TRADING),
    humanApprovalRequired:process.env.CRYPTO_LIVE_APPROVAL_REQUIRED!=='false',
    autonomousLiveOrders:truthy(process.env.CRYPTO_AUTONOMOUS_LIVE_ORDERS),
    supportedInstruments:Object.keys(INSTRUMENT_MAP),
    liveMode:'spot-market-only',
    withdrawals:false
  };
}

export function buildSignedRequest(method,params={},nonce=Date.now()){
  const apiKey=process.env.CRYPTOCOM_API_KEY||'',secret=process.env.CRYPTOCOM_API_SECRET||'';
  if(!apiKey||!secret)throw Error('Crypto.com API credentials are not configured');
  const id=nonce;
  const payload=method+id+apiKey+objectToString(params)+nonce;
  const sig=crypto.createHmac('sha256',secret).update(payload).digest('hex');
  return {id:String(id),method,api_key:apiKey,sig,nonce:String(nonce),params};
}

export async function privateCall(method,params,{transport=fetch,timeoutMs=8000}={}){
  const body=buildSignedRequest(method,params);
  const r=await transport(API_BASE+'/'+method,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(timeoutMs)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error('Crypto.com HTTP '+r.status);
  if(data?.code!==0){
    const error=Error('Crypto.com rejected or malformed response');
    if(Number.isSafeInteger(data?.code))error.providerCode=data.code;
    throw error;
  }
  return data;
}

export function buildSpotOrderParams(envelope){
  const cfg=liveExecutionConfig();
  if(!cfg.apiConfigured)throw Error('Crypto.com API credentials are not configured');
  if(!cfg.liveTradingEnabled)throw Error('Live trading is disabled');
  if(!cfg.humanApprovalRequired)throw Error('Human approval gate must remain enabled');
  if(cfg.autonomousLiveOrders)throw Error('Autonomous live orders are prohibited in this runtime');
  if(envelope?.approval?.permission!=='ONE_ORDER_ONLY')throw Error('One-order human approval required');
  const order=envelope?.order||{};
  const instrument=INSTRUMENT_MAP[order.instrument];
  if(!instrument)throw Error('Instrument is not approved for live execution');
  if(Number(order.leverage||1)!==1)throw Error('Live execution is spot-only; leverage must be 1');
  const notional=Number(order.notional);
  const price=Number(order.price||envelope?.proposal?.price);
  if(!(notional>=1))throw Error('Invalid notional');
  const params={instrument_name:instrument,side:String(order.side||'').toUpperCase(),type:'MARKET',client_oid:String(envelope.approval.proposalId).slice(0,36)};
  if(!['BUY','SELL'].includes(params.side))throw Error('Invalid side');
  if(params.side==='BUY')params.notional=notional.toFixed(2);
  else{
    if(!(price>0))throw Error('Approved reference price required for market sell sizing');
    params.quantity=(notional/price).toFixed(8);
  }
  return params;
}

export async function executeApprovedSpotOrder(envelope,options){
  if(!envelope?.approval)throw Error('Live order execution blocked: approval required');
  const {guardedApproval}=await import('./crypto-order-gateway.mjs');
  return guardedApproval(envelope,options);
}

// Read-only Exchange verification. No create-order calls or trading permission probes.
export async function verifyExchangeReadAccess({transport=fetch}={}){
  if(!liveExecutionConfig().apiConfigured)return {verified:false,reason:'CREDENTIALS_MISSING'};
  try{
    const data=await privateCall('private/user-balance',{}, {transport});
    if(!Array.isArray(data.result?.data)||data.result.data.length!==1||data.result.data[0]?.instrument_name!=='USD')return {verified:false,reason:'UNEXPECTED_ACCOUNT_RESPONSE'};
    const account=data.result.data[0],positions=account.position_balances;
    const usd=Array.isArray(positions)?positions.filter(p=>p?.instrument_name==='USD'):[];
    const amount=x=>(typeof x==='number'||typeof x==='string'&&x.trim()!=='')&&Number.isFinite(Number(x))&&Number(x)>=0;
    const available=usd.length===1&&amount(usd[0].quantity)&&amount(usd[0].reserved_qty)?Number(usd[0].quantity)-Number(usd[0].reserved_qty):null;
    return {verified:true,provider:'Crypto.com Exchange',endpoint:API_BASE,checkedAt:new Date().toISOString(),accountCount:data.result.data.length,
      currentServerRequestAccepted:true,usdFundsAvailable:available===null?null:available>0,
      tradePermission:'UNVERIFIED',accountEligibility:'UNVERIFIED',withdrawalPermission:'UNVERIFIED',
      note:'Read authentication is not trading authorization. No order or permission-changing request was sent.'};
  }catch(error){
    return {verified:false,reason:'READ_ONLY_VERIFICATION_FAILED',...(Number.isSafeInteger(error?.providerCode)?{providerCode:error.providerCode}:{}),detail:String(error?.message||error).slice(0,160)};
  }
}

const strictNumber=value=>{
  if((typeof value!=='string'&&typeof value!=='number')||String(value).trim()===''||!Number.isFinite(Number(value)))throw Error('Invalid exchange numeric field');
  return Number(value);
};
export async function readExchangeRisk(instrument,{transport=fetch}={}){
  const base=instrument==='BTC-USD'?'BTC':instrument==='ETH-USD'?'ETH':null;
  if(!base)throw Error('Unsupported instrument');
  const started=Date.now();
  const data=await privateCall('private/user-balance',{}, {transport});
  const accounts=data.result?.data;
  if(!Array.isArray(accounts)||accounts.length!==1||accounts[0].instrument_name!=='USD')throw Error('Unsupported account balance response');
  const account=accounts[0],positions=account.position_balances;
  if(account.is_liquidating!==false||!Array.isArray(positions)||strictNumber(account.total_initial_margin)!==0||strictNumber(account.total_maintenance_margin)!==0)throw Error('Account is not verified unleveraged spot');
  if(positions.some(p=>strictNumber(p.quantity)<0))throw Error('Borrowed balances prohibited');
  const usd=positions.filter(p=>p.instrument_name==='USD'),asset=positions.filter(p=>p.instrument_name===base);
  if(usd.length!==1||asset.length!==1)throw Error('Missing or ambiguous balances');
  const quantity=strictNumber(asset[0].quantity),value=strictNumber(asset[0].market_value);
  // Zero balances cannot provide an exchange-derived sizing price; fail closed.
  if(quantity<=0||value<=0)throw Error('Exchange valuation price unavailable');
  const equity=strictNumber(account.total_cash_balance);
  // Session P&L is NOT daily P&L. Do not silently substitute it, zero, or a
  // browser-provided value. A certified daily accounting adapter is required.
  throw Error('Trusted daily P&L accounting is not yet certified; live execution blocked');
}
export async function reconcileExchangeOrder(clientOid,expected,{transport=fetch,historyOptions={}}={}){
  try{
    const data=await privateCall('private/get-order-detail',{client_oid:clientOid},{transport});
    const order=data.result;
    if(!order||order.client_oid!==clientOid||!String(order.order_id||'')||!expected||order.instrument_name!==INSTRUMENT_MAP[expected.instrument]||order.side!==expected.side||!['ACTIVE','FILLED','CANCELED','EXPIRED','REJECTED'].includes(order.status))return {verified:false};
    if(!['FILLED','REJECTED'].includes(order.status))return {verified:false};
    const history=await readCompleteTradeHistory({...historyOptions,
      call:(method,params)=>privateCall(method,params,{transport}),instrument:order.instrument_name,
      startNs:String(tradeTimeNs(order)),endNs:String(BigInt(Date.now()+1)*1000000n)});
    const matching=history.trades.filter(t=>String(t.order_id)===String(order.order_id));
    if(matching.some(t=>t.client_oid!==clientOid||t.instrument_name!==order.instrument_name||t.side!==order.side||strictNumber(t.traded_quantity)<=0))return {verified:false};
    const quantity=matching.reduce((sum,t)=>sum+strictNumber(t.traded_quantity),0);
    if(!fillQuantitiesMatch(matching,order.cumulative_quantity))return {verified:false};
    // Re-read after recovery: changing order identity/status/quantity cannot be
    // finalized using an earlier snapshot of history.
    const final=(await privateCall('private/get-order-detail',{client_oid:clientOid},{transport})).result;
    if(!final||['client_oid','order_id','instrument_name','side','status','cumulative_quantity'].some(k=>String(final[k])!==String(order[k])))return {verified:false};
    return {verified:true,orderId:String(order.order_id),clientOid,status:order.status,filledQuantity:quantity,fills:matching,history:{complete:true,pages:history.pages,startNs:history.startNs,endNs:history.endNs},checkedAt:new Date().toISOString()};
  }catch{return {verified:false}}
}
