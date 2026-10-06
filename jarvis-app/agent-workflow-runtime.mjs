import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import crypto from 'node:crypto';

const PATH=process.env.JARVIS_WORKFLOW_STATE_PATH||'/data/jarvis-workflows.json';
const MAX_WORKFLOWS=200,MAX_RUNS=1000;
let state=null,writeChain=Promise.resolve();

export const WORKFLOW_VERSION='1.0.0';
export const WORKFLOW_NODE_TYPES=Object.freeze([
  'trigger','connector','agent','mcp','guardrail','condition','loop','memory','transform','approval','subagent','output'
]);

const CONSEQUENTIAL=/send|post|publish|spend|buy|purchase|refund|delete|deploy|connect account|trade|bet|withdraw|transfer|charge/i;
const clean=(v,max=4000)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
const uid=p=>p+'-'+crypto.randomUUID();

function seed(){return {version:WORKFLOW_VERSION,createdAt:new Date().toISOString(),updatedAt:null,workflows:[],runs:[]}}
async function persist(){
  const tmp=PATH+'.tmp',snap=JSON.stringify(state,null,2);
  writeChain=writeChain.then(async()=>{await mkdir(dirname(PATH),{recursive:true});await writeFile(tmp,snap,'utf8');await rename(tmp,PATH)});
  await writeChain;
}
export async function initWorkflowRuntime(){
  if(state)return state;
  try{state=JSON.parse(await readFile(PATH,'utf8'))}catch{state=seed();await persist()}
  if(!Array.isArray(state.workflows))state.workflows=[];
  if(!Array.isArray(state.runs))state.runs=[];
  return state;
}

function node(id,type,label,config={}){return {id,type,label,config}}
function edge(from,to,label='next'){return {from,to,label}}

export function referenceEmailDigestWorkflow(){
  return {
    id:'reference-email-digest',
    name:'Unread Email Digest to Discord',
    description:'Fetch unread mail, summarize deterministically with an agent, run guardrails, request approval, then post the digest.',
    createdAt:new Date().toISOString(),
    nodes:[
      node('start','trigger','Unread-email trigger',{mode:'schedule-or-manual'}),
      node('mail','connector','Get unread emails',{connector:'gmail',action:'read_unread',write:false}),
      node('memory','memory','Thread context',{scope:'workflow-session'}),
      node('summarize','agent','Summarize and prioritize',{instruction:'Summarize each unread email, identify sender/topic, urgency and requested action. Do not invent facts.'}),
      node('guard','guardrail','PII and prompt-injection guard',{checks:['prompt-injection','secret-exfiltration','unsafe-instruction','PII-minimization']}),
      node('hasmail','condition','Any unread mail?',{expression:'items.length > 0'}),
      node('approve','approval','Approve external Discord post',{reason:'external message send'}),
      node('discord','output','Post digest to Discord',{connector:'discord',action:'send_message',consequential:true}),
      node('empty','output','No-mail result',{action:'internal_result',consequential:false})
    ],
    edges:[
      edge('start','mail'),edge('mail','memory'),edge('memory','summarize'),edge('summarize','guard'),edge('guard','hasmail'),
      edge('hasmail','approve','yes'),edge('approve','discord','approved'),edge('hasmail','empty','no')
    ],
    status:'template',
    sourcePattern:'uploaded TikTok: unread email -> summarize -> Discord, generalized with guardrail and approval'
  };
}

export function compileWorkflow({goal='',name=''}={}){
  const g=clean(goal,6000),lower=g.toLowerCase();
  if(!g)throw Error('goal required');
  const nodes=[node('start','trigger','Start',{mode:/schedule|daily|hourly|every /.test(lower)?'schedule':'manual-or-event'})];
  const edges=[];
  let prev='start';
  const push=(n,label='next')=>{nodes.push(n);edges.push(edge(prev,n.id,label));prev=n.id};

  if(/email|gmail|inbox|unread/.test(lower))push(node('connector-email','connector','Email connector',{connector:'gmail',action:/send email/.test(lower)?'read_context':'read',write:false}));
  if(/calendar|meeting|event/.test(lower))push(node('connector-calendar','connector','Calendar connector',{connector:'calendar',action:'read',write:false}));
  if(/web|internet|research|search/.test(lower))push(node('connector-web','connector','Web research',{connector:'web',action:'search',write:false}));
  if(/mcp|tool|app|integration|connector/.test(lower))push(node('mcp-discover','mcp','Discover scoped tools',{mode:'just-in-time',write:false}));
  if(/memory|context|thread|history/.test(lower))push(node('memory','memory','Workflow memory',{scope:'workflow'}));

  push(node('agent-main','agent','Reason / transform',{instruction:g}));

  if(/if|else|condition|only when|when /.test(lower))push(node('condition','condition','Evaluate condition',{expression:'derived from owner goal'}));
  if(/guard|safe|pii|secret|prompt injection|validate/.test(lower)||/email|message|post|publish/.test(lower))push(node('guard','guardrail','Guardrails',{checks:['prompt-injection','secret-exfiltration','policy','schema-validation']}));
  if(/loop|while|repeat|until|retry/.test(lower))push(node('loop','loop','Bounded loop',{maxIterations:10,breakCondition:'goal satisfied or error'}));

  const consequential=CONSEQUENTIAL.test(g);
  if(consequential)push(node('approval','approval','Owner approval',{reason:'consequential external action'}));

  const action=/discord/.test(lower)?'discord':
    /slack/.test(lower)?'slack':
    /youtube/.test(lower)?'youtube':
    /tiktok/.test(lower)?'tiktok':
    /shopify/.test(lower)?'shopify':
    /email|gmail/.test(lower)&&/send/.test(lower)?'email':
    'internal';
  push(node('output','output',action==='internal'?'Return result':'Execute '+action+' output',{channel:action,consequential}));

  return {
    id:uid('workflow'),name:clean(name||g.slice(0,80),120),goal:g,createdAt:new Date().toISOString(),
    nodes,edges,status:'compiled',requiresApproval:consequential,
    sourcePattern:'JARVIS declarative workflow compiler'
  };
}

