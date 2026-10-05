import crypto from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
import {agentSecurityProfile,securityManifest,classifyAction,auditChainEntry} from './agent-security.mjs';

const KEY='agent-of-agents-v2';
const MAX_HISTORY=1000,MAX_APPROVALS=250,MAX_MISSIONS=200;

export const AGENT_OF_AGENTS_VERSION='2.0.0';

export const CEO_POLICY=Object.freeze({
  name:'ULTRON Commerce CEO',
  role:'orchestrator-agent',
  objective:'Turn validated buyer demand into original products, storefronts, approved marketing, customer support and measurable profit with minimal manual work.',
  editorInChief:'human-owner',
  operatingMode:'autonomous-reversible-work + approval-gated-consequential-actions',
  priorities:[
    'print-on-demand and digital products before inventory-heavy physical goods',
    'validated demand before product proliferation',
    'gross-margin and support-load awareness',
    'owned/permissioned distribution before paid media',
    'human approval before ad spend, public campaign launch, refunds, banking or other consequential actions'
  ]
});

export const COMMERCE_AGENTS=Object.freeze({
  ProductScoutAgent:{
    purpose:'Continuously rank public/authorized demand signals and propose high-margin digital or print-on-demand products.',
    capabilities:['public-trend-research','market-gap-analysis','margin-modeling','pod-concept-generation','printable-pattern-briefs','candidate-ranking'],
    defaultMode:'research-and-propose',
    approvalRequiredFor:[]
  },
  StoreBuilderAgent:{
    purpose:'Turn approved product candidates into storefront-ready listings and landing-page plans.',
    capabilities:['shopify-product-plan','landing-page-spec','seo-description','collection-plan','image-brief','pricing-plan','digital-product-plan'],
    defaultMode:'draft-and-stage',
    approvalRequiredFor:['public-publish','store-settings-change']
  },
  MediaBuyerAgent:{
    purpose:'Create campaign concepts, scripts, creatives and measurement plans; optimize only within explicitly approved budget envelopes.',
    capabilities:['creative-brief','video-script','audience-hypothesis','campaign-plan','roas-analysis','budget-proposal','experiment-design'],
    defaultMode:'proposal-only',
    approvalRequiredFor:['campaign-launch','budget-change','paid-spend']
  },
  CustomerSupportAgent:{
    purpose:'Answer product/policy questions, prepare tracking responses and draft refund resolutions from store policy.',
    capabilities:['faq-answer','policy-retrieval','tracking-response','refund-eligibility-review','support-triage','escalation'],
    defaultMode:'answer-and-draft',
    approvalRequiredFor:['refund-execution','account-change']
  }
});

export const POD_STRATEGY=Object.freeze({
  preferredLaunchOrder:['digital-download','printable-template','print-on-demand-art','print-on-demand-apparel','print-on-demand-homeware','supplier-fulfilled-physical-product'],
  gates:[
    'original or legitimately licensed design',
    'observable buyer demand',
    'positive expected gross margin after production, platform, refund and support assumptions',
    'no counterfeit branding, protected logos or copied artwork',
    'sample/proof review before scaling paid promotion'
  ],
  reason:'Minimize inventory exposure, shipping complexity and customer-service load while learning demand.'
});

function seed(){
  return {
    version:AGENT_OF_AGENTS_VERSION,enabled:true,createdAt:new Date().toISOString(),updatedAt:null,cycles:0,
    missions:[],activeTeam:null,approvals:[],history:[],metrics:{missionsCreated:0,agentsSpawned:0,approvalRequests:0,approved:0,rejected:0},
    connectors:{
      shopify:{mode:'connector-or-runtime-token',storeDomain:process.env.SHOPIFY_STORE_DOMAIN||null,status:process.env.SHOPIFY_ADMIN_TOKEN?'runtime-token-configured':'connector-bridge-required'},
      flowise:{mode:'optional-webhook',urlConfigured:Boolean(process.env.FLOWISE_WEBHOOK_URL)},
      langflow:{mode:'optional-webhook',urlConfigured:Boolean(process.env.LANGFLOW_WEBHOOK_URL)},
      slack:{mode:'optional-webhook',urlConfigured:Boolean(process.env.SLACK_APPROVAL_WEBHOOK_URL)},
      discord:{mode:'optional-webhook',urlConfigured:Boolean(process.env.DISCORD_APPROVAL_WEBHOOK_URL)}
    },
    auditHash:''
  };
}

