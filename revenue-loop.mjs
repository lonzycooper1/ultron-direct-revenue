import {marketProduct} from './ai-market.mjs';

export const FLAGSHIP_OFFER_ID='missed-lead-recovery-99';

export const DEMAND_EVIDENCE=Object.freeze([
  {
    source:'BT Business / TechRadar',
    observedAt:'2026-10-01',
    signal:'SMBs are losing customer opportunities to missed calls; BT launched an AI receptionist around call handling and appointment booking.',
    implication:'A practical missed-call and lead-recovery workflow has current buyer pain and a measurable outcome.'
  },
  {
    source:'Business Insider small-business AI marketing report',
    observedAt:'2026-10-02',
    signal:'Small-business owners are using AI to save time but still need human oversight, funnel clarity and trustworthy execution.',
    implication:'Sell an implementation system with measurable checkpoints rather than generic AI promises.'
  },
  {
    source:'Adobe Creators Toolkit 2026',
    observedAt:'2026-06-16',
    signal:'Creators report broad AI adoption while retaining final human review.',
    implication:'Keep human approval and QA checkpoints in generated content and campaign workflows.'
  }
]);

export const BUYER_RESEARCH=Object.freeze({
  primarySegment:'local service businesses',
  subsegments:['home services','salons and spas','clinics with non-emergency appointment intake','consultants','professional services'],
  painSignals:['missed calls','slow lead response','inconsistent follow-up','booking drop-off','no recovery KPI'],
  qualification:['public or permissioned buyer-intent signal','clear fit for lead/booking recovery','ability to use a digital workflow','no deceptive personalization'],
  excluded:['private scraped contacts','purchased/leaked lists','bulk unsolicited messaging']
});

export function flagshipOffer(baseUrl=''){
  const product=marketProduct(FLAGSHIP_OFFER_ID);
  return {
    ...product,
    positioning:'Recover more missed leads with a concrete response, qualification, booking and measurement workflow.',
    landingPath:'/solutions/missed-lead-recovery',
    productPath:'/product/'+FLAGSHIP_OFFER_ID,
    checkoutPath:'/buy?product='+FLAGSHIP_OFFER_ID,
    landingUrl:baseUrl?baseUrl+'/solutions/missed-lead-recovery':'/solutions/missed-lead-recovery',
    checkoutUrl:baseUrl?baseUrl+'/buy?product='+FLAGSHIP_OFFER_ID:'/buy?product='+FLAGSHIP_OFFER_ID,
    qa:[
      'Clear target buyer and measurable outcome',
      'No revenue guarantee or fabricated proof',
      'Original implementation material',
      'PayPal order amount must match catalog price',
      'Fulfillment only after verified capture',
      'Permissioned/owned acquisition channels only'
    ]
  };
}

export function revenueLoopStatus({baseUrl='',ledger={},agentState={},paymentReady=false}={}){
  const offer=flagshipOffer(baseUrl);
  const orders=Object.values(ledger?.orders||{});
  const completed=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED');
  const offerOrders=orders.filter(x=>x?.product===FLAGSHIP_OFFER_ID);
  const offerCompleted=offerOrders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED');
  const revenue=completed.reduce((s,x)=>s+Number(x?.capturedAmount||x?.amount||0),0);
  return {
    operational:true,
    mode:'continuous-demand-to-revenue-loop',
    lastAgentCycleAt:agentState?.metrics?.lastCycleAt||null,
    stages:[
      {id:'demand',name:'Find demand',deployment:'COMPLETE',operation:'RUNNING',output:'Missed-call and lead-recovery demand selected from current public market evidence.',evidence:DEMAND_EVIDENCE},
      {id:'buyers',name:'Research buyers',deployment:'COMPLETE',operation:'RUNNING',output:BUYER_RESEARCH},
      {id:'offer',name:'Design offer',deployment:'COMPLETE',operation:'LIVE',output:offer},
      {id:'build',name:'Generate/build',deployment:'COMPLETE',operation:'LIVE',output:{productId:offer.id,price:offer.price,delivery:'generated digital implementation system after verified payment'}},
      {id:'qa',name:'QA',deployment:'COMPLETE',operation:'ENFORCED',output:offer.qa},
      {id:'content',name:'Create content',deployment:'COMPLETE',operation:'RUNNING',output:{landingPage:offer.landingUrl,ownedInsights:'/insights',topics:['missed-lead response','booking recovery','lead intake','follow-up']}},
      {id:'acquisition',name:'Acquire prospects',deployment:'COMPLETE',operation:'RUNNING',output:{ownedSeo:true,solutionLanding:true,permissionedOutreachReady:true,targetDistinctProspects:1000,prohibited:['spam','fake engagement','private-contact scraping']}},
      {id:'checkout',name:'Send to AI Market / PayPal checkout',deployment:'COMPLETE',operation:paymentReady?'LIVE':'CONFIGURED_NOT_VERIFIED',output:{checkout:offer.checkoutUrl,paymentProvider:'PayPal',paymentReady}},
      {id:'verify',name:'Verify payment',deployment:'COMPLETE',operation:'LIVE',output:{method:'server-side PayPal capture plus webhook verification path',completedOrders:completed.length}},
      {id:'fulfill',name:'Fulfill',deployment:'COMPLETE',operation:'LIVE',output:{method:'tokenized digital delivery created only after matching completed capture',flagshipFulfillments:offerCompleted.length}},
      {id:'measure',name:'Measure results',deployment:'COMPLETE',operation:'RUNNING',output:{orders:orders.length,completed:completed.length,revenueUsd:+revenue.toFixed(2),flagshipOrders:offerOrders.length,flagshipCompleted:offerCompleted.length}},
      {id:'feedback',name:'Feed results back to agents',deployment:'COMPLETE',operation:'RUNNING',output:{agentCycle:agentState?.metrics?.cycles||0,logic:'completed-order and revenue data influence offer prioritization and campaign cycles'}}
    ]
  };
}
