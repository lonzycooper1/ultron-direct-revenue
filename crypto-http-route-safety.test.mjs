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
    env:{...process.env,PORT:String(port),CRYPTO_APPROVAL_SECRET:token,CRYPTO_PROVIDER:'crypto-com-app',CDC_API_KEY:'',CDC_API_SECRET:'',CRYPTOCOM_API_KEY:'exchange-key-must-be-ignored',CRYPTOCOM_API_SECRET:'exchange-secret-must-be-ignored',CRYPTOCOM_LIVE_TRADING:'false',CRYPTO_AUTONOMOUS_LIVE_ORDERS:'false'},
    stdio:['ignore','pipe','pipe']
  });
  let stderr='';
  child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-3000)});
  try{
    await waitForHealth(base,child);
    for(const [path,method] of [['/state','GET'],['/cycle','POST'],['/api/proposals','POST'],['/api/exchange/verify','POST'],['/api/app/verify','POST'],['/api/provider/verify','POST'],['/api/app/readiness','POST'],['/api/app/quotes','POST'],['/api/app/quotes/00000000-0000-4000-8000-000000000001','GET'],['/api/app/quotes/00000000-0000-4000-8000-000000000001/review','POST'],['/api/proposals/00000000-0000-4000-8000-000000000001/approve','POST']]){
      const response=await fetch(base+path,{method,headers:{'content-type':'application/json'},body:method==='POST'?'{}':undefined,signal:AbortSignal.timeout(2000)});
      assert.equal(response.status,401,path+' must reject unauthenticated requests; '+stderr);
    }
    // Parse the shipped browser script, not just the Node server file.
    // Corrupt server-side route text inside this inline script previously
    // passed node --check while breaking the dashboard in browsers.
    const dashboardResponse=await fetch(base+'/dashboard',{signal:AbortSignal.timeout(2000)});
    assert.equal(dashboardResponse.status,200);
    const dashboard=await dashboardResponse.text();
    const scripts=[...dashboard.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length,1,'research dashboard must supply one browser script');
    assert.doesNotMatch(scripts[0][1],/const u=new URL\(req\.url/,'server-side router code must not leak into browser JS');
    assert.doesNotThrow(()=>new Function(scripts[0][1]),'browser dashboard script must parse');
    assert.match(dashboard,/research only; trading disabled/,'research status must not promise executable orders');
    const approvalResponse=await fetch(base+'/approval?key='+encodeURIComponent(token),{signal:AbortSignal.timeout(2000)});
    assert.equal(approvalResponse.status,200);
    const approvalHtml=await approvalResponse.text();
    assert.match(approvalHtml,/history\.replaceState/,'owner secret should be cleared from visible navigation');
    assert.ok(!approvalHtml.includes("fetch('/api/proposals?key="),'approval API requests must not send secret in query');
    assert.match(approvalHtml,/disabled[^>]*>Order proposal unavailable/,'orders must visibly remain disabled');
    const allowed=await fetch(base+'/state',{headers:{'x-ultron-approval-key':token},signal:AbortSignal.timeout(2000)});
    assert.equal(allowed.status,200,'authenticated owner must retain state access');
    assert.equal((await allowed.json()).mode,'live-market-research');
    const headers={'x-ultron-approval-key':token};
    assert.equal((await fetch(base+'/api/exchange/verify',{headers})).status,405);
    const verification=await fetch(base+'/api/exchange/verify',{method:'POST',headers});
    assert.equal(verification.status,503);
    const evidence=await verification.json();
    assert.equal(evidence.verification.reason,'CREDENTIALS_MISSING');
    assert.equal(evidence.liveOrders,false);
    assert.equal(evidence.verification.provider,'Crypto.com App');
    for(const path of ['/api/app/verify','/api/provider/verify']){
      const r=await fetch(base+path,{method:'POST',headers});
      assert.equal(r.status,503);
      assert.equal((await r.json()).verification.provider,'Crypto.com App');
    }
    const health=await (await fetch(base+'/health')).json();
    assert.equal(health.providerId,'crypto-com-app');
    assert.equal(health.apiConfigured,false);
    assert.equal(evidence.scope,'READ_ONLY_ACCOUNT_ACCESS');
    for(const path of ['/health','/opportunities']){
      const response=await fetch(base+path,{signal:AbortSignal.timeout(2000)});
      assert.equal(response.status,200,path+' should remain public for non-sensitive status');
    }
  }finally{
    child.kill('SIGTERM');
    await new Promise(resolve=>{if(child.exitCode!==null||child.signalCode!==null)return resolve();child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve()},1200).unref()});
  }
});
