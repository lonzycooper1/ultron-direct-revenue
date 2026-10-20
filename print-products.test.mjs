import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFile} from 'node:child_process';import {promisify} from 'node:util';import {createServer} from 'node:http';import {createPrintFactory,renderProduct,validateProduct} from './print-products.mjs';import {printProductRoute} from './print-products-http.mjs';import {getJson,mutateJson} from './state-store.mjs';
const run=promisify(execFile),input={type:'journal',title:'Focused Work Journal',audience:'Independent business owners',source:'Original fixture prompts',pages:30,requestId:'fixture-journal'};
function fixture(){let state={products:{}};return {factory:createPrintFactory({read:async()=>structuredClone(state),mutate:async fn=>{const next=structuredClone(state);await fn(next);state=next}}),corrupt(){Object.values(state.products)[0].pdf='YmFk'}}}
test('real PDF page count, text extraction and ZIP integrity match requested product',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ultron-print-'));try{
 for(const type of ['journal','planner','workbook','coloring','guide']){
  const f=fixture(),p=await f.factory.create({...input,type,requestId:type,...(type==='guide'?{sections:[{heading:'Prepare',body:'Collect the approved inputs and record their sources.'},{heading:'Review',body:'Check each output before delivering the final resource.'}]}:{})});
  const pdf=await f.factory.artifact(p.id),zip=await f.factory.artifact(p.id,'zip');await writeFile(join(dir,type+'.pdf'),pdf.bytes);await writeFile(join(dir,type+'.zip'),zip.bytes);
  const info=(await run('pdfinfo',[join(dir,type+'.pdf')])).stdout;assert.match(info,new RegExp('Pages:\\s+'+(type==='guide'?3:30)));assert.match(info,/612 x 792/);assert.match((await run('unzip',['-t',join(dir,type+'.zip')])).stdout,/No errors detected/);
  const extracted=(await run('pdftotext',[join(dir,type+'.pdf'),'-'])).stdout;assert.match(extracted,/Focused Work Journal/);assert.equal(p.manifest.publicationApproved,false);
 }
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('changed replays, tampering and unbound reviews fail closed',async()=>{
 const f=fixture(),p=await f.factory.create(input);assert.equal((await f.factory.create(input)).id,p.id);
 await assert.rejects(f.factory.create({...input,title:'Different'}),/identity/);
 await assert.rejects(f.factory.review(p.id,{reviewer:'Fixture reviewer',allPagesReviewed:true,rightsConfirmed:true,pdfSha256:'wrong'}),/exact PDF/);
 const reviewed=await f.factory.review(p.id,{reviewer:'Fixture reviewer',allPagesReviewed:true,rightsConfirmed:true,pdfSha256:p.manifest.pdfSha256});assert.equal(reviewed.status,'OWNER_REVIEWED_NOT_PUBLISHED');assert.equal(reviewed.manifest.customerAccepted,false);
 f.corrupt();await assert.rejects(f.factory.artifact(p.id),/integrity/);
 for(const patch of [{pages:1000},{title:'Unsupported \u2603'},{prompts:[42]},{source:''},{requestId:5}])assert.throws(()=>validateProduct({...input,...patch}));
});
test('HTTP authorizes before storage and provides private downloads',async()=>{
 let touched=false;const f=fixture(),app=createServer(async(req,res)=>{const json=(s,d)=>{res.writeHead(s,{'content-type':'application/json'});res.end(JSON.stringify(d))};if(!await printProductRoute(req,res,new URL(req.url,'http://local'),{authorized:()=>req.headers.authorization==='Bearer fixture-only',json,factory:{...f.factory,list:async()=>{touched=true;return f.factory.list()}}}))json(404,{})});
 await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 try{assert.equal((await fetch(base+'/api/print-products')).status,403);assert.equal(touched,false);
 const headers={authorization:'Bearer fixture-only','content-type':'application/json'};const r=await fetch(base+'/api/print-products',{method:'POST',headers,body:JSON.stringify(input)});assert.equal(r.status,200);const {product:p}=await r.json();const a=await fetch(base+'/api/print-products/artifact?id='+p.id,{headers});assert.equal(a.status,200);assert.equal(a.headers.get('cache-control'),'private,no-store');assert.equal(a.headers.get('content-type'),'application/pdf');assert.equal(Buffer.from(await a.arrayBuffer()).subarray(0,4).toString(),'%PDF');
 }finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
test('PostgreSQL concurrent creation survives factory restart without duplicate products',async()=>{
 const key='print-fixture-'+Date.now(),empty=()=>({products:{}}),opts={read:()=>getJson(key,empty()),mutate:fn=>mutateJson(key,empty(),fn)};
 const f=createPrintFactory(opts),results=await Promise.all(Array.from({length:4},()=>f.create(input)));assert.equal(new Set(results.map(r=>r.id)).size,1);
 const restarted=createPrintFactory(opts);assert.equal((await restarted.list()).length,1);assert.equal((await restarted.artifact(results[0].id)).bytes.subarray(0,4).toString(),'%PDF');
});
