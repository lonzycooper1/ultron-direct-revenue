import {getJson,mutateJson} from './state-store.mjs';
const KEY='order-ledger',FRESH={orders:{},events:[]};
export async function ledger(){return getJson(KEY,FRESH)}
export async function saveLedger(mutator){return mutateJson(KEY,FRESH,mutator)}

/** Legacy order-ledger key is maintained for live PayPal capture interoperability. */
export async function getRecordedOrder(id){
 if(typeof id!=='string'||id.length>160)return null;
 const state=await ledger();return state.orders?.[id]||null;
}
export async function appendSignedPaymentEvidence({eventId,kind,orderId}){
 const order=await getRecordedOrder(orderId);
 if(!order||order.status!=='COMPLETED'||!order.captureId)throw Error('Verified order record required');
 const {appendEnterpriseAudit}=await import('./enterprise-store-v45.mjs');
 return appendEnterpriseAudit({eventId,kind,payload:{orderId,provider:'paypal',captureId:order.captureId,
  currency:order.currency,amountUsd:order.capturedAmount??null,
  bankSettlementVerified:false,customerAccepted:false}});
}
