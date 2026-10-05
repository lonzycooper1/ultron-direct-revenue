import {securityManifest} from './agent-security.mjs';
export const UNIVERSAL_MARKET_VERSION='1.0.0';
export const UNIVERSAL_MARKET_SUMMARY=Object.freeze({
 name:'ULTRON Universal Commerce Exchange',
 role:'multi-sided commerce mediator',
 domains:['catalog','merchant-registry','offer-engine','search','recommendations','cart','checkout','orders','payments','inventory','fulfillment','returns','support','trust-safety','reviews-proof','promotions','affiliate-routing','analytics','events'],
 commerceTypes:['digital-download','software','subscription','service','print-on-demand','merchant-physical','supplier-fulfilled','affiliate-offer','booking','education'],
 amazonInspired:[
  'canonical product page with multiple seller offers',
  'featured-offer selection',
  'API-first bounded services',
  'event-driven commerce workflows',
  'search and personalization',
  'multi-channel fulfillment adapters',
  'seller tooling and trust/safety'
 ],
 differentiators:[
  'digital goods, software, services and bookings are first-class',
  'transparent buyer-value offer ranking',
  'AI Agent-of-Agents orchestration',
  'provider-neutral fulfillment routing',
  'human approval gates for consequential actions',
  'verified-revenue accounting',
  '20-layer bot security'
 ]
});
export function universalMarketManifest(){return {...UNIVERSAL_MARKET_SUMMARY,version:UNIVERSAL_MARKET_VERSION,security:securityManifest(),runtime:'ULTRON direct-revenue service'}}
export async function fetchUniversalMarketState(baseUrl){
 try{const r=await fetch(String(baseUrl).replace(/\/$/,'')+'/api/universal-marketplace',{signal:AbortSignal.timeout(5000)});const d=await r.json();return {reachable:r.ok,status:r.status,...d}}catch(e){return {reachable:false,error:String(e?.message||e).slice(0,180)}}
}