const clean=(v,max=1200)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
const uid=p=>p+'-'+crypto.randomUUID();

function goalNeeds(goal=''){
  const g=goal.toLowerCase();
  const needs=['ProductScoutAgent'];
  if(/store|shopify|listing|landing|product|sell|commerce|pod|print/.test(g))needs.push('StoreBuilderAgent');
  if(/ad|campaign|meta|tiktok|creative|marketing|roas|traffic/.test(g))needs.push('MediaBuyerAgent');
  if(/support|customer|refund|tracking|faq|order/.test(g))needs.push('CustomerSupportAgent');
  return [...new Set(needs)];
}

export function spawnCommerceTeam({goal='',context={}}={}){
  const selected=goalNeeds(clean(goal,2000));
  return {
    id:uid('commerce-team'),createdAt:new Date().toISOString(),goal:clean(goal,2000),
    agents:selected.map(name=>({
      id:uid(name.replace(/Agent$/,'')),name,status:'active',
      ...COMMERCE_AGENTS[name],
      security:agentSecurityProfile(name)
    })),
    sharedContext:{
      strategy:'POD_AND_DIGITAL_FIRST',
      editorInChief:'human-owner',
      context:Object.fromEntries(Object.entries(context||{}).slice(0,25).map(([k,v])=>[clean(k,80),clean(v,800)]))
    }
  };
}

function task(stage,owner,action,approvalRequired=false){
  return {id:uid('task'),stage,owner,action,status:approvalRequired?'awaiting-approval':'ready',approvalRequired,createdAt:new Date().toISOString()};
}

export function buildCommerceMission({goal='Launch a validated low-inventory ecommerce offer',context={}}={}){
  const team=spawnCommerceTeam({goal,context});
  const tasks=[
    task('DISCOVER','ProductScoutAgent','Gather public/authorized trend signals, buyer pain, alternatives and price anchors.'),
    task('SCORE','ProductScoutAgent','Score candidates for demand evidence, originality, gross margin, refund/support burden and repeatability.'),
    task('POD_GATE','ProductScoutAgent','Prefer digital/POD candidates unless evidence justifies physical inventory complexity.'),
    task('OFFER','StoreBuilderAgent','Create positioning, price, bundle/upsell and customer promise for the top validated candidate.'),
    task('CREATIVE_SPEC','StoreBuilderAgent','Create original image/video briefs and SEO-ready product copy.'),
    task('STORE_STAGE','StoreBuilderAgent','Stage Shopify-ready product, collection and landing-page actions without public publishing.'),
    task('PUBLISH_APPROVAL','StoreBuilderAgent','Request Editor-in-Chief approval before public publishing or store-setting changes.',true),
    task('MEDIA_PLAN','MediaBuyerAgent','Create 3-5 creative concepts, scripts, audience hypotheses and measurement plan.'),
    task('AD_APPROVAL','MediaBuyerAgent','Request Editor-in-Chief approval before paid campaign launch or budget changes.',true),
    task('SUPPORT_PACK','CustomerSupportAgent','Build FAQ, tracking-response templates, policy answers and escalation rules.'),
    task('REFUND_POLICY','CustomerSupportAgent','Prepare refund eligibility logic; refund execution remains approval-gated.',true),
    task('MEASURE','MediaBuyerAgent','Measure traffic, conversion, CAC/ROAS when available, refunds and support burden.'),
    task('LEARN','ProductScoutAgent','Feed verified outcomes back into candidate ranking and next-cycle decisions.')
  ];
  return {id:uid('commerce-mission'),createdAt:new Date().toISOString(),goal:team.goal,status:'planned',team,tasks,policy:CEO_POLICY,pod:POD_STRATEGY};
}

