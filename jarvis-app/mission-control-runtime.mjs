import crypto from 'node:crypto';
import {agentSecurityProfile,securityManifest} from './agent-security.mjs';

export const AGENT_STORE_VERSION='1.0.0';

export const AGENT_TEMPLATES=Object.freeze({
  OperationsManager:{
    role:'manager',purpose:'Decompose owner goals, assign specialists, watch blockers and consolidate results.',
    modelTier:'standard',heartbeatMinutes:15,triggerMode:'mission-and-event',
    allowedCapabilities:['plan','delegate','inspect-status','request-approval','summarize-output'],
    approvalGates:['external-write','financial-action']
  },
  ResearchScout:{
    role:'research',purpose:'Find evidence, pain points, competitor patterns and opportunities using approved public sources.',
    modelTier:'economy',heartbeatMinutes:60,triggerMode:'mission',
    allowedCapabilities:['web-research','source-grounding','opportunity-ranking'],approvalGates:[]
  },
  ProductCreator:{
    role:'builder',purpose:'Create original digital products, POD briefs, guides, templates and validated offer assets.',
    modelTier:'standard',heartbeatMinutes:60,triggerMode:'task',
    allowedCapabilities:['product-design','original-content','image-brief','pricing-plan','qa-handoff'],
    approvalGates:['public-publish']
  },
  SoftwareBuilder:{
    role:'builder',purpose:'Design, code, test and stage software from a bounded requirements brief.',
    modelTier:'deep',heartbeatMinutes:30,triggerMode:'task',
    allowedCapabilities:['requirements','code','tests','debug','deployment-plan'],approvalGates:['production-deploy']
  },
  GrowthContent:{
    role:'media',purpose:'Create original content, campaigns and experiments from real product evidence.',
    modelTier:'standard',heartbeatMinutes:60,triggerMode:'task',
    allowedCapabilities:['copy','creative-brief','content-calendar','experiment-design','analytics'],
    approvalGates:['public-publish','paid-spend']
  },
  WorkflowEngineer:{
    role:'automation',purpose:'Compile goals into typed workflows using connectors, agents, guardrails, conditions and approvals.',
    modelTier:'standard',heartbeatMinutes:30,triggerMode:'mission',
    allowedCapabilities:['workflow-compile','workflow-validate','dry-run','connector-plan'],approvalGates:['consequential-execution']
  },
  FulfillmentOperator:{
    role:'operations',purpose:'Route verified paid orders to the correct digital, service, POD or merchant fulfillment path.',
    modelTier:'economy',heartbeatMinutes:15,triggerMode:'verified-order',
    allowedCapabilities:['order-read','fulfillment-route','delivery-status'],approvalGates:['refund','supplier-purchase']
  },
  SupportSpecialist:{
    role:'support',purpose:'Answer policy/product questions, triage tracking issues and prepare support resolutions.',
    modelTier:'economy',heartbeatMinutes:30,triggerMode:'support-event',
    allowedCapabilities:['faq','policy-retrieval','tracking-response','triage'],approvalGates:['refund','account-change']
  },
  FinanceAnalyst:{
    role:'analysis',purpose:'Analyze business metrics, unit economics, budgets and market data without autonomous financial execution.',
    modelTier:'standard',heartbeatMinutes:60,triggerMode:'mission',
    allowedCapabilities:['unit-economics','budget-analysis','scenario-modeling','market-research'],
    approvalGates:['all-financial-execution'],advisoryOnly:true
  }
});

const clean=(v,max=1600)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
const uid=p=>p+'-'+crypto.randomUUID();

export function configureAgent(templateName,{name='',modelTier,budgetUsd=0,heartbeatMinutes,customInstructions='',allowedTools=[]}={}){
  const t=AGENT_TEMPLATES[templateName];if(!t)throw Error('unknown agent template');
  const tier=['economy','standard','deep'].includes(modelTier)?modelTier:t.modelTier;
  return {
    id:uid('agent'),template:templateName,name:clean(name||templateName,120),...t,
    modelTier:tier,budgetUsd:Math.max(0,Number(budgetUsd)||0),
    heartbeatMinutes:Math.max(5,Math.min(1440,Number(heartbeatMinutes)||t.heartbeatMinutes)),
    customInstructions:clean(customInstructions,4000),
    requestedTools:(allowedTools||[]).slice(0,30).map(x=>clean(x,100)),
    security:agentSecurityProfile(templateName),
    status:'configured'
  };
}

