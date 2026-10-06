import {getJson,setJson} from './state-store.mjs';
const KEY='ultron-advantage-os-v1',now=()=>new Date().toISOString(),num=v=>Number.isFinite(Number(v))?Number(v):0,clip=(v,a=0,b=100)=>Math.max(a,Math.min(b,num(v)));
const defs=[
['demandRadar','ULTRON Demand Radar 2.0','Continuously rank lawful public demand signals by buyer intent, competition, urgency, achievable margin and fulfillment fit.'],
['arbitrage','Opportunity Arbitrage Engine','Find expensive, slow, confusing or poorly served paid problems where ULTRON can deliver materially better value.'],
['attentionPrediction','Attention Prediction Engine','Score creative relevance, hook, novelty, clarity, credibility, retention and commercial intent; calibrate against observed outcomes.'],
['contentGenome','Content Genome','Learn topic, hook, opening, length, format, CTA, audience, emotion, timing and offer combinations that produce qualified traffic.'],
['creativeTournament','Creative Tournament System','Run bounded creative variants, retire weak variants and generate descendants of measured winners.'],
['utilityNetwork','Free Utility Network','Useful calculators, assessments, generators, checklists and mini-tools that solve a real problem and connect naturally to paid solutions.'],
['programmaticSeo','Programmatic SEO Engine','High-quality industry × problem × location × solution pages with duplicate/thin-content controls and business-outcome measurement.'],
['answerVisibility','Answer/Search Visibility Engine','Structured original information, research, tools and schema for traditional and AI-assisted discovery without ranking manipulation.'],
['authority','Authority Engine','Original benchmarks, anonymized aggregate insights, experiments, tools and technical reports designed to earn citations voluntarily.'],
['community','Community Engine','Build an owned audience through useful email, customer education, newsletters and legitimate community participation.'],
['creatorNetwork','Creator Collaboration Network','Discover creators with genuine audience-product overlap and score partnerships by attributable customer potential.'],
['b2bPartners','B2B Partnership Network','Find agencies, consultants, developers and providers already serving target customers.'],
['demoFactory','Interactive Demo Factory','Create customized, non-deceptive prospect demos before purchase.'],
['proposalV2','Proposal Generator 2.0','Diagnosis, recommended solution, scope, timeline, price, acceptance criteria and next step; human review for commitments.'],
['objectionIntel','Objection Intelligence','Measure price, trust, timing, complexity and incumbent-vendor objections and feed them back into offer design.'],
['trustCenter','Trust Center','Central privacy, security, refund/fulfillment, support, payment, demo and genuine-proof information.'],
['reputation','Reputation Engine','Track genuine satisfaction, complaints, refunds and reviews; surface recurring problems without fabricating or suppressing feedback.'],
['successAutopilot','Customer Success Autopilot','Onboarding → activation → milestones → support → completion → satisfaction → renewal/referral.'],
['churnPrediction','Churn Prediction','Estimate inactivity/dissatisfaction risk and recommend useful interventions.'],
['nextBestAction','Next-Best-Action Brain','Recommend educate, wait, demonstrate, diagnose, follow up, support, expand, request referral or do nothing.'],
['ltvOptimizer','Lifetime-Value Optimizer','Optimize long-term contribution profit rather than first-purchase revenue.'],
['pricingIntel','Pricing Intelligence','Responsibly test packaging, bundles, subscriptions, retainers and tiers without deceptive pricing or fake scarcity.'],
['marginOptimizer','Margin Optimizer','Model fulfillment, support, compute, payment fees, refunds and acquisition costs; prioritize contribution profit.'],
['cashFlow','Cash-Flow Brain','Forecast receivables, refunds, subscriptions, infrastructure costs and reserves while separating expected from realized cash.'],
['treasuryPolicy','Treasury Policy Engine','Recommend operating reserve, taxes, infrastructure, experiments, reinvestment and owner distribution; transfers/spend remain controlled.'],
['agentRoi','Agent ROI Ranking','Rank agents by useful output, revenue influence, accuracy, latency and cost; reduce or retire negative-value loops.'],
['skillRegistry','Agent Marketplace / Skill Registry','Activate specialist skills only when needed rather than keeping every worker continuously active.'],
['knowledgeGraph','World Model / Business Knowledge Graph','Connect customers, problems, products, competitors, content, channels, experiments, payments and outcomes.'],
['causalLearning','Causal Learning Engine','Prefer controlled experiments where practical to distinguish causal lift from correlation.'],
['failureMemory','Failure Memory','Persist failed experiments, conditions, cost, result and likely reason to prevent repeated mistakes.'],
['calibration','Prediction Calibration','Record forecasts before outcomes and measure calibration for demand, conversion, churn, revenue and creative performance.'],
['decisionJournal','Decision Journal','Evidence → assumptions → prediction → action → outcome → lesson for consequential business decisions.'],
['qaArmy','Autonomous QA Army','Test links, checkout, mobile, APIs, content accuracy, security, accessibility and fulfillment before release.'],
['canaryRollback','Canary Deployment + Automatic Rollback','Stage major technical changes on limited traffic and roll back on defined safety/reliability regression thresholds.'],
['disasterRecovery','Disaster-Recovery System','Backups, deployment history, configuration recovery, secret-rotation procedures and tested restore instructions.'],
['fraudDefense','Fraud/Abuse Defense','Detect suspicious orders, bots, chargeback patterns, fake signups, credential abuse and manipulation without assuming legitimate users are fraudulent.'],
['permissions','Permission Architecture','Least-privilege agent roles: research, content, analytics, commerce and infrastructure permissions remain separated.'],
['approvalCenter','Human Approval Center','One queue for paid ads, refunds, transfers, contracts, account/security changes and other consequential actions.'],
['ceoSimulator','CEO Strategy Simulator','Scenario-test traffic, conversion, CAC, refunds, price, margin and capacity before capital is committed.'],
['goalDecomposition','Goal Decomposition Engine','Convert a revenue objective into contribution-profit, customers, opportunities, leads, qualified traffic, channels, experiments and daily execution targets.']
];
export const ADVANTAGE_SYSTEMS=defs.map(([id,name,purpose],i)=>({id,index:i+1,name,purpose,status:'ACTIVE'}));
export const SCALE_RULE='No feature earns scale because it sounds impressive. It earns scale only when measured evidence shows improved qualified attention, conversion, retention, contribution profit, reliability, or learning.';
export function demandScore(x={}){const w={buyerIntent:.24,competition:.12,urgency:.18,margin:.18,fulfillmentFit:.18,evidence:.10};const competition=100-clip(x.competition);return +Object.entries(w).reduce((s,[k,v])=>s+(k==='competition'?competition:clip(x[k]))*v,0).toFixed(1)}
export function attentionScore(x={}){const keys=['relevance','hook','novelty','clarity','credibility','retention','commercialIntent'];return +(keys.reduce((s,k)=>s+clip(x[k]),0)/keys.length).toFixed(1)}
export function agentRoi(x={}){const value=num(x.verifiedRevenueInfluence)+num(x.usefulOutputValue),cost=num(x.computeCost)+num(x.apiCost)+num(x.laborEquivalentCost);return{value:+value.toFixed(2),cost:+cost.toFixed(2),net:+(value-cost).toFixed(2),roi:cost?+((value-cost)/cost).toFixed(3):null}}
export function decomposeGoal({revenueTarget=0,contributionMargin=.6,aov=99,conversion=.02,leadToSale=.1,trafficToLead=.05,days=30}={}){const revenue=num(revenueTarget),margin=Math.max(.01,Math.min(1,num(contributionMargin))),price=Math.max(.01,num(aov)),conv=Math.max(.0001,num(conversion)),l2s=Math.max(.0001,num(leadToSale)),t2l=Math.max(.0001,num(trafficToLead)),customers=Math.ceil(revenue/price),opps=Math.ceil(customers/l2s),leads=Math.ceil(opps),traffic=Math.ceil(leads/t2l);return{revenueTarget:revenue,contributionProfitTarget:+(revenue*margin).toFixed(2),customersRequired:customers,qualifiedOpportunitiesRequired:opps,leadsRequired:leads,qualifiedTrafficRequired:traffic,dailyRevenueTarget:+(revenue/Math.max(1,num(days))).toFixed(2),dailyTrafficTarget:Math.ceil(traffic/Math.max(1,num(days))),note:'Planning math, not a revenue forecast or guarantee.'}}
export function scenario({traffic=1000,conversion=.02,aov=99,cac=15,grossMargin=.8,refundRate=.03}={}){const customers=num(traffic)*num(conversion),rev=customers*num(aov),refunds=rev*num(refundRate),gross=(rev-refunds)*num(grossMargin),acq=customers*num(cac);return{customers:+customers.toFixed(2),revenue:+rev.toFixed(2),refunds:+refunds.toFixed(2),grossProfit:+gross.toFixed(2),acquisitionCost:+acq.toFixed(2),contributionProfit:+(gross-acq).toFixed(2),note:'Scenario only; outcomes depend on real demand and execution.'}}
export async function advantageState(){return getJson(KEY,{version:1,createdAt:now(),systems:ADVANTAGE_SYSTEMS,demandSignals:[],creativePredictions:[],contentGenome:[],tournaments:[],utilities:[],partners:[],objections:[],customerSuccess:{},reputation:[],agentRoi:[],knowledgeGraph:{nodes:[],edges:[]},failures:[],predictions:[],decisionJournal:[],approvals:[],qaRuns:[],updatedAt:now()})}
export async function saveAdvantageState(s){s.updatedAt=now();return setJson(KEY,s)}
export function advantageManifest(){return{version:'2.0.0',status:'ACTIVE',systems:ADVANTAGE_SYSTEMS,priority:['demandRadar','utilityNetwork','creativeTournament','demoFactory','knowledgeGraph'],rule:SCALE_RULE,operatingLoop:['DETECT DEMAND','RANK GAP','PREDICT ATTENTION','CREATE BOUNDED TEST','QA','PUBLISH/AUTHORIZE','MEASURE','ATTRIBUTE','CALIBRATE','LEARN','SCALE OR RETIRE','REMEMBER'],guardrails:['lawful public or permissioned data only','no private-data scraping','no fabricated proof/reviews/customers','no bulk unsolicited spam','no deceptive scarcity or ranking manipulation','financial transfers, paid spend, binding commitments and sensitive account changes remain approval-gated']}}
