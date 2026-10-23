import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {createSupportIntake} from './support-intake.mjs';import {freshOps} from './ultron-revenue-operations-v41.mjs';import {getJson,mutateJson} from './state-store.mjs';import {createApp} from './server.js';
const input={email:'fixture@example.test',message:'Controlled support question about a PDF download.',orderReference:'UNVERIFIED-FIXTURE',kind:'DELIVERY',requestId:'fixture-request-123456',serviceContactConsent:true};
function memory(){let s=freshOps();return {read:async()=>structuredClone(s),mutate:async f=>f(s)}}
test('public support persists a private owner task, deduplicates retry and never verifies buyer or resolution',async()=>{
 const store=memory(),app=createSupportIntake(store),a=await app.submit(input);assert.equal((await app.submit(input)).ticketId,a.ticketId);
 assert.equal(a.status,'QUEUED_NOT_RESOLVED');assert.equal('email' in a,false);const s=await store.read();assert.equal(s.tasks[a.ticketId].providerVerified,false);
 assert.equal((await app.snapshot())[0].source,'UNVERIFIED_PUBLIC_SUPPORT_REQUEST');
 await assert.rejects(app.submit({...input,message:'Changed payload with same identity'}),/identity/);
 assert.equal((await app.review({id:a.ticketId,status:'OWNER_REPORTED_RESOLVED',reference:'Controlled review reference'})).replySent,false);
});
test('support refuses missing consent, credential content and daily overflow without allowing refund execution',async()=>{
 const app=createSupportIntake(memory());await assert.rejects(app.submit({...input,serviceContactConsent:false}));await assert.rejects(app.submit({...input,message:'password=not-for-storage'}),/credentials/);
 for(let i=0;i<3;i++)await app.submit({...input,requestId:'fixture-request-12345'+i,kind:'REFUND_REVIEW'});
 await assert.rejects(app.submit({...input,requestId:'fixture-request-123459'}),/Daily/);
 await assert.rejects(app.review({id:'missing',status:'REFUND_SENT',reference:'fixture'}));
});
test('support queue and recorded owner review survive isolated PostgreSQL module restart',async()=>{
 const key='support-intake-test-'+randomUUID(),store={read:()=>getJson(key,freshOps()),mutate:f=>mutateJson(key,freshOps(),f)},a=createSupportIntake(store),r=await a.submit(input);
 const restarted=createSupportIntake(store);assert.equal((await restarted.snapshot())[0].id,r.ticketId);
 await restarted.review({id:r.ticketId,status:'OWNER_REVIEWED',reference:'Controlled review reference'});assert.equal((await createSupportIntake(store).snapshot())[0].status,'OWNER_REVIEWED');
});
test('HTTP support form works without exposing private queue or accepting oversized/hostile requests',async()=>{
 const app=createApp({ownerSessions:{route:async()=>false,direct:req=>req.headers.authorization==='Bearer fixture',authenticated:async()=>false}}).listen(0,'127.0.0.1');await new Promise(r=>app.once('listening',r));const base='http://127.0.0.1:'+app.address().port;
 try{
  assert.match(await(await fetch(base+'/support')).text(),/Submit support request/);
  assert.equal((await fetch(base+'/api/support/owner')).status,403);assert.equal((await fetch(base+'/api/support/owner/review',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,403);
  const r=await fetch(base+'/api/support/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...input,email:'fixture-'+randomUUID()+'@example.test',requestId:randomUUID()})});assert.equal(r.status,200);assert.equal('email' in await r.json(),false);
  assert.equal((await fetch(base+'/api/support/request',{method:'POST',headers:{'content-type':'application/json',origin:'https://evil.example'},body:'{}'})).status,403);
  assert.equal((await fetch(base+'/api/support/request',{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(6100)})).status,413);
 }finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
