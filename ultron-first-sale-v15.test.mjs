import test from 'node:test';import assert from 'node:assert/strict';import {firstSaleDashboard,firstSaleScore} from './ultron-first-sale-v15.mjs';
test('first-sale mode has real researched prospects and fixed PayPal offer',async()=>{const d=await firstSaleDashboard();assert.ok(d.prospects.length>=5);assert.equal(d.offer.priceUsd,500);assert.match(d.offer.checkout,/buy\?product=ai-revenue-audit-500/);assert.equal(d.truth.prospectsAreCustomers,false)});
test('outreach remains approval gated',async()=>{const d=await firstSaleDashboard();assert.ok(d.prospects.every(p=>p.outreach==='APPROVAL_REQUIRED'))});
test('first-sale score identifies next action',async()=>{const s=await firstSaleScore();assert.ok(s.researchedProspects>=5);assert.ok(s.next)});
