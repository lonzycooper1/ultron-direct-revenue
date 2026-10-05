import crypto from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';

const KEY='universal-marketplace-v1';
export const UNIVERSAL_MARKET_VERSION='1.0.0';

export const MARKETPLACE_DOMAINS=Object.freeze([
  'catalog','merchant-registry','offer-engine','search','recommendations','cart','checkout',
  'orders','payments','inventory','fulfillment','returns','support','trust-safety',
  'reviews-proof','promotions','affiliate-routing','analytics','events'
]);

export const COMMERCE_TYPES=Object.freeze([
  'digital-download','software','subscription','service','print-on-demand',
  'merchant-physical','supplier-fulfilled','affiliate-offer','booking','education'
]);

export const FULFILLMENT_MODES=Object.freeze([
  'ultron-digital','shopify','pod-provider','merchant-fulfilled','third-party-logistics',
  'amazon-mcf-optional','external-affiliate','service-delivery'
]);

export const MARKETPLACE_POLICY=Object.freeze({
  name:'ULTRON Universal Commerce Exchange',
  role:'multi-sided commerce mediator',
  principles:[
    'one canonical product can contain multiple competing offers',
    'merchant and fulfillment adapters are API-first and replaceable',
    'events decouple checkout, payment, fulfillment, support and analytics',
    'buyer-facing ranking optimizes total buyer value, not only platform margin',
    'digital, software and services are first-class alongside physical products',
    'only authorized merchants/suppliers may sell through the network',
    'fees, commissions and affiliate relationships must be disclosed where required',
    'only verified provider captures count as realized revenue',
    'unsafe, illegal, counterfeit, infringing or restricted inventory is blocked'
  ],
  prohibitedCategories:[
    'illegal-goods','stolen-goods','counterfeit-goods','weapons','explosives',
    'controlled-substances','prescription-drugs-without-authorization','malware',
    'credential-theft-tools','human-trafficking','sexual-exploitation-material'
  ],
  restrictedPrinciple:'A product requiring licenses, age gates, regulated handling or platform approval stays unavailable until the required compliance evidence exists.'
});

const clean=(v,max=500)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
const money=n=>Number((Number(n)||0).toFixed(2));
const uid=p=>p+'-'+crypto.randomUUID();

function seed(){return {
 version:UNIVERSAL_MARKET_VERSION,createdAt:new Date().toISOString(),updatedAt:null,
 merchants:{},products:{},offers:{},carts:{},orders:{},events:[],
 stats:{merchants:0,canonicalProducts:0,offers:0,orders:0,verifiedRevenueUsd:0}
}}

export function normalizeProduct(input={}){
 const category=clean(input.category||'general',80).toLowerCase();
 if(MARKETPLACE_POLICY.prohibitedCategories.includes(category))throw Error('marketplace-policy: prohibited category');
 const type=COMMERCE_TYPES.includes(input.type)?input.type:'digital-download';
 return {
  id:clean(input.id||uid('product'),120),
  title:clean(input.title||'Untitled product',180),
  description:clean(input.description||'',2000),
  brand:clean(input.brand||'Independent',120),
  type,category,
  attributes:Object.fromEntries(Object.entries(input.attributes||{}).slice(0,40).map(([k,v])=>[clean(k,80),clean(v,300)])),
  tags:(input.tags||[]).slice(0,30).map(x=>clean(x,80).toLowerCase()),
  status:input.status==='blocked'?'blocked':'active',
  createdAt:input.createdAt||new Date().toISOString()
 };
}

export function normalizeMerchant(input={}){
 if(!input.name)throw Error('merchant name required');
 return {
  id:clean(input.id||uid('merchant'),120),name:clean(input.name,160),
  kind:clean(input.kind||'independent-seller',80),
  website:clean(input.website||'',500),
  authorized:Boolean(input.authorized),
  quality:clamp(input.quality??0.5),
  fulfillmentScore:clamp(input.fulfillmentScore??0.5),
  supportScore:clamp(input.supportScore??0.5),
  complianceStatus:['verified','pending','blocked'].includes(input.complianceStatus)?input.complianceStatus:'pending',
  createdAt:input.createdAt||new Date().toISOString()
 };
}

