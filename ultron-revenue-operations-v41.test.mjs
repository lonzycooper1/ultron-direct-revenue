import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {AUDIT_SKU,TERMS,validateAuditIntake,businessDeadline,prepareAudit,reviewAudit,acceptAudit,recordSignedCapture,independentSale,financialSummary,publicOperations,encryptSnapshot,decryptSnapshot,safeRead,renderAuditDelivery} from './ultron-revenue-operations-v41.mjs';
const input={company:'Local Fixture Business',website:'https://fixture-business.org/',email:'buyer@fixture-business.org',monthlyLeads:50,missedPercent:20,responseMinutes:120,followup:'manual',currentWorkflow:'Form inquiries go to a shared inbox; owner replies manually.',acceptTerms:true,termsVersion:TERMS.version};
const paid=()=>({id:'LOCAL_ORDER',product:AUDIT_SKU,status:'COMPLETED',captureId:'LOCAL_CAPTURE',capturedAt:'2026-10-16T15:00:00Z',capturedAmount:500,amount:'500.00',currency:'USD',auditIntake:validateAuditIntake(input)});
const review={reviewer:'Fixture reviewer',scopeConfirmed:true,qualityApproved:true,findings:[{source:'PUBLIC_PAGE',sourceUrl:input.website,observation:'Static HTML has no telephone link; confirm rendered mobile behavior before changing it.'},{source:'CUSTOMER_STATEMENT',reference:'Order intake',observation:'The supplied baseline says manual responses take two hours; this has not been independently measured.'}]};
test('audit checkout rejects absent or outdated terms and invalid contact information',()=>{
 assert.throws(()=>validateAuditIntake({...input,acceptTerms:false}),/terms/);
 assert.throws(()=>validateAuditIntake({...input,termsVersion:'old'}),/terms/);
 assert.throws(()=>validateAuditIntake({...input,email:'broken'}),/email/);
 assert.throws(()=>validateAuditIntake({...input,website:'https://127.0.0.1/'}),/public HTTPS/);
 assert.equal(validateAuditIntake(input).consentScope,'ORDER_SERVICE_ONLY');assert.equal(validateAuditIntake(validateAuditIntake(input)).termsVersion,TERMS.version);
});
test('weekday deadline skips weekends and legacy paid audit enters onboarding',()=>{
 assert.equal(businessDeadline('2026-10-16T15:00:00Z'),'2026-10-23T15:00:00.000Z');
 const o=paid();delete o.auditIntake;assert.equal(prepareAudit(o).status,'ONBOARDING_REQUIRED');
 assert.throws(()=>prepareAudit({...o,captureId:null}),/payment/);
});
test('complete local paid audit fixture requires review, signed event, buyer proof and acceptance',()=>{
 const o=paid();o.fulfillment=prepareAudit(o,{status:'INSPECTED',title:'Fixture',h1Count:1,formCount:1,telLink:false,bookingText:true});
 assert.equal(o.fulfillment.sections.length,0);assert.equal(o.fulfillment.status,'QUALITY_REVIEW_PENDING');
 assert.match(renderAuditDelivery(o),/awaiting onboarding or quality review/);
 assert.throws(()=>acceptAudit(o,{token:o.fulfillment.token,reportVersion:1,accepted:true}),/reviewed/);
 assert.throws(()=>reviewAudit(o,{...review,findings:review.findings.slice(0,1)}),/two/);
 reviewAudit(o,review);assert.equal(o.fulfillment.status,'READY_FOR_CUSTOMER_REVIEW');
 assert.match(o.fulfillment.sections.map(s=>s.body).join(' '),/Local Fixture Business/);
 acceptAudit(o,{token:o.fulfillment.token,reportVersion:1,accepted:true});assert.equal(independentSale(o),false);
 assert.throws(()=>recordSignedCapture(o,{eventId:'LOCAL_EVENT',captureId:'WRONG',receivedAt:new Date().toISOString()}),/Matching/);
 recordSignedCapture(o,{eventId:'LOCAL_EVENT',captureId:o.captureId,receivedAt:new Date().toISOString()});
 o.independentBuyerVerified=true;o.independentBuyerEvidence={source:'PAYPAL_ORDER_READ_AND_OWNER_REVIEW',orderId:o.id};
 assert.equal(independentSale(o),true);
 const at=o.customerAcceptanceEvidence.at;acceptAudit(o,{token:o.fulfillment.token,reportVersion:1,accepted:true});assert.equal(o.customerAcceptanceEvidence.at,at);
 reviewAudit(o,review);assert.equal(o.fulfillment.reportVersion,2);assert.equal(independentSale(o),false);
 assert.throws(()=>acceptAudit(o,{token:o.fulfillment.token,reportVersion:1,accepted:true}),/Current/);
});
test('public result never leaks intake, private tokens or document references',()=>{
 const o=paid();o.fulfillment=prepareAudit(o);const summary=JSON.stringify(publicOperations([o]));
 for(const secret of [o.auditIntake.email,o.fulfillment.token,o.auditIntake.website])assert.equal(summary.includes(secret),false);
 assert.equal(publicOperations([o]).pendingAuditReviews,1);
});
test('financial controls dedupe captures and distinguish unknown profit and documented bank receipt',()=>{
 const o=paid();assert.equal(financialSummary([o,o]).captures,1);assert.equal(financialSummary([o]).recordedContributionProfitUsd,null);
 o.paypalFeeSource='PROVIDER';o.paypalFeeUsd=18;o.costReview={complete:true,amountUsd:50,reference:'LOCAL_COST_DOC'};
 o.refunds=[{amountUsd:20,source:'PAYPAL_SIGNED_EVENT'},{amountUsd:999,source:'UNVERIFIED'}];
 const s=financialSummary([o]);assert.equal(s.grossCapturedUsd,500);assert.equal(s.providerRefundsUsd,20);assert.equal(s.recordedContributionProfitUsd,412);assert.equal(s.bankSettlementStatus,'UNVERIFIED');
 o.settlement={source:'OWNER_RECONCILED_DOCUMENTS',payoutReference:'LOCAL_PAYOUT',bankReference:'LOCAL_BANK_DOC',bankAmountUsd:462};
 assert.match(financialSummary([o]).bankSettlementStatus,/NOT_INDEPENDENTLY_VERIFIED/);
});
test('encrypted backup restore rejects wrong key and tampering',()=>{
 const key=randomBytes(32).toString('base64'),snapshot={version:1,rows:[{key:'fixture',value:{private:'LOCAL_FIXTURE'}}]};
 const b=encryptSnapshot(snapshot,key);assert.equal(JSON.stringify(b).includes('LOCAL_FIXTURE'),false);
 assert.deepEqual(decryptSnapshot(b,key),snapshot);
 assert.throws(()=>decryptSnapshot(b,randomBytes(32).toString('base64')));
 assert.throws(()=>decryptSnapshot({...b,sha256:'wrong'},key),/digest/);
});
test('bounded recovery retries transient reads and never retries ambiguous operations',async()=>{
 let n=0;const x=await safeRead(async()=>{n++;if(n===1){const e=Error('temporary');e.retryable=true;throw e}return 'recovered'},{wait:async()=>{}});
 assert.equal(x,'recovered');assert.equal(n,2);
 let post=0;await assert.rejects(safeRead(async()=>{post++;throw Error('ambiguous payment')},{wait:async()=>{}}));assert.equal(post,1);
});
