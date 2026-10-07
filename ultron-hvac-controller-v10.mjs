import {state,save,ceoLoop,profit,winnerPolicy} from './ultron-hvac-flagship-v10.mjs';
const n=v=>Number.isFinite(Number(v))?Number(v):0;
export async function runHvacFlagshipCycle({ledger={},agentState={}}={}){
 const s=await state(),orders=Object.values(ledger?.orders||{}),paid=orders.filter(o=>o.product==='ai-revenue-audit-500'&&(String(o.status||'').toUpperCase()==='COMPLETED'||o.capturedAt)),revenue=paid.reduce((a,o)=>a+n(o.capturedAmount||o.amount),0);
 const qualified=(s.crm||[]).filter(x=>['QUALIFIED','DIAGNOSTIC_CREATED','CONTACTED','ENGAGED','PROPOSAL','CHECKOUT','PAID','FULFILLMENT','OUTCOME','EXPANSION','REFERRAL'].includes(x.stage)).length;
 const checkouts=(s.analytics||[]).filter(x=>x.type==='checkout.opened').length,fulfilled=paid.filter(x=>x.fulfillment).length,outcomes=(s.analytics||[]).filter(x=>x.type==='outcome.verified').length,retained=Object.values(s.customerMemory||{}).filter(x=>x.retained).length,referrals=(s.analytics||[]).filter(x=>x.type==='referral.created').length;
 const cp=profit(s.costs,revenue);s.metrics={qualifiedProspects:qualified,checkoutStarts:checkouts,paidAudits:paid.length,verifiedAuditRevenueUsd:+revenue.toFixed(2),fulfilledAudits:fulfilled,verifiedOutcomes:outcomes,retainedCustomers:retained,verifiedReferrals:referrals,contributionProfitUsd:cp.contributionProfit};
 s.ceo=ceoLoop({qualifiedDemand:qualified,checkout:checkouts,fulfillment:fulfilled,outcome:outcomes,retention:retained,referral:referrals});
 s.flagshipDecision=winnerPolicy({customerOutcomes:outcomes,contributionProfit:cp.contributionProfit,buyerResponses:(s.crm||[]).filter(x=>['ENGAGED','PROPOSAL','CHECKOUT'].includes(x.stage)).length,purchases:paid.length,experiments:(s.experiments||[]).length});
 s.reinvestmentQueue=cp.contributionProfit>0?[{rank:1,use:'product improvement',basis:'verified contribution profit'},{rank:2,use:'owned distribution',basis:'verified contribution profit'},{rank:3,use:'reliability/customer success',basis:'verified contribution profit'},{rank:4,use:'reserves',basis:'verified contribution profit'}]:[];
 await save(s);return s;
}
