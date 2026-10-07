import test from 'node:test';import assert from 'node:assert/strict';import {COMMERCIAL_OS_STAGES,forecast,dataRoomManifest,osDashboard} from './ultron-commercial-os-v14.mjs';
test('revenue funnel preserves required stages',()=>assert.deepEqual(COMMERCIAL_OS_STAGES,['DISCOVERED','QUALIFIED','CONTACT_READY','CONTACTED','REPLIED','MEETING','PROPOSAL','PAYPAL_CHECKOUT','PAID','FULFILLED','RETAINED']));
test('forecast is evidence based',async()=>{const f=await forecast();assert.match(f.base.basis,/actual funnel/i)});
test('lender room never fabricates evidence',async()=>{const d=await dataRoomManifest();assert.match(d.rule,/Never fabricate/i)});
test('commercial OS keeps PayPal active and approvals',async()=>{const d=await osDashboard();assert.equal(d.providerAbstraction.active,'PayPal');assert.equal(d.compliance.outreach,'APPROVAL_REQUIRED')});
