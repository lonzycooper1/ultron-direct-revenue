import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {createContinuousOperations,freshContinuous,INTERVAL_MS,continuousHealth} from './continuous-operations.mjs';
import {getJson,mutateJson} from './state-store.mjs';
const initial=Date.parse('2026-10-23T12:00:00Z');
function memory(){let s=freshContinuous();return {read:async()=>structuredClone(s),mutate:async fn=>{await fn(s)}}}
test('two due scheduler cycles persist across restart, reject early retry, and become stale',async()=>{
 let now=initial,n=0;const store=memory(),steps={publicFeeds:async()=>{n++;return {status:'COMPLETED'}}};
 let w=createContinuousOperations({...store,clock:()=>now});assert.equal((await w.run(steps)).status,'COMPLETED');
 assert.equal((await w.run(steps)).status,'NOT_DUE_OR_RUNNING_OR_PAUSED');
 w=createContinuousOperations({...store,clock:()=>now});now+=INTERVAL_MS;await w.run(steps);
 assert.equal(n,2);assert.equal((await w.snapshot()).scheduledRuns,2);assert.equal((await w.snapshot()).consecutiveSuccessfulRuns,2);
 now+=INTERVAL_MS*2+1;assert.equal((await w.snapshot()).status,'STALE');
});
test('overlap is rejected, pause persists, independent steps continue after failure without leaking errors',async()=>{
 const store=memory();let release,entered;const enteredP=new Promise(r=>entered=r),wait=new Promise(r=>release=r);
 const w=createContinuousOperations({...store,clock:()=>initial});let independent=0;
 const active=w.run({feed:async()=>{entered();await wait;throw Error('private-secret')},delivery:async()=>{independent++;return {status:'COMPLETED'}}});
 await enteredP;assert.equal((await w.run({x:async()=>({status:'COMPLETED'})})).status,'NOT_DUE_OR_RUNNING_OR_PAUSED');release();
 assert.equal((await active).status,'DEGRADED');assert.equal(independent,1);assert.equal(JSON.stringify(await w.snapshot()).includes('private-secret'),false);
 await w.control('pause');assert.equal((await createContinuousOperations({...store,clock:()=>initial+INTERVAL_MS}).snapshot()).status,'PAUSED');
});
test('expired process lease records interruption; startup is not an unattended scheduled cycle',async()=>{
 const store=memory();await store.mutate(s=>{s.running={id:'old',trigger:'SCHEDULED',startedAt:new Date(initial-600000).toISOString(),until:new Date(initial-1).toISOString()}});
 const w=createContinuousOperations({...store,clock:()=>initial});await w.run({feed:async()=>({status:'COMPLETED'})},{trigger:'STARTUP'});
 const s=await w.snapshot();assert.equal(s.scheduledRuns,0);assert.equal(s.runs[0].status,'INTERRUPTED_REVIEW_REQUIRED');assert.equal(s.runs[1].trigger,'STARTUP');
});
test('failed feed in cooldown cannot turn the operating status healthy',async()=>{
 const w=createContinuousOperations({...memory(),clock:()=>initial});await w.run({feed:async()=>({status:'COOLDOWN',sourceStatus:'PARTIAL_PUBLIC_FEED'})});assert.equal((await w.snapshot()).status,'DEGRADED');
 assert.equal(continuousHealth(freshContinuous(),initial).status,'NOT_VERIFIED');
});
test('PostgreSQL claims serialize separate workers and retain pause and completed records',async()=>{
 const key='continuous-test-'+randomUUID(),store={read:()=>getJson(key,freshContinuous()),mutate:fn=>mutateJson(key,freshContinuous(),fn)};
 const a=createContinuousOperations({...store,clock:()=>initial}),b=createContinuousOperations({...store,clock:()=>initial});let n=0;
 await Promise.all([a,b].map(w=>w.run({feed:async()=>{n++;return {status:'COMPLETED'}}})));assert.equal(n,1);
 await a.control('pause');const restarted=createContinuousOperations(store);assert.equal((await restarted.snapshot()).paused,true);assert.equal((await restarted.snapshot()).runs.length,1);
});

test('separate process crash recovers an expired lease without changing unrelated customer state',async()=>{
 const {execFile}=await import('node:child_process'),{promisify}=await import('node:util');const run=promisify(execFile);
 const key='continuous-process-test-'+randomUUID(),customerKey='continuous-customer-test-'+randomUUID();
 await mutateJson(customerKey,{orders:{}},s=>{s.orders.fixture={status:'UNCHANGED_CONTROLLED_CUSTOMER_FIXTURE'}});
 const source=(now,operation)=>`import {createContinuousOperations,freshContinuous} from './continuous-operations.mjs';import {getJson,mutateJson} from './state-store.mjs';const key=${JSON.stringify(key)};const w=createContinuousOperations({clock:()=>${now},read:()=>getJson(key,freshContinuous()),mutate:f=>mutateJson(key,freshContinuous(),f)});await w.run({feed:async()=>{${operation}}},{trigger:'CONTROLLED_TEST'});process.exit(0);`;
 await assert.rejects(run(process.execPath,['--input-type=module','-e',source(initial,'process.exit(23)')],{cwd:import.meta.dirname}),e=>e.code===23);
 await run(process.execPath,['--input-type=module','-e',source(initial+360000,"return {status:'COMPLETED'}")],{cwd:import.meta.dirname});
 const s=await getJson(key,freshContinuous());assert.equal(s.runs[0].status,'INTERRUPTED_REVIEW_REQUIRED');assert.equal(s.runs[1].status,'COMPLETED');assert.equal(s.running,null);
 assert.equal((await getJson(customerKey,{})).orders.fixture.status,'UNCHANGED_CONTROLLED_CUSTOMER_FIXTURE');
});

test('scheduled successes from another release cannot verify the current revision',async()=>{
 const store=memory();let now=initial;const a=createContinuousOperations({...store,clock:()=>now,revision:'old-release'});await a.run({feed:async()=>({status:'COMPLETED'})});now+=INTERVAL_MS;await a.run({feed:async()=>({status:'COMPLETED'})});
 const next=createContinuousOperations({...store,clock:()=>now,revision:'new-release'});assert.equal((await next.snapshot()).scheduledRuns,0);assert.equal((await next.snapshot()).consecutiveSuccessfulScheduledRuns,0);
});
