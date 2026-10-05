import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import crypto from 'node:crypto';
import {CAPABILITY_PACK as OCT05_CAPABILITY_PACK,LOCAL_MODEL_RESOURCES,capabilityMission} from './capability-pack.mjs';
import {caseStudyMasteryManifest,buildRevenuePortfolio,interpretOwnerDirective,OWNER_OPERATING_CONTRACT,MASTERY_PRINCIPLES} from './business-mastery.mjs';

const STATE_PATH=process.env.JARVIS_NUCLEUS_STATE_PATH||'/data/jarvis-nucleus.json';
const MAX_EVENTS=2000,MAX_MISSIONS=500,MAX_OUTCOMES=1000;

export const NUCLEUS_VERSION='2.0.0';
export const NUCLEUS_POLICY=Object.freeze({
  externalFinancialActions:'explicit-human-approval',
  liveTrading:'one-order-human-approval-only',
  security:'defensive-analysis-and-responsible-disclosure',
  acquisition:'owned-or-permissioned-channels-only',
  originality:'clean-room-and-original-output',
  paymentAccounting:'verified-payments-only',
  localModels:'supported-but-never-disable-policy-layer',
  prohibited:['phishing','credential theft','malware deployment','fund theft','market manipulation','spam','fake engagement','counterfeit content','fabricated revenue','guaranteed returns','autonomous real-money trading','safety-boundary removal']
});

