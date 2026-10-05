import test from 'node:test';import assert from 'node:assert/strict';
import {AI_MARKET_CATALOG,AI_MARKET_RULES,validateMarketProduct,buildDigitalDelivery,marketStats} from './ai-market.mjs';
test('catalog stays inside requested $1-$999 range',()=>{assert.ok(AI_MARKET_CATALOG.length>=9);for(const p of AI_MARKET_CATALOG){assert.ok(p.price>=1&&p.price<=999);validateMarketProduct(p)}const s=marketStats();assert.equal(s.minPrice,1);assert.equal(s.maxPrice,999)});
test('invalid prices are rejected',()=>{assert.throws(()=>validateMarketProduct({name:'x',description:'x',price:0}));assert.throws(()=>validateMarketProduct({name:'x',description:'x',price:1000}))});
test('digital fulfillment is generated only as a delivery artifact',()=>{const d=buildDigitalDelivery(AI_MARKET_CATALOG[0],'ORDER1');assert.equal(d.type,'AI_MARKET_DIGITAL_PRODUCT');assert.equal(d.orderId,'ORDER1');assert.ok(d.sections.length>=3)});
test('market keeps verified revenue and integrity controls',()=>{assert.equal(AI_MARKET_RULES.accounting,'verified-payments-only');for(const x of ['copyright-infringement','deceptive-claims','fabricated-revenue','spam'])assert.ok(AI_MARKET_RULES.prohibited.includes(x))});