export function buildAgentTeam({goal='',budgetUsd=0,customInstructions=''}={}){
  const g=clean(goal,4000),l=g.toLowerCase();
  const selected=['OperationsManager'];
  const add=x=>{if(!selected.includes(x))selected.push(x)};
  if(/research|find|market|trend|pain|competitor|opportunit/.test(l))add('ResearchScout');
  if(/product|guide|pdf|template|pod|print|offer|course|digital/.test(l))add('ProductCreator');
  if(/app|software|code|website|build|deploy|api/.test(l))add('SoftwareBuilder');
  if(/marketing|content|social|tiktok|youtube|campaign|traffic|promot/.test(l))add('GrowthContent');
  if(/workflow|automation|mcp|n8n|connector|integration|email|discord|slack/.test(l))add('WorkflowEngineer');
  if(/fulfill|order|delivery|pod|customer/.test(l))add('FulfillmentOperator');
  if(/support|refund|tracking|faq/.test(l))add('SupportSpecialist');
  if(/finance|budget|revenue|margin|profit|stock|crypto|bet|trading/.test(l))add('FinanceAnalyst');
  if(selected.length===1){add('ResearchScout');add('WorkflowEngineer')}
  const each=budgetUsd>0?Number((budgetUsd/selected.length).toFixed(2)):0;
  return {
    id:uid('agent-team'),goal:g,createdAt:new Date().toISOString(),
    manager:'OperationsManager',
    agents:selected.map(t=>configureAgent(t,{budgetUsd:each,customInstructions})),
    operatingContract:{
      delegation:'manager assigns bounded tasks to specialists and consolidates outputs',
      modelRouting:'economy for cheap repetitive work, standard for normal reasoning, deep for complex build/review work',
      eventing:'agents may wake on mission, schedule, or approved system events; no busy-loop polling',
      costControl:'per-agent budgets and model tiers; expensive reasoning only when useful',
      approvals:'publishing, spending, refunds, financial execution and other consequential writes remain owner-gated'
    }
  };
}

export function missionControlPanels(){
  return [
    {id:'focus',name:'Current Focus',shows:['active mission','next action','owner objective']},
    {id:'tasks',name:'Task Board',shows:['queued','in progress','blocked','done','assigned agent']},
    {id:'decisions',name:'Decision Queue',shows:['approval requests','tradeoffs','owner choices']},
    {id:'timeline',name:'Timeline',shows:['agent actions','tool calls','outputs','errors']},
    {id:'blockers',name:'Blockers',shows:['missing credential','provider restriction','failed dependency','policy gate']},
    {id:'budget',name:'Budget',shows:['model spend ceiling','paid-media budget','remaining allowance']},
    {id:'economics',name:'Unit Economics',shows:['price','estimated variable cost','gross margin','refund/support burden']},
    {id:'outputs',name:'Outputs',shows:['files','links','product assets','reports','deployment receipts']},
    {id:'health',name:'System Health',shows:['services','heartbeats','queues','recent failures']},
    {id:'agents',name:'Agent Village',shows:['role','status','model tier','heartbeat','budget','current task']}
  ];
}

export function bootstrapInstructions({team,environment='JARVIS'}={}){
  const t=team||buildAgentTeam({goal:'Operate a lean AI business ecosystem'});
  return {
    environment,
    principle:'Keep it lean: instantiate specialists only when a mission needs them; avoid idle model calls.',
    steps:[
      'Create or select the persistent JARVIS workspace.',
      'Install the team definitions and scoped capability allowlists.',
      'Verify every connector separately; do not assume ChatGPT OAuth transfers into JARVIS.',
      'Set model tier, budget and heartbeat for each agent.',
      'Run dry tests before enabling production writes.',
      'Show every file/config changed and record an audit receipt.',
      'Hand off one test mission and verify its outputs.',
      'Document how to trigger, edit, pause, disable or remove each agent safely.'
    ],
    team:t
  };
}

export function missionControlManifest(){
  return {
    version:AGENT_STORE_VERSION,
    name:'JARVIS Agent Store + Mission Control',
    architecture:'owner -> operations manager -> dynamically selected specialists -> workflow/tool layer -> approval gates -> outputs -> feedback',
    templateCount:Object.keys(AGENT_TEMPLATES).length,
    templates:AGENT_TEMPLATES,
    panels:missionControlPanels(),
    bootstrap:bootstrapInstructions(),
    security:securityManifest(),
    sourcePattern:'uploaded AI ecosystem / agent-store TikTok, implemented clean-room with explicit budgets, model tiers, heartbeats, outputs and approval gates',
    financialBoundary:'Finance Analyst is advisory-only; real-money trading, betting, transfers and other financial execution remain approval-gated.'
  };
}
