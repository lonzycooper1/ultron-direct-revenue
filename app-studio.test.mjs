import test from 'node:test';import assert from 'node:assert/strict';import JSZip from 'jszip';import {randomUUID} from 'node:crypto';import {writeFile,mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';
import {createAppStudio,budgetSummary} from './app-studio.mjs';import {appDocument,resumeFeedback,runnerStep} from './app-studio-templates.mjs';import {competitorEvidence,compareTravelQuotes,messageRiskTriage} from './source-business-tools.mjs';import {getJson,mutateJson} from './state-store.mjs';import {createApp} from './server.js';
const now=Date.parse('2026-10-23T23:00:00Z'),spec={id:'fixture',title:'Original fixture',brief:'Owner-controlled original workflow',kind:'crm',originalityConfirmed:true};
function memory(){let s={apps:{}};return {read:async()=>structuredClone(s),mutate:async f=>f(s)}}
test('working private app creation and records are idempotent, versioned and persist on restart',async()=>{
 const key='app-studio-test-'+randomUUID(),store={read:()=>getJson(key,{apps:{}}),mutate:f=>mutateJson(key,{apps:{}},f)},a=createAppStudio(store);await a.create(spec);assert.equal((await a.create(spec)).version,1);await assert.rejects(a.create({...spec,brief:'Changed'}),/Conflict/);
 const b={appId:'fixture',recordId:'company1',expectedVersion:0,data:{company:'Synthetic service',stage:'NEW',source:'Controlled fixture',nextAction:'Review consent'}};await a.save(b);assert.equal((await a.save(b)).version,1);
 const restarted=createAppStudio(store);assert.equal((await restarted.snapshot()).apps[0].records.company1.data.stage,'NEW');
 const results=await Promise.allSettled(['REVIEWED','QUALIFIED'].map(stage=>restarted.save({...b,expectedVersion:1,data:{...b.data,stage}})));assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
 await assert.rejects(a.create({...spec,id:'__proto__'}));
});
test('six original app packages contain runnable source, PWA files and no saved private records',async()=>{
 const a=createAppStudio(memory()),dir=await mkdtemp(join(tmpdir(),'app-studio-test-'));
 try{for(const kind of ['crm','board','budget','resume','image','game']){await a.create({...spec,id:kind,kind});const pkg=await a.bundle(kind),zip=await JSZip.loadAsync(pkg.bytes);assert.ok(zip.file('manifest.webmanifest'));assert.ok(zip.file('sw.js'));const html=await zip.file('index.html').async('string');assert.match(html,/<script>/);const code=html.match(/<script>([\s\S]*?)<\/script>/)[1],file=join(dir,kind+'.mjs');await writeFile(file,code);execFileSync(process.execPath,['--check',file]);assert.equal(html.includes('Synthetic service'),false)}}finally{await rm(dir,{recursive:true,force:true})}
 assert.ok(!appDocument({...spec,kind:'resume'},{installable:false}).includes('serviceWorker.register'));
});
test('untrusted titles are escaped; literal resume feedback and perspective game behave deterministically',()=>{
 assert.ok(!appDocument({...spec,title:'</title><script>alert(1)</script>',kind:'resume'}).includes('<script>alert(1)'));
 const r=resumeFeedback('JavaScript and PostgreSQL','JavaScript PostgreSQL Python');assert.ok(r.missing.includes('python'));assert.equal('fitScore' in r,false);
 const next=runnerStep({x:.6,z:.01,target:.6,score:0},0);assert.equal(next.score,1);assert.equal(runnerStep({...next,x:1},1).x,1);
});
test('budget unknowns stay unknown and estimates remain distinct from actual values',()=>{
 const r=budgetSummary([{basis:'ACTUAL',kind:'INCOME',amountCents:100},{basis:'ACTUAL',kind:'EXPENSE',amountCents:null},{basis:'ESTIMATE',kind:'EXPENSE',amountCents:50}]);assert.equal(r.recordedActualNetCents,null);assert.equal(r.estimatedExpenseCents,50);assert.equal(r.bankSettlementVerified,false);
});
const domain={domain:'example.com',provider:'Controlled export',source:'https://example.com/report',basis:'PROVIDER_ESTIMATE',observedAt:'2026-10-23',periodStart:'2026-09-01',periodEnd:'2026-09-30',country:'US',device:'TOTAL',visits:100,channels:[{channel:'organic',sharePct:60}],evidence:[]};
test('competitor comparisons refuse mismatched periods, stale ranking and ungrounded channel shares',()=>{
 assert.equal(competitorEvidence({domains:[domain,{...domain,domain:'other.example',country:'GB'}]},now).ranking,null);
 assert.equal(competitorEvidence({domains:[{...domain,observedAt:'2026-08-01'}]},now).records[0].freshness,'STALE');
 assert.throws(()=>competitorEvidence({domains:[{...domain,channels:[{channel:'x',sharePct:101}]}]},now));
});
test('travel costs must be complete and fresh before ranking, with no booking side effects',()=>{
 const q={itinerary:'FIXTURE',provider:'Fixture airline',source:'https://example.com/quote',currency:'USD',observedAt:'2026-10-23T22:59:00Z',fareCents:900,taxCents:100,baggageCents:200,seatCents:0,bookingCents:0,otherCents:0,restrictions:'Controlled quote, not actual availability'};
 const r=compareTravelQuotes({itinerary:'FIXTURE',quotes:[q,{...q,baggageCents:null}]},now);assert.equal(r.ranked.length,1);assert.equal(r.ranked[0].totalCents,1200);assert.equal(r.availabilityRechecked,false);
 assert.throws(()=>compareTravelQuotes({itinerary:'OTHER',quotes:[q,q]},now));
});
test('message rules identify concerns without storing message text or declaring it safe',async()=>{
 const a=createAppStudio({...memory(),clock:()=>now}),r=await a.analyze({id:'msg',kind:'message',input:{message:'Urgent: send the verification code immediately using a gift card.',authorizationConfirmed:true}});
 assert.ok(r.value.findings.length>=2);assert.equal(JSON.stringify(await a.snapshot()).includes('Urgent:'),false);assert.match(messageRiskTriage({message:'A routine greeting.',authorizationConfirmed:true}).status,/NOT_A_SAFETY_VERDICT/);
});
test('HTTP app records and source exports preserve owner authorization',async()=>{
 const app=createApp({ownerSessions:{route:async()=>false,direct:r=>r.headers.authorization==='Bearer fixture',authenticated:async()=>false}}).listen(0,'127.0.0.1');await new Promise(r=>app.once('listening',r));const base='http://127.0.0.1:'+app.address().port;
 try{assert.equal((await fetch(base+'/app-studio')).status,200);assert.equal((await fetch(base+'/api/app-studio/snapshot')).status,403);assert.equal((await fetch(base+'/api/app-studio/bundle?id=x')).status,403);const source=await(await fetch(base+'/api/app-studio/source')).json();assert.equal(source.slides.length,10);const r=await fetch(base+'/api/app-studio/create',{method:'POST',headers:{authorization:'Bearer fixture','content-type':'application/json'},body:JSON.stringify({...spec,id:randomUUID()})});assert.equal(r.status,200)}finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
