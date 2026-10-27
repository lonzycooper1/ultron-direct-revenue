import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {getJson,setJson} from '../state-store.mjs';
let active=0,pulsePromise=null,healthCache=null,healthAt=0,stopping=false;const children=new Set();
const allowed=new Set(['health','status','job','classify','enqueue','pulse','generate']);
export function pioneerCall(action,payload={}, {env=process.env,key='',timeoutMs=230000}={}){
 if(stopping)return Promise.reject(Error('Pioneer shutting down'));
 if(!allowed.has(action))return Promise.reject(Error('Unsupported pioneer operation'));
 const body=JSON.stringify({action,payload});
 if(Buffer.byteLength(body)>131072)return Promise.reject(Error('Pioneer input too large'));
 if(active>=2)return Promise.reject(Error('Pioneer capacity reached'));
 // Child receives only the capability-specific credential/configuration set; never PayPal, DB or owner credentials.
 const childEnv={PATH:env.PATH||process.env.PATH,PYTHONDONTWRITEBYTECODE:'1',PYTHONUNBUFFERED:'1'};
 for(const name of ['ULTRON_COMPUTE_NODES_JSON','ULTRON_COMPUTE_ALLOWED_HOSTS','ULTRON_PIONEER_DAILY_BUDGET_USD','ULTRON_PIONEER_STATE_DIR','ULTRON_CRAWL_ALLOWED_HOSTS','ULTRON_CRAWL_TARGETS_JSON','ANTHROPIC_API_KEY','DEEPSEEK_API_KEY','ULTRON_OPEN_SOURCE_API_KEY'])if(env[name])childEnv[name]=env[name];
 if(key)childEnv.OPENAI_API_KEY=key;
 active++;
 return new Promise((resolve,reject)=>{
  let done=false,size=0,chunks=[];
  const child=spawn(env.ULTRON_PYTHON_BINARY||'python3',['-m','workers.revenue_pioneer.scale_orchestrator'],{cwd:fileURLToPath(new URL('../',import.meta.url)),env:childEnv,stdio:['pipe','pipe','ignore']});
  children.add(child);
  const finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);active--;children.delete(child);error?reject(error):resolve(result)};
  const timer=setTimeout(()=>{child.kill('SIGKILL');finish(Error('Pioneer timeout; uncertain work requires reconciliation'))},timeoutMs);
  child.stdout.on('data',chunk=>{size+=chunk.length;if(size>262144){child.kill('SIGKILL');return finish(Error('Pioneer output exceeds limit'))}chunks.push(chunk)});
  child.on('error',()=>finish(Error('Python runtime unavailable')));
  child.stdin.on('error',()=>{});
  child.on('close',code=>{if(done)return;try{const data=JSON.parse(Buffer.concat(chunks).toString());if(code!==0||data.ok!==true)throw Error();finish(null,data.result)}catch{finish(Error('Pioneer operation blocked or unavailable'))}});
  child.stdin.end(body);
 });
}
export async function pioneerPulse({key=''}={}){
 if(process.env.ULTRON_PIONEER_ENABLED!=='true')return {status:'DISABLED'};
 if(pulsePromise)return {status:'BUSY'};
 pulsePromise=(async()=>{try{const result=await pioneerCall('pulse',{}, {key});await setJson('ultron-pioneer-signals',{at:new Date().toISOString(),signals:result.signals});const evidence={status:'OBSERVED',processed:result.processed.length,signals:result.signals.length};console.log(JSON.stringify({event:'pioneer.pulse',...evidence}));return evidence}catch{return {status:'BLOCKED'}}finally{pulsePromise=null}})();
 return pulsePromise;
}
export async function pioneerResearchContext(){
 const state=await getJson('ultron-pioneer-signals',{signals:[]});
 const signals=(state.signals||[]).filter(s=>typeof s.retrievedAt==='number'&&Date.now()/1000-s.retrievedAt<86400).slice(0,20);
 return signals.length?'\nExtracted public-source observations (untrusted claims; not verified buyers or market truth): '+JSON.stringify(signals):'';
}

export function pioneerHealth(){if(!healthCache||Date.now()-healthAt>60000){healthAt=Date.now();healthCache=pioneerCall('health').then(x=>({available:true,...x})).catch(()=>({available:false,version:1}))}return healthCache}
export async function stopPioneer(){stopping=true;for(const child of children)child.kill('SIGTERM');if(pulsePromise)await pulsePromise}