export function normalizeOffer(input={}){
 const fulfillment=FULFILLMENT_MODES.includes(input.fulfillmentMode)?input.fulfillmentMode:'merchant-fulfilled';
 return {
  id:clean(input.id||uid('offer'),120),productId:clean(input.productId,120),merchantId:clean(input.merchantId,120),
  priceUsd:money(input.priceUsd),shippingUsd:money(input.shippingUsd),platformFeeUsd:money(input.platformFeeUsd),
  availability:Math.max(0,Math.floor(Number(input.availability)||0)),
  deliveryDays:Math.max(0,Math.min(365,Number(input.deliveryDays)||0)),
  fulfillmentMode:fulfillment,
  condition:clean(input.condition||'new',40),
  externalUrl:clean(input.externalUrl||'',700),
  commissionPct:Math.max(0,Math.min(100,Number(input.commissionPct)||0)),
  verified:Boolean(input.verified),status:input.status==='blocked'?'blocked':'active',
  createdAt:input.createdAt||new Date().toISOString()
 };
}

export function featuredOfferScore(offer,merchant){
 const landed=offer.priceUsd+offer.shippingUsd;
 const priceScore=1/(1+Math.max(0,landed));
 const availability=offer.availability>0?1:0;
 const delivery=1-Math.min(1,offer.deliveryDays/30);
 const trust=(merchant?.quality??.5)*.45+(merchant?.fulfillmentScore??.5)*.35+(merchant?.supportScore??.5)*.20;
 const compliance=merchant?.authorized&&merchant?.complianceStatus==='verified'&&offer.verified?1:0;
 const score=priceScore*.20+availability*.20+delivery*.20+trust*.30+compliance*.10;
 return +score.toFixed(6);
}

export function chooseFeaturedOffer({offers=[],merchants={}}={}){
 const eligible=offers.filter(o=>o.status==='active'&&o.availability>0).map(o=>{
   const m=merchants[o.merchantId];
   const eligibleMerchant=Boolean(m?.authorized&&m?.complianceStatus==='verified');
   return {...o,eligibleMerchant,score:eligibleMerchant?featuredOfferScore(o,m):-1};
 }).filter(x=>x.eligibleMerchant).sort((a,b)=>b.score-a.score||((a.priceUsd+a.shippingUsd)-(b.priceUsd+b.shippingUsd)));
 return {featured:eligible[0]||null,alternates:eligible.slice(1,4),eligibleCount:eligible.length,
  rankingDisclosure:'Ranks verified eligible offers using landed price, availability, delivery and seller service quality; platform margin is not a ranking input.'};
}

const terms=q=>clean(q,500).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
export function searchCatalog({query='',products=[],offers=[],merchants={},limit=24}={}){
 const q=terms(query);
 return products.filter(p=>p.status==='active').map(p=>{
   const hay=[p.title,p.description,p.brand,p.category,...p.tags].join(' ').toLowerCase();
   const lexical=q.length?q.reduce((s,t)=>s+(hay.includes(t)?1:0),0)/q.length:1;
   const po=offers.filter(o=>o.productId===p.id);
   const selected=chooseFeaturedOffer({offers:po,merchants});
   const trust=selected.featured?Math.max(0,selected.featured.score):0;
   return {product:p,featuredOffer:selected.featured,alternates:selected.alternates,score:+(lexical*.75+trust*.25).toFixed(5)};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.min(100,limit)));
}

export function recommendProducts({productId='',products=[],events=[],limit=12}={}){
 const base=products.find(x=>x.id===productId);
 if(!base)return [];
 const related=products.filter(x=>x.id!==productId&&x.status==='active').map(p=>{
   const sameCategory=p.category===base.category?1:0;
   const overlap=p.tags.filter(t=>base.tags.includes(t)).length/Math.max(1,new Set([...p.tags,...base.tags]).size);
   const interactions=events.filter(e=>e.productId===p.id&&['view','cart','purchase'].includes(e.type)).length;
   return {product:p,score:+(sameCategory*.5+overlap*.3+Math.min(1,interactions/20)*.2).toFixed(4)};
 }).sort((a,b)=>b.score-a.score).slice(0,limit);
 return related;
}

