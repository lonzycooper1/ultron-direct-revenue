import {buildJarvisMission,jarvisManifest,classifyAction} from './jarvis-core.mjs';
import {marketStats,marketStores} from './ai-market.mjs';
import {masterCapabilityManifest,marketVideoPlan,cryptoVideoPlan,buildMission} from './video-master-pack.mjs';
import {expansionManifest,contentMission,businessOpportunityMission,cryptoResearchMission} from './video-expansion-pack.mjs';

const memory=new Map();
const missions=new Map();
const events=[];
const approvals=new Map();
const now=()=>new Date().toISOString();
const push=(type,data={})=>{const e={id:crypto.randomUUID(),at:now(),type,...data};events.unshift(e);if(events.length>500)events.length=500;return e};

export function jarvisStatus(){return {ok:true,brain:jarvisManifest(),divisions:{aiMarket:{status:'ready',stats:marketStats(),stores:marketStores().length,expansion:expansionManifest().aiMarket,contentMission:contentMission({}),businessMission:businessOpportunityMission({})},cryptoIntelligence:{status:'ready',execution:'approval-gated',capabilities:cryptoVideoPlan(),expansion:expansionManifest().crypto,researchMission:cryptoResearchMission({})}},shared:{memoryItems:memory.size,missions:missions.size,pendingApprovals:[...approvals.values()].filter(x=>x.status==='pending').length,events:events.length},interfaces:['web','ios','android','desktop']}}
export function remember({key,value,source='jarvis'}={}){if(!key)throw Error('key required');const item={key:String(key),value,source,updatedAt:now()};memory.set(item.key,item);push('memory.updated',{key:item.key});return item}
export function recall(key){return key?memory.get(String(key))||null:[...memory.values()]}
export function createMission(input={}){const division=input.division==='crypto'?'crypto':input.division==='market'?'market':'general';const m={...buildJarvisMission({...input,division}),status:'planned',updatedAt:now(),divisionPlan:division==='crypto'?cryptoVideoPlan():division==='market'?marketVideoPlan():masterCapabilityManifest()};missions.set(m.id,m);push('mission.created',{missionId:m.id,division});return m}
export function runMission(id){const m=missions.get(id);if(!m)throw Error('mission not found');m.updatedAt=now();if(m.policy?.approvalRequired){const a={id:crypto.randomUUID(),missionId:id,action:m.goal,risk:m.policy.risk,status:'pending',createdAt:now()};approvals.set(a.id,a);m.status='awaiting-approval';m.approvalId=a.id;push('approval.required',{missionId:id,approvalId:a.id});return m}m.status='completed';m.completedAt=now();m.result={ok:true,route:m.division==='crypto'?'Crypto Intelligence':m.division==='market'?'AI Market':'JARVIS',plan:buildMission({goal:m.goal,division:m.division})};push('mission.completed',{missionId:id});return m}
export function decideApproval(id,decision){const a=approvals.get(id);if(!a)throw Error('approval not found');a.status=decision==='approve'?'approved':'rejected';a.decidedAt=now();const m=missions.get(a.missionId);if(m){m.status=a.status==='approved'?'approved-for-external-execution':'rejected';m.updatedAt=now()}push('approval.decided',{approvalId:id,status:a.status});return a}
export function jarvisControl(){return {killSwitch:false,financialExecution:'explicit-approval',manifest:jarvisManifest(),missions:[...missions.values()].slice(-100),approvals:[...approvals.values()].slice(-100),events:events.slice(0,100),memory:[...memory.values()].slice(-100)}}
export function actionPolicy(action){return classifyAction(action)}
