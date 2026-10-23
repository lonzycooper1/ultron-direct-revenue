import test from 'node:test';import assert from 'node:assert/strict';
import {capacityGate,validateCostBreakdown,businessEvidenceReport,createBusinessEvidence} from './business-evidence.mjs';
const cents={labor:1000,api:50,hosting:25,assets:0,acquisition:0,other:0};
test('actual costs require explicit categories; estimates and unknowns cannot become profit',()=>{
 assert.equal(validateCostBreakdown({basis:'ACTUAL',reference:'timesheet record',cents}).amountUsd,10.75);
 assert.equal(validateCostBreakdown({basis:'ESTIMATE',reference:'planning assumptions',cents}).complete,false);
 assert.equal(validateCostBreakdown({basis:'ACTUAL',reference:'partial records',cents:{...cents,api:null}}).amountUsd,null);
 assert.throws(()=>validateCostBreakdown({basis:'ACTUAL',reference:'record',cents:{...cents,api:undefined}}));
 assert.throws(()=>validateCostBreakdown({basis:'ACTUAL',reference:'record',cents:{...cents,api:0.5}}));
});
test('overdue and exhausted delivery capacity pause checkout; completed work releases it',()=>{
 const pending={status:'COMPLETED',captureId:'capture'};assert.equal(capacityGate([pending,pending,pending]).allowed,false);
 assert.equal(capacityGate([{...pending,fulfillment:{dueAt:'2020-01-01'}}]).reason,'OVERDUE_PAID_DELIVERY');
 assert.equal(capacityGate([{...pending,fulfillmentCompletedAt:'2026-10-23'}]).allowed,true);
});
test('no customers, missing fees and degraded feeds cannot establish profit or permit expansion',()=>{
 const r=businessEvidenceReport({feeds:{sourceStatus:'PARTIAL_PUBLIC_FEED'},inbound:{total:17,items:[]}});
 assert.equal(r.requirements.length,10);assert.equal(r.funnel.independentAcceptedCustomers,0);assert.equal(r.financials.recordedContributionProfitUsd,null);
 assert.equal(r.expansion.allowed,false);assert.ok(r.expansion.reasons.includes('ACTUAL_COSTS_OR_FEES_INCOMPLETE'));assert.equal(r.funnel.repeatPurchases,null);
});
test('stable checkout events deduplicate without storing order identifiers or contact data',async()=>{
 let s={events:{},totals:{},startedAt:null,lastRecordedAt:null};const w=createBusinessEvidence({read:async()=>s,mutate:async f=>f(s),clock:()=>1});
 await w.record('CHECKOUT_CREATED','private-order');await w.record('CHECKOUT_CREATED','private-order');
 assert.equal((await w.snapshot()).totals.CHECKOUT_CREATED,1);assert.equal(JSON.stringify(s).includes('private-order'),false);
});

test('HTTP protects cost writes and controls, exposes only sanitized public runtime evidence',async()=>{
 const {createApp}=await import('./server.js');
 const app=createApp({ownerSessions:{route:async()=>false,direct:req=>req.headers.authorization==='Bearer fixture',authenticated:async()=>false}}).listen(0,'127.0.0.1');await new Promise(r=>app.once('listening',r));const base='http://127.0.0.1:'+app.address().port;
 try{
  assert.equal((await fetch(base+'/business-operations')).status,200);
  assert.equal((await fetch(base+'/api/business-evidence/owner')).status,403);
  for(const path of ['/api/continuous-operations/control','/api/business-evidence/costs'])assert.equal((await fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,403);
  const pub=await(await fetch(base+'/api/continuous-operations')).json();assert.ok(pub.runtime);assert.equal('financials' in pub,false);
  assert.equal((await fetch(base+'/api/business-evidence/costs',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:JSON.stringify({orderId:'missing',basis:'ACTUAL',reference:'fixture documents',cents})})).status,400);
  assert.equal((await fetch(base+'/api/continuous-operations/control',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:'{"action":"disable-auth"}'})).status,400);
 }finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
test('completed mini-audit acceptance and generic ready downloads do not consume manual delivery capacity',()=>{
 const paid={status:'COMPLETED',captureId:'capture',fulfillment:{token:'fixture'}};
 assert.equal(capacityGate([paid,paid,paid]).allowed,true);
 assert.equal(capacityGate([{...paid,v34Intake:{},auditDelivery:{acceptedAt:'2026-10-23'}}]).pending,0);
});
test('startup plus one scheduled run cannot verify two unattended cycles',()=>{
 const r=businessEvidenceReport({continuous:{status:'HEALTHY',consecutiveSuccessfulRuns:2,consecutiveSuccessfulScheduledRuns:1}});
 assert.equal(r.requirements[0].status,'VERIFICATION_REQUIRED');assert.ok(r.expansion.reasons.includes('CONTINUOUS_OPERATION_NOT_VERIFIED'));
});
