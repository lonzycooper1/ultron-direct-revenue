import {V7_SYSTEMS} from './ultron-strategic-edge-v7.mjs';
const now=()=>new Date().toISOString(),num=v=>Number.isFinite(Number(v))?Number(v):0,clip=v=>Math.max(0,Math.min(100,num(v)));
export const SYSTEM_CONTRACTS=V7_SYSTEMS.map(s=>({
  ...s,
  inputs:['observations','provenance','constraints','historical outcomes'],
  outputs:['score','decision','evidence status','next action'],
  evidenceRequirements:['source','observedAt','confidence','permission'],
  stopConditions:['missing required evidence','hard constraint violated','approval required','capacity exceeded','kill switch active']
}));
export function evaluateSystem(systemId,input={}){
  const system=SYSTEM_CONTRACTS.find(x=>x.id===systemId);
  if(!system)return {ok:false,status:'UNKNOWN_SYSTEM'};
  const evidence=Array.isArray(input.evidence)?input.evidence:[],valid=evidence.filter(x=>x&&x.source&&x.observedAt&&x.permission);
  if(!valid.length)return {ok:true,system,status:'NO_CURRENT_EVIDENCE',score:0,decision:'WAIT_FOR_EVIDENCE',nextAction:'Acquire public or permissioned evidence with provenance.'};
  if(input.killSwitch)return {ok:true,system,status:'STOPPED',score:0,decision:'STOP',nextAction:'Respect kill switch.'};
  if(input.approvalRequired&&!input.approved)return {ok:true,system,status:'APPROVAL_REQUIRED',score:0,decision:'QUEUE_FOR_APPROVAL',nextAction:'Await authorized approval.'};
  const confidence=valid.reduce((a,x)=>a+clip(x.confidence),0)/valid.length;
  const freshness=valid.reduce((a,x)=>a+clip(x.freshness??50),0)/valid.length;
  const outcome=clip(input.outcomeHistory??50),score=confidence*.45+freshness*.25+outcome*.30;
  return {ok:true,system,status:'EVALUATED',score:+score.toFixed(1),decision:score>=70?'ACT_OR_TEST':score>=45?'BOUNDED_TEST':'WAIT_FOR_MORE_EVIDENCE',evidenceCount:valid.length,nextAction:score>=70?'Select smallest reversible high-value action.':'Increase evidence quality before scaling.',evaluatedAt:now()};
}
export function evaluateAll(inputBySystem={}){return SYSTEM_CONTRACTS.map(s=>evaluateSystem(s.id,inputBySystem[s.id]||{}))}