export const NUCLEUS_SKILLS=Object.freeze([
  {id:'demand-research',name:'Demand Research',division:'market',agent:'DemandResearchAgent'},
  {id:'buyer-research',name:'Buyer Research',division:'market',agent:'BuyerResearchAgent'},
  {id:'offer-design',name:'Offer Design',division:'market',agent:'OfferDesignAgent'},
  {id:'product-factory',name:'Digital Product Factory',division:'market',agent:'ProductFactoryAgent'},
  {id:'qa',name:'Product QA',division:'core',agent:'CriticAgent'},
  {id:'content',name:'Content Production',division:'media',agent:'ContentAgent'},
  {id:'acquisition',name:'Permissioned Acquisition',division:'market',agent:'GrowthAgent'},
  {id:'payment',name:'Verified Payment Routing',division:'market',agent:'PaymentAgent'},
  {id:'fulfillment',name:'Verified-Payment Fulfillment',division:'market',agent:'FulfillmentAgent'},
  {id:'analytics',name:'Funnel Analytics',division:'core',agent:'AnalyticsAgent'},
  {id:'feedback',name:'Outcome Feedback',division:'core',agent:'LearningAgent'},
  {id:'ugc-opportunities',name:'UGC Opportunity Research',division:'creator',agent:'UGCOpportunityAgent'},
  {id:'brand-brief-match',name:'Brand Brief Matching',division:'creator',agent:'BrandBriefMatcher'},
  {id:'portfolio-proof',name:'Creator Portfolio Proof Builder',division:'creator',agent:'PortfolioProofAgent'},
  {id:'software-factory',name:'Rapid Software Factory',division:'builder',agent:'RapidSoftwareFactory'},
  {id:'software-test',name:'Software Test/Eval',division:'builder',agent:'TestAgent'},
  {id:'software-deploy',name:'Deployment Planning',division:'builder',agent:'DeploymentAgent'},
  {id:'experiment-engine',name:'Bounded Experiment Engine',division:'core',agent:'ExperimentAgent'},
  {id:'channel-factory',name:'Channel Concept Factory',division:'media',agent:'ChannelFactoryAgent'},
  {id:'pattern-research',name:'Successful Pattern Research',division:'media',agent:'PatternResearchAgent'},
  {id:'commerce-scout',name:'Commerce Product Research',division:'commerce',agent:'CommerceScoutAgent'},
  {id:'bundle-design',name:'Bundle Design',division:'commerce',agent:'BundleDesignerAgent'},
  {id:'store-builder',name:'Storefront Planning',division:'commerce',agent:'StoreBuilderAgent'},
  {id:'margin-research',name:'Cost/Margin Research',division:'commerce',agent:'MarginResearchAgent'},
  {id:'business-audit',name:'Business Workflow Gap Audit',division:'services',agent:'BusinessLossAuditAgent'},
  {id:'roi-estimate',name:'Evidence-Based ROI Estimate',division:'services',agent:'ROIModelAgent'},
  {id:'ai-implementation',name:'AI Implementation Planning',division:'services',agent:'AIImplementationAgent'},
  {id:'workflow-gap',name:'Workflow Gap Mapping',division:'services',agent:'WorkflowGapAgent'},
  {id:'web3-research',name:'Web3 Protocol Research',division:'security',agent:'Web3ResearchAgent'},
  {id:'contract-metadata',name:'Contract Metadata Inspection',division:'security',agent:'ContractMetadataAgent'},
  {id:'proxy-verification',name:'Proxy Contract Verification',division:'security',agent:'ProxyVerificationAgent'},
  {id:'solidity-review',name:'Defensive Solidity Static Review',division:'security',agent:'StaticSecurityReviewAgent'},
  {id:'security-report',name:'Responsible Security Report',division:'security',agent:'BugReportAgent'},
  {id:'indicator-research',name:'Indicator Research',division:'crypto',agent:'IndicatorResearchAgent'},
  {id:'strategy-compose',name:'Strategy Composition',division:'crypto',agent:'StrategyComposerAgent'},
  {id:'backtest',name:'Backtesting',division:'crypto',agent:'BacktestAgent'},
  {id:'regime',name:'Market Regime Research',division:'crypto',agent:'RegimeAgent'},
  {id:'risk-review',name:'Trading Risk Review',division:'crypto',agent:'RiskReviewAgent'},
  {id:'ambient-audio',name:'Original Ambient Audio Planning',division:'media',agent:'AmbientAudioAgent'},
  {id:'track-segmentation',name:'Track Segmentation Plan',division:'media',agent:'TrackSegmentAgent'},
  {id:'release-metadata',name:'Release Metadata',division:'media',agent:'MetadataAgent'},
  {id:'rights-check',name:'Media Rights Check',division:'media',agent:'RightsAgent'},
  {id:'release-package',name:'Distribution Package',division:'media',agent:'ReleasePackagingAgent'},
  {id:'faceless-media',name:'Faceless Media System',division:'media',agent:'FacelessMediaAgent'},
  {id:'viral-patterns',name:'Viral Pattern Decomposition',division:'media',agent:'ViralPatternAgent'},
  {id:'originality',name:'Originality Review',division:'core',agent:'OriginalityAgent'},
  {id:'publishing',name:'Authorized Publishing Plan',division:'media',agent:'PublishingSchedulerAgent'},
  {id:'local-model-router',name:'Local/Open Model Router',division:'core',agent:'LocalModelRouterAgent'},
  {id:'model-benchmark',name:'Model Capability Benchmark',division:'core',agent:'ModelBenchmarkAgent'},
  {id:'memory',name:'Persistent Mission Memory',division:'core',agent:'MemoryAgent'},
  {id:'audit-log',name:'Append-Only Audit Trail',division:'core',agent:'AuditAgent'},
  {id:'health',name:'Division Health Monitoring',division:'core',agent:'HealthAgent'},
  {id:'approvals',name:'Consequential Action Approval',division:'core',agent:'ApprovalAgent'},
  {id:'case-study-mastery',name:'Business Case Study Mastery',division:'core',agent:'CaseStudyMasteryAgent'},
  {id:'pain-mining',name:'Pain-First Opportunity Mining',division:'market',agent:'PainMinerAgent'},
  {id:'proof-validation',name:'Proof Before Scale',division:'market',agent:'ValidationAgent'},
  {id:'recurring-revenue',name:'Recurring Revenue Design',division:'market',agent:'RecurringRevenueAgent'},
  {id:'retention',name:'Retention and Churn Reduction',division:'market',agent:'RetentionAgent'},
  {id:'utility-wedge',name:'Free Utility Conversion Wedge',division:'market',agent:'UtilityWedgeAgent'},
  {id:'offer-ladder',name:'Offer Ladder Design',division:'market',agent:'OfferLadderAgent'},
  {id:'audience-leverage',name:'Audience and Distribution Leverage',division:'market',agent:'AudienceLeverageAgent'},
  {id:'customer-feedback',name:'Customer Feedback Learning',division:'core',agent:'CustomerFeedbackAgent'},
  {id:'revenue-evidence',name:'Verified Revenue Evidence',division:'core',agent:'RevenueEvidenceAgent'},
  {id:'creator-opportunity-feed',name:'Creator Opportunity Feed',division:'creator',agent:'UGCOpportunityAgent'},
  {id:'opportunity-fit',name:'Opportunity Fit Scoring',division:'creator',agent:'BrandBriefMatcher'},
  {id:'portfolio-proof',name:'Portfolio Proof Builder',division:'creator',agent:'PortfolioProofAgent'},
  {id:'autonomous-build-queue',name:'Autonomous Software Build Queue',division:'builder',agent:'RapidSoftwareFactory'}
]);

