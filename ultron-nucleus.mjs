// ULTRON Nucleus: shared vital-signs + executive cognition layer.
// It does not autonomously execute consequential financial actions.
const now=()=>new Date().toISOString();
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
export const NUCLEUS_ORGANS={
 heart:{name:'Heartbeat & Event Bus',purpose:'Keeps every division synchronized, detects stale services and emits work/events.'},
 brain:{name:'Executive Cognition',purpose:'Turns goals and observations into ranked plans, predictions, critiques and next actions.'},
 memory:{name:'Long/Short Memory',purpose:'Stores outcomes, decisions, evidence and lessons so the system improves instead of resetting.'},
 lungs:{name:'Data & Connector Intake',purpose:'Continuously refreshes authorized external data and normalizes it into observations.'},
 senses:{name:'Observability',purpose:'Measures latency, errors, revenue, conversion, model quality, drift and service health.'},
 nerves:{name:'Message/Workflow Graph',purpose:'Routes events, tasks and dependencies between specialist agents.'},
 immune:{name:'Security & Guardrails',purpose:'Permissions, anomaly detection, secrets boundaries, approval gates and kill switches.'},
 metabolism:{name:'Resource Governor',purpose:'Allocates compute, API spend and agent effort toward expected net value.'},
 reflexes:{name:'Incident Response',purpose:'Retries safe work, isolates failures, rolls back bad releases and escalates blockers.'},
 learning:{name:'Evaluation & Learning Loop',purpose:'Backtests predictions, scores outcomes, calibrates confidence and promotes only measured improvements.'}
};
export function nucleusManifest(){return{version:'1.0',status:'ONLINE',objective:'Observe -> reason -> plan -> act within permissions -> measure -> learn',organs:NUCLEUS_ORGANS,principles:['one shared event vocabulary','evidence before confidence','outcomes feed memory','consequential actions require policy/approval','health and economics are first-class signals','no feature earns scale without measured evidence of improved qualified attention, conversion, retention, contribution profit, reliability, or learning']}}
export function vitalSnapshot({services=[],business={},trading={},memory={}}={}){
 const online=services.filter(x=>x.online).length,total=services.length||1,servicePct=online/total*100;
 const stale=services.filter(x=>x.lastSeenAt&&Date.now()-Date.parse(x.lastSeenAt)>10*60e3).map(x=>x.name);
 const revenue=Number(business.verifiedRevenueUsd||0),orders=Number(business.completedOrders||0);
 const tradeCycleFresh=trading.lastCycleAt?Date.now()-Date.parse(trading.lastCycleAt)<5*60e3:false;
 const memoryEvents=Number(memory.events||0);
 const score=clamp(servicePct*.45+(tradeCycleFresh?15:0)+(memoryEvents?10:0)+(orders?15:0)+(revenue>0?15:0));
 return{at:now(),healthScore:+score.toFixed(1),services:{online,total,stale},business:{verifiedRevenueUsd:revenue,completedOrders:orders},trading:{fresh:tradeCycleFresh,lastCycleAt:trading.lastCycleAt||null},memory:{events:memoryEvents},state:score>=85?'THRIVING':score>=65?'STABLE':score>=40?'DEGRADED':'CRITICAL'};
}
export function executiveCycle({goal='Increase verified net value safely',observations=[],metrics={}}={}){
 const blockers=observations.filter(x=>x.severity==='blocker'||x.severity==='critical');
 const opportunities=observations.filter(x=>x.type==='opportunity').sort((a,b)=>(b.expectedValue||0)-(a.expectedValue||0));
 return{at:now(),goal,observe:{count:observations.length,blockers:blockers.length},orient:{topBlockers:blockers.slice(0,5),topOpportunities:opportunities.slice(0,5)},decide:{priority:blockers[0]?'resolve-blocker':opportunities[0]?'pursue-highest-expected-value':'collect-more-evidence'},act:{mode:'permissioned-workflow',approvalRequiredFor:['live financial orders','paid spend','publishing as owner','refunds','account/security changes']},learn:{required:true,comparePredictionToOutcome:true,calibrateConfidence:true},metrics};
}

