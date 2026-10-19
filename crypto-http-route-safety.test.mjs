import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

async function unusedPort(){
  const server=createServer();
  await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  await new Promise(resolve=>server.close(resolve));
  return port;
}
async function waitForHealth(base,child){
  for(let attempt=0;attempt<100;attempt++){
    if(child.exitCode!==null)throw Error('Crypto server exited before health check');
    try{const r=await fetch(base+'/health',{signal:AbortSignal.timeout(600)});if(r.ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  throw Error('Crypto server health endpoint did not become available');
}
test('crypto HTTP owner-only state and manual cycles reject unauthenticated users', {timeout:15000}, async()=>{
  const port=await unusedPort();
  const base='http://127.0.0.1:'+port;
  const token='isolated-ci-owner-token';
  const child=spawn(process.execPath,['crypto-bot-runtime.mjs'],{
    cwd:dirname(fileURLToPath(import.meta.url)),
    env:{...process.env,PORT:String(port),CRYPTO_APPROVAL_SECRET:token,CRYPTOCOM_LIVE_TRADING:'false',CRYPTO_AUTONOMOUS_LIVE_ORDERS:'false'},
    stdio:['ignore','pipe','pipe']
  });
  let stderr='';
  child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-3000)});
  try{
    await waitForHealth(base,child);
    for(const [path,method] of [['/state','GET'],['/cycle','POST'],['/api/proposals','POST']]){
      const response=await fetch(base+path,{method,headers:{'content-type':'application/json'},body:method==='POST'?'{}':undefined,signal:AbortSignal.timeout(2000)});
      assert.equal(response.status,401,path+' must reject unauthenticated requests; '+stderr);
    }
    const allowed=await fetch(base+'/state',{headers:{'x-ultron-approval-key':token},signal:AbortSignal.timeout(2000)});
    assert.equal(allowed.status,200,'authenticated owner must retain state access');
    assert.equal((await allowed.json()).mode,'live-market-research');
    for(const path of ['/health','/opportunities']){
      const response=await fetch(base+path,{signal:AbortSignal.timeout(2000)});
      assert.equal(response.status,200,path+' should remain public for non-sensitive status');
    }
  }finally{
    child.kill('SIGTERM');
    await new Promise(resolve=>{if(child.exitCode!==null||child.signalCode!==null)return resolve();child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve()},1200).unref()});
  }
});
