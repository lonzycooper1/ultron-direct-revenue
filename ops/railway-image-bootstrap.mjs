// Supported image-source fallback for Railway build-service outages.
// Run this self-contained module with the official Node 22 Alpine image.
// It downloads a pinned public source commit; no credentials enter build tools.
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';

const commit=process.env.ULTRON_BOOTSTRAP_COMMIT;
const manifest=JSON.parse(process.env.ULTRON_BOOTSTRAP_MANIFEST||'null');
if(!/^[a-f0-9]{40}$/.test(commit||'')||!manifest||typeof manifest!=='object'||Array.isArray(manifest))throw Error('Pinned source commit and checksum manifest required');
const required=['package.json','package-lock.json','crypto-bot-runtime.mjs','crypto-app.mjs','crypto-app-approval.mjs','crypto-provider.mjs','crypto-readiness.mjs','crypto-order-gateway.mjs','crypto-reserved-dispatch.mjs','crypto-durable-safety.mjs','crypto-live-approval.mjs','crypto-bots.mjs','crypto-opportunity-engine.mjs','crypto-exchange.mjs','crypto-trade-history.mjs'];
if(Object.keys(manifest).length!==required.length||required.some(p=>!/^[a-f0-9]{64}$/.test(manifest[p]||'')))throw Error('Complete runtime checksum manifest required');
const root=mkdtempSync(join(tmpdir(),'ultron-release-'));
let child;
try{
  const url='https://codeload.github.com/lonzycooper1/ultron-direct-revenue/tar.gz/'+commit;
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!response.ok||!response.body)throw Error('Pinned public source download failed');
  const chunks=[];let size=0;
  for await(const chunk of response.body){size+=chunk.byteLength;if(size>50*1024*1024)throw Error('Source archive exceeds maximum size');chunks.push(chunk)}
  const archive=join(root,'source.tar.gz');writeFileSync(archive,Buffer.concat(chunks));
  const cleanEnv={PATH:process.env.PATH,HOME:root,NODE_ENV:'production'};
  const extracted=spawnSync('tar',['-xzf',archive,'--strip-components=1','-C',root],{env:cleanEnv,stdio:'inherit',timeout:15000});
  if(extracted.error||extracted.status!==0)throw Error('Source archive extraction failed');
  for(const path of required){
    const actual=createHash('sha256').update(readFileSync(join(root,path))).digest('hex');
    if(actual!==manifest[path])throw Error('Pinned runtime checksum mismatch');
  }
  const installed=spawnSync('npm',['ci','--omit=dev','--ignore-scripts','--no-audit','--no-fund'],{cwd:root,env:cleanEnv,stdio:'inherit',timeout:75000});
  if(installed.error||installed.status!==0)throw Error('Locked dependency installation failed');
  console.log('ULTRON verified public source commit='+commit+' runtimeSha256='+manifest['crypto-bot-runtime.mjs']);
  child=spawn(process.execPath,['crypto-bot-runtime.mjs'],{cwd:root,env:{...process.env,ULTRON_RELEASE_COMMIT:commit},stdio:'inherit'});
  const forward=signal=>{if(child&&!child.killed)child.kill(signal)};
  process.on('SIGTERM',()=>forward('SIGTERM'));process.on('SIGINT',()=>forward('SIGINT'));
  const exit=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',(code,signal)=>resolve(signal?1:code??1))});
  rmSync(root,{recursive:true,force:true});process.exitCode=exit;
}catch{
  if(child&&!child.killed)child.kill('SIGTERM');
  rmSync(root,{recursive:true,force:true});
  console.error('ULTRON pinned image bootstrap failed; refusing to start an unverified release');
  process.exitCode=1;
}