function baseState(){
  return {
    nucleusId:'jarvis-'+crypto.randomUUID(),
    version:NUCLEUS_VERSION,
    createdAt:new Date().toISOString(),
    lastTickAt:null,
    heartbeatCount:0,
    missions:[],
    outcomes:[],
    events:[],
    skillStats:Object.fromEntries(NUCLEUS_SKILLS.map(s=>[s.id,{runs:0,successes:0,failures:0,lastUsedAt:null,score:0.5}])),
    modelRouter:{lastHealthCheckAt:null,providers:{}},ownerGoal:OWNER_OPERATING_CONTRACT.stretchObjective,businessMastery:caseStudyMasteryManifest(),revenuePortfolio:buildRevenuePortfolio({verifiedRevenueUsd:0,completedOrders:0})
  };
}
let state=null,writeChain=Promise.resolve();

async function persist(){
  const snapshot=JSON.stringify(state,null,2),tmp=STATE_PATH+'.tmp';
  writeChain=writeChain.then(async()=>{await mkdir(dirname(STATE_PATH),{recursive:true});await writeFile(tmp,snapshot,'utf8');await rename(tmp,STATE_PATH)});
  await writeChain;
}
function event(type,data={}){
  state.events.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),type,...data});
  if(state.events.length>MAX_EVENTS)state.events.length=MAX_EVENTS;
}
export async function initNucleus(){
  if(state)return state;
  try{state=JSON.parse(await readFile(STATE_PATH,'utf8'))}catch{state=baseState();await persist()}
  if(!state.skillStats)state.skillStats=baseState().skillStats;
  event('nucleus-online',{version:NUCLEUS_VERSION});
  await persist();
  return state;
}
function providerConfig(){
  const providers=[
    {id:'ollama',name:'Ollama',kind:'local-chat',baseUrl:process.env.OLLAMA_BASE_URL||'',model:process.env.OLLAMA_MODEL||'',endpoint:'/api/chat'},
    {id:'lmstudio',name:'LM Studio',kind:'openai-compatible-local',baseUrl:process.env.LMSTUDIO_BASE_URL||'',model:process.env.LMSTUDIO_MODEL||'',endpoint:'/v1/models'},
    {id:'anythingllm',name:'AnythingLLM',kind:'workspace-adapter',baseUrl:process.env.ANYTHINGLLM_BASE_URL||'',model:'',endpoint:'/api'}
  ];
  return providers.map(p=>({...p,configured:Boolean(p.baseUrl),baseUrl:p.baseUrl?new URL(p.baseUrl).origin:''}));
}
export async function modelHealth(){
  await initNucleus();
  const out={};
  for(const p of providerConfig()){
    if(!p.configured){out[p.id]={name:p.name,configured:false,reachable:false};continue}
    try{
      const url=p.id==='ollama'?new URL('/api/tags',p.baseUrl):p.id==='lmstudio'?new URL('/v1/models',p.baseUrl):new URL('/',p.baseUrl);
      const r=await fetch(url,{signal:AbortSignal.timeout(2500),headers:{accept:'application/json'}});
      out[p.id]={name:p.name,configured:true,reachable:r.ok,status:r.status};
    }catch(e){out[p.id]={name:p.name,configured:true,reachable:false,error:String(e?.message||e).slice(0,160)}}
  }
  state.modelRouter={lastHealthCheckAt:new Date().toISOString(),providers:out};
  event('model-health',{providers:Object.fromEntries(Object.entries(out).map(([k,v])=>[k,{configured:v.configured,reachable:v.reachable}]))});
  await persist();return out;
}
function skillIdsForMission(plan){
  const byAgent=new Map(NUCLEUS_SKILLS.map(s=>[s.agent,s.id]));
  const ids=plan.specialists.map(a=>byAgent.get(a)).filter(Boolean);
  for(const core of ['memory','audit-log','qa'])if(!ids.includes(core))ids.push(core);
  if(plan.approvalRequired&&!ids.includes('approvals'))ids.push('approvals');
  return ids;
}
export async function invokeLocalModel({provider='ollama',prompt='',system=''}={}){
  await initNucleus();
  const cfg=providerConfig().find(x=>x.id===provider);
  if(!cfg)throw Error('unknown model provider');
  if(!cfg.configured)throw Error(cfg.name+' is not configured');
  const userPrompt=String(prompt||'').trim().slice(0,20000);
  if(!userPrompt)throw Error('prompt required');
  const policySystem='You are a JARVIS nucleus model worker. Follow the application policy above the model layer. Do not perform phishing, credential theft, malware deployment, exploit execution, fund theft, spam, fake engagement, fabricated financial results, or autonomous real-money trading. Consequential financial actions require explicit human approval. Produce useful research, drafting, planning, coding, analysis, or defensive-security assistance within those boundaries.';
  let model=cfg.model;
  if(provider==='ollama'){
    if(!model){const lr=await fetch(new URL('/api/tags',cfg.baseUrl),{signal:AbortSignal.timeout(5000)}),ld=await lr.json();model=ld?.models?.[0]?.name||''}
    if(!model)throw Error('no Ollama model loaded');
    const r=await fetch(new URL('/api/chat',cfg.baseUrl),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,stream:false,messages:[{role:'system',content:policySystem+' '+String(system||'').slice(0,4000)},{role:'user',content:userPrompt}]}),signal:AbortSignal.timeout(120000)});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d?.error||('Ollama '+r.status));
    event('model-invocation',{provider,model,ok:true});await persist();
    return {provider,model,output:String(d?.message?.content||''),local:true};
  }
  if(provider==='lmstudio'){
    if(!model){const lr=await fetch(new URL('/v1/models',cfg.baseUrl),{signal:AbortSignal.timeout(5000)}),ld=await lr.json();model=ld?.data?.[0]?.id||''}
    if(!model)throw Error('no LM Studio model loaded');
    const r=await fetch(new URL('/v1/chat/completions',cfg.baseUrl),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,messages:[{role:'system',content:policySystem+' '+String(system||'').slice(0,4000)},{role:'user',content:userPrompt}],temperature:0.3}),signal:AbortSignal.timeout(120000)});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d?.error?.message||('LM Studio '+r.status));
    event('model-invocation',{provider,model,ok:true});await persist();
    return {provider,model,output:String(d?.choices?.[0]?.message?.content||''),local:true};
  }
  throw Error('AnythingLLM workspace execution requires an explicitly configured workspace adapter; model routing remains available through Ollama or LM Studio.');
}

