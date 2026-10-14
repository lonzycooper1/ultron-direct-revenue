import test from 'node:test';
import assert from 'node:assert/strict';
import {
 B2B_CAMPAIGN_VERSION,B2B_OFFER,B2B_SKU,COMMERCIAL_FUNCTIONS,STEPS,
 qualification,scenario,demonstration,proposal,contingency,readiness,
 availableNextTasks,reconcileB2B,publicLanding
} from './ultron-b2b-90-day-v35.mjs';

test('13 user-requested steps and five commercial functions are in the runtime',()=>{
 assert.equal(B2B_CAMPAIGN_VERSION,'35.0.0');
 assert.equal(STEPS.length,13);assert.equal(COMMERCIAL_FUNCTIONS.length,5);
 assert.equal(B2B_OFFER.priceUsd,60000);assert.equal(B2B_OFFER.depositUsd,30000);
});
test('illustrative stretch math is correct but explicitly hypothetical',()=>{
 const x=scenario({signed:20,accepted:17});
 assert.equal(x.contractedUsd,1200000);assert.equal(x.modeledCollectionsUsd,1110000);
 assert.match(x.disclaimer,/does not represent/);
 assert.equal(scenario({signed:3,accepted:50}).accepted,3);
});
test('score does not mistake fit for contact permission',()=>{
 const input={vertical:'hvac',annualRevenueUsd:6000000,locations:2,
  evidenceOfNeed:'Has confirmed a workflow pain on the public business website',sourceUrl:'https://public.example.org/',contactPermission:false};
 const s=qualification(input);assert.equal(s.score,90);
 assert.equal(s.contactAuthorized,false);assert.equal(s.proofLevel,'OWNER_RESEARCH_INPUT_NOT_BUYER_VERIFIED');
});
test('demo is explicitly uninstalled',()=>{
 const d=demonstration({company:'Example HVAC'});
 assert.equal(d.kind,'UNDEPLOYED_PROOF_OF_VALUE_DRAFT');assert.equal(d.steps.length,5);
});
test('contract requires review, cannot be sent as executed agreement',()=>{
 const d=proposal({company:'ABC Mechanical',diagnosis:'Customer self-reported missed inquiries'});
 assert.equal(d.approval,'OWNER_AND_CUSTOMER_SIGNATURE_REQUIRED');
 assert.equal(d.priceUsd,60000);assert.match(d.status,/NOT_AN_OFFER/);
});
test('contingency first prevents sales without partners',()=>{
 assert.equal(contingency({signed:0,day:7,partners:0}).priority,'FULFILLMENT');
 assert.equal(contingency({signed:0,day:14,partners:2}).priority,'REPAIR_ACQUISITION');
 assert.equal(contingency({signed:5,day:20,partners:2,approvedDeliveryCapacity:2}).priority,'CAPACITY');
});
test('integration readiness distinguishes token presence from functionality',()=>{
 const r=readiness({DATABASE_URL:'secret',PAYPAL_CLIENT_ID:'yes',PAYPAL_CLIENT_SECRET:'yes',PAYPAL_WEBHOOK_ID:'yes',PUBLIC_BASE_URL:'https://ultron-direct-revenue-production.up.railway.app'});
 assert.equal(r.brandedDomain,'RAILWAY_DOMAIN_ONLY');
 assert.match(r.providerCheckout,/NOT_PROOF/);assert.match(r.crm,/MISSING/);
});
test('owner-reported deposits and unrelated sales never become high-ticket revenue',()=>{
 const all=[
  {product:'instant-lead-audit-99',status:'COMPLETED',captureId:'c1',capturedAt:'today',capturedAmount:99},
  {product:B2B_SKU,status:'PENDING',captureId:'c2',capturedAt:'today',capturedAmount:30000},
  {product:B2B_SKU,status:'COMPLETED',captureId:null,capturedAt:'today',capturedAmount:30000},
  {product:B2B_SKU,status:'COMPLETED',captureId:'b1',capturedAt:'today',capturedAmount:30000}
 ];
 const r=reconcileB2B([...all,all[3]]);
 assert.equal(r.providerCapturedUsd,30000);assert.equal(r.providerCapturedCount,1);
 assert.equal(r.bankSettlementVerified,false);assert.equal(r.profitUsd,null);
});
test('no real buyer commitments or metrics invented for empty campaign',()=>{
 const r=reconcileB2B([]);
 assert.equal(r.providerCapturedUsd,0);
 assert.ok(availableNextTasks({}).length>=4);
});
test('public page is discovery-first, no bypass or payment processing',()=>{
 const page=publicLanding();
 assert.match(page,/Request a private discovery conversation/);
 assert.match(page,/signed statement of work/);
 assert.doesNotMatch(page,/guaranteed revenue/i);
 assert.doesNotMatch(page,/<form/);
});