export function visualAgentGraph(){
  const nodes=[
    {id:'editor',label:'Editor-in-Chief',type:'human-approval'},
    {id:'ceo',label:'Orchestrator CEO',type:'orchestrator'},
    ...Object.entries(COMMERCE_AGENTS).map(([id,a])=>({id,label:id.replace(/Agent$/,''),type:'agent',purpose:a.purpose})),
    {id:'shopify',label:'Shopify / Store API',type:'connector'},
    {id:'ads',label:'Meta/TikTok/Windsor',type:'connector'},
    {id:'support',label:'Email/Helpdesk',type:'connector'},
    {id:'analytics',label:'Outcome Analytics',type:'data'}
  ];
  const edges=[
    ['editor','ceo','goal + approvals'],['ceo','ProductScoutAgent','spawn / rank'],['ProductScoutAgent','StoreBuilderAgent','validated candidate'],
    ['StoreBuilderAgent','shopify','stage listing'],['StoreBuilderAgent','editor','publish approval'],
    ['ceo','MediaBuyerAgent','creative + growth task'],['MediaBuyerAgent','editor','spend approval'],['MediaBuyerAgent','ads','approved campaign only'],
    ['ceo','CustomerSupportAgent','policy + support task'],['CustomerSupportAgent','support','responses'],['CustomerSupportAgent','editor','refund approval'],
    ['shopify','analytics','orders / conversion'],['ads','analytics','spend / ROAS'],['support','analytics','refund/support burden'],['analytics','ceo','feedback']
  ].map(([from,to,label])=>({from,to,label}));
  return {
    format:'portable-agent-graph-v1',
    note:'Portable topology intended to map into visual builders such as Flowise or Langflow; not an export of either vendor-specific schema.',
    nodes,edges
  };
}

function approvalFor(taskItem,missionId){
  return {
    id:uid('approval'),missionId,taskId:taskItem.id,owner:taskItem.owner,action:taskItem.action,
    status:'pending',createdAt:new Date().toISOString(),decidedAt:null,decision:null,
    security:agentSecurityProfile(taskItem.owner)
  };
}

function audit(state,event,data){
  const e=auditChainEntry({previousHash:state.auditHash||'',agent:'ULTRON-Commerce-CEO',event,data});
  state.auditHash=e.hash;state.history.unshift(e);state.history=state.history.slice(0,MAX_HISTORY);return e;
}

async function safePost(url,payload){
  if(!url)return {configured:false,sent:false};
  try{
    const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(5000)});
    return {configured:true,sent:r.ok,status:r.status};
  }catch(e){return {configured:true,sent:false,error:String(e?.message||e).slice(0,180)}}
}
async function notifyApprovals(approvals=[]){
  const pending=(approvals||[]).filter(x=>x.status==='pending').slice(0,10);
  if(!pending.length)return {pending:0,slack:{configured:false,sent:false},discord:{configured:false,sent:false}};
  const text='ULTRON Editor-in-Chief approval required:\n'+pending.map(a=>'- '+a.owner+': '+a.action+' ['+a.id+']').join('\n');
  const [slack,discord]=await Promise.all([
    safePost(process.env.SLACK_APPROVAL_WEBHOOK_URL,{text}),
    safePost(process.env.DISCORD_APPROVAL_WEBHOOK_URL,{content:text})
  ]);
  return {pending:pending.length,slack,discord};
}
async function mirrorToVisualBuilders(mission){
  const payload={source:'ULTRON-Agent-of-Agents',version:AGENT_OF_AGENTS_VERSION,mission,graph:visualAgentGraph()};
  const [flowise,langflow]=await Promise.all([
    safePost(process.env.FLOWISE_WEBHOOK_URL,payload),
    safePost(process.env.LANGFLOW_WEBHOOK_URL,payload)
  ]);
  return {flowise,langflow};
}

