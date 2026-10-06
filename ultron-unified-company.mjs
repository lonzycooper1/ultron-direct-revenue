import {v8Manifest} from './ultron-autonomous-revenue-v8.mjs';
import {v7Manifest} from './ultron-strategic-edge-v7.mjs';
import {v6Manifest} from './ultron-discovery-economy-v6.mjs';
import {manifest as sovereignManifest} from './ultron-sovereign-v5.mjs';
import {getJson,setJson} from './state-store.mjs';
const KEY='ultron-unified-company-v1',now=()=>new Date().toISOString(),num=v=>Number.isFinite(Number(v))?Number(v):0,clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,num(v)));
const D=[
['distributionBrain','ULTRON Distribution Brain','Allocate offers across SEO, short-form, partners, referrals, communities, opt-in email and approved paid acquisition using measured CAC, conversion and contribution profit.'],
['buyerTwin','Buyer Digital Twin','Segment models of problems, objections, budgets, triggers and decision criteria; never impersonates a real person.'],
['voiceCustomer','Voice-of-Customer Intelligence','Learn permissioned customer language from conversations, support, reviews, diagnostics and lost-sale reasons.'],
['saturation','Market Saturation Detector','Measure competition, pricing similarity, advertising/content saturation and differentiation before investment.'],
['moat','Competitive Moat Engine','Score data advantage, brand, distribution, switching costs, proprietary workflows, community, partnerships and accumulated learning.'],
['category','Category-Creation Engine','Find defensible differentiated packaging instead of competing only for existing categories.'],
['validation','Product Validation Gate','Require evidence of problem severity, intent, willingness to pay, differentiation, fulfillment fit, margin and distribution before scale.'],
['interview','Customer Interview Copilot','Generate questions and organize permissioned feedback; compare stated needs with observed purchasing behavior.'],
['leadMagnet','Lead-Magnet Factory','Create useful assessments, ROI calculators, readiness scores, diagnostics and reports tied naturally to paid solutions.'],
['landing','Personalized Landing-Page Engine','Select positioning from legitimate non-sensitive context such as industry, referral source, campaign and expressed problem.'],
['demoPurchase','Demo-to-Purchase Engine','Measure demo viewed → features explored → objection → offer → checkout → verified payment.'],
['dealRoom','Deal Room','Private high-value prospect workspace for diagnosis, demo, implementation, scope, timeline, evidence, price and next step.'],
['pipeline','Pipeline Forecasting Brain','Forecast qualified pipeline using calibrated stage conversion and expected close date; keep forecasts separate from captured revenue.'],
['lossAutopsy','Sales-Loss Autopsy','Structure lost-opportunity reasons and feed them into product-market-fit learning.'],
['concentration','Revenue Concentration Monitor','Warn on excessive dependency on a customer, product, channel, partner or platform.'],
['cohorts','Customer Cohort Engine','Compare activation, retention, expansion, refunds and contribution profit by acquisition period/channel.'],
['referral2','Referral Flywheel 2.0','Request referrals from genuinely satisfied customers, attribute them and measure referred-customer quality.'],
['networkEffects','Network-Effects Engine','Find legitimate product surfaces where participation improves marketplace supply, benchmarks, integrations, templates or knowledge.'],
['recurring','Subscription / Recurring-Revenue Designer','Identify products that genuinely create recurring customer value.'],
['enterprise','Enterprise Readiness Layer','Security docs, access control, auditability, SLA/data-processing/procurement/account-admin readiness.'],
['integrationHub','Integration Hub','Normalize authorized CRM, commerce, payments, analytics, email, calendar, support and external-data connections.'],
['eventBus2','Event Bus 2.0','Common verified vocabulary: lead.created, diagnostic.completed, proposal.viewed, checkout.started, payment.captured, fulfillment.completed, customer.renewed.'],
['provenance','Data Provenance Engine','Attach source, observation time, confidence, permission level and freshness to important facts.'],
['truthGraph','Business Truth Graph','Distinguish observed, customer-provided, inferred, forecast and verified-financial facts.'],
['modelRouter','Model Router','Route routine work to efficient models and reserve deeper reasoning for complex/high-value decisions.'],
['evalLab','AI Evaluation Laboratory','Benchmark agent/model/prompt changes on quality, reliability, latency and cost before promotion.'],
['agentReputation','Agent Reputation System','Internal trust based on measured outcomes; route more work to reliable agents and review/retire weak ones.'],
['redTeam','Adversarial Red Team','Test prompt injection, malformed input, payment inconsistency, permission escalation, misleading data and workflow failures.'],
['vault','Secret / Credential Vault Architecture','Least-privilege, short-lived credential design; broad credentials are not exposed to unrelated agents.'],
['audit','Immutable Audit Ledger','Tamper-evident record design for approvals, verified financial events, deployments and important decisions.'],
['continuity','Business Continuity Mode','Queue recoverable work and protect state when AI, hosting, payment or provider dependencies fail.'],
['resilience','Multi-Provider Resilience','Provider interfaces and graceful degradation where redundancy is economically justified.'],
['conflict','Goal Conflict Resolver','Resolve growth vs margin, speed vs quality and conversion vs satisfaction under explicit priorities.'],
['constraints','Constraint Engine','Hard mission budgets, permissions, deadline, risk, quality, compliance and stop conditions.'],
['killSwitch','Kill-Switch System','Immediate control state for agents, campaigns, commerce, integrations and autonomous execution.'],
['dailyBrief','Daily CEO Brief','What changed, earned/lost value, broke, was learned, needs approval and the three highest-value next actions.'],
['weeklyReview','Weekly Strategy Review','Compare actual results to predictions/goals and recommend resource increases, decreases or retirement.'],
['northStar','North-Star Decomposition','Require every agent to map work to qualified demand, conversion, customer value, profit, reliability or learning.'],
['compounding','Compounding Engine','Identify reusable software, SEO assets, customer relationships, datasets, workflows, brand, recurring contracts and partnerships.'],
['economicAutopilot','ULTRON Economic Autopilot','Rank the highest expected contribution-profit action given evidence, capital, customers, capabilities and constraints; execute only safe/reversible work and queue consequential actions for approval.']
];
export const UNIFIED_SYSTEMS=D.map(([id,name,purpose],i)=>({id,index:i+1,name,purpose,status:'ACTIVE'}));
export const EVENTS=['lead.created','diagnostic.completed','proposal.viewed','checkout.started','payment.authorized','payment.captured','payment.refunded','fulfillment.completed','customer.renewed'];
export const LOOPS={market:['detect problem','validate demand','create offer','acquire attention','convert customer'],customer:['deliver outcome','prove value','retain','expand','referral'],intelligence:['predict','act/test','measure','attribute','learn','remember','reallocate']};
export function validateProduct(x={}){const k=['problemSeverity','buyerIntent','willingnessToPay','differentiation','fulfillmentAbility','margin','distributionPath'],scores=Object.fromEntries(k.map(y=>[y,clamp(x[y])])),score=+(Object.values(scores).reduce((a,b)=>a+b,0)/k.length).toFixed(1);return{score,decision:score>=70&&Math.min(...Object.values(scores))>=45?'VALIDATE_WITH_BOUNDED_TEST':'HOLD',scores,note:'Gate authorizes testing, not guaranteed demand or autonomous spend.'}}
export function chooseDistribution(channels=[]){return channels.map(c=>{const cac=Math.max(.01,num(c.cac)),conv=num(c.conversion),profit=num(c.contributionProfit),evidence=Math.max(1,num(c.sampleSize));return{...c,score:+((profit/cac)*Math.max(.001,conv)*Math.log10(evidence+9)).toFixed(4)}}).sort((a,b)=>b.score-a.score)}
export function provenance(value,{source='unknown',kind='inference',confidence=0,permission='unknown',observedAt=now(),freshUntil=null}={}){return{value,source,kind,confidence:clamp(confidence)/100,permission,observedAt,freshUntil}}
export function resolveConflict({growth=0,margin=0,quality=0,satisfaction=0,reliability=0}={}){const scores={customerSafety:clamp(Math.min(quality,satisfaction,reliability)),durableEconomics:clamp((margin+satisfaction)/2),growth:clamp(growth)};return{priority:scores.customerSafety<60?'PROTECT_CUSTOMER_AND_RELIABILITY':scores.durableEconomics<60?'IMPROVE_UNIT_ECONOMICS':'CONTROLLED_GROWTH',scores}}
export function economicDecision(actions=[]){const ranked=actions.map(a=>{const expected=num(a.expectedContributionProfit),confidence=clamp(a.confidence)/100,cost=num(a.cost),risk=clamp(a.risk)/100,reversible=a.reversible!==false,score=(expected*confidence-cost)*(1-risk);return{...a,score:+score.toFixed(2),mode:reversible&&cost<=0?'SAFE_AUTOMATION':'APPROVAL_REQUIRED'}}).sort((a,b)=>b.score-a.score);return{selected:ranked[0]||null,ranked}}
export async function unifiedState(){return getJson(KEY,{version:1,createdAt:now(),systems:UNIFIED_SYSTEMS,events:[],facts:[],distribution:[],segments:[],voice:[],products:[],pipeline:[],losses:[],cohorts:[],evaluations:[],agentReputation:{},audit:[],continuity:{mode:'NORMAL'},killSwitch:{global:false,agents:false,campaigns:false,commerce:false,integrations:false},approvals:[],dailyBriefs:[],weeklyReviews:[],updatedAt:now()})}
export async function saveUnifiedState(s){s.updatedAt=now();return setJson(KEY,s)}
export function unifiedManifest(){const v5=sovereignManifest(),v6=v6Manifest(),v7=v7Manifest(),v8=v8Manifest();return{version:'8.0.0',status:'ACTIVE',systems:[...UNIFIED_SYSTEMS,...v5.systems,...v6.systems,...v7.systems,...v8.systems],events:EVENTS,loops:LOOPS,sovereign:v5,discoveryEconomy:v6,strategicEdge:v7,autonomousRevenue:v8,unifiedHierarchy:v8.architecture,scientificMethod:v5.scientificLoop,realityEngine:v5.realityEngine,civilizationMemory:v5.civilizationMemory,complexityTax:v5.complexityTax,aboveLoops:'ULTRON Economic Autopilot',priority:['distributionBrain','validation','voiceCustomer','truthGraph','evalLab','dailyBrief','economicAutopilot'],governance:['verified revenue is never replaced by forecasts','no fabricated customers, reviews, proof or demand','public/permissioned data only','least privilege','paid spend, refunds, transfers, contracts, account/security changes and sensitive communications require authorization','kill switch overrides autonomous work'],northStar:v8.objective}}
