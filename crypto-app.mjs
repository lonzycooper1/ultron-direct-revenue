import crypto from 'node:crypto';
import os from 'node:os';

const BASE='https://wapi.crypto.com';
const READ_PATHS=new Set(['/v1/fiat-account','/v1/crypto-account','/v1/api-keys/current']);
const QUOTE_PATHS=new Set(['/v1/crypto-purchase/quotations','/v1/crypto-sales/quotations']);
const SAFE_CODES=new Set(['unauthorized','restricted_feature','key_not_active','api_key_not_found','invalid_quotation','not_enough_balance','existing_currency_order_error','viban_purchase_not_enabled','crypto_viban_not_enabled']);

export function appExecutionConfig(){
  return {provider:'Crypto.com App',providerId:'crypto-com-app',
    apiConfigured:Boolean(process.env.CDC_API_KEY&&process.env.CDC_API_SECRET),
    liveTradingEnabled:false,humanApprovalRequired:true,autonomousLiveOrders:false,
    supportedInstruments:['BTC-USD','ETH-USD'],liveMode:'app-read-only-pending-certification',
    withdrawals:false,credentialVariables:['CDC_API_KEY','CDC_API_SECRET'],
    setupPath:'Crypto.com App → More → Agent Key'};
}

// App authentication differs from Exchange: base64 HMAC over timestamp,
// HTTP method, path and body. Never reuse the Exchange key pair or signature.
export function appRequestHeaders(method,path,body,timestamp=Date.now()){
  if(!(method==='GET'&&READ_PATHS.has(path)||method==='POST'&&QUOTE_PATHS.has(path)))throw Error('Unsupported Crypto.com App endpoint');
  const key=process.env.CDC_API_KEY,secret=process.env.CDC_API_SECRET;
  if(!key||!secret)throw Object.assign(Error('App Agent Key required'),{diagnostic:'CREDENTIALS_MISSING'});
  if(key.trim()!==key||secret.trim()!==secret)throw Object.assign(Error('Invalid App credential format'),{diagnostic:'CREDENTIAL_FORMAT_INVALID'});
  if(!Number.isSafeInteger(timestamp)||timestamp<0)throw Error('Invalid timestamp');
  const stamp=String(timestamp);
  return {'User-Agent':`Node/${process.version} ${os.platform()}/${os.release()}-cdc-clawbot/1.0`,'Accept':'application/json',
    'Cdc-Api-Key':key,'Cdc-Api-Timestamp':stamp,
    ...(body?{'Content-Type':'application/json'}:{}),
    'Cdc-Api-Signature':crypto.createHmac('sha256',secret).update(stamp+method+path+(body?JSON.stringify(body):'')).digest('base64')};
}
export function appReadHeaders(path,timestamp=Date.now()){
  if(!READ_PATHS.has(path))throw Error('Unsupported Crypto.com App read endpoint');
  return appRequestHeaders('GET',path,undefined,timestamp);
}

export async function appRead(path,{transport=fetch}={}){
  const headers=appReadHeaders(path);
  const response=await transport(BASE+path,{method:'GET',headers,redirect:'error',signal:AbortSignal.timeout(8000)});
  const data=await response.json().catch(()=>null);
  if(!response.ok||data?.ok!==true){
    // Provider messages can contain account data; return only bounded categories.
    const diagnostic=response.status===401?'HTTP_UNAUTHORIZED':response.status===403?'HTTP_ACCESS_DENIED':response.status===429?'RATE_LIMITED':'HTTP_OR_PROVIDER_ERROR';
    const providerError=SAFE_CODES.has(data?.error)?data.error:undefined;
    throw Object.assign(Error('Crypto.com App read rejected'),{httpStatus:response.status,diagnostic,providerError});
  }
  return data;
}

// Quotes do not execute trades. Order, withdrawal and transfer endpoints are
// deliberately absent from this transport's allowlist.
export async function appQuotation(type,params,{transport=fetch}={}){
  const path=type==='purchase'?'/v1/crypto-purchase/quotations':type==='sale'?'/v1/crypto-sales/quotations':null;
  if(!path)throw Error('Unsupported App spot quotation');
  const headers=appRequestHeaders('POST',path,params);
  const started=Date.now();
  const response=await transport(BASE+path,{method:'POST',headers,body:JSON.stringify(params),redirect:'error',signal:AbortSignal.timeout(8000)});
  const data=await response.json().catch(()=>null);
  if(!response.ok||data?.ok!==true||!data.quotation)throw Error('App quotation rejected or malformed; no order submitted');
  return {quotation:data.quotation,requestedAt:started,receivedAt:Date.now()};
}

export async function verifyAppReadAccess(options={}){
  const common={provider:'Crypto.com App',endpoint:BASE,checkedAt:new Date().toISOString(),tradePermission:'UNVERIFIED',liveOrders:false};
  if(!appExecutionConfig().apiConfigured)return {...common,verified:false,reason:'CREDENTIALS_MISSING'};
  try{
    const fiat=await appRead('/v1/fiat-account',options);
    const coins=await appRead('/v1/crypto-account',options);
    if(!Array.isArray(fiat.account?.balances)||!Array.isArray(coins.account?.wallets))return {...common,verified:false,reason:'UNEXPECTED_ACCOUNT_RESPONSE'};
    return {...common,verified:true,currentServerRequestAccepted:true,
      note:'App read authentication only; no trade, transfer or withdrawal was submitted.'};
  }catch(error){
    const allowed=['CREDENTIAL_FORMAT_INVALID','HTTP_UNAUTHORIZED','HTTP_ACCESS_DENIED','RATE_LIMITED','HTTP_OR_PROVIDER_ERROR'];
    return {...common,verified:false,reason:'READ_ONLY_VERIFICATION_FAILED',
      diagnostic:allowed.includes(error.diagnostic)?error.diagnostic:error.name==='TimeoutError'?'REQUEST_TIMEOUT':'NETWORK_OR_CONFIGURATION_ERROR',
      ...(SAFE_CODES.has(error.providerError)?{providerError:error.providerError}:{}),
      ...(Number.isInteger(error.httpStatus)&&error.httpStatus>=100&&error.httpStatus<=599?{httpStatus:error.httpStatus}:{})};
  }
}
