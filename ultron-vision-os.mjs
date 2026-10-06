import {unifiedManifest} from './ultron-unified-company.mjs';
import {v6Manifest} from './ultron-discovery-economy-v6.mjs';
import {v7Manifest} from './ultron-v7-manifest-lite.mjs';
import {attention,physics,feasibility,revenueQuality,confidence} from './ultron-v7-runtime.mjs';

export const VISION='One adaptive business intelligence that discovers demand, chooses what matters, creates and sells useful products, receives verified PayPal payments, fulfills customer value, learns from outcomes, simplifies itself and compounds proprietary knowledge.';

export const FINAL_GAPS=[
 {id:'distribution',name:'Verified buyer distribution',need:'Real qualified people must reach offers; software cannot manufacture genuine buyers.',priority:100},
 {id:'conversion-evidence',name:'Conversion evidence',need:'Measure landing view → lead → checkout → capture → fulfillment → customer outcome.',priority:96},
 {id:'customer-outcomes',name:'Customer outcome evidence',need:'Collect permissioned post-delivery results so Reality Engine can learn what creates value.',priority:94},
 {id:'channel-connectors',name:'Production channel connectors',need:'Authorized publishing, CRM, email, social and partner connectors must provide real event ingestion.',priority:90},
 {id:'cost-truth',name:'Complete unit economics',need:'Attach provider fees, compute, acquisition, labor/fulfillment, refunds and support costs to revenue.',priority:90},
 {id:'cash-truth',name:'Payout-available cash truth',need:'Keep captured revenue, refunds, fees and payout availability separate.',priority:88},
 {id:'retention',name:'Retention and recurring value',need:'Measure renewal, repeat purchase, expansion and churn after genuine customer value.',priority:85},
 {id:'proof',name:'Consented proof system',need:'Turn completed work into factual case studies only with permission.',priority:82},
 {id:'data-quality',name:'Connector freshness and provenance',need:'World-state claims require timestamps, source reliability and freshness.',priority:80},
 {id:'simplicity',name:'System consolidation',need:'Retire duplicate agents and capabilities when coordination/maintenance cost exceeds value.',priority:78}
];

export function revenueActivation({verifiedRevenueUsd=0,completedOrders=0,leads=0,qualifiedLeads=0,paymentReady=false,fulfillmentReady=true}={}){
 const stages=[
  {id:'offer',ready:true,action:'Keep one primary offer and one high-value implementation upsell.'},
  {id:'traffic',ready:qualifiedLeads>0,action:'Acquire qualified buyers through owned, referral, partner and compliant targeted outreach channels.'},
  {id:'leadCapture',ready:leads>0,action:'Route every voluntary/authorized lead into one measurable pipeline.'},
  {id:'checkout',ready:Boolean(paymentReady),action:'Send qualified buyers to live PayPal checkout.'},
  {id:'capture',ready:completedOrders>0,action:'Count only verified external captures as realized revenue.'},
  {id:'fulfillment',ready:Boolean(fulfillmentReady),action:'Deliver promised value only after verified payment.'},
  {id:'outcome',ready:false,action:'Collect permissioned customer outcome evidence after delivery.'},
  {id:'retention',ready:false,action:'Offer recurring optimization only where it creates continuing value.'}
 ];
 const first=stages.find(x=>!x.ready);
 return {verifiedRevenueUsd:Number(verifiedRevenueUsd)||0,completedOrders:Number(completedOrders)||0,stages,bottleneck:first?.id||'scale-validated-loop',nextAction:first?.action||'Scale only channels and offers with verified contribution profit.'};
}

export function visionDecision(items=[]){return attention(items)}
export function visionPhysics(x={}){return physics(x)}
export function visionFeasibility(x={}){return feasibility(x)}
export function visionRevenueQuality(x={}){return revenueQuality(x)}
export function visionConfidence(x={}){return confidence(x)}

export function visionManifest(){
 const company=unifiedManifest(),discovery=v6Manifest(),edge=v7Manifest();
 return {
  version:'VISION-1.0',status:'ACTIVE',vision:VISION,
  layers:{company,discovery,edge},
  gaps:FINAL_GAPS,
  architecture:['OWNER','GOAL GENOME','STRATEGIC ATTENTION','MISSION COMPILER','NUCLEUS','CONSTITUTION','WORLD STATE','DISCOVERY ECONOMY','SOVEREIGN INTELLIGENCE','ECONOMIC AUTOPILOT','BUSINESS PHYSICS','DIGITAL TWIN','DYNAMIC TEAM','PRODUCT AND OFFER','AUTHORIZED DISTRIBUTION','PAYPAL CHECKOUT','VERIFIED CAPTURE','FULFILLMENT','CUSTOMER OUTCOME','EVIDENCE GRAPH','CIVILIZATION MEMORY','CAUSAL LEARNING','PROPRIETARY INTELLIGENCE','RECURSIVE IMPROVEMENT','SIMPLIFY OR SCALE','REPEAT'],
  operatingRules:['reality outranks consensus','no fabricated buyers or revenue','one bottleneck at a time','attention before agent count','capacity before growth','customer outcome before proof','contribution profit before scale','proprietary learning must come from lawful public or permissioned data','paid spend, transfers, refunds, contracts, account/security changes and sensitive communications remain authorized'],
  todayFocus:['qualified distribution','one clear offer','live PayPal checkout','verified fulfillment','measure every funnel step','collect real objections and outcomes']
 };
}
