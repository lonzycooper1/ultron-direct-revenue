import {v8State,saveV8State,flywheelScore,revenueTruth,capacityGate,websiteFactory,productFactory,demandFactory,businessFactory} from './ultron-autonomous-revenue-v8.mjs';
const num=v=>Number.isFinite(Number(v))?Number(v):0;
export async function runRevenueFlywheelCycle({ledger={},baseUrl='' }={}){
 const s=await v8State(),orders=Object.values(ledger?.orders||{}),paid=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt);
 const revenue=paid.reduce((a,x)=>a+num(x?.capturedAmount||x?.amount),0);
 const fulfilled=paid.filter(x=>x.fulfillment).length;
 const funnel={qualifiedAttention:num(s.metrics?.qualifiedAttention),leads:num(s.metrics?.leads),checkoutStarts:orders.length,verifiedCaptures:paid.length,fulfilled,customerOutcomes:(s.outcomes||[]).filter(x=>x.verified).length,retained:(s.retention||[]).filter(x=>x.active).length,referrals:(s.referrals||[]).filter(x=>x.verified).length};
 const score=flywheelScore({demandCreation:funnel.leads?60:20,acquisition:funnel.leads?60:20,conversion:orders.length?Math.min(100,paid.length/orders.length*100):10,fulfillment:paid.length?Math.min(100,fulfilled/paid.length*100):10,customerOutcome:paid.length?Math.min(100,funnel.customerOutcomes/paid.length*100):5,retention:funnel.retained?60:10,referral:funnel.referrals?60:10,margin:revenue?50:20,reinvestment:(s.reinvestmentCandidates||[]).length?50:20,learning:(s.experiments||[]).length?60:30});
 const stage=score.weakest?.stage||'demandCreation';
 const actions={
  demandCreation:'Create useful problem-awareness utility/content from validated demand evidence.',
  acquisition:'Strengthen owned/permissioned distribution around validated offers.',
  conversion:'Improve offer clarity, proof and checkout flow using bounded tests.',
  fulfillment:'Increase fulfillment reliability/capacity before more acquisition.',
  customerOutcome:'Measure and improve whether buyers achieved the promised outcome.',
  retention:'Create recurring value only where ongoing customer value is proven.',
  referral:'Ask satisfied customers for permissioned referrals after verified outcomes.',
  margin:'Reduce cost-to-serve and improve delivery efficiency before scaling.',
  reinvestment:'Allocate only verified contribution profit to bounded experiments.',
  learning:'Run experiments with explicit hypotheses, metrics and outcome capture.'
 };
 s.revenueTruth=revenueTruth({capturedExternal:revenue,grossRevenue:revenue,contributionProfit:num(s.revenueTruth?.contributionProfit)});
 s.flywheels=[score];
 s.controller={at:new Date().toISOString(),funnel,bottleneck:stage,recommendedAction:actions[stage],baseUrl,rule:'Output of each verified stage becomes input to the next. Do not fabricate missing stages.'};
 s.capacity=capacityGate({demand:orders.length,fulfillmentCapacity:Math.max(1,fulfilled||1),supportCapacity:100,quality:100,refundRate:0});
 await saveV8State(s);return s.controller;
}
export function compileOpportunity(opportunity={}){
 const product=productFactory({name:opportunity.problem||opportunity.name,severity:opportunity.problemSeverity,evidence:opportunity.evidence||[]});
 const site=websiteFactory(opportunity);
 const demand=demandFactory({validatedProduct:product.status==='CANDIDATE'});
 const business=businessFactory(opportunity);
 return {product,site,demand,business};
}
