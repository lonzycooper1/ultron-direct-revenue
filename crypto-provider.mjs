import * as exchange from './crypto-exchange.mjs';
import {appExecutionConfig,verifyAppReadAccess} from './crypto-app.mjs';

export function selectedProvider(){
  const value=process.env.CRYPTO_PROVIDER||'crypto-com-app';
  if(!['crypto-com-app','crypto-com-exchange'].includes(value))throw Error('Unsupported CRYPTO_PROVIDER');
  return value;
}
export function liveExecutionConfig(){
  return selectedProvider()==='crypto-com-app'?appExecutionConfig():{...exchange.liveExecutionConfig(),providerId:'crypto-com-exchange'};
}
export function verifyProviderReadAccess(options){
  return selectedProvider()==='crypto-com-app'?verifyAppReadAccess(options):exchange.verifyExchangeReadAccess(options);
}
export function readProviderRisk(instrument,options){
  if(selectedProvider()==='crypto-com-app')throw Error('Crypto.com App live risk accounting and quote approvals require certification; execution blocked');
  return exchange.readExchangeRisk(instrument,options);
}
export function reconcileProviderOrder(id,expected,options){
  // Existing Exchange reservations must never be looked up on an App account.
  if(selectedProvider()==='crypto-com-app')return Promise.resolve({verified:false,reason:'PROVIDER_MIGRATION_REQUIRES_LEDGER_REVIEW'});
  return exchange.reconcileExchangeOrder(id,expected,options);
}
export async function executeApprovedSpotOrder(envelope,options){
  if(selectedProvider()==='crypto-com-app')throw Error('Crypto.com App live execution blocked pending safety certification');
  return exchange.executeApprovedSpotOrder(envelope,options);
}
