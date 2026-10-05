import crypto from 'node:crypto';

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

async function privateCall(method,params){
  const body=buildSignedRequest(method,params);
  const r=await fetch(API_BASE+'/'+method,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(body)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error('Crypto.com HTTP '+r.status);
  if(Number(data.code)!==0)throw Error('Crypto.com '+String(data.message||data.code||'order rejected'));
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

export async function executeApprovedSpotOrder(envelope){
  const params=buildSpotOrderParams(envelope);
  const data=await privateCall('private/create-order',params);
  return {
    accepted:true,
    provider:'Crypto.com Exchange',
    orderId:data?.result?.order_id?String(data.result.order_id):null,
    clientOrderId:data?.result?.client_oid?String(data.result.client_oid):params.client_oid,
    instrument:params.instrument_name,
    side:params.side,
    type:'MARKET',
    submittedAt:new Date().toISOString(),
    note:'Exchange create-order is asynchronous; acceptance does not guarantee final fill.'
  };
}
