// Case stages describe the next review task, never proof of a sale or permission to send.
export const CASE_STAGES=Object.freeze(['RESEARCH','QUALIFICATION','OUTREACH_REVIEW','CONVERSATION','PROPOSAL_REVIEW','PAYMENT_REVIEW','DELIVERY_REVIEW','ACCEPTANCE_REVIEW','RECONCILIATION_REVIEW']);
const text=(x,n=1000)=>String(x??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
export function recordRevenueCase(state,input,now=new Date().toISOString()){
 const id=text(input.id,100),requestId=text(input.requestId,100),stage=input.stage;
 if(!/^[a-zA-Z0-9_-]{3,100}$/.test(id)||!requestId||!CASE_STAGES.includes(stage))throw Error('Case identity, request identity and supported review stage required');
 const fields={stage,owner:text(input.owner,100),nextAction:text(input.nextAction),dependency:text(input.dependency),evidenceReference:text(input.evidenceReference,500),dueAt:input.dueAt};
 if(!fields.owner||!fields.nextAction||!fields.dependency||!fields.evidenceReference||!Number.isFinite(Date.parse(fields.dueAt)))throw Error('Owner, next action, dependency, evidence and valid deadline required');
 state.cases??={};const old=state.cases[id],fingerprint=JSON.stringify(fields);
 if(old?.requests?.[requestId]){if(old.requests[requestId]!==fingerprint)throw Error('Request identity reused with changed content');return old;}
 if(old&&CASE_STAGES.indexOf(stage)>CASE_STAGES.indexOf(old.stage)+1)throw Error('Review stages cannot be skipped');
 if(!old&&stage!=='RESEARCH')throw Error('New cases begin with research');
 const entry={id,...fields,requests:{...old?.requests,[requestId]:fingerprint},history:[...(old?.history||[]),{requestId,stage,evidenceReference:fields.evidenceReference,at:now}],createdAt:old?.createdAt||now,updatedAt:now,
  automation:'MANUAL_REVIEW_ONLY',providerVerified:false,customer:false,permissionToSend:false};
 state.cases[id]=entry;return entry;
}
export function escalateRevenueCases(state,now=new Date().toISOString()){
 state.alerts??={};for(const c of Object.values(state.cases||{})){
  if(Date.parse(c.dueAt)>=Date.parse(now))continue;
  const id='revenue-case:'+c.id;
  state.alerts[id]??={id,kind:'REVENUE_CASE_REVIEW_OVERDUE',reference:c.id,createdAt:now,status:'QUEUED_NOT_DELIVERED'};
  Object.assign(state.alerts[id],{overdue:true,owner:c.owner,nextAction:c.nextAction,dependency:c.dependency});
 }
}
