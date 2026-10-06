import {getJson,setJson} from './state-store.mjs';

const KEY='ultron-discovery-economy-v6';
const now=()=>new Date().toISOString();
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const clip=(v,a=0,b=100)=>Math.max(a,Math.min(b,num(v)));

const defs=[
['frontierScanner','Frontier Scanner'],['weakSignal','Weak-Signal Detector'],['trendLifecycle','Trend Lifecycle Predictor'],['problemDiscovery','Problem Discovery Engine'],['problemSeverity','Problem Severity Index'],['nonConsumption','Non-Consumption Detector'],['whiteSpace','Market White-Space Engine'],['crossIndustry','Cross-Industry Transfer Engine'],['techConvergence','Technology Convergence Engine'],['contrarian','Contrarian Opportunity Engine'],
['causalReasoning','Causal Reasoning Engine'],['causalGraph','Causal Business Graph'],['intervention','Intervention Simulator'],['reversibility','Decision Reversibility Engine'],['regret','Regret Minimization Engine'],['bayesian','Bayesian Business Brain'],['assumptionRegistry','Assumption Registry'],['assumptionStress','Assumption Stress Tester'],['dependencyGraph','Dependency Graph'],['singlePointFailure','Single-Point-of-Failure Hunter'],
['businessModelGenerator','Business Model Generator'],['businessModelTournament','Business Model Tournament'],['productMutation','Product Mutation Engine'],['opportunityRecombination','Opportunity Recombination Engine'],['capabilityRecombination','Capability Recombination Engine'],['zeroToOne','Zero-to-One Lab'],['prototypeCompiler','Prototype Compiler'],['prototypeGraveyard','Prototype Graveyard'],['innovationPortfolio','Innovation Portfolio'],['innovationYield','Innovation Yield Engine'],
['companyGenerator','Company Generator'],['divisionGenerator','Division Generator'],['teamCompiler','Agent Team Compiler'],['orgTwin','Organizational Digital Twin'],['talentMarket','Internal Talent Market'],['specialization','Agent Specialization Engine'],['apprenticeship','Agent Apprenticeship System'],['promotionLadder','Agent Promotion Ladder'],['agentBankruptcy','Agent Bankruptcy System'],['orgCompression','Organizational Compression Engine']
];

export const V6_SYSTEMS=defs.map(([id,name],i)=>({id,index:i+1,name,status:'ACTIVE'}));

export const EVIDENCE_LADDER=['built','working','used','purchased','fulfilled','customer outcome','profitable','repeatable','scalable','defensible'];
export const AUTHORITY_HIERARCHY=['owner intent','law and safety','customer commitments','financial limits','privacy and security','factual integrity','operational constraints','mission objectives','agent instructions'];
export const IMPROVEMENT_LOOP=['observe performance','identify weakness','propose improvement','build candidate','sandbox','benchmark','adversarial test','shadow production','compare with incumbent','promote or reject','monitor regression'];

export function problemSeverity(x={}){
  const keys=['frequency','financialImpact','urgency','willingnessToSolve','solutionDissatisfaction'];
  const score=keys.reduce((s,k)=>s+clip(x[k]),0)/keys.length;
  return {score:+score.toFixed(1),priority:score>=75?'HIGH':score>=55?'MEDIUM':'LOW'};
}

export function classifyTrend({growth=0,acceleration=0,competition=0,saturation=0}={}){
  if(clip(saturation)>=80||clip(growth)<15)return 'DECLINING';
  if(clip(saturation)>=65||clip(competition)>=80)return 'SATURATED';
  if(clip(growth)>=70&&clip(acceleration)>=60)return 'ACCELERATING';
  if(clip(growth)>=35)return 'EMERGING';
  return 'MAINSTREAM';
}

export function bayesUpdate({prior=.5,likelihoodIfTrue=.7,likelihoodIfFalse=.3}={}){
  const p=Math.max(.001,Math.min(.999,num(prior))),lt=Math.max(.001,Math.min(.999,num(likelihoodIfTrue))),lf=Math.max(.001,Math.min(.999,num(likelihoodIfFalse)));
  const post=(lt*p)/((lt*p)+(lf*(1-p)));
  return {prior:p,posterior:+post.toFixed(4)};
}

export function reversibility({reversible=true,costToUndo=0,timeToUndoHours=0,customersAffected=0}={}){
  const score=100-(reversible?0:45)-Math.min(25,num(costToUndo)/100)-Math.min(15,num(timeToUndoHours)/24)-Math.min(15,num(customersAffected));
  return {score:+clip(score).toFixed(1),evidenceRequirement:score<40?'VERY_HIGH':score<70?'HIGH':'NORMAL'};
}

export function discoveryProposal(x={}){
  return {
    id:x.id||'proposal-'+Date.now(),
    problem:x.problem||'',
    evidence:x.evidence||[],
    hypothesis:x.hypothesis||'',
    opportunity:x.opportunity||'',
    proposedExperiment:x.proposedExperiment||'',
    requiredResources:x.requiredResources||{},
    expectedInformationGain:clip(x.expectedInformationGain),
    expectedEconomicValue:num(x.expectedEconomicValue),
    researchBudget:Math.max(0,num(x.researchBudget)),
    status:'PROPOSED',
    createdAt:now()
  };
}

