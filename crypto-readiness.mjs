import {verifyExchangeReadAccess} from './crypto-exchange.mjs';

// One read-only authentication check per process start. Never change execution
// flags, expose balances/keys, or infer trade permission from read permission.
export async function checkReadOnlyStartup({verify=verifyExchangeReadAccess,log=console.log}={}){
 let result;
 try{result=await verify()}catch{result={verified:false,reason:'STARTUP_READ_CHECK_FAILED'}}
 const summary={scope:'READ_ONLY_ACCOUNT_ACCESS',verified:result?.verified===true,
  reason:result?.verified===true?'READ_AUTHENTICATION_ACCEPTED':
   ['CREDENTIALS_MISSING','UNEXPECTED_ACCOUNT_RESPONSE','READ_ONLY_VERIFICATION_FAILED','STARTUP_READ_CHECK_FAILED'].includes(result?.reason)?result.reason:'READ_CHECK_FAILED',
  ...(Number.isSafeInteger(result?.providerCode)?{providerCode:result.providerCode}:{}),
  checkedAt:new Date().toISOString(),tradePermission:'UNVERIFIED',liveOrders:false};
 log('ULTRON exchange read verification',JSON.stringify(summary));
 return summary;
}
