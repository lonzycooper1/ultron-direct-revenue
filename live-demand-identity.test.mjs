import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchPublicDemand} from './live-demand-v46.mjs';

test('distinct Hacker News discussions retain exact source identity and deduplicate repeats',async()=>{
 const now=Date.parse('2026-10-20T12:00:00Z');
 const hit=id=>({objectID:id,title:'Ask HN: How do you manage customer booking?',story_text:'Our manual appointment workflow needs a reliable customer follow-up process.',created_at:'2026-10-20T10:00:00Z'});
 const request=async()=>new Response(JSON.stringify({hits:[hit('12345'),hit('67890'),hit('12345'),hit(''),hit('invalid')]}),{headers:{'content-type':'application/json'}});
 const result=await fetchPublicDemand({request,now,sources:[{name:'hacker-news'}]});
 assert.deepEqual(result.signals.map(x=>x.url),['https://news.ycombinator.com/item?id=12345','https://news.ycombinator.com/item?id=67890']);
 assert.notEqual(result.signals[0].id,result.signals[1].id);
 assert.ok(result.signals.every(x=>x.permissionToContact===false&&x.independentlyVerifiedBuyer===false));
});

test('GitHub request fits a small page and preserves evidence without contact permission',async()=>{
 const now=Date.parse('2026-10-20T12:00:00Z');
 const request=async url=>{
  assert.equal(new URL(url).searchParams.get('per_page'),'3');
  return new Response(JSON.stringify({items:[{title:'Manual appointment follow-up needs improvement',body:'We manually handle customer bookings and need reliable appointment follow-up.',html_url:'https://github.com/example/service/issues/12',created_at:'2026-10-20T10:00:00Z'}]}),{headers:{'content-type':'application/json'}});
 };
 const result=await fetchPublicDemand({request,now,sources:[{name:'github-issues'}]});
 assert.equal(result.partial,false);assert.equal(result.signals.length,1);
 assert.equal(result.signals[0].permissionToContact,false);
});

test('oversized chunked feed is cancelled before reading its entire body',async()=>{
 let cancelled=false,pulls=0;
 const body=new ReadableStream({pull(controller){pulls++;controller.enqueue(new Uint8Array(80000))},cancel(){cancelled=true}});
 const result=await fetchPublicDemand({request:async()=>new Response(body,{headers:{'content-type':'application/json'}}),sources:[{name:'github-issues'}]});
 assert.equal(result.partial,true);assert.equal(result.signals.length,0);
 assert.match(result.errors[0].reason,/ingestion limit/);
 assert.equal(cancelled,true);assert.ok(pulls<=3);
});
