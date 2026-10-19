import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createMainframe44,validateInbound,providerReadiness} from './ultron-mainframe-v44.mjs';

const blank=()=>({drafts:{},submittedLeadHashes:{},events:[],updatedAt:null});
function harness(overrides={}){
 const state=blank();
 const reader=async()=>state;
 const mutate=async(fn)=>{await fn(state);return state};
 return {state,mainframe:createMainframe44({read:reader,mutate,
  capture:async(input)=>({leadId:'lead-unit-1',contactStatus:input.followupConsent?'OPT_IN_TO_ONE_TO_ONE_REPLY':'NO_FOLLOWUP_PERMISSION'}),
  health:async()=>({ok:true,backend:'postgres'}),readLeads:async()=>({total:1,consentedForOneToOneFollowup:0}),
  readLedger:async()=>({orders:{}}),readExecutive:async()=>({counts:{QUEUED:0},hostedAgentsAccess:'UNVERIFIED'}),
  readAgents:async()=>({approvals:[]}),...overrides})};
}

test('database-backed storage is required and integrations are not falsely verified',()=>{
 const p=providerReadiness({ULTRON_EXECUTIVE_DAILY_LIMIT:'4'});
 assert.equal(p.gmail.configured,false);assert.equal(p.paypal.configured,false);
 assert.equal(p.security.automaticAdSpendUsd,0);assert.equal(p.mcp.executionAllowed,false);
});

test('public lead validation requires honest first-party consent and rejects honeypots',()=>{
 const data=validateInbound({company:'Real Services LLC',email:'INFO@EXAMPLE.ORG',followupConsent:false});
 assert.equal(data.email,'info@example.org');assert.equal(data.followupConsent,false);
 assert.equal(data.source,'mainframe-v44-first-party-intake');
 assert.throws(()=>validateInbound({company:'A',email:'a@example.org'}),/Company required/);
 assert.throws(()=>validateInbound({company:'Real Services',email:'a@example.org',website_url:'https://spam.invalid'}),/rejected/);
 assert.throws(()=>validateInbound({company:'Real Services',email:'a@example.org',followupConsent:'yes'}),/boolean/);
});

test('inbound events are persisted and a per-email daily abuse cap applies',async()=>{
 const {mainframe,state}=harness();
 const body={company:'Real Services LLC',email:'info@example.org',followupConsent:true};
 for(let i=0;i<5;i++)await mainframe.publicIntake(body);
 assert.equal(state.events.length,5);
 assert.equal(state.events[0].consented,true);
 assert.equal(state.events[0].idHash.length,64);
 await assert.rejects(mainframe.publicIntake(body),/Daily submission limit/);
});

test('original draft files persist with checksum and remain approval-gated',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'ultron-mainframe-'));
 try{
  const {mainframe,state}=harness({env:{ULTRON_ARTIFACT_DIR:directory}});
  const brief={
   title:'Original Booking Operations Guide',category:'booking-operations',
   audience:'Owners of local service firms',
   problem:'Prospective bookings are missed when business phone calls go unanswered',
   objective:'Map the existing booking process and test simple response improvements',
   successCriterion:'Measure reply time and completed appointments over one month',
   priceCents:2900,originalityAcknowledged:true,
   evidence:[
    {label:'Public first source',relevance:'A published process document for manual intake operations',observedAt:'2020-01-01T00:00:00Z',url:'https://example.org/guide'},
    {label:'Public second source',relevance:'A distinct published summary about appointment routing',observedAt:'2020-01-02T00:00:00Z',url:'https://example.org/routing'}
   ]
  };
  const draft=await mainframe.saveProductDraft(brief);
  assert.equal(draft.status,'DRAFT_OWNER_REVIEW_REQUIRED');
  assert.equal(draft.paymentCaptured,false);assert.equal(draft.published,false);
  const got=await mainframe.getProductDraft(draft.id);
  assert.match(got.data.toString('utf8'),/Original Booking Operations Guide/);
  assert.equal(state.drafts[draft.id].sha256,got.sha256);
  await writeFile(join(directory,draft.id+'.html'),'tampered');
  await assert.rejects(mainframe.getProductDraft(draft.id),/digest mismatch/);
 }finally{await rm(directory,{recursive:true,force:true})}
});

test('public status separates real capture records, acceptance, and bank settlement',async()=>{
 const {mainframe}=harness();
 const s=await mainframe.snapshot();
 assert.equal(s.database,'POSTGRES_CONNECTED');
 assert.equal(s.liveWorker.configured,false);
 assert.equal(s.orders.signedCaptureRecords,0);
 assert.equal(s.orders.bankSettlement,'NOT_VERIFIED_BY_MAINFRAME');
 assert.equal(s.limits.noUnapprovedOutbound,true);
});
