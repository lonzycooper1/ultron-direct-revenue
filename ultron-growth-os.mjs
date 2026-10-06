import {getJson,setJson} from './state-store.mjs';
const KEY='ultron-growth-os-v1',now=()=>new Date().toISOString(),n=v=>Number.isFinite(Number(v))?Number(v):0,ratio=(a,b)=>b?+(a/b).toFixed(4):0;
export const SYSTEMS=[
['attention','Attention Engine','Trend Radar, Hook Lab, viral-pattern analysis, SEO opportunities, short-form content, free tools, creator/partner discovery and Creative Darwinism.'],
['customerGraph','Customer Intelligence Graph','Unified prospect/customer identity, pain, source, behavior, conversations, objections, purchases, LTV, churn, referrals and next-best action.'],
['intent','Intent Engine','Cold → interested → qualified → purchase-ready → customer → expansion-ready scoring.'],
['offerIntel','Offer Intelligence / PMF','Allocate resources by measured traffic, leads, checkout, purchases, refunds, margin and retention; retire weak experiments.'],
['conversion','Conversion Laboratory','Bounded tests of positioning, headlines, demos, pricing presentation, CTA, checkout and onboarding.'],
['sales','Sales Copilot','Public/permissioned context, diagnosis, matched offer, proposal/demo draft, objection tracking and next follow-up.'],
['proof','Proof Engine','Consent-based genuine metrics, workflow evidence, testimonials, demos and case studies; never manufactured proof.'],
['referral','Referral + Partnership Engine','Qualified customer introductions, creators, consultants, agencies, affiliates and complementary partners.'],
['retention','Retention Engine','Activation, usage, support, satisfaction, renewal and churn-risk workflows.'],
['expansion','Expansion Engine','Next-best genuine value from $99 → $500 → $2,500 → $7,500 → $10,000.'],
['economics','Unit-Economics Brain','CAC, gross margin, refund rate, conversion, LTV, payback and contribution profit.'],
['capital','Capital Allocation Engine','Recommend infrastructure, content, experiments, fulfillment, reserves and owner distribution; spending stays approval-gated.'],
['experiments','Experimentation OS','Hypothesis → bounded test → metric → result → promote/retire → memory.'],
['attribution','Attribution Engine','Payment ← checkout ← offer ← lead ← landing page ← content/outreach ← channel ← experiment.'],
['truth','Revenue Truth Layer','Separate projected opportunity, checkout, authorization, capture, refund, fulfillment and payout availability.'],
['reliability','Reliability / Self-Healing','Detect service/API/link/feed/checkout/agent failures; retry safe work and escalate consequential recovery.'],
['cost','Cost Governor','Per-agent/mission API, compute and acquisition budgets with cost per useful outcome.'],
['warehouse','Data Warehouse + Business Memory','Durable experiments, interactions, campaigns, products, failures, wins and learned precedents.'],
['simulation','Simulation / Digital Twin','Scenario math for traffic × conversion × AOV × margin × refunds × CAC before expensive changes.'],
['founder','Founder Command Center','Qualified attention, leads, opportunities, conversion, verified revenue, gross profit, CAC, LTV, cash available and system health.']
].map(([id,name,purpose])=>({id,name,purpose,status:'ACTIVE'}));
export function intentStage(x={}){let s=n(x.score);if(x.customer&&n(x.expansionScore)>=70)return'expansion-ready';if(x.customer)return'customer';if(s>=80)return'purchase-ready';if(s>=60)return'qualified';if(s>=30)return'interested';return'cold'}
export function unitEconomics(m={}){const spend=n(m.acquisitionCost),customers=n(m.customers),revenue=n(m.revenue),cogs=n(m.cogs),refunds=n(m.refunds),gross=Math.max(0,revenue-refunds-cogs),cac=customers?spend/customers:0,ltv=customers?gross/customers:0;return{cac:+cac.toFixed(2),grossProfit:+gross.toFixed(2),grossMargin:ratio(gross,revenue),refundRate:ratio(refunds,revenue),ltv:+ltv.toFixed(2),contributionProfit:+(gross-spend).toFixed(2),ltvCac:cac?+(ltv/cac).toFixed(2):0}}
export function simulate({traffic=0,conversion=.01,aov=99,grossMargin=.8,refundRate=.03,cac=0}={}){const customers=n(traffic)*n(conversion),revenue=customers*n(aov),refunds=revenue*n(refundRate),gross=(revenue-refunds)*n(grossMargin),acq=customers*n(cac);return{traffic:n(traffic),customers:+customers.toFixed(2),revenue:+revenue.toFixed(2),refunds:+refunds.toFixed(2),grossProfit:+gross.toFixed(2),acquisitionCost:+acq.toFixed(2),contributionProfit:+(gross-acq).toFixed(2),note:'Scenario, not forecast.'}}
export async function growthState(){return getJson(KEY,{version:1,createdAt:now(),systems:SYSTEMS,experiments:[],attention:[],customers:{},attribution:[],memory:[],costs:{},updatedAt:now()})}
export async function recordExperiment(e={}){const s=await growthState();s.experiments.unshift({id:e.id||crypto.randomUUID(),hypothesis:String(e.hypothesis||''),audience:String(e.audience||''),metric:String(e.metric||''),target:n(e.target),result:e.result??null,status:e.status||'BOUNDED',createdAt:now()});s.experiments=s.experiments.slice(0,5000);s.updatedAt=now();return setJson(KEY,s)}
export function growthManifest(){return{version:'1.0.0',status:'ACTIVE',systems:SYSTEMS,loop:['SENSE DEMAND','EARN ATTENTION','CAPTURE INTENT','QUALIFY','CONVERT','VERIFY PAYMENT','FULFILL','PROVE','RETAIN','EXPAND','ATTRIBUTE','LEARN','REALLOCATE'],guardrails:['no fabricated customers, proof or revenue','no private-data scraping','no bulk spam','paid spend and binding actions remain approval-gated','retire experiments, not legitimate customer obligations']}}
