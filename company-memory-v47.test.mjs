import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompanyMemory} from './company-memory-v47.mjs';
import {createExecutive,validateJob} from './executive-runtime.mjs';
import {createApp} from './server.js';
import pg from 'pg';
import {randomUUID} from 'node:crypto';

const time=Date.parse('2026-10-20T12:00:00Z');
const doc=(over={})=>({id:'one',title:'Bakery support policy',text:'Bakery refunds need the original receipt.',source:'owner-policy-12',observedAt:'2026-10-19T12:00:00Z',expiresAt:'2026-10-21T12:00:00Z',evidenceType:'OWNER_RECORD',...over});
function fixture(){const states=new Map();let now=time;const memory=createCompanyMemory({clock:()=>now,read:async k=>structuredClone(states.get(k)||{revision:0,documents:{},relations:[],audit:[]}),mutate:async(k,fn)=>{const v=structuredClone(states.get(k)||{revision:0,documents:{},relations:[],audit:[]});await fn(v);states.set(k,v)}});return {memory,states,advance:n=>now+=n}}
test('memory preserves provenance, ignores expired records and isolates customer scopes',async()=>{
 const f=fixture();await f.memory.save('customer-a',doc());await f.memory.save('customer-b',doc({text:'Private bakery account details.'}));
 const r=await f.memory.search('customer-a',{query:'bakery refunds'});assert.equal(r.matches.length,1);assert.equal(r.matches[0].source,'owner-policy-12');assert.equal(r.matches[0].evidenceType,'OWNER_RECORD');assert.doesNotMatch(JSON.stringify(r),/Private bakery/);
 const c=await f.memory.context('customer-a','bakery');assert.equal(c.externalActionsAuthorized,false);assert.equal(c.citations[0].version,1);assert.match(c.text,/UNTRUSTED COMPANY EVIDENCE/);
 f.advance(86400001);assert.equal((await f.memory.search('customer-a',{query:'bakery'})).matches.length,0);assert.equal((await f.memory.snapshot('customer-a')).documents[0].expired,true);
});
test('edits require the current version, exact replay is idempotent and retrieval is fresh',async()=>{
 const f=fixture(),a=await f.memory.save('a',doc());
 const withoutId=doc();delete withoutId.id;const auto=await f.memory.save('auto',withoutId);assert.equal((await f.memory.save('auto',withoutId)).id,auto.id);assert.equal((await f.memory.snapshot('auto')).documents.length,1);assert.equal((await f.memory.save('a',doc())).version,1);
 await assert.rejects(f.memory.save('a',doc({text:'Changed'})),/changed/);
 await f.memory.save('a',doc({text:'New cancellation policy',expectedVersion:a.version}));
 assert.equal((await f.memory.search('a',{query:'cancellation'})).matches[0].version,2);
 assert.equal((await f.memory.snapshot('a')).revision,2);
});
test('relationships cannot cross scopes and malformed records are rejected',async()=>{
 const f=fixture();await f.memory.save('a',doc());await f.memory.save('b',doc({id:'two'}));
 await assert.rejects(f.memory.relate('a',{from:'one',to:'two',label:'supports'}),/this scope/);
 await f.memory.save('a',doc({id:'two'}));await f.memory.relate('a',{from:'one',to:'two',label:'supports'});await f.memory.relate('a',{from:'one',to:'two',label:'supports'});
 assert.equal((await f.memory.snapshot('a')).relations.length,1);
 for(const d of [{evidenceType:'AI_GUESS'},{expiresAt:'2020-01-01'},{source:''},{observedAt:'2030-01-01'}])await assert.rejects(f.memory.save('a',doc(d)));
 await assert.rejects(f.memory.search('../a',{query:'bakery'}));
 await assert.rejects(f.memory.save('a',doc({id:'__proto__'})));
 await assert.rejects(f.memory.save('a',doc({observedAt:123})));
});
test('executive opt-in binds scope to idempotency and persists evidence used by the model',async()=>{
 let s={jobs:{},schedule:{},usage:{}},calls=[];
 const f=fixture();await f.memory.save('customer-a',doc());
 const e=createExecutive({env:{ULTRON_EXECUTIVE_ENABLED:'true',OPENAI_API_KEY:'fixture'},clock:()=>time,memory:f.memory,read:async()=>structuredClone(s),mutate:async fn=>{await fn(s);return structuredClone(s)},request:async(u,o)=>{calls.push(JSON.parse(o.body));return {ok:true,json:async()=>({id:'response',status:'completed',output:[{type:'message',content:[{type:'output_text',text:'Draft grounded in supplied policy'}]}]})}}});
 await e.enqueue({kind:'support',prompt:'Explain bakery refunds',memoryScope:'customer-a',idempotencyKey:'support-one'});
 await assert.rejects(e.enqueue({kind:'support',prompt:'Explain bakery refunds',memoryScope:'customer-b',idempotencyKey:'support-one'}),/reused/);
 assert.equal((await e.tick()).status,'DRAFT_READY');assert.match(calls[0].input,/original receipt/);assert.match(calls[1].input,/UNTRUSTED COMPANY EVIDENCE/);
 const saved=Object.values(s.jobs)[0];assert.equal(saved.result.companyEvidence.scope,'customer-a');assert.equal(saved.result.companyEvidence.citations.length,1);
 assert.throws(()=>validateJob({kind:'research',prompt:'x',memoryScope:'../all'}));
});
test('memory retrieval failure stops provider dispatch',async()=>{
 let s={jobs:{},schedule:{},usage:{}},calls=0;
 const e=createExecutive({env:{ULTRON_EXECUTIVE_ENABLED:'true',OPENAI_API_KEY:'fixture'},clock:()=>time,read:async()=>s,mutate:async fn=>fn(s),memory:{context:async()=>{throw Error('Memory unavailable')}},request:async()=>{calls++;throw Error('Must not dispatch')}});
 await e.enqueue({kind:'research',prompt:'Research',memoryScope:'a'});assert.equal((await e.tick()).status,'BLOCKED');assert.equal(calls,0);
});
test('HTTP memory routes deny every unauthorized operation before storage access',async()=>{
 const app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 try{for(const [action,method] of [['save','POST'],['search','POST'],['relate','POST'],['context','POST'],['snapshot','GET']]){const r=await fetch(base+'/api/company-memory/v47/'+action+'?scope=a',{method});assert.equal(r.status,403)}assert.equal((await fetch(base+'/workbench')).status,200)}finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
test('isolated PostgreSQL memory survives restart and serializes competing edits',async()=>{
 assert.ok(process.env.DATABASE_URL,'Isolated PostgreSQL test database required');
 const url=new URL(process.env.DATABASE_URL);assert.match(url.hostname,/^(localhost|127\.0\.0\.1)$/);assert.match(url.pathname,/test/i);
 // Use production state-store transactions under a unique key; no global truncate.
 const {getJson,mutateJson}=await import('./state-store.mjs');const scope='test-'+randomUUID();
 const make=()=>createCompanyMemory({clock:()=>time,read:k=>getJson(k,{revision:0,documents:{},relations:[],audit:[]}),mutate:(k,fn)=>mutateJson(k,{revision:0,documents:{},relations:[],audit:[]},fn)});
 const first=make();await first.save(scope,doc());
 const results=await Promise.allSettled(Array.from({length:8},(_,i)=>first.save(scope,doc({text:'Concurrent edit '+i,expectedVersion:1}))));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,7);
 const restarted=make();assert.equal((await restarted.snapshot(scope)).documents[0].version,2);
 const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});try{await pool.query('DELETE FROM ultron_state WHERE key=$1',['company-memory-v47:'+scope])}finally{await pool.end()}
});
