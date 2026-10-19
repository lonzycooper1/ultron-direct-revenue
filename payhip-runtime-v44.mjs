// Payhip webhook receipts are provisional until independently reconciled against Payhip.
// Payhip's documented sha256(apiKey) signature does NOT authenticate individual event bodies.
// Therefore NO automatic fulfillment, revenue certification, or refund is authorized here.
import {getJson,mutateJson} from './state-store.mjs';
import {normalizeEvent,emptyLedger,applyEvent} from './payments-new/payhip-events.mjs';
const KEY='ultron-payhip-v44';
const empty=()=>({...emptyLedger(),receivedAt:null});
export function createPayhipReceiver({env=process.env,mutate=f=>mutateJson(KEY,empty(),f),read=()=>getJson(KEY,empty())}={}){
 async function receive(payload){
  if(!env.ULTRON_PAYHIP_API_KEY)throw Error('Payhip server key is not configured');
  const event=normalizeEvent(payload,env.ULTRON_PAYHIP_API_KEY);
  let disposition;
  await mutate(s=>{
   const candidate=applyEvent({transactions:s.transactions||{},events:s.events||{}},event);
   if(Object.keys(candidate.ledger.events).length>10000)throw Error('Payhip event log retention review required');
   s.transactions=candidate.ledger.transactions;s.events=candidate.ledger.events;
   s.receivedAt=new Date().toISOString();disposition=candidate.disposition;
  });
  return {accepted:true,disposition,type:event.type,transactionId:event.id,
   source:'PAYHIP_WEBHOOK_ONLY',providerPaymentVerified:false,bankSettlementVerified:false,
   automaticDelivery:false,ownerReconciliationRequired:true};
 }
 async function status(){
  const s=await read();const records=Object.values(s.transactions||{});
  return {provider:'payhip',eventCount:Object.keys(s.events||{}).length,transactionCount:records.length,
   provisionallyPaidRecords:records.filter(x=>x.paidObserved).length,
   refundsRequiringReconciliation:records.filter(x=>x.refundedCents>0).length,
   lastReceiptAt:s.receivedAt,providerPaymentVerified:false,bankSettlementVerified:false,
   note:'Webhook signature does not bind the payload. Confirm against provider account records before delivery or reporting revenue.'};
 }
 return {receive,status};
}
export const payhipReceiver=createPayhipReceiver();
