export const REVENUE_MASTERY_VERSION='1.0.0';

export const REVENUE_MODELS=Object.freeze({
 contentAgency:{
  name:'AI-Assisted Content & Copywriting Agency',
  customerProblem:'Businesses need consistent on-brand content and lifecycle copy without adding full-time headcount.',
  revenue:'fixed-scope sprint plus monthly retainer',
  aiDoes:['research','outlines','drafts','variations','content calendars','QA assistance'],
  humanValue:['brand fit','fact checking','editing','strategy','client communication','final approval'],
  entryOffer:{name:'Content Growth Sprint',priceUsd:1250},
  recurringOffer:{name:'Content & Growth Retainer',priceUsdMonthly:1500}
 },
 aiSoftware:{
  name:'No-Code Software & Custom AI Workflows',
  customerProblem:'SMBs lose time and revenue moving information manually across inboxes, calendars, CRM, support and spreadsheets.',
  revenue:'implementation plus optional recurring optimization and support',
  aiDoes:['requirements','code scaffolding','integrations','tests','debugging','documentation'],
  humanValue:['niche selection','scope control','authorization','acceptance criteria','deployment approval'],
  entryOffer:{name:'Niche AI Tool Sprint',priceUsd:3500},
  recurringOffer:{name:'AI Growth & Automation Retainer',priceUsdMonthly:1500}
 },
 digitalProducts:{
  name:'Digital Products & Educational Content',
  customerProblem:'Experts have useful knowledge but no packaged product, checkout, delivery or validation loop.',
  revenue:'one-time digital sales plus optional upsell',
  aiDoes:['outline','drafting','examples','worksheets','listing copy','creative briefs'],
  humanValue:['expertise validation','originality','rights review','quality','audience selection'],
  entryOffer:{name:'Digital Product Launch Pack',priceUsd:750}
 }
});

export const PAYPAL_MASTERY=Object.freeze({
 oneTime:'PayPal Orders API -> customer approval -> capture -> verified fulfillment',
 agency:'PayPal Invoicing API -> draft invoice -> owner-approved send -> provider-confirmed payment',
 recurring:'PayPal Catalog Product -> Billing Plan -> Subscription approval -> recurring provider events',
 accounting:'Only provider-confirmed completed payments count as realized revenue.'
});

export const CASHFLOW_LOOP=Object.freeze([
 'pick one paid problem with evidence of urgency and willingness to pay',
 'package one fixed-scope offer with acceptance criteria',
 'build proof or demo before broad promotion',
 'publish only through authorized channels',
 'route payment through verified checkout, invoice, or subscription',
 'fulfill exactly the promised scope',
 'measure conversion, gross margin, refund/support burden and retention',
 'use feedback to improve one bottleneck at a time'
]);

export function chooseRevenueTrack(goal=''){
 const g=String(goal||'').toLowerCase();
 if(/content|copy|blog|email|social|marketing/.test(g))return 'contentAgency';
 if(/software|app|automation|workflow|saas|subscription|gpt|agent/.test(g))return 'aiSoftware';
 if(/ebook|guide|template|course|digital product|download|education/.test(g))return 'digitalProducts';
 return 'aiSoftware';
}

export function revenueMission({goal='',budgetUsd=0,weeklyHours=20}={}){
 const key=chooseRevenueTrack(goal),model=REVENUE_MODELS[key];
 return {
  version:REVENUE_MASTERY_VERSION,
  goal:String(goal||'').slice(0,3000),
  selectedTrack:key,
  model,
  budgetUsd:Math.max(0,Number(budgetUsd)||0),
  weeklyHours:Math.max(1,Number(weeklyHours)||20),
  stages:[
   'PAID_PROBLEM_RESEARCH','OFFER_DESIGN','PROOF_OR_DEMO','WORKFLOW_OR_PRODUCT_BUILD',
   'CHECKOUT_AND_BILLING','AUTHORIZED_ACQUISITION','VERIFIED_PAYMENT','FULFILLMENT',
   'OUTCOME_MEASUREMENT','RETENTION_OR_NEXT_OFFER'
  ],
  approvalGates:['public publishing','paid media spend','invoice send','subscription activation','refunds'],
  paypal:PAYPAL_MASTERY,
  principle:'AI supplies production and operations leverage; customer value, authorization, trust and verified payment remain real-world constraints.'
 };
}

export function revenueMasteryManifest(){
 return {
  version:REVENUE_MASTERY_VERSION,
  models:REVENUE_MODELS,
  paypal:PAYPAL_MASTERY,
  cashflowLoop:CASHFLOW_LOOP,
  defaultMission:revenueMission({goal:'build a recurring AI automation business'})
 };
}
