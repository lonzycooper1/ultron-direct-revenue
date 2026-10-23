import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createServer} from 'node:http';
import {attachShutdown} from './service-lifecycle.mjs';
test('shutdown drains an actual pending HTTP response and worker before reporting clean exit',async()=>{
 let started,release,exited,admission=false;const active=new Promise(r=>started=r),pending=new Promise(r=>release=r),exitPromise=new Promise(r=>exited=r),logs=[];
 const server=createServer(async(req,res)=>{started();await pending;res.end('finished')}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const response=fetch('http://127.0.0.1:'+server.address().port);await active;
 const life=attachShutdown(server,{signals:new EventEmitter(),beforeClose:()=>{admission=true},drain:()=>pending,exit:exited,log:x=>logs.push(x),timeoutMs:1000});
 const closing=life.shutdown('SIGTERM');assert.equal(life.isStopping(),true);release();assert.equal(await (await response).text(),'finished');await closing;assert.equal(await exitPromise,0);assert.equal(admission,true);assert.equal(logs.at(-1).phase,'drained');
});
test('shutdown deadline marks unfinished work for reconciliation without clearing leases',async()=>{
 let exit,forced=false;const done=new Promise(r=>exit=r),logs=[];const server={close:()=>{},closeAllConnections:()=>{forced=true}};
 attachShutdown(server,{signals:new EventEmitter(),timeoutMs:15,exit,log:x=>logs.push(x)}).shutdown('SIGTERM');
 const keepAlive=setTimeout(()=>{},100);assert.equal(await done,0);clearTimeout(keepAlive);assert.equal(forced,true);assert.equal(logs.at(-1).unfinishedWork,'REQUIRES_DURABLE_RECONCILIATION');
});
