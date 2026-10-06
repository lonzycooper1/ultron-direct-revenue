import {getJson,setJson} from './state-store.mjs';
const KEY='ultron-proprietary-intelligence-v7',now=()=>new Date().toISOString();
export const FACTORY_FLOW=['public or permissioned observation','structured observation','experiment','verified outcome','causal finding','benchmark','decision rule','reusable model','civilization memory'];
export function observation(x={}){return {id:x.id||'obs-'+Date.now(),source:x.source||null,permission:x.permission||'unknown',observedAt:x.observedAt||now(),freshUntil:x.freshUntil||null,confidence:Number(x.confidence||0),data:x.data||null,evidence:x.evidence||[],status:x.data?'OBSERVED':'NO_CURRENT_EVIDENCE'}}
export function intelligenceRecord(x={}){return {id:x.id||'intel-'+Date.now(),observation:x.observation||null,experiment:x.experiment||null,verifiedOutcome:x.verifiedOutcome||null,causalFinding:x.causalFinding||null,benchmark:x.benchmark||null,decisionRule:x.decisionRule||null,reusableModel:x.reusableModel||null,civilizationMemoryRef:x.civilizationMemoryRef||null,createdAt:now()}}
export async function intelligenceFactoryState(){return getJson(KEY,{version:7,flow:FACTORY_FLOW,observations:[],experiments:[],outcomes:[],findings:[],benchmarks:[],decisionRules:[],models:[],memoryExports:[],updatedAt:now()})}
export async function saveIntelligenceFactoryState(s){s.updatedAt=now();return setJson(KEY,s)}