export const SYSTEM_360={
  command:{role:'goal intake and mission decomposition',outputs:['mission','constraints','success metrics']},
  perception:{role:'authorized data ingestion and normalization',outputs:['observations','freshness','provenance']},
  cognition:{role:'reasoning, forecasting, critique and planning',outputs:['ranked plan','alternatives','uncertainty']},
  coordination:{role:'agent graph, queues, dependencies and ownership',outputs:['tasks','handoffs','deadlines']},
  execution:{role:'permissioned tools and workflows',outputs:['artifacts','safe actions','approval requests']},
  commerce:{role:'demand, offers, checkout, fulfillment and support',outputs:['leads','orders','deliveries']},
  finance:{role:'verified economics and resource allocation',outputs:['revenue','cost','margin','runway']},
  memory:{role:'episodic, semantic and outcome memory',outputs:['lessons','precedents','retrieval']},
  evaluation:{role:'tests, backtests, experiments and scorecards',outputs:['quality','calibration','promotion decision']},
  security:{role:'identity, authorization, anomaly and policy enforcement',outputs:['allow','deny','escalate']},
  reliability:{role:'health, retries, rollback, backup and disaster recovery',outputs:['SLO','incident','recovery']},
  governance:{role:'audit trail, approvals and human control',outputs:['decision log','approval state','accountability']}
};
export function system360Manifest(){return{version:'1.0',status:'ACTIVE',loop:['GOAL','SENSE','THINK','PLAN','SIMULATE','AUTHORIZE','ACT','VERIFY','MEASURE','LEARN','REMEMBER','OPTIMIZE','REPEAT'],systems:SYSTEM_360,completionDefinition:{technical:'all critical services healthy, observable and recoverable',economic:'revenue and costs are verified rather than projected',learning:'predictions are scored against outcomes',governance:'consequential actions remain attributable and approval-gated'},northStar:'maximize verified durable net value per unit of time, capital and risk — never fabricated activity',scaleRule:'No feature earns scale because it sounds impressive. It earns scale only when measured evidence shows improved qualified attention, conversion, retention, contribution profit, reliability, or learning.'}}

export const OPENAI_CAPACITY_POLICY={
  tiers:{
    Build:{models:{'Astra/Sol/Terra':{rpm:5000,tpm:1000000},Luna:{rpm:5000,tpm:2000000}}},
    Launch:{models:{'Astra/Sol/Terra':{rpm:10000,tpm:4000000},Luna:{rpm:10000,tpm:10000000}}},
    Grow:{models:{'Astra/Sol/Terra':{rpm:15000,tpm:40000000},Luna:{rpm:30000,tpm:180000000}}}
  },
  source:'OpenAI tier update 2026-10-06',
  strategy:{
    routing:'Reserve higher-reasoning models for executive/complex work; route high-volume routine work to faster lower-cost models.',
    scheduler:'Token-bucket queues by model and workload; smooth bursts instead of firing every agent simultaneously.',
    backpressure:'Honor Retry-After/429, exponential backoff with jitter, and pause noncritical work before critical work.',
    budgets:'Enforce per-mission token and dollar budgets independently of rate limits.',
    cache:'Reuse stable system context and deterministic intermediate artifacts; avoid repeated context.',
    observability:'Track RPM, TPM, latency, 429s, spend, tokens per successful outcome and model-level error rate.',
    scaling:'Detect configured tier from runtime limits where available; never assume email tier equals actual organization limits.'
  }
};
export function openAICapacityPlan({tier='Build'}={}){const t=OPENAI_CAPACITY_POLICY.tiers[tier]||OPENAI_CAPACITY_POLICY.tiers.Build;return{tier,limits:t,policy:OPENAI_CAPACITY_POLICY.strategy,allocation:{executiveReasoningPct:10,specialistWorkPct:25,highVolumeWorkerPct:55,reservePct:10},note:'Capacity limits are ceilings, not targets. Actual organization/model limits and spend controls govern.'}}