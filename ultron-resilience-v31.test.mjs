import test from 'node:test';
import assert from 'node:assert/strict';
import {DEPARTMENTS,computeGates,jobPlan,reassignJob,reviewResult,publicStatus} from './ultron-resilience-v31.mjs';
test('each department has manager, worker, reviewer and fallback',()=>{
 assert.ok(Object.keys(DEPARTMENTS).length>=10);
 for(const d of Object.values(DEPARTMENTS)){
  for(const k of ['manager','worker','reviewer','backup'])assert.ok(d[k]);
  assert.notEqual(d.worker,d.reviewer);
 }
});
test('missing OAuth and no buyer is blocked and not faked',()=>{
 const x=computeGates({},{paidOrders:0,pendingApprovals:3});
 assert.equal(x.gmail.status,'OWNER_ACTION_REQUIRED');
 assert.equal(x.buyers.status,'NO_VERIFIED_PAID_ORDER');
 assert.equal(x.approvals.count,3);
 assert.equal(x.paypal.status,'CONFIGURATION_MISSING');
});
test('scheduled actions are bounded and idempotently keyed',()=>{
 const a=jobPlan(new Date('2026-10-13T15:03:00Z'));
 const b=jobPlan(new Date('2026-10-13T15:22:00Z'));
 assert.deepEqual(a,b);assert.equal(new Set(a.map(x=>x.id)).size,a.length);
});
test('expired lease uses backup and eventually escalates',()=>{
 const j={department:'acquisition',status:'RUNNING',attempts:0,leaseExpiresAt:1};
 const a=reassignJob(j,3000);assert.equal(a.owner,DEPARTMENTS.acquisition.backup);
 const b=reassignJob({...a,status:'RUNNING',leaseExpiresAt:1},3000);
 const c=reassignJob({...b,status:'RUNNING',leaseExpiresAt:1},3000);
 assert.equal(c.status,'BLOCKED');
});
test('independent review does not bless unverified sales',()=>{
 assert.equal(reviewResult('SALES_TRUTH',{paidOrders:0,revenueUsd:0}).ok,true);
 assert.equal(reviewResult('SALES_TRUTH',{paidOrders:'100',revenueUsd:999}).ok,false);
 assert.equal(reviewResult('DISCOVERY',{foo:'bar'}).ok,false);
});
test('public dashboard contains no private fields',()=>{
 const x=publicStatus({latest:{paidOrders:0,revenueUsd:0,gates:{gmail:{status:'BLOCKED'}},clientEmail:'secret@example.com'},jobs:{}});
 assert.ok(!JSON.stringify(x).includes('secret@example.com'));
 assert.equal(x.verifiedRevenueUsd,0);
});
