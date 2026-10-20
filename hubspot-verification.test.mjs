import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyHubSpot} from './hubspot-verification.mjs';
test('missing credential never makes a provider request',async()=>{
 const r=await verifyHubSpot({env:{},fetchImpl:()=>assert.fail('unexpected request')});
 assert.equal(r.category,'NOT_CONFIGURED');assert.equal(r.readVerified,false);
});
test('read probe uses the fixed HTTPS provider and returns no contact data or credential',async()=>{
 const r=await verifyHubSpot({env:{ULTRON_HUBSPOT_PRIVATE_APP_TOKEN:'secret-test-value'},fetchImpl:async(url,opts)=>{
  assert.equal(url,'https://api.hubapi.com/crm/v3/objects/contacts?limit=1&properties=createdate');
  assert.equal(opts.method,'GET');assert.equal(opts.redirect,'error');assert.equal(opts.headers.authorization,'Bearer secret-test-value');
  return {ok:true,status:200,json:async()=>({results:[{id:'private-id',properties:{email:'private@example.com'}}]})};
 }});
 assert.equal(r.readVerified,true);assert.equal(r.writeVerified,false);
 assert.doesNotMatch(JSON.stringify(r),/secret-test-value|private-id|private@example/);
});
for(const [status,category] of [[401,'CREDENTIAL_REJECTED'],[403,'SCOPE_OR_ACCOUNT_ACCESS_DENIED'],[429,'RATE_LIMITED'],[500,'PROVIDER_ERROR']])test(`provider ${status} is sanitized`,async()=>{
 const r=await verifyHubSpot({env:{ULTRON_HUBSPOT_PRIVATE_APP_TOKEN:'x'},fetchImpl:async()=>({ok:false,status,json:()=>assert.fail('must not read error body')})});
 assert.equal(r.category,category);assert.equal(r.httpStatus,status);assert.equal(r.readVerified,false);
});
test('malformed success and thrown provider errors cannot claim connectivity',async()=>{
 for(const fetchImpl of [async()=>({ok:true,status:200,json:async()=>({})}),async()=>{throw Error('credential and private response')}]){
  const r=await verifyHubSpot({env:{ULTRON_HUBSPOT_PRIVATE_APP_TOKEN:'x'},fetchImpl});
  assert.equal(r.readVerified,false);assert.doesNotMatch(JSON.stringify(r),/credential and private response/);
 }
});
