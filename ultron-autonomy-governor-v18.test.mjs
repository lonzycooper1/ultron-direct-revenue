import test from 'node:test';import assert from 'node:assert/strict';import {autonomyDecision,dashboard} from './ultron-autonomy-governor-v18.mjs';
test('routine work is autonomous',()=>assert.equal(autonomyDecision('website research').decision,'AUTO'));
test('approved campaign sends can run inside policy envelope',()=>assert.equal(autonomyDecision('send followup',{approvedCampaign:true,withinSuppressionRules:true}).decision,'POLICY_BOUND_AUTO'));
test('financial and credential actions stay gated',()=>{assert.equal(autonomyDecision('ad spend').decision,'OWNER_APPROVAL');assert.equal(autonomyDecision('payment account change').decision,'OWNER_APPROVAL')});
test('fabrication is denied',()=>assert.equal(autonomyDecision('fabricate revenue').decision,'DENY'));
test('default budget prevents unattended spend',async()=>assert.equal((await dashboard()).budgets.mode,'ZERO_SPEND_UNTIL_OWNER_BUDGET'));