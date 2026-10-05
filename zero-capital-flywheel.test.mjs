import test from 'node:test';
import assert from 'node:assert/strict';
import {ZERO_CAPITAL_FLYWHEEL,nextZeroCapitalMission} from './zero-capital-flywheel.mjs';

test('flywheel is customer-funded and counts only verified revenue',()=>{
 assert.match(ZERO_CAPITAL_FLYWHEEL.cashFlowRule,/buyer pays/);
 assert.match(ZERO_CAPITAL_FLYWHEEL.accounting.actualRevenue,/verified customer payments/i);
 assert.ok(ZERO_CAPITAL_FLYWHEEL.stages.includes('verify-customer-payment'));
 assert.ok(ZERO_CAPITAL_FLYWHEEL.stages.indexOf('verify-customer-payment') < ZERO_CAPITAL_FLYWHEEL.stages.indexOf('fulfill-purchased-work'));
});

test('first mission is an unrelated paying customer rather than projected revenue',()=>{
 const mission=nextZeroCapitalMission({verifiedRevenueUsd:0,customerCount:0});
 assert.equal(mission.priority,'FIRST_CUSTOMER');
 assert.equal(mission.targetUsd,10);
 assert.match(mission.action,/unrelated prospect/i);
 assert.match(mission.action,/verified payment/i);
});

test('unsafe or fabricated growth methods stay prohibited',()=>{
 for(const item of ['fake-transactions','fabricated-revenue','spam','phishing','unauthorized-charges']) assert.ok(ZERO_CAPITAL_FLYWHEEL.prohibited.includes(item));
});
