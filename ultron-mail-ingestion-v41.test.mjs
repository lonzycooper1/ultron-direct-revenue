import test from 'node:test';import assert from 'node:assert/strict';
import {ingestReplies,scopedIncoming} from './ultron-mail-ingestion-v41.mjs';
const sent={status:'SENT',ownerApprovedAt:'2026-10-14',to:'buyer@fixture-business.org',prospectId:'P1',providerThreadId:'T1'};
const message=(body='Please stop emailing me')=>({id:'M1',threadId:'T1',labelIds:['INBOX'],payload:{mimeType:'text/plain',headers:[{name:'From',value:'Buyer <buyer@fixture-business.org>'}],body:{data:Buffer.from(body).toString('base64url')}}});
test('only known approved contacted senders are eligible; opt-out in a new thread is retained',()=>{
 assert.ok(scopedIncoming(message(),[sent],{P1:{}}));assert.equal(scopedIncoming(message(),[],{P1:{}}),null);
 assert.ok(scopedIncoming({...message(),threadId:'T2'},[sent],{P1:{}}));assert.ok(scopedIncoming({...message('STOP'),threadId:'T2'},[sent],{P1:{}}));
 assert.equal(scopedIncoming({...message('Yes, interested'),threadId:'T2'},[sent],{P1:{}}),null);
});
test('bounce requires matching sent thread and recipient evidence',()=>{
 const b=message('Delivery failed for buyer@fixture-business.org');b.payload.headers[0].value='mailer-daemon@googlemail.com';
 assert.equal(scopedIncoming(b,[sent],{P1:{}}).bounce,true);
 assert.equal(scopedIncoming({...b,threadId:'unrelated'},[sent],{P1:{}}),null);
});
test('disabled ingestion never reads inbox or obtains credentials',async()=>{
 const r=await ingestReplies({env:{},getToken:()=>{throw Error('must not run')}});assert.equal(r.status,'OWNER_ENABLE_REQUIRED');
});
test('mismatched OAuth mailbox blocks before message list',async()=>{
 let calls=0;await assert.rejects(ingestReplies({env:{ULTRON_GMAIL_INGEST_ENABLED:'true',ULTRON_GMAIL_REFRESH_TOKEN:'LOCAL',ULTRON_BUSINESS_SENDER:'sender@fixture-business.org'},growthRead:async()=>({outbox:{a:sent},prospects:{P1:{}}}),getToken:async()=>'LOCAL',fetchImpl:async()=>{calls++;return {ok:true,json:async()=>({emailAddress:'wrong@fixture-business.org'})}}}),/does not match/);assert.equal(calls,1);
});
test('provider read is bounded and repeated reply is deduplicated without sends',async()=>{
 const state={seen:{}},received=[],calls=[];
 const deps={env:{ULTRON_GMAIL_INGEST_ENABLED:'true',ULTRON_GMAIL_REFRESH_TOKEN:'LOCAL',ULTRON_BUSINESS_SENDER:'sender@fixture-business.org'},growthRead:async()=>({outbox:{a:sent},prospects:{P1:{}}}),getToken:async()=>'LOCAL',stateRead:async()=>state,stateMutate:async f=>f(state),onReply:async x=>{received.push(x);return {classification:'OPT_OUT'}},fetchImpl:async u=>{calls.push(u);return {ok:true,json:async()=>u.endsWith('profile')?{emailAddress:'sender@fixture-business.org'}:u.includes('messages?')?{messages:[{id:'M1'}]}:message()}}};
 assert.equal((await ingestReplies(deps)).processed,1);assert.equal((await ingestReplies(deps)).processed,0);assert.equal(received.length,1);assert.equal(received[0].source,'GMAIL_API_READ');
 assert.ok(calls.some(u=>u.includes('maxResults=20')));assert.equal(state.lastStatus,'SCOPED_READ_COMPLETED');
});
