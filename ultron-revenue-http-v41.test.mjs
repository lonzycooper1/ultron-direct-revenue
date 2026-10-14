import test from 'node:test';import assert from 'node:assert/strict';
import {createApp} from './server.js';
test('customer routes render scope and redirect legacy $500 checkout to intake without creating an order',async()=>{
 const app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 try{
  const legacy=await fetch(base+'/buy?product=ai-revenue-audit-500',{redirect:'manual'});assert.equal(legacy.status,303);assert.equal(legacy.headers.get('location'),'/audit-intake');
  const page=await fetch(base+'/audit-intake');assert.equal(page.status,200);assert.match(await page.text(),/five business days/);
  const terms=await fetch(base+'/audit-terms');assert.equal(terms.status,200);assert.match(await terms.text(),/Refunds require individual review/);
 }finally{app.closeAllConnections();await new Promise(r=>app.close(r));}
});
test('unauthenticated review and invalid public checkout fail before database or provider effects',async()=>{
 const app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 try{
  const review=await fetch(base+'/api/audit/v41/review',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(review.status,403);
  const checkout=await fetch(base+'/api/audit/v41/checkout',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(checkout.status,400);assert.match((await checkout.json()).error,/terms/);
  const invalid=await fetch(base+'/api/audit/v41/checkout',{method:'POST',body:'{}'});assert.equal(invalid.status,415);
 }finally{app.closeAllConnections();await new Promise(r=>app.close(r));}
});
