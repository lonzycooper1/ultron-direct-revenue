import test from 'node:test';import assert from 'node:assert/strict';import {catalog,commercialDashboard} from './ultron-commercial-v13.mjs';
test('commercial catalog has tiered SaaS plans',async()=>{const c=await catalog();assert.equal(c.plans.free.monthlyUsd,0);assert.ok(c.plans.standard.monthlyUsd>0);assert.ok(c.plans.premium.includedUnits>c.plans.standard.includedUnits)});
test('commercial truth does not count unverified subscription revenue',async()=>{const d=await commercialDashboard();assert.match(d.truth.subscriptionRevenue,/verified processor payment/i);assert.match(d.truth.credits,/never cash/i)});

test('commercial PayPal checkout metadata is explicit',async()=>{const m=await import('./ultron-commercial-v13.mjs');const x=await m.commercialCheckoutSpec({customerId:'cust-test',type:'PLAN',sku:'standard'});assert.equal(x.customId,'ULTRON:PLAN:cust-test:standard');assert.match(x.rule,/verified PayPal event/i)});
