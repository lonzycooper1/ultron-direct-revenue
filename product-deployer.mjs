import {createHash} from 'node:crypto';
import {successfulTestExecution} from './test-execution-evidence.mjs';
import {getJson,mutateJson} from './state-store.mjs';
const KEY='ultron-product-deployments',fresh=()=>({deployments:{}});
export function deploymentFiles(job){
 if(job.status!=='DRAFT_READY'||job.kind!=='build'||!job.result?.evidence?.commands?.some(successfulTestExecution))throw Error('Saved build with successful test execution required');
 const artifact=job.result.artifacts.find(a=>a.path==='/workspace/outputs/vercel-files.json');
 if(!artifact?.base64)throw Error('Build has no deployment file manifest');
 const bytes=Buffer.from(artifact.base64,'base64');
 if(bytes.length>2*1024*1024||createHash('sha256').update(bytes).digest('hex')!==artifact.sha256)throw Error('Invalid deployment artifact digest or size');
 const files=JSON.parse(bytes.toString());
 if(!Array.isArray(files)||!files.length||files.length>150)throw Error('Deployment requires 1–150 source files');
 const seen=new Set();let size=0;
 for(const f of files){
  if(typeof f.file!=='string'||f.file.length>200||f.file.startsWith('/')||f.file.includes('\\')||f.file.split('/').some(p=>!p||p==='..'||p==='.'||p.startsWith('.'))||seen.has(f.file)||typeof f.data!=='string'||f.encoding!=='base64')throw Error('Unsafe or duplicate deployment file');
  seen.add(f.file);size+=Buffer.byteLength(f.data,'base64');
 }
 if(size>2*1024*1024)throw Error('Deployment sources exceed 2 MiB');
 return files;
}
export function createProductDeployer({env=process.env,request=fetch,read=()=>getJson(KEY,fresh()),mutate=f=>mutateJson(KEY,fresh(),f)}={}){
 async function submit(job){
  const files=deploymentFiles(job);if(!env.ULTRON_VERCEL_TOKEN||!env.ULTRON_VERCEL_PROJECT_ID)throw Error('Vercel runtime deployment credentials are not configured');
  let existing,claimed=false;
  await mutate(s=>{existing=s.deployments[job.id];if(existing)return;claimed=true;s.deployments[job.id]={jobId:job.id,status:'SUBMITTING_RECONCILE_IF_INTERRUPTED',createdAt:new Date().toISOString()}});
  if(!claimed)return existing;
  const query=env.ULTRON_VERCEL_TEAM_ID?'?teamId='+encodeURIComponent(env.ULTRON_VERCEL_TEAM_ID):'';
  try{
   const r=await request('https://api.vercel.com/v13/deployments'+query,{method:'POST',headers:{authorization:'Bearer '+env.ULTRON_VERCEL_TOKEN,'content-type':'application/json'},body:JSON.stringify({name:env.ULTRON_VERCEL_PROJECT_NAME||'ultron-product-lab',project:env.ULTRON_VERCEL_PROJECT_ID,files,meta:{ultronJobId:job.id}}),signal:AbortSignal.timeout(30000),redirect:'error'});
   if(!r.ok){await mutate(s=>{s.deployments[job.id].status='PROVIDER_REJECTED';s.deployments[job.id].httpStatus=r.status});throw Error('Vercel deployment HTTP '+r.status)}
   const d=await r.json();if(!d.id)throw Error('Vercel deployment receipt missing');
   await mutate(s=>{Object.assign(s.deployments[job.id],{deploymentId:d.id,url:d.url||null,providerTarget:d.target??'preview',status:'SUBMITTED_NOT_VERIFIED'})});return (await read()).deployments[job.id];
  }catch(e){await mutate(s=>{const x=s.deployments[job.id];if(x.status!=='PROVIDER_REJECTED')x.status='RECONCILIATION_REQUIRED'});throw e}
 }
 async function poll(){
  if(!env.ULTRON_VERCEL_TOKEN)return {status:'RUNTIME_AUTH_REQUIRED'};
  const query=env.ULTRON_VERCEL_TEAM_ID?'?teamId='+encodeURIComponent(env.ULTRON_VERCEL_TEAM_ID):'';
  for(const x of Object.values((await read()).deployments).filter(d=>d.deploymentId&&d.status==='SUBMITTED_NOT_VERIFIED').slice(0,5)){
   const r=await request('https://api.vercel.com/v13/deployments/'+encodeURIComponent(x.deploymentId)+query,{headers:{authorization:'Bearer '+env.ULTRON_VERCEL_TOKEN},signal:AbortSignal.timeout(10000),redirect:'error'});
   if(!r.ok)continue;const d=await r.json(),state=d.readyState||d.status;
   if(['READY','ERROR','CANCELED'].includes(state))await mutate(s=>{Object.assign(s.deployments[x.jobId],{status:state==='READY'?'DEPLOYED_PROVIDER_VERIFIED':'DEPLOYMENT_FAILED',providerState:state,providerTarget:d.target??'preview',url:d.url||null,checkedAt:new Date().toISOString()})});
  }
  return {status:'CHECKED'};
 }
 return {submit,poll,status:read};
}
export const productDeployer=createProductDeployer();