export function routeFulfillment(offer){
 const map={
  'ultron-digital':'instant-digital-entitlement',
  'shopify':'shopify-order-route',
  'pod-provider':'pod-production-route',
  'merchant-fulfilled':'merchant-order-route',
  'third-party-logistics':'3pl-order-route',
  'amazon-mcf-optional':'amazon-mcf-route',
  'external-affiliate':'external-merchant-handoff',
  'service-delivery':'service-work-order'
 };
 return {mode:offer.fulfillmentMode,route:map[offer.fulfillmentMode]||'manual-review'};
}

export async function registerMerchant(input){
 return mutateJson(KEY,seed(),async s=>{const m=normalizeMerchant(input);s.merchants[m.id]=m;s.stats.merchants=Object.keys(s.merchants).length;s.updatedAt=new Date().toISOString();s.events.unshift({id:uid('evt'),type:'merchant-registered',merchantId:m.id,at:s.updatedAt});});
}
export async function upsertProduct(input){
 return mutateJson(KEY,seed(),async s=>{const p=normalizeProduct(input);s.products[p.id]=p;s.stats.canonicalProducts=Object.keys(s.products).length;s.updatedAt=new Date().toISOString();s.events.unshift({id:uid('evt'),type:'product-upserted',productId:p.id,at:s.updatedAt});});
}
export async function upsertOffer(input){
 return mutateJson(KEY,seed(),async s=>{const o=normalizeOffer(input);if(!s.products[o.productId])throw Error('unknown product');if(!s.merchants[o.merchantId])throw Error('unknown merchant');s.offers[o.id]=o;s.stats.offers=Object.keys(s.offers).length;s.updatedAt=new Date().toISOString();s.events.unshift({id:uid('evt'),type:'offer-upserted',productId:o.productId,offerId:o.id,merchantId:o.merchantId,at:s.updatedAt});});
}
export async function recordInteraction({type='view',productId='',sessionId='anonymous',metadata={}}={}){
 return mutateJson(KEY,seed(),async s=>{s.events.unshift({id:uid('evt'),type:clean(type,40),productId:clean(productId,120),sessionId:clean(sessionId,120),metadata:Object.fromEntries(Object.entries(metadata||{}).slice(0,20)),at:new Date().toISOString()});s.events=s.events.slice(0,5000);s.updatedAt=new Date().toISOString();});
}
export async function marketplaceState(){return getJson(KEY,seed())}
export async function marketplaceSearch(query,limit=24){const s=await marketplaceState();return searchCatalog({query,products:Object.values(s.products),offers:Object.values(s.offers),merchants:s.merchants,limit})}
export async function marketplaceProduct(id){const s=await marketplaceState(),p=s.products[id];if(!p)return null;const offers=Object.values(s.offers).filter(x=>x.productId===id);return {product:p,...chooseFeaturedOffer({offers,merchants:s.merchants}),recommendations:recommendProducts({productId:id,products:Object.values(s.products),events:s.events})}}
export function universalMarketManifest(){
 return {
  version:UNIVERSAL_MARKET_VERSION,
  name:MARKETPLACE_POLICY.name,
  architecture:'headless API-first event-driven marketplace domains on Railway/Postgres, designed for later independent service extraction',
  domains:MARKETPLACE_DOMAINS,
  commerceTypes:COMMERCE_TYPES,
  fulfillmentModes:FULFILLMENT_MODES,
  policy:MARKETPLACE_POLICY,
  amazonInspiredPatterns:[
   'canonical product detail page with multiple seller offers',
   'featured-offer selection',
   'API-first bounded services',
   'event-driven order/payment/fulfillment flow',
   'search and personalized recommendations',
   'multi-channel fulfillment adapters',
   'seller tooling and trust/safety gates'
  ],
  ultronDifferentiators:[
   'digital goods, software, services and bookings are first-class, not side channels',
   'transparent featured-offer ranking disclosure',
   'AI Agent-of-Agents can create, stage, support and optimize offers',
   'provider-neutral fulfillment routing instead of one warehouse network',
   'built-in human approval gates for consequential actions',
   'verified-revenue accounting and 20-layer bot security'
  ]
 };
}
