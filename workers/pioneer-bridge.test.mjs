import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {pioneerCall} from './pioneer-bridge.mjs';
test('real Python bridge persists, executes and retrieves a deterministic task without credentials',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ultron-pioneer-'));const env={ULTRON_PIONEER_STATE_DIR:dir};
 try{
  const input={id:'parse:bridge',kind:'task',payload:{kind:'parse_json',text:'{"count":7}',data_class:'public'}};
  assert.equal((await pioneerCall('enqueue',input,{env})).status,'QUEUED');
  assert.equal((await pioneerCall('pulse',{}, {env})).processed[0].status,'DRAFT_READY');
  const saved=await pioneerCall('job',{id:input.id},{env});assert.equal(JSON.parse(saved.result.text).count,7);
  const status=await pioneerCall('status',{}, {env});assert.equal(status.compute.configuredNodes.length,0);assert.equal(status.reservedOrObservedUsd,0);assert.equal(status.financialTransactionsExecuted,false);
  await assert.rejects(pioneerCall('generate',{kind:'parse_json',text:'{}',data_class:'internal'},{env}));
  await assert.rejects(pioneerCall('transfer',{}, {env}));
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('existing HTTP owner boundary protects all pioneer routes',async()=>{
 const {createApp}=await import('../server.js');const app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));
 try{const base='http://127.0.0.1:'+app.address().port;for(const [path,method] of [['/api/pioneer/status','GET'],['/api/pioneer/jobs/x','GET'],['/api/pioneer/jobs','POST']])assert.equal((await fetch(base+path,{method})).status,403)}finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
