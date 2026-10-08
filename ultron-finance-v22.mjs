import {getJson,mutateJson} from './state-store.mjs';
import {ledger} from './ledger-store.mjs';
const KEY='ultron-finance-v22';
const fresh=()=>({receipts:{},payoutRecords:{},expenses:{},documents:{},subscriptions:{},referrals:{},content:{},experiments:{}});
const read=()=>getJson(KEY,fresh());
const edit=async fn=>{let v;await mutateJson(KEY,fresh(),s=>{v=fn(s)});return v};
const cash=n=>Math.round(Math.max(0,Number(n)||0)*100)/100;
export function reserveCalc(x={}){
 const cleared=Math.max(0,Math.min(cash(x.captured)-cash(x.refunds),cash(x.settled),cash(x.depositClaim)));
 const reserves=cash(cleared*.35);
 const unallocated=cash(Math.max(0,cleared-reserves-cash(x.fees)-cash(x.costs)));
 return {clearedEvidenceCapUsd:cleared,reserveUsd:reserves,unallocatedAfterDocumentedCostsUsd:unallocated,
 recommendedSpendUsd:0,automaticSpending:false,actualCashVerified:false,
 disclaimer:'Reported deposits are not verified account balances. Do not spend without owner approval and settlement verification.'};
}
export function reviewCatalog(x={}){
 if(x.openOrders>0)return 'KEEP_EXISTING_ORDERS';
 if(x.sales<3||x.views<100)return 'NOT_ENOUGH_DATA';
 if(x.refunds/x.sales>.2||x.margin<0)return 'REVIEW_NO_AUTO_DELETION';
 return 'KEEP_MEASURING';
}
export async function record({type,id,orderId,amount,source,relatedId}={}){
 const table={SETTLEMENT:'receipts',DEPOSIT_EVIDENCE:'payoutRecords',EXPENSE:'expenses',FINANCE_DOCUMENT:'documents',
 SUBSCRIPTION:'subscriptions',REFERRAL:'referrals',CONTENT_DRAFT:'content'}[type];
 if(!table||!id||!source)throw Error('evidence ID and type required');
 if(type==='SETTLEMENT'){const l=await ledger(),order=l.orders?.[orderId];
   if(!order?.capturedAt||!order.captureId)throw Error('captured PayPal purchase required');}
 if(type==='DEPOSIT_EVIDENCE'){const s=await read();if(!s.receipts[relatedId])throw Error('matching settlement reference required');}
 if(['SETTLEMENT','DEPOSIT_EVIDENCE','EXPENSE'].includes(type)&&(!Number.isFinite(Number(amount))||Number(amount)<0))throw Error('nonnegative amount required');
 return edit(s=>{if(s[table][id])return {duplicate:true};
   const entry={id,type,orderId:String(orderId||''),amountUsd:cash(amount),reference:String(source).slice(0,512),
    relatedId:String(relatedId||''),verification:'OWNER_EVIDENCE_NOT_BANK_API_VERIFIED',
    updatedAt:new Date().toISOString(),externalAction:false};
   s[table][id]=entry;return entry;});
}
export async function proposeExperiment({id,hypothesis,baseline,channel,budget}={}){
 if(!id||!hypothesis||!baseline||!channel||!Number.isFinite(Number(budget))||budget<0)throw Error('valid experiment required');
 return edit(s=>{s.experiments[id]={id,hypothesis,baseline,channel,budgetUsd:cash(budget),status:'REQUIRES_APPROVAL',spentUsd:0};
 return s.experiments[id]});
}
export async function report(){
 const [s,l]=await Promise.all([read(),ledger()]);
 const orders=Object.values(l.orders||{}).filter(o=>o.captureId&&o.capturedAt);
 const value=orders.reduce((a,x)=>a+Number(x.capturedAmount||0),0);
 const sums=k=>Object.values(s[k]).reduce((a,x)=>a+(x.amountUsd||0),0);
 return {verifiedOrderCount:orders.length,verifiedCaptureUsd:cash(value),settlementsClaimedUsd:cash(sums('receipts')),
  depositClaimsUsd:cash(sums('payoutRecords')),expensesRecordedUsd:cash(sums('expenses')),
  settledMismatch:cash(Math.max(0,value-sums('receipts'))),
  reserve:reserveCalc({captured:value,settled:sums('receipts'),depositClaim:sums('payoutRecords'),costs:sums('expenses')}),
  evidenceCounts:{documents:Object.keys(s.documents).length,subscriptions:Object.keys(s.subscriptions).length,
   referrals:Object.keys(s.referrals).length,contentDrafts:Object.keys(s.content).length},
  ownerApprovalRequired:true};
}