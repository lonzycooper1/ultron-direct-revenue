import {agentSecurityProfile,securityManifest} from './agent-security.mjs';

export const AGENT_OF_AGENTS_VERSION='2.0.0';
export const COMMERCE_AGENTS=Object.freeze({
 ProductScoutAgent:{purpose:'Rank public/authorized trend signals and propose high-margin digital or print-on-demand products.',mode:'research-and-propose'},
 StoreBuilderAgent:{purpose:'Turn approved product candidates into Shopify/storefront-ready listings and landing-page plans.',mode:'draft-and-stage'},
 MediaBuyerAgent:{purpose:'Create campaign concepts, scripts, creatives and measurement plans; paid spend remains approval-gated.',mode:'proposal-only'},
 CustomerSupportAgent:{purpose:'Answer product/policy questions, prepare tracking responses and draft refund resolutions.',mode:'answer-and-draft'}
});
export const POD_STRATEGY=Object.freeze({
 preferredLaunchOrder:['digital-download','printable-template','print-on-demand-art','print-on-demand-apparel','print-on-demand-homeware','supplier-fulfilled-physical-product'],
 reason:'Minimize inventory exposure, shipping complexity and customer-service load while validating demand.'
});
export function visualAgentGraph(){
 const nodes=[{id:'editor',label:'Editor-in-Chief',type:'human-approval'},{id:'ceo',label:'Orchestrator CEO',type:'orchestrator'},...Object.entries(COMMERCE_AGENTS).map(([id,a])=>({id,label:id.replace(/Agent$/,''),type:'agent',purpose:a.purpose})),{id:'shopify',label:'Shopify / Store API',type:'connector'},{id:'ads',label:'Meta/TikTok/Windsor',type:'connector'},{id:'support',label:'Email/Helpdesk',type:'connector'},{id:'analytics',label:'Outcome Analytics',type:'data'}];
 const edges=[['editor','ceo','goal + approvals'],['ceo','ProductScoutAgent','spawn / rank'],['ProductScoutAgent','StoreBuilderAgent','validated candidate'],['StoreBuilderAgent','shopify','stage listing'],['StoreBuilderAgent','editor','publish approval'],['ceo','MediaBuyerAgent','creative + growth task'],['MediaBuyerAgent','editor','spend approval'],['MediaBuyerAgent','ads','approved campaign only'],['ceo','CustomerSupportAgent','policy + support task'],['CustomerSupportAgent','support','responses'],['CustomerSupportAgent','editor','refund approval'],['shopify','analytics','orders / conversion'],['ads','analytics','spend / ROAS'],['support','analytics','refund/support burden'],['analytics','ceo','feedback']].map(([from,to,label])=>({from,to,label}));
 return {format:'portable-agent-graph-v1',note:'Portable topology for mapping into visual builders such as Flowise or Langflow; not a vendor-specific export.',nodes,edges};
}
export function agentOfAgentsManifest(){
 return {
  version:AGENT_OF_AGENTS_VERSION,
  architecture:'JARVIS -> Agent-of-Agents CEO -> dynamically spawned commerce specialists -> approval/connectors -> analytics feedback',
  agents:Object.fromEntries(Object.entries(COMMERCE_AGENTS).map(([k,v])=>[k,{...v,security:agentSecurityProfile(k)}])),
  podStrategy:POD_STRATEGY,
  graph:visualAgentGraph(),
  security:securityManifest(),
  humanInTheLoop:['public product publishing','paid campaign launch','budget changes','refund execution','banking or payout changes'],
  noCode:{flowise:'topology-ready',langflow:'topology-ready'},
  executionService:'ULTRON direct-revenue service'
 };
}
export async function fetchAgentOfAgentsState(baseUrl){
 try{const r=await fetch(String(baseUrl).replace(/\/$/,'')+'/api/agent-of-agents',{signal:AbortSignal.timeout(5000)});const d=await r.json();return {reachable:r.ok,status:r.status,...d}}catch(e){return {reachable:false,error:String(e?.message||e).slice(0,180)}}
}