export function validateWorkflow(graph={}){
  const errors=[],warnings=[];
  const nodes=Array.isArray(graph.nodes)?graph.nodes:[],edges=Array.isArray(graph.edges)?graph.edges:[];
  if(!nodes.length)errors.push('workflow requires nodes');
  const ids=new Set();
  for(const n of nodes){
    if(!n?.id)errors.push('node id required');
    if(ids.has(n?.id))errors.push('duplicate node id: '+n.id);
    ids.add(n?.id);
    if(!WORKFLOW_NODE_TYPES.includes(n?.type))errors.push('invalid node type: '+n?.type);
  }
  if(!nodes.some(n=>n.type==='trigger'))errors.push('workflow requires a trigger node');
  for(const e of edges){if(!ids.has(e.from)||!ids.has(e.to))errors.push('edge references unknown node: '+e.from+' -> '+e.to)}
  const consequential=nodes.filter(n=>n.type==='output'&&n.config?.consequential);
  if(consequential.length&&!nodes.some(n=>n.type==='approval'))errors.push('consequential output requires approval node');
  for(const n of nodes.filter(n=>n.type==='loop'))if(!(Number(n.config?.maxIterations)>0))errors.push('loop must have a positive maxIterations');
  if(nodes.filter(n=>n.type==='agent').length>8)warnings.push('large agent graph: consider subagents or smaller workflows');
  return {valid:errors.length===0,errors,warnings,nodeCount:nodes.length,edgeCount:edges.length};
}

export function simulateWorkflow(graph={},input={}){
  const validation=validateWorkflow(graph);if(!validation.valid)return {ok:false,validation,steps:[]};
  const byId=new Map(graph.nodes.map(n=>[n.id,n]));
  const outgoing=new Map();
  for(const e of graph.edges||[]){if(!outgoing.has(e.from))outgoing.set(e.from,[]);outgoing.get(e.from).push(e)}
  const start=graph.nodes.find(n=>n.type==='trigger');
  const steps=[],seen=new Map(),queue=[start.id];
  while(queue.length&&steps.length<100){
    const id=queue.shift(),n=byId.get(id);if(!n)continue;
    const count=(seen.get(id)||0)+1;seen.set(id,count);
    if(n.type==='loop'&&count>Math.max(1,Number(n.config?.maxIterations)||1))continue;
    steps.push({index:steps.length,nodeId:id,type:n.type,label:n.label,action:n.type==='approval'?'pause-for-owner':n.type==='output'&&n.config?.consequential?'blocked-until-approved':'simulate'});
    for(const e of outgoing.get(id)||[])queue.push(e.to);
  }
  return {ok:true,dryRun:true,input:Object.fromEntries(Object.entries(input||{}).slice(0,20)),validation,steps,externalActionsExecuted:false};
}

export async function createWorkflow({goal='',name='',graph=null}={}){
  await initWorkflowRuntime();
  const wf=graph?{...graph,id:graph.id||uid('workflow'),name:clean(graph.name||name||'Workflow',120),createdAt:graph.createdAt||new Date().toISOString()}:compileWorkflow({goal,name});
  const validation=validateWorkflow(wf);if(!validation.valid)throw Error('invalid workflow: '+validation.errors.join('; '));
  wf.validation=validation;wf.updatedAt=new Date().toISOString();
  state.workflows.unshift(wf);state.workflows=state.workflows.slice(0,MAX_WORKFLOWS);state.updatedAt=wf.updatedAt;await persist();return wf;
}
export async function listWorkflows(){await initWorkflowRuntime();return state.workflows.map(w=>({id:w.id,name:w.name,goal:w.goal,status:w.status,requiresApproval:w.requiresApproval,nodeCount:w.nodes?.length||0,updatedAt:w.updatedAt||w.createdAt}))}
export async function getWorkflow(id){await initWorkflowRuntime();const w=state.workflows.find(x=>x.id===id);if(!w)throw Error('workflow not found');return w}
export async function recordDryRun(id,input={}){
  const w=await getWorkflow(id),simulation=simulateWorkflow(w,input);
  const run={id:uid('workflow-run'),workflowId:id,at:new Date().toISOString(),mode:'dry-run',simulation};
  state.runs.unshift(run);state.runs=state.runs.slice(0,MAX_RUNS);await persist();return run;
}

export function workflowManifest(){
  return {
    version:WORKFLOW_VERSION,
    architecture:'goal -> compiler -> typed graph -> validator -> guardrails -> approval gate -> connector/output -> run log',
    nodeTypes:WORKFLOW_NODE_TYPES,
    capabilities:[
      'natural-language workflow compilation','deterministic + AI node mixing','MCP/tool nodes','conditions and bounded loops',
      'memory nodes','guardrail nodes','subagent nodes','approval gates','dry-run simulation','persistent workflow registry'
    ],
    consequentialActions:'owner approval required',
    sourcePatterns:['uploaded TikTok n8n/Cursor-style graph builder','current agent/workflow architecture patterns'],
    reference:referenceEmailDigestWorkflow()
  };
}
