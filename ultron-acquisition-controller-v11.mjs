import {state,save,scoreProspect,sampleGate,dependencyHealth,identityKey} from './ultron-customer-acquisition-v11.mjs';
const n=v=>Number.isFinite(Number(v))?Number(v):0;
export async function runAcquisitionCycle({ledger={},agentState={}}={}){
 const s=await state(),seen=new Map();for(const p of s.prospects||[]){const k=identityKey(p);if(k&&!seen.has(k))seen.set(k,p)}s.prospects=[...seen.values()].slice(0,1000);
 for(const p of s.prospects){const evidenceQuality=p.evidence?.length?70:20,contactQuality=p.contactRoutes?.length?75:25,intent=n(p.intentScore);p.scoring=scoreProspect({problemEvidence:p.problemScore||0,buyerIntent:intent,contactQuality,buyerFit:80,recency:75,evidenceQuality});if(p.scoring.qualified&&p.stage==='DISCOVERED')p.stage='QUALIFIED'}
 const orders=Object.values(ledger?.orders||{}),paid=orders.filter(o=>String(o.status||'').toUpperCase()==='COMPLETED'||o.capturedAt),revenue=paid.reduce((a,o)=>a+n(o.capturedAmount||o.amount),0),responses=(s.conversations||[]).filter(x=>x.direction==='inbound').length,purchases=paid.length,exposures=(s.outreach||[]).filter(x=>x.status==='SENT'||x.status==='DELIVERED').length;
 s.experimentGate=sampleGate({exposures,responses,purchases});s.truth={verifiedCustomers:new Set(paid.map(x=>x.payerEmail||x.customerId||x.id)).size,verifiedRevenueUsd:+revenue.toFixed(2),verifiedOutcomes:(s.attribution||[]).filter(x=>x.type==='outcome.verified').length};
 s.controller={at:new Date().toISOString(),prospects:s.prospects.length,qualified:s.prospects.filter(x=>x.scoring?.qualified).length,evidenceReady:s.prospects.filter(x=>x.evidence?.length).length,outreachSent:exposures,responses,purchases,nextAction:s.prospects.length<100?'CONTINUE_PUBLIC_PROSPECT_INGESTION':s.prospects.filter(x=>x.evidence?.length).length<20?'AUDIT_TOP_PROSPECT_WEBSITES':exposures<20?'PREPARE_INDIVIDUALIZED_OUTREACH':'LEARN_FROM_REAL_RESPONSES'};
 s.dependencyHealth=dependencyHealth({paypal:true,hosting:true,prospectProvider:'PUBLIC_FEED_READY_HUNTER_ACCOUNT_RESTRICTED',email:'DRAFT_ONLY_UNTIL_AUTHORIZED_SENDER_CONNECTED',crm:'INTERNAL_CRM_READY'});
 await save(s);return s;
}
