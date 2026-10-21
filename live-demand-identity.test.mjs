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
