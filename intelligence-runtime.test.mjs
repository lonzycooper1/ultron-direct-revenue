import test from 'node:test';
import assert from 'node:assert/strict';
import {createIntelligence,revenueSnapshot,sportsNarrative} from './intelligence-runtime.mjs';
import {createApp} from './server.js';
const fixture=()=>{
 const state={version:1,events:{},subscriptions:{},tasks:{}};let calls=0;
 const read=async()=>structuredClone(state),mutate=async fn=>{const next=structuredClone(state);await fn(next);Object.assign(state,next)};
 const options={read,mutate,orders:async()=>({orders:{}}),board:async()=>{calls++;return {ok:true,events:[],projections:[]}},worker:{enqueue:async j=>({id:'fixture',...j}),status:async()=>({workerEnabled:true})}};
 return {state,options,get calls(){return calls}};
};
const event=(id,type,at='2026-10-23T12:00:00Z')=>({id,event_type:type,create_time:at,resource:{id:'SUB-1'}});
test('signed failures persist across runtime recreation; duplicates and late events cannot regress state',async()=>{
 const f=fixture(),a=createIntelligence(f.options);await a.signedBillingEvent(event('E1','BILLING.SUBSCRIPTION.PAYMENT.FAILED'));
 assert.equal((await createIntelligence(f.options).snapshot()).subscriptions.riskSignals.length,1);
 assert.equal((await a.signedBillingEvent(event('E1','BILLING.SUBSCRIPTION.PAYMENT.FAILED'))).duplicate,true);
 await a.signedBillingEvent(event('E2','BILLING.SUBSCRIPTION.ACTIVATED','2026-10-23T13:00:00Z'));
 await a.signedBillingEvent(event('E3','BILLING.SUBSCRIPTION.PAYMENT.FAILED','2026-10-23T11:00:00Z'));
 assert.equal((await a.snapshot()).subscriptions.riskSignals.length,0);
 assert.equal(Object.keys(f.state.events).length,3);
});
test('unrelated events are ignored and invalid signed records are rejected',async()=>{
 const a=createIntelligence(fixture().options);assert.equal((await a.signedBillingEvent({event_type:'OTHER'})).recorded,false);
 await assert.rejects(a.signedBillingEvent(event('E1','BILLING.SUBSCRIPTION.PAYMENT.FAILED','bad')),/Invalid/);
});
test('revenue deduplicates captures, excludes other currencies, and preserves unknown fees and profit',()=>{
 const o={status:'COMPLETED',captureId:'C1',capturedAt:'2026-10-23T12:00:00Z',currency:'USD',capturedAmount:19.99};
 const r=revenueSnapshot([o,{...o},{...o,currency:'EUR',captureId:'C2'}],{subscriptions:{}});
 assert.equal(r.captures,1);assert.equal(r.grossCapturedUsd,19.99);assert.equal(r.excludedNonUsdOrders,1);
 for(const k of ['paypalFeesUsd','recordedContributionProfitUsd','ltvUsd','arpuUsd','churnRate'])assert.equal(r[k],null);
});
test('tool policy rejects arbitrary effects; replay survives a new runtime without rerunning providers',async()=>{
 const f=fixture(),a=createIntelligence(f.options),request={tool:'sports.board',input:{sport:'NBA'},idempotencyKey:'fixture-1'};
 await assert.rejects(a.execute({...request,tool:'send.email'}),/Invalid/);
 const r=await a.execute(request);assert.equal(r.status,'COMPLETED');assert.equal(r.externalActionTaken,false);
 assert.deepEqual(await createIntelligence(f.options).execute(request),r);assert.equal(f.calls,1);
 await assert.rejects(a.execute({...request,input:{sport:'NFL'}}),/Conflict/);
});
test('provider failure is durably recorded without provider body or secret',async()=>{
 const f=fixture(),a=createIntelligence({...f.options,board:async()=>{throw Error('fixture-sensitive-provider-body')}});
 await assert.rejects(a.execute({tool:'sports.board',idempotencyKey:'failed'}));
 assert.equal(f.state.tasks.failed.status,'FAILED');assert.doesNotMatch(JSON.stringify(f.state),/fixture-sensitive/);
});
test('interrupted task is surfaced for reconciliation and is never executed again silently',async()=>{
 const f=fixture();f.state.tasks.crash={status:'RUNNING',startedAt:'2020-01-01T00:00:00Z'};
 assert.equal((await createIntelligence(f.options).status()).tasks[0].status,'RECONCILIATION_REQUIRED');assert.equal(f.calls,0);
});
test('conversation uses existing budgeted queue and includes observed module context',async()=>{
 const a=createIntelligence(fixture().options),r=await a.execute({tool:'conversation',input:{module:'revenue',message:'What evidence is missing?'},idempotencyKey:'chat'});
 assert.equal(r.result.status,'QUEUED_FOR_EXISTING_WORKER');assert.match(r.result.job.prompt,/APPLICATION_LEDGER/);
});
test('previews and summaries enforce actual game state and retain missing scores',()=>{
 const e={id:'1',state:'post',name:'A versus B',teams:[{name:'A',score:null},{name:'B',score:2}]};
 assert.match(sportsNarrative({events:[e]},'1','summary').text,/score unavailable/);
 assert.throws(()=>sportsNarrative({events:[e]},'1','preview'),/Invalid/);
});
test('private intelligence routes reject unauthenticated requests before accessing storage',async()=>{
 const server=createApp({ownerSessions:{route:async()=>false,direct:()=>false,authenticated:async()=>false}}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{for(const path of ['status','revenue','execute']){const r=await fetch('http://127.0.0.1:'+server.address().port+'/api/intelligence/'+path);assert.equal(r.status,403)}}finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
});
test('scheduled observations survive restart and run at most once in each ten-minute slot',async()=>{
 const f=fixture(),a=createIntelligence(f.options);assert.equal((await a.cycle()).status,'OBSERVED');
 const restarted=createIntelligence(f.options);assert.equal((await restarted.cycle()).status,'ALREADY_CLAIMED');
 const s=await restarted.status();assert.equal(s.monitor.history.length,1);assert.equal(s.monitor.latest.sports.status,'PROVIDER_RESPONDED');assert.equal(f.calls,1);
});
test('empty but successful provider response differs from outage; failed cycles are degraded',async()=>{
 const f=fixture(),a=createIntelligence({...f.options,board:async()=>({ok:false,events:[]})});
 const r=await a.cycle();assert.equal(r.status,'DEGRADED');assert.equal(r.sports.status,'UNAVAILABLE');
 await assert.rejects(a.execute({tool:'sports.board',idempotencyKey:'outage'}),/unavailable/);
});
test('PostgreSQL serializes concurrent claims and persists completed replay across instances',{skip:!process.env.DATABASE_URL},async()=>{
 const {assertTestDatabase}=await import('./ops/assert-test-database.mjs');assertTestDatabase();
 const {getJson,mutateJson}=await import('./state-store.mjs');
 const key='intelligence-test-'+crypto.randomUUID(),empty={version:1,events:{},subscriptions:{},tasks:{}};let calls=0;
 const options={read:()=>getJson(key,empty),mutate:f=>mutateJson(key,empty,f),board:async()=>{calls++;await new Promise(r=>setTimeout(r,50));return {ok:true,events:[],projections:[]}}};
 const a=createIntelligence(options),request={tool:'sports.board',idempotencyKey:'concurrent'};
 const results=await Promise.allSettled([a.execute(request),createIntelligence(options).execute(request)]);
 assert.ok(results.some(r=>r.status==='fulfilled'));assert.equal(calls,1);
 assert.equal((await createIntelligence(options).execute(request)).status,'COMPLETED');assert.equal(calls,1);
});
test('authenticated API validates size/type and executes/replays a real allowed tool',async()=>{
 const f=fixture(),runtime=createIntelligence(f.options),server=createApp({ownerSessions:{route:async()=>false,direct:()=>true,authenticated:async()=>false},intelligenceRuntime:runtime}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const url='http://127.0.0.1:'+server.address().port+'/api/intelligence/execute',headers={'content-type':'application/json'},body=JSON.stringify({tool:'revenue.snapshot',idempotencyKey:'http'});
 try{
  assert.equal((await fetch(url,{method:'POST',body})).status,415);
  assert.equal((await fetch(url,{method:'POST',headers,body:'{bad'})).status,400);
  assert.equal((await fetch(url,{method:'POST',headers,body:JSON.stringify({tool:'refund',idempotencyKey:'bad'})})).status,400);
  assert.equal((await fetch(url,{method:'POST',headers,body:' '.repeat(33000)})).status,413);
  const first=await (await fetch(url,{method:'POST',headers,body})).json();assert.equal(first.result.currency,'USD');
  assert.deepEqual(await (await fetch(url,{method:'POST',headers,body})).json(),first);
  const changed=await fetch(url,{method:'POST',headers,body:JSON.stringify({tool:'sports.board',idempotencyKey:'http'})});assert.equal(changed.status,409);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
});
