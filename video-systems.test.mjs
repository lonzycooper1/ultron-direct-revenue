import test from 'node:test';import assert from 'node:assert/strict';
import {productCritiqueSystem,appFactorySystem,prospectRevenueSystem,wizardOperatingSystem,unifiedVideoArchitecture} from './video-systems.mjs';
test('critique system ranks 9 candidates',()=>{const x=productCritiqueSystem({problem:'slow follow-up'});assert.equal(x.candidates.length,9);assert.equal(x.selected,x.candidates[0])});
test('app factory has build and commercial gates',()=>{const x=appFactorySystem({idea:'lead responder'});assert.ok(x.gates.includes('tests pass'));assert.ok(x.artifacts.includes('API contract'))});
test('revenue system requires payment verification before fulfillment',()=>{const x=prospectRevenueSystem({prospect:'Acme',offer:'kit',amountUsd:29});assert.equal(x.workflow.steps[3].stage,'verify-payment');assert.equal(x.workflow.steps[4].stage,'fulfill')});
test('wizard system creates project',()=>{assert.equal(wizardOperatingSystem({objective:'launch'}).project.status,'active')});
test('unified architecture keeps trading separate from merchant revenue',()=>{const x=unifiedVideoArchitecture();assert.match(x.separation.merchantRevenue,/verified/i);assert.match(x.separation.marketResearch,/paper/i)});
