import {verifyProviderReadAccess} from './crypto-provider.mjs';

// One read-only authentication check per process start. Never change execution
// flags, expose balances/keys, or infer trade permission from read permission.
export async function checkReadOnlyStartup({verify=verifyProviderReadAccess,log=console.log}={}){
 let result;
 try{result=await verify()}catch{result={verified:false,reason:'STARTUP_READ_CHECK_FAILED'}}
 const summary={scope:'READ_ONLY_ACCOUNT_ACCESS',verified:result?.verified===true,
  reason:result?.verified===true?'READ_AUTHENTICATION_ACCEPTED':
   ['CREDENTIALS_MISSING','UNEXPECTED_ACCOUNT_RESPONSE','READ_ONLY_VERIFICATION_FAILED','STARTUP_READ_CHECK_FAILED'].includes(result?.reason)?result.reason:'READ_CHECK_FAILED',
  ...(Number.isSafeInteger(result?.providerCode)?{providerCode:result.providerCode}:{}),
  ...(Number.isInteger(result?.httpStatus)&&result.httpStatus>=100&&result.httpStatus<=599?{httpStatus:result.httpStatus}:{}),
  ...(['KEY_OR_SIGNATURE_REJECTED','TIMESTAMP_REJECTED','IP_NOT_ALLOWLISTED','ACCOUNT_TIER_REJECTED','ACCOUNT_SUSPENDED','RATE_LIMITED','CREDENTIAL_FORMAT_INVALID','REQUEST_TIMEOUT','HTTP_ACCESS_DENIED','HTTP_UNAUTHORIZED','HTTP_OR_PROVIDER_ERROR','NETWORK_OR_CONFIGURATION_ERROR'].includes(result?.diagnostic)?{diagnostic:result.diagnostic}:{}),
  checkedAt:new Date().toISOString(),tradePermission:'UNVERIFIED',liveOrders:false};
 log('ULTRON provider read verification',JSON.stringify(summary));
 return summary;
}
