import test from 'node:test';import assert from 'node:assert/strict';
import {projections,sportsCommercialStatus,securityAndOpsManifest,V13_VERSION} from './ultron-v13-control.mjs';
test('v13 control version',()=>assert.equal(V13_VERSION,'13.1.0'));
test('projection model produces 12 months and break-even',()=>{const p=projections({startingMonthlyRevenue:1000,monthlyGrowthPct:5,grossMarginPct:50,fixedMonthlyCost:500});assert.equal(p.base.length,12);assert.equal(p.breakEvenMonthlyRevenue,1000)});
test('sports commercial layer never fakes licensed feed',()=>{const s=sportsCommercialStatus();assert.equal(typeof s.licensedFeedConfigured,'boolean');if(!s.licensedFeedConfigured)assert.equal(s.status,'EXTERNAL_CREDENTIAL_REQUIRED')});
test('ops manifest distinguishes configured from external blockers',()=>{const o=securityAndOpsManifest();assert.equal(o.memory.backend,'Postgres');assert.equal(o.rollback.healthGate,true)});