export function authorityCertificate(x={}){
  return {
    requester:x.requester||'unknown',
    mission:x.mission||null,
    budget:Math.max(0,num(x.budget)),
    permissions:x.permissions||[],
    blastRadius:x.blastRadius||{},
    reversible:Boolean(x.reversible),
    approvalsRequired:x.approvalsRequired||[],
    hierarchy:AUTHORITY_HIERARCHY,
    issuedAt:now()
  };
}

export function goalGenome(x={}){
  return {
    goal:x.goal||'',
    why:x.why||'',
    constraints:x.constraints||[],
    assumptions:x.assumptions||[],
    dependencies:x.dependencies||[],
    metrics:x.metrics||[],
    subgoals:x.subgoals||[],
    experiments:x.experiments||[],
    decisions:x.decisions||[],
    resources:x.resources||{},
    outcomes:x.outcomes||[],
    lessons:x.lessons||[],
    createdAt:x.createdAt||now(),
    updatedAt:now()
  };
}

export function antiDelusionCheck(x={}){
  const flags=[];
  if(x.activity&&!x.outcome)flags.push('ACTIVITY_WITHOUT_OUTCOME');
  if(x.forecastPresentedAsFact)flags.push('FORECAST_PRESENTED_AS_FACT');
  if(x.unsupportedConfidence)flags.push('UNSUPPORTED_CONFIDENCE');
  if(x.vanityMetric)flags.push('VANITY_METRIC');
  if(x.duplicateSystem)flags.push('DUPLICATED_SYSTEM');
  if(x.staleAssumption)flags.push('STALE_ASSUMPTION');
  return {flags,pass:flags.length===0,evidenceStage:x.evidenceStage||'built',ladder:EVIDENCE_LADDER};
}

export async function v6State(){
  return getJson(KEY,{
    version:6,createdAt:now(),systems:V6_SYSTEMS,
    discoveryEconomy:{proposals:[],allocations:[],reputation:{}},
    digitalEconomyTwin:{customers:[],ultron:[],competitors:[],platforms:[],suppliers:[],partners:[],capital:[],technology:[],regulation:[],predictions:[],outcomes:[]},
    recursiveImprovement:{candidates:[],benchmarks:[],shadowRuns:[],promotions:[],regressions:[]},
    constitution:{hierarchy:AUTHORITY_HIERARCHY,certificates:[]},
    timeMachine:{snapshots:[]},
    goalGenomes:[],
    antiDelusion:{checks:[],flags:[]},
    assumptions:[],dependencies:{nodes:[],edges:[]},causalGraph:{nodes:[],edges:[]},
    prototypes:{active:[],graveyard:[]},innovationPortfolio:[],temporaryDivisions:[],agentPerformance:{},
    updatedAt:now()
  });
}
export async function saveV6State(s){s.updatedAt=now();return setJson(KEY,s)}

export function v6Manifest(){
  return {
    version:'6.0.0',status:'ACTIVE',systems:V6_SYSTEMS,
    discoveryEconomy:{flow:['problem','evidence','hypothesis','opportunity','proposed experiment','required resources','expected information gain','expected economic value'],allocationRule:'Bounded virtual research budgets rise only when prior discoveries survive real-world testing.'},
    digitalEconomyTwin:{entities:['customers','ULTRON','competitors','platforms','suppliers','partners','capital','technology','regulation'],rule:'Simulation is never treated as reality; predictions are scored against observed outcomes.'},
    recursiveImprovement:{loop:IMPROVEMENT_LOOP,rule:'Self-proposed changes cannot promote themselves directly to production.'},
    constitution:{hierarchy:AUTHORITY_HIERARCHY},
    timeMachine:'Historical snapshots preserve what ULTRON knew, believed, predicted, decided and later observed.',
    goalGenome:['goal','why','constraints','assumptions','dependencies','metrics','subgoals','experiments','decisions','resources','outcomes','lessons'],
    antiDelusion:{checks:['fake progress','circular reasoning','unsupported confidence','vanity metrics','duplicated systems','stale assumptions','forecast-as-fact','activity-without-outcome'],evidenceLadder:EVIDENCE_LADDER},
    architecture:['OWNER','GOAL GENOME','MISSION COMPILER','NUCLEUS','CONSTITUTION','DISCOVERY ECONOMY','SOVEREIGN INTELLIGENCE','ECONOMIC AUTOPILOT','DIGITAL ECONOMY TWIN','DYNAMIC ORGANIZATION','EXECUTION','CUSTOMERS AND REALITY','EVIDENCE GRAPH','CIVILIZATION MEMORY','CAUSAL LEARNING','RECURSIVE IMPROVEMENT LAB','STRATEGY EVOLUTION','REPEAT'],
    northStar:'Increase verified customer value and durable contribution profit per unit of capital, time, compute and risk.'
  };
}
