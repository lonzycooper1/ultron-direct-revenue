import test from 'node:test';
import assert from 'node:assert/strict';
import {createOwnerSessions} from './owner-sessions.mjs';
import {createApp} from './server.js';
function fixture(){let state={sessions:{}},now=Date.now();const secret='fixture-owner-high-entropy',origin='https://merchant.example';
 const options={secret,origin,clock:()=>now,read:async()=>structuredClone(state),mutate:async fn=>fn(state)};
 return {options,secret,origin,state,get now(){return now},advance(){now+=8*24*3600*1000}};
}
async function serverFor(sessions){const server=createApp({ownerSessions:sessions}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));return {base:'http://127.0.0.1:'+server.address().port,close:()=>{server.closeAllConnections();return new Promise(r=>server.close(r))}}}
test('owner session survives service restart, stores only hashes and blocks cross-origin private reads',async()=>{
 const f=fixture(),s=await serverFor(createOwnerSessions(f.options));
 try{
  const denied=await fetch(s.base+'/api/owner/session',{method:'POST',headers:{origin:f.origin}});assert.equal(denied.status,403);
  const login=await fetch(s.base+'/api/owner/session',{method:'POST',headers:{origin:f.origin,authorization:'Bearer '+f.secret}});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie');assert.match(cookie,/^__Host-ultron-owner=/);for(const flag of ['HttpOnly','Secure','SameSite=Strict','Path=/','Max-Age=604800'])assert.ok(cookie.includes(flag));
  const value=cookie.split(';')[0],restarted=createOwnerSessions(f.options);
  assert.doesNotMatch(JSON.stringify(f.state),new RegExp(f.secret));assert.ok(!JSON.stringify(f.state).includes(value.split('=')[1]));
  assert.equal(await restarted.authenticated({headers:{cookie:value,'sec-fetch-site':'same-origin'}}),true);
  for(const headers of [{cookie:value},{cookie:value,origin:'https://evil.example'},{cookie:value,'sec-fetch-site':'same-site'},{cookie:value,origin:f.origin,'sec-fetch-site':'cross-site'},{cookie:value+'; '+value,'sec-fetch-site':'same-origin'}])assert.equal(await restarted.authenticated({headers}),false);
  const authenticated=createOwnerSessions(f.options),wrapped=await serverFor(authenticated);
  try{const headers={cookie:value,'sec-fetch-site':'same-origin'};
   const protectedResponse=await fetch(wrapped.base+'/api/company-memory/v47/snapshot?scope=fixture',{headers});assert.notEqual(protectedResponse.status,403);
   assert.equal((await fetch(wrapped.base+'/api/owner/session',{headers})).status,200);
   assert.equal((await fetch(wrapped.base+'/api/owner/session',{method:'DELETE',headers:{...headers,origin:'https://evil.example'}})).status,403);
   assert.equal((await fetch(wrapped.base+'/api/owner/session',{method:'DELETE',headers:{...headers,origin:f.origin}})).status,200);
   assert.equal(await restarted.authenticated({headers}),false);
  }finally{await wrapped.close()}
 }finally{await s.close()}
});
test('sessions expire, revoke on credential rotation and cannot be issued cross-origin or over HTTP origin',async()=>{
 const f=fixture();const run=async options=>{const s=await serverFor(createOwnerSessions(options));try{return await fetch(s.base+'/api/owner/session',{method:'POST',headers:{origin:f.origin,authorization:'Bearer '+f.secret}})}finally{await s.close()}};
 assert.equal((await run({...f.options,origin:'http://merchant.example'})).status,403);
 const s=await serverFor(createOwnerSessions(f.options));try{
  assert.equal((await fetch(s.base+'/api/owner/session',{method:'POST',headers:{origin:'https://evil.example',authorization:'Bearer '+f.secret}})).status,403);
  const r=await fetch(s.base+'/api/owner/session',{method:'POST',headers:{origin:f.origin,authorization:'Bearer '+f.secret}}),headers={cookie:r.headers.get('set-cookie').split(';')[0],'sec-fetch-site':'same-origin'};
  assert.equal(await createOwnerSessions({...f.options,secret:'rotated-fixture'}).authenticated({headers}),false);
  f.advance();assert.equal(await createOwnerSessions(f.options).authenticated({headers}),false);
 }finally{await s.close()}
});
