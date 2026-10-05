import test from 'node:test';import assert from 'node:assert/strict';
import {UNIVERSAL_MARKET_VERSION,MARKETPLACE_DOMAINS,COMMERCE_TYPES,FULFILLMENT_MODES,normalizeProduct,normalizeMerchant,normalizeOffer,chooseFeaturedOffer,searchCatalog,recommendProducts,routeFulfillment,universalMarketManifest} from './universal-marketplace.mjs';

test('universal market exposes Amazon-style marketplace domains',()=>{
  assert.equal(UNIVERSAL_MARKET_VERSION,'1.0.0');
  for(const d of ['catalog','merchant-registry','offer-engine','search','recommendations','cart','checkout','orders','payments','inventory','fulfillment','returns','support','trust-safety','analytics','events'])assert.ok(MARKETPLACE_DOMAINS.includes(d));
  assert.ok(COMMERCE_TYPES.includes('service'));assert.ok(COMMERCE_TYPES.includes('software'));assert.ok(COMMERCE_TYPES.includes('print-on-demand'));
});
test('featured offer ranks buyer value among verified authorized merchants',()=>{
 const p=normalizeProduct({id:'p1',title:'Test'});
 const m1=normalizeMerchant({id:'m1',name:'A',authorized:true,complianceStatus:'verified',quality:.8,fulfillmentScore:.9,supportScore:.9});
 const m2=normalizeMerchant({id:'m2',name:'B',authorized:true,complianceStatus:'verified',quality:.6,fulfillmentScore:.6,supportScore:.6});
 const o1=normalizeOffer({id:'o1',productId:p.id,merchantId:m1.id,priceUsd:20,shippingUsd:0,availability:10,deliveryDays:2,verified:true});
 const o2=normalizeOffer({id:'o2',productId:p.id,merchantId:m2.id,priceUsd:18,shippingUsd:4,availability:10,deliveryDays:8,verified:true});
 assert.equal(chooseFeaturedOffer({offers:[o1,o2],merchants:{m1,m2}}).featured.id,'o1');
});
test('unauthorized seller cannot become featured offer',()=>{
 const m=normalizeMerchant({id:'m1',name:'A',authorized:false,complianceStatus:'pending'});
 const o=normalizeOffer({id:'o1',productId:'p1',merchantId:'m1',priceUsd:1,availability:999,verified:true});
 assert.equal(chooseFeaturedOffer({offers:[o],merchants:{m1:m}}).featured,null);
});
test('search and recommendation support canonical products',()=>{
 const p1=normalizeProduct({id:'p1',title:'AI workflow kit',category:'software',tags:['ai','workflow']});
 const p2=normalizeProduct({id:'p2',title:'Automation templates',category:'software',tags:['workflow']});
 const results=searchCatalog({query:'workflow',products:[p1,p2],offers:[],merchants:{}});assert.equal(results.length,2);
 const rec=recommendProducts({productId:'p1',products:[p1,p2],events:[{type:'view',productId:'p2'}]});assert.equal(rec[0].product.id,'p2');
});
test('restricted unsafe category is rejected',()=>assert.throws(()=>normalizeProduct({title:'x',category:'weapons'})));
test('fulfillment adapters cover digital POD merchant 3PL and affiliate routes',()=>{
 for(const mode of ['ultron-digital','pod-provider','merchant-fulfilled','third-party-logistics','external-affiliate'])assert.ok(routeFulfillment({fulfillmentMode:mode}).route);
 assert.ok(FULFILLMENT_MODES.includes('amazon-mcf-optional'));
});
test('manifest differentiates ULTRON rather than claiming it is Amazon',()=>{
 const m=universalMarketManifest();assert.match(m.architecture,/API-first/i);assert.ok(m.ultronDifferentiators.some(x=>/digital goods/i.test(x)));assert.ok(m.policy.principles.some(x=>/authorized merchants/i.test(x)));
});