export async function createCommerceMission(input={}){
  const mission=buildCommerceMission(input);
  const state=await mutateJson(KEY,seed(),async state=>{
    state.enabled=true;state.updatedAt=new Date().toISOString();
    state.missions.unshift(mission);state.missions=state.missions.slice(0,MAX_MISSIONS);
    state.activeTeam=mission.team;
    state.metrics.missionsCreated++;state.metrics.agentsSpawned+=mission.team.agents.length;
    for(const t of mission.tasks.filter(x=>x.approvalRequired)){
      const a=approvalFor(t,mission.id);state.approvals.unshift(a);state.metrics.approvalRequests++;
    }
    state.approvals=state.approvals.slice(0,MAX_APPROVALS);
    audit(state,'mission-created',{missionId:mission.id,goal:mission.goal,agents:mission.team.agents.map(x=>x.name)});
  });
  state.lastNotification=await notifyApprovals(state.approvals);
  state.visualBuilderMirror=await mirrorToVisualBuilders(mission);
  return state;
}

export async function decideApproval({approvalId,decision,note=''}={}){
  const d=String(decision||'').toLowerCase();
  if(!['approve','reject'].includes(d))throw Error('decision must be approve or reject');
  const state=await mutateJson(KEY,seed(),async state=>{
    const a=state.approvals.find(x=>x.id===approvalId);if(!a)throw Error('approval not found');
    if(a.status!=='pending')throw Error('approval already decided');
    a.status=d==='approve'?'approved':'rejected';a.decision=d;a.note=clean(note,500);a.decidedAt=new Date().toISOString();
    state.metrics[d==='approve'?'approved':'rejected']++;
    audit(state,'approval-decided',{approvalId:a.id,missionId:a.missionId,decision:d});
  });
  state.lastNotification=await notifyApprovals(state.approvals);
  return state;
}

export async function runAgentOfAgentsCycle({goal='Operate the commerce network',context={}}={}){
  return mutateJson(KEY,seed(),async state=>{
    state.cycles++;state.updatedAt=new Date().toISOString();
    if(!state.missions.length){
      const m=buildCommerceMission({goal,context});state.missions.unshift(m);state.activeTeam=m.team;state.metrics.missionsCreated++;state.metrics.agentsSpawned+=m.team.agents.length;
      for(const t of m.tasks.filter(x=>x.approvalRequired)){state.approvals.unshift(approvalFor(t,m.id));state.metrics.approvalRequests++}
    }
    const mission=state.missions[0];
    const approvalsByTask=new Map(state.approvals.filter(a=>a.missionId===mission.id).map(a=>[a.taskId,a]));
    for(const t of mission.tasks){
      if(t.approvalRequired){
        const a=approvalsByTask.get(t.id);
        t.status=a?.status==='approved'?'approved-ready':a?.status==='rejected'?'rejected':'awaiting-approval';
      }else if(t.status==='ready')t.status='planned-execution';
    }
    mission.status=mission.tasks.some(t=>t.status==='awaiting-approval')?'active-with-approval-gates':'active';
    audit(state,'ceo-cycle',{cycle:state.cycles,missionId:mission.id,status:mission.status});
    state.approvals=state.approvals.slice(0,MAX_APPROVALS);
  });
}

export async function agentOfAgentsState(){return getJson(KEY,seed())}

export function agentOfAgentsManifest(){
  return {
    version:AGENT_OF_AGENTS_VERSION,
    architecture:'JARVIS -> Agent-of-Agents CEO -> dynamically spawned commerce specialists -> approval/connectors -> analytics feedback',
    ceo:CEO_POLICY,
    agents:COMMERCE_AGENTS,
    podStrategy:POD_STRATEGY,
    graph:visualAgentGraph(),
    security:securityManifest(),
    guarantees:{
      autonomousReversibleWork:true,
      autonomousAdSpend:false,
      autonomousRefunds:false,
      autonomousPublicPublishing:false
    }
  };
}