export async function planMission({goal='',division='general',context={}}={}){
  await initNucleus();
  const plan=capabilityMission({goal,division});
  const mission={
    id:crypto.randomUUID(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    goal:plan.goal,division:plan.division,status:plan.approvalRequired?'planned-awaiting-consequential-action':'planned',ownerIntent:interpretOwnerDirective(plan.goal),
    approvalRequired:plan.approvalRequired,specialists:plan.specialists,skillIds:skillIdsForMission(plan),stages:plan.stages,
    currentStage:0,context:Object.fromEntries(Object.entries(context||{}).slice(0,20).map(([k,v])=>[String(k).slice(0,80),String(v).slice(0,1000)])),
    evidence:[],artifacts:[],metrics:{},history:[{at:new Date().toISOString(),event:'planned'}]
  };
  state.missions.unshift(mission);if(state.missions.length>MAX_MISSIONS)state.missions.length=MAX_MISSIONS;
  for(const id of mission.skillIds){const s=state.skillStats[id];if(s){s.runs++;s.lastUsedAt=mission.createdAt}}
  event('mission-planned',{missionId:mission.id,division:mission.division,approvalRequired:mission.approvalRequired,skills:mission.skillIds});
  await persist();return mission;
}
export async function updateMission(id,{status,stage,evidence,artifact,metrics}={}){
  await initNucleus();const m=state.missions.find(x=>x.id===id);if(!m)throw Error('mission not found');
  if(status)m.status=String(status).slice(0,80);
  if(Number.isInteger(stage))m.currentStage=Math.max(0,Math.min(m.stages.length-1,stage));
  if(evidence)m.evidence.unshift(String(evidence).slice(0,2000));
  if(artifact)m.artifacts.unshift(String(artifact).slice(0,2000));
  if(metrics&&typeof metrics==='object')m.metrics={...m.metrics,...metrics};
  m.updatedAt=new Date().toISOString();m.history.unshift({at:m.updatedAt,event:'updated',status:m.status,stage:m.currentStage});
  event('mission-updated',{missionId:id,status:m.status,stage:m.currentStage});await persist();return m;
}
export async function recordOutcome({missionId,success,valueUsd=0,notes=''}={}){
  await initNucleus();const m=state.missions.find(x=>x.id===missionId);if(!m)throw Error('mission not found');
  const o={id:crypto.randomUUID(),missionId,at:new Date().toISOString(),success:Boolean(success),valueUsd:Number(valueUsd)||0,notes:String(notes).slice(0,2000)};
  state.outcomes.unshift(o);if(state.outcomes.length>MAX_OUTCOMES)state.outcomes.length=MAX_OUTCOMES;
  for(const id of m.skillIds){const s=state.skillStats[id];if(!s)continue;if(o.success)s.successes++;else s.failures++;const n=s.successes+s.failures;s.score=n?+(s.successes/n).toFixed(4):0.5}
  m.status=o.success?'completed':'completed-with-failure';m.updatedAt=o.at;m.history.unshift({at:o.at,event:'outcome',success:o.success});
  event('outcome-recorded',{missionId,success:o.success,valueUsd:o.valueUsd});await persist();return o;
}
export async function heartbeat({market=null,crypto=null}={}){
  await initNucleus();state.heartbeatCount++;state.lastTickAt=new Date().toISOString();
  event('heartbeat',{market:market?{reachable:Boolean(market.reachable),status:market.status}:null,crypto:crypto?{reachable:Boolean(crypto.reachable),status:crypto.status}:null});
  await persist();return {at:state.lastTickAt,count:state.heartbeatCount};
}
export async function nucleusSnapshot(){
  await initNucleus();
  const ranked=Object.entries(state.skillStats).sort((a,b)=>b[1].score-a[1].score).slice(0,15).map(([id,v])=>({id,...v}));
  return {
    id:state.nucleusId,version:NUCLEUS_VERSION,status:'online',lastTickAt:state.lastTickAt,heartbeatCount:state.heartbeatCount,
    policy:NUCLEUS_POLICY,capabilityPack:OCT05_CAPABILITY_PACK,localModelResources:LOCAL_MODEL_RESOURCES,ownerOperatingContract:OWNER_OPERATING_CONTRACT,businessMastery:caseStudyMasteryManifest(),masteryPrinciples:MASTERY_PRINCIPLES,revenuePortfolio:state.revenuePortfolio,
    skills:{count:NUCLEUS_SKILLS.length,registry:NUCLEUS_SKILLS,topRanked:ranked},
    memory:{missions:state.missions.length,outcomes:state.outcomes.length,events:state.events.length,statePath:'persistent-volume'},
    recentMissions:state.missions.slice(0,20),recentOutcomes:state.outcomes.slice(0,20),recentEvents:state.events.slice(0,50),
    modelRouter:state.modelRouter
  };
}
