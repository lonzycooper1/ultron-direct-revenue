import test from 'node:test';
import assert from 'node:assert/strict';
import {resourcePriorities,intentEvidence,contactConfidence,safeSalesClaim,offerMatch,queuePriority,
  financialControls,scopedDeliverables,readinessRegistry} from './ultron-reflective-revenue-v20.mjs';

test('50 requested upgrades are separately tracked and honestly labeled',()=>{
 const a=readinessRegistry();assert.equal(a.length,50);
 assert.equal(new Set(a.map(x=>x.id)).size,50);assert.equal(a[0].id,'revenue-mission-controller');
 assert.match(a.find(x=>x.id==='buyer-intent-network').status,/REQUIRED/);
});
test('reflective agent gives scarce resources to acquisition before first sale',()=>{
 const m=resourcePriorities({paid:0,verifiedRevenue:0});
 assert.equal(m.objective,'NEXT_VERIFIED_INDEPENDENT_PAYING_CUSTOMER');
 assert.equal(m.weights.acquisition,60);assert.equal(Object.values(m.weights).reduce((x,y)=>x+y,0),100);
});
test('real buyer reply outranks speculative prospecting',()=>{
 const m=resourcePriorities({interested:2,paid:0});assert.equal(m.weights.conversion,55);
 assert.ok(queuePriority('INTERESTED_REPLY')>queuePriority('PRODUCT_IDEA'));
});
test('unfulfilled customers get priority over acquiring more users',()=>{
 const m=resourcePriorities({unfulfilled:1,interested:2,paid:1,verifiedRevenue:99});
 assert.equal(m.weights.fulfillment,55);
});
test('unsupported intent claims cannot create verified buyers',()=>{
 const b=intentEvidence({company:'Claimed buyer',publicRequest:'need a website',sourceUrl:'http://localhost',postedAt:'today'});
 assert.equal(b.score,0);assert.equal(b.verifiedBuyer,false);
});
test('sourced public requests are only candidates',()=>{
 const b=intentEvidence({publicRequest:'Request for proposal: we need an online booking automation for our company.',sourceUrl:'https://example.com/rfp/123',postedAt:'2026-10-07'});
 assert.ok(b.score>0);assert.equal(b.verifiedBuyer,false);
});
test('email syntax does not imply verified deliverability',()=>{
 const c=contactConfidence({role:'CEO',sourceUrl:'https://example.com',email:'owner@example.com',publiclyListed:true});
 assert.ok(c.score<85);assert.equal(c.isMailboxValid,false);
});
test('unsupported income claims are denied and ordinary scope is allowed',()=>{
 assert.equal(safeSalesClaim('We guaranteed revenue growth').approved,false);
 assert.equal(safeSalesClaim('This demo shows a sample booking workflow').approved,true);
});
test('offer matching selects smallest suitable audit',()=>{
 assert.equal(offerMatch('missed bookings').priceUsd,99);
 assert.equal(offerMatch('full audit of leads').priceUsd,500);
 assert.equal(offerMatch('integrate an automation system').priceUsd,2500);
});
test('zero revenue cannot authorize reinvestment',()=>{
 const f=financialControls({grossRevenue:0,ownerApprovedDailySpendUsd:500,satisfiedCustomers:3});
 assert.equal(f.maxApprovedExperimentSpendUsd,0);assert.equal(f.scalingGateOpen,false);
});
test('owner budget does not open scaling without three independent satisfied customers',()=>{
 const f=financialControls({grossRevenue:1000,recordedCosts:200,ownerApprovedDailySpendUsd:1000,satisfiedCustomers:2});
 assert.equal(f.maxApprovedExperimentSpendUsd,0);assert.equal(f.scalingGateOpen,false);
});
test('only collected cash after expenses and reserve forms a recommendation cap',()=>{
 const f=financialControls({grossRevenue:1000,recordedCosts:200,reserveRatePct:35,taxAllowancePct:25,
 ownerApprovedDailySpendUsd:1000,satisfiedCustomers:3});
 assert.equal(f.availableAfterIllustrativeHoldsUsd,250);assert.equal(f.maxApprovedExperimentSpendUsd,250);
 assert.equal(f.automaticPaymentOrTransferEnabled,false);
});
test('refunds reduce allocable collected revenue',()=>{
 const a=financialControls({grossRevenue:1000,refunds:700,recordedCosts:100,satisfiedCustomers:3,
   ownerApprovedDailySpendUsd:100});
 assert.ok(a.availableAfterIllustrativeHoldsUsd<100);assert.equal(a.maxApprovedExperimentSpendUsd,a.availableAfterIllustrativeHoldsUsd);
});
test('fixed-scope audit has no customer credential request',()=>{
 const x=scopedDeliverables('missed-lead-mini-audit-99');assert.equal(x.requiresAccess,false);
 assert.ok(x.items.length>=3);
});
test('service implementation requires customer authorization and QA',()=>{
 const x=scopedDeliverables('lead-recovery-implementation-2500');
 assert.equal(x.requiresAccess,true);assert.ok(x.items.some(t=>/QA/.test(t)));
});
