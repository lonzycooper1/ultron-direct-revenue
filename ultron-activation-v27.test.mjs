import test from 'node:test';
import assert from 'node:assert/strict';
import {activationPlan} from './ultron-activation-v27.mjs';
import {prioritize} from './ultron-operator-v23.mjs';
test('Unavailable discovery switches the next priority to first-party opt-in rather than pretending to have leads',()=>{
 const p=activationPlan({integrations:{discovery:{configured:false}},inbound:{total:0,new:0}});
 assert.equal(p.focus,'FIRST_PARTY_DEMAND_FALLBACK');
 assert.equal(p.firstPartyInbound.received,0);
 assert.equal(p.providerGates.discovery.status,'BLOCKED');
 assert.equal(p.status,'INCREMENTAL_ACTIVATION_NOT_COMPLETE');
});
test('Voluntary diagnostic submission is a candidate, not a qualified paying customer',()=>{
 const p=activationPlan({inbound:{total:3,new:2,high:1}});
 assert.equal(p.focus,'REVIEW_VOLUNTARY_INBOUND');
 assert.equal(p.firstPartyInbound.qualifiedBuyerCountNotEstablished,true);
 assert.equal(p.verifiedRevenueUsd,0);
 assert.equal(p.actions.find(x=>x.key==='inbound').mode,'INTERNAL_TRIAGE');
});
test('Genuine interested replies and unfulfilled paid work outrank research',()=>{
 const interest=activationPlan({inbound:{total:7,new:7},interestedBuyers:1});
 const paid=activationPlan({inbound:{total:7,new:7},interestedBuyers:1,paidOrders:1,unfulfilledPaidOrders:1});
 assert.equal(interest.focus,'HUMAN_INTEREST_REPLY_FIRST');
 assert.equal(paid.focus,'PAID_DELIVERY_FIRST');
 assert.equal(prioritize({paid:1,interested:1,inbound:4,blockers:10}),'FULFILL_PAID_ORDERS');
 assert.equal(prioritize({paid:0,interested:0,inbound:4,blockers:10}),'REVIEW_OPT_IN_INBOUND');
});
test('Selected sender is not mistaken for server email authorization',()=>{
 const p=activationPlan({integrations:{gmail:{configured:false,selectedSender:'hunterward199@gmail.com'}}});
 assert.equal(p.providerGates.sender.status,'BLOCKED');
 assert.ok(p.actions.some(x=>x.mode==='OWNER_GOOGLE_OAUTH'));
 assert.ok(p.ownerApprovedScope.includes('contacting businesses'));
});
test('PayPal API readiness does not invent buyer transactions',()=>{
 const p=activationPlan({paymentRuntime:{ok:true,apiAuthorized:true,webhookEndpointVerified:true}});
 assert.equal(p.providerGates.payments.status,'PRODUCTION_PROVIDER_VERIFIED');
 assert.equal(p.paidOrders,0);
 assert.equal(p.verifiedRevenueUsd,0);
});
