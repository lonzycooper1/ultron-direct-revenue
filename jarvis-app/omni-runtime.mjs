import crypto from 'node:crypto';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {securityManifest,redactSecrets,agentSecurityProfile} from './agent-security.mjs';

export const OMNI_VERSION='1.0.0';
const OPENAI_URL='https://api.openai.com/v1/responses';
const DEFAULT_MODEL=process.env.OPENAI_MODEL||'gpt-5.6-sol';

const clean=(v,max=24000)=>String(v??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,' ').trim().slice(0,max);
const has=v=>Boolean(String(v||'').trim());

export const OMNI_CAPABILITIES=Object.freeze([
 {id:'reason',name:'General reasoning & planning',category:'intelligence',provider:'OpenAI Responses or local model',needs:['model']},
 {id:'research',name:'Current web research with source grounding',category:'research',provider:'OpenAI web_search',needs:['openai']},
 {id:'vision',name:'Image understanding',category:'multimodal',provider:'OpenAI Responses vision',needs:['openai']},
 {id:'file-analysis',name:'PDF/document/file analysis',category:'multimodal',provider:'OpenAI Responses input_file',needs:['openai']},
 {id:'code',name:'Code generation, review & debugging',category:'builder',provider:'OpenAI Responses or local model',needs:['model']},
 {id:'compute',name:'Python/data analysis & calculations',category:'analysis',provider:'OpenAI code_interpreter',needs:['openai']},
 {id:'image-generation',name:'Image generation/editing',category:'creative',provider:'OpenAI image_generation',needs:['openai']},
 {id:'audio-transcription',name:'Audio transcription',category:'multimodal',provider:'OpenAI transcription API',needs:['openai']},
 {id:'speech-generation',name:'Text-to-speech',category:'multimodal',provider:'OpenAI speech API',needs:['openai']},
 {id:'artifact-generation',name:'Reports, charts and generated files',category:'creative',provider:'OpenAI code_interpreter + JARVIS outputs',needs:['openai']},
 {id:'structured-writing',name:'Emails, reports, plans, copy & structured drafts',category:'writing',provider:'OpenAI Responses or local model',needs:['model']},
 {id:'translation',name:'Translation & rewriting',category:'writing',provider:'OpenAI Responses or local model',needs:['model']},
 {id:'memory',name:'Persistent mission memory',category:'core',provider:'JARVIS nucleus',needs:[]},
 {id:'agent-orchestration',name:'Multi-agent task decomposition & delegation',category:'core',provider:'JARVIS nucleus + Agent-of-Agents',needs:[]},
 {id:'automation',name:'Scheduled/repeating task plans',category:'core',provider:'JARVIS automation queue',needs:[]},
 {id:'web-fetch',name:'Direct URL retrieval & summarization',category:'research',provider:'JARVIS HTTPS fetch + model',needs:['model']},
 {id:'github',name:'Repository/code operations',category:'connector',provider:'remote MCP/webhook adapter',needs:['connector']},
 {id:'railway',name:'Deployment & runtime operations',category:'connector',provider:'remote MCP/webhook adapter',needs:['connector']},
 {id:'shopify',name:'Direct Shopify Admin operations',category:'connector',provider:'JARVIS Shopify connector bridge',needs:['connector']},
 {id:'gmail',name:'Email read/draft/send workflows',category:'connector',provider:'OpenAI connector/MCP',needs:['openai','gmail_oauth']},
 {id:'calendar',name:'Calendar read/schedule workflows',category:'connector',provider:'OpenAI connector/MCP',needs:['openai','calendar_oauth']},
 {id:'drive',name:'Drive file search/read workflows',category:'connector',provider:'OpenAI connector/MCP',needs:['openai','drive_oauth']},
 {id:'crm',name:'CRM analysis & actions',category:'connector',provider:'remote MCP/webhook adapter',needs:['connector']},
 {id:'marketing',name:'Social/ad analytics and approved actions',category:'connector',provider:'remote MCP/webhook adapter',needs:['connector']},
 {id:'commerce',name:'Marketplace, products, checkout & fulfillment',category:'business',provider:'ULTRON Everything Market',needs:[]},
 {id:'payments',name:'Verified-payment routing/accounting',category:'business',provider:'ULTRON PayPal runtime',needs:[]},
 {id:'defensive-security',name:'Defensive security analysis',category:'security',provider:'JARVIS security division',needs:[]},
 {id:'voice-realtime',name:'Realtime voice/audio interface',category:'multimodal',provider:'OpenAI Realtime adapter',needs:['openai','client_realtime']},
 {id:'computer-use',name:'Browser/computer operation',category:'operator',provider:'OpenAI computer-use harness',needs:['openai','computer_harness']}
]);

const CONNECTORS=Object.freeze({
 gmail:{connector_id:'connector_gmail',tokenEnv:'OPENAI_CONNECTOR_GMAIL_TOKEN',name:'Gmail'},
 calendar:{connector_id:'connector_googlecalendar',tokenEnv:'OPENAI_CONNECTOR_GOOGLECALENDAR_TOKEN',name:'Google Calendar'},
 drive:{connector_id:'connector_googledrive',tokenEnv:'OPENAI_CONNECTOR_GOOGLEDRIVE_TOKEN',name:'Google Drive'},
 dropbox:{connector_id:'connector_dropbox',tokenEnv:'OPENAI_CONNECTOR_DROPBOX_TOKEN',name:'Dropbox'},
 outlook_email:{connector_id:'connector_outlookemail',tokenEnv:'OPENAI_CONNECTOR_OUTLOOKEMAIL_TOKEN',name:'Outlook Email'},
 outlook_calendar:{connector_id:'connector_outlookcalendar',tokenEnv:'OPENAI_CONNECTOR_OUTLOOKCALENDAR_TOKEN',name:'Outlook Calendar'},
 sharepoint:{connector_id:'connector_sharepoint',tokenEnv:'OPENAI_CONNECTOR_SHAREPOINT_TOKEN',name:'SharePoint'}
});

function localConfigured(){
 return has(process.env.OLLAMA_BASE_URL)||has(process.env.LMSTUDIO_BASE_URL);
}
let cachedOpenAIKey=null;
function decryptConfiguredOpenAIKey(){
 if(cachedOpenAIKey)return cachedOpenAIKey;
 if(has(process.env.OPENAI_API_KEY)){cachedOpenAIKey=process.env.OPENAI_API_KEY;return cachedOpenAIKey}
 if(!has(process.env.OPENAI_API_KEY_ENCRYPTED)||!has(process.env.OPENAI_API_KEY_PRIVATE_JWK))return '';
 try{
   const jwk=JSON.parse(process.env.OPENAI_API_KEY_PRIVATE_JWK);
   const key=crypto.createPrivateKey({key:jwk,format:'jwk'});
   const ciphertext=Buffer.from(process.env.OPENAI_API_KEY_ENCRYPTED,'base64url');
   cachedOpenAIKey=crypto.privateDecrypt({key,oaepHash:'sha256'},ciphertext).toString('utf8').trim();
   return cachedOpenAIKey;
 }catch{return ''}
}
function openaiConfigured(){return has(decryptConfiguredOpenAIKey())}
function openaiKey(){const k=decryptConfiguredOpenAIKey();if(!k)throw Error('OpenAI model credential is not configured');return k}
function customBridgeConfigured(){return has(process.env.JARVIS_MCP_SERVERS_JSON)}
function computerHarnessConfigured(){return has(process.env.JARVIS_COMPUTER_HARNESS_URL)}
function realtimeConfigured(){return openaiConfigured()&&has(process.env.OPENAI_REALTIME_CLIENT_ENABLED)}

export function omniStatus(){
 const openai=openaiConfigured(),local=localConfigured(),model=openai||local;
 const connectorState=Object.fromEntries(Object.entries(CONNECTORS).map(([id,c])=>[id,{name:c.name,configured:has(process.env[c.tokenEnv]),credential:c.tokenEnv}]));
 const capabilityStatus=OMNI_CAPABILITIES.map(c=>{
   let status='LIVE';
   const missing=[];
   for(const n of c.needs){
     if(n==='model'&&!model)missing.push('OPENAI_API_KEY or reachable local model');
     if(n==='openai'&&!openai)missing.push('OPENAI_API_KEY');
     if(n==='connector'&&!customBridgeConfigured())missing.push('configured MCP/webhook bridge');
     if(n==='gmail_oauth'&&!connectorState.gmail.configured)missing.push(CONNECTORS.gmail.tokenEnv);
     if(n==='calendar_oauth'&&!connectorState.calendar.configured)missing.push(CONNECTORS.calendar.tokenEnv);
     if(n==='drive_oauth'&&!connectorState.drive.configured)missing.push(CONNECTORS.drive.tokenEnv);
     if(n==='client_realtime'&&!realtimeConfigured())missing.push('Realtime client configuration');
     if(n==='computer_harness'&&!computerHarnessConfigured())missing.push('computer/browser harness');
   }
   if(missing.length)status='READY_NEEDS_CREDENTIAL';
   if(['gmail','calendar','drive','github','railway','crm','marketing','computer-use'].includes(c.id)&&!missing.length)status='APPROVAL_GATED';
   return {...c,status,missing};
 });
 return {
   version:OMNI_VERSION,
   openai:{configured:openai,model:DEFAULT_MODEL},
   localModels:{configured:local},
   connectors:connectorState,
   customMcpBridge:customBridgeConfigured(),
   computerHarness:computerHarnessConfigured(),
   realtime:realtimeConfigured(),
   capabilities:capabilityStatus,
   counts:{
     total:capabilityStatus.length,
     live:capabilityStatus.filter(x=>x.status==='LIVE').length,
     approvalGated:capabilityStatus.filter(x=>x.status==='APPROVAL_GATED').length,
     needsCredential:capabilityStatus.filter(x=>x.status==='READY_NEEDS_CREDENTIAL').length
   }
 };
}

const POLICY='You are the ULTRON JARVIS Omni Runtime. Be capable, practical and accurate. Follow the application security and authorization policy. Never fabricate completed external actions, revenue, buyers, payments, deployments, messages, files, or tool results. Do not perform phishing, credential theft, malware deployment, fund theft, market manipulation, spam, fake engagement, counterfeit content, or fabricated financial results. Do not make autonomous real-money trades. Consequential external actions such as spending money, publishing, sending messages, changing accounts, refunds, banking, or irreversible changes must remain approval-gated unless the caller supplies a valid approved action context. For research, distinguish sources from inference. For code, generate independently authored code and preserve secrets.';

function extractOutputText(d){
 if(typeof d?.output_text==='string')return d.output_text;
 const chunks=[];
 for(const item of d?.output||[]){
   if(item?.type==='message')for(const c of item.content||[])if(c?.type==='output_text'&&c.text)chunks.push(c.text);
 }
 return chunks.join('\\n').trim();
}
function approvalRequests(d){
 return (d?.output||[]).filter(x=>x?.type==='mcp_approval_request').map(x=>({id:x.id,name:x.name,serverLabel:x.server_label,arguments:x.arguments}));
}
function imageOutputs(d){
 return (d?.output||[]).filter(x=>x?.type==='image_generation_call'&&x.result).map(x=>({id:x.id,b64_json:x.result,status:x.status}));
}
function citations(d){
 const out=[];
 for(const item of d?.output||[])if(item?.type==='message')for(const c of item.content||[])for(const a of c.annotations||[])out.push(a);
 return out.slice(0,100);
}
function codeOutputs(d){
 return (d?.output||[]).filter(x=>x?.type==='code_interpreter_call').map(x=>({id:x.id,status:x.status,code:x.code||null,outputs:x.outputs||[]}));
}
function webSearchOutputs(d){
 return (d?.output||[]).filter(x=>x?.type==='web_search_call').map(x=>({id:x.id,status:x.status,action:x.action?.type||null}));
}

function customMcpTools(){
 if(!customBridgeConfigured())return [];
 try{
   const arr=JSON.parse(process.env.JARVIS_MCP_SERVERS_JSON);
   if(!Array.isArray(arr))return [];
   return arr.slice(0,12).filter(x=>x&&x.server_url&&x.server_label).map(x=>({
     type:'mcp',
     server_label:clean(x.server_label,80),
     server_description:clean(x.server_description||'JARVIS external capability bridge',300),
     server_url:String(x.server_url),
     headers:x.headers&&typeof x.headers==='object'?x.headers:undefined,
     require_approval:x.require_approval||'always',
     allowed_tools:Array.isArray(x.allowed_tools)?x.allowed_tools.slice(0,50):undefined
   }));
 }catch{return []}
}
function connectorTools(ids=[]){
 return [...new Set(ids)].map(id=>[id,CONNECTORS[id]]).filter(([,c])=>c&&has(process.env[c.tokenEnv])).map(([id,c])=>({
   type:'mcp',
   server_label:'connector_'+id,
   connector_id:c.connector_id,
   authorization:process.env[c.tokenEnv],
   require_approval:'always'
 }));
}

function internalFunctionTools(){
 return [
  {type:'function',name:'ultron_market_search',description:'Search the live ULTRON Everything Market and native catalog for products, software, services, POD or merchant offers.',parameters:{type:'object',properties:{query:{type:'string'},limit:{type:'integer',minimum:1,maximum:25}},required:['query','limit'],additionalProperties:false},strict:true},
  {type:'function',name:'ultron_market_status',description:'Read the live ULTRON revenue/market service health and public runtime status.',parameters:{type:'object',properties:{},required:[],additionalProperties:false},strict:true},
  {type:'function',name:'ultron_agent_of_agents_status',description:'Read the Agent-of-Agents commerce CEO runtime, active specialist team and pending approvals.',parameters:{type:'object',properties:{},required:[],additionalProperties:false},strict:true},
  {type:'function',name:'ultron_create_commerce_mission',description:'Create a new internal commerce mission. This plans and stages work; consequential publishing, spend and refunds remain human-approved.',parameters:{type:'object',properties:{goal:{type:'string',minLength:1,maxLength:2000}},required:['goal'],additionalProperties:false},strict:true},
  {type:'function',name:'ultron_crypto_status',description:'Read the live crypto intelligence service health. Does not place trades.',parameters:{type:'object',properties:{},required:[],additionalProperties:false},strict:true}
 ];
}
function buildTools(mode,{connectors=[]}={}){
 const tools=[];
 if(mode==='quality')return tools;
 if(mode==='research'||mode==='deep-research')tools.push({type:'web_search'});
 if(['compute','data','code-run','deep-research'].includes(mode))tools.push({type:'code_interpreter',container:{type:'auto'}});
 if(['image','image-edit'].includes(mode))tools.push({type:'image_generation',action:'auto'});
 tools.push(...internalFunctionTools(),...connectorTools(connectors),...customMcpTools());
 return tools;
}

function buildContent(prompt,{files=[],images=[]}={}){
 const content=[{type:'input_text',text:clean(prompt,40000)}];
 for(const img of (images||[]).slice(0,8)){
   if(img?.url)content.push({type:'input_image',image_url:String(img.url),detail:img.detail||'auto'});
   else if(img?.base64&&img?.mimeType)content.push({type:'input_image',image_url:'data:'+img.mimeType+';base64,'+img.base64,detail:img.detail||'auto'});
 }
 for(const f of (files||[]).slice(0,10)){
   if(f?.fileId)content.push({type:'input_file',file_id:String(f.fileId)});
   else if(f?.url)content.push({type:'input_file',file_url:String(f.url),filename:clean(f.filename||'file',255)});
   else if(f?.base64)content.push({type:'input_file',file_data:String(f.base64),filename:clean(f.filename||'file',255)});
 }
 return content;
}

export function inferOmniMode(prompt=''){
 const p=String(prompt).toLowerCase();
 if(/generate|create|draw|render|make an image|edit (this )?(image|photo)/.test(p))return 'image';
 if(/calculate|analy[sz]e data|spreadsheet|csv|statistics|chart|plot|python/.test(p))return 'compute';
 if(/latest|today|current|search (the )?(web|internet)|research|look up|find online/.test(p))return 'research';
 if(/debug|write code|code this|implement|refactor|repository|github|deploy/.test(p))return 'code';
 if(/pdf|document|attachment|file|summari[sz]e this/.test(p))return 'file';
 return 'reason';
}

export function planOmniTask({prompt='',mode='auto',connectors=[]}={}){
 const selected=mode==='auto'?inferOmniMode(prompt):mode;
 const capabilityMap={
   reason:['reason','structured-writing','memory'],
   research:['research','reason','structured-writing'],
   'deep-research':['research','compute','reason','structured-writing'],
   compute:['compute','reason'],
   data:['compute','reason'],
   code:['code','reason'],
   'code-run':['code','compute'],
   image:['image-generation'],
   'image-edit':['image-generation','vision'],
   file:['file-analysis','reason'],
   vision:['vision','reason']
 };
 const ids=[...(capabilityMap[selected]||['reason']),...connectors];
 const st=omniStatus();
 const entries=ids.map(id=>st.capabilities.find(c=>c.id===id)||{id,status:'UNKNOWN'}).filter(Boolean);
 return {
   id:'omni-plan-'+crypto.randomUUID(),createdAt:new Date().toISOString(),mode:selected,prompt:clean(prompt,4000),
   capabilities:entries,
   canExecuteNow:entries.every(x=>x.status!=='READY_NEEDS_CREDENTIAL'),
   approvalRequired:entries.some(x=>x.status==='APPROVAL_GATED'),
   security:agentSecurityProfile('JARVIS-Omni')
 };
}

const MARKET_URL=process.env.MARKET_URL||'https://ultron-direct-revenue-production.up.railway.app';
const CRYPTO_URL=process.env.CRYPTO_URL||'https://ultron-trading-engine-production.up.railway.app';
async function serviceJson(url,options={}){
 const r=await fetch(url,{...options,headers:{'content-type':'application/json','accept':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(12000)});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw Error((d&&d.error)||('service '+r.status));
 return d;
}
async function runInternalFunction(name,args={}){
 if(name==='ultron_market_search'){
   const q=encodeURIComponent(clean(args.query,500)),limit=Math.max(1,Math.min(25,Number(args.limit)||10));
   return serviceJson(MARKET_URL.replace(/\/$/,'')+'/api/universal-marketplace/search?q='+q+'&limit='+limit);
 }
 if(name==='ultron_market_status')return serviceJson(MARKET_URL.replace(/\/$/,'')+'/health');
 if(name==='ultron_agent_of_agents_status')return serviceJson(MARKET_URL.replace(/\/$/,'')+'/api/agent-of-agents');
 if(name==='ultron_create_commerce_mission'){
   return serviceJson(MARKET_URL.replace(/\/$/,'')+'/api/agent-of-agents/mission',{method:'POST',body:JSON.stringify({goal:clean(args.goal,2000)})});
 }
 if(name==='ultron_crypto_status')return serviceJson(CRYPTO_URL.replace(/\/$/,'')+'/health');
 throw Error('unknown internal function');
}
function functionCalls(d){return (d?.output||[]).filter(x=>x?.type==='function_call')}

export async function invokeOpenAIOmni({prompt='',mode='reason',files=[],images=[],connectors=[],instructions='',history=[]}={}){
 if(!openaiConfigured())throw Error('OPENAI_API_KEY is not configured');
 const user=clean(prompt,40000);if(!user)throw Error('prompt required');
 const tools=buildTools(mode,{connectors});
 const prior=(history||[]).slice(-24).filter(x=>x&&['user','assistant'].includes(x.role)&&x.content).map(x=>({role:x.role,content:[{type:x.role==='assistant'?'output_text':'input_text',text:clean(x.content,12000)}]}));
 let input=[...prior,{role:'user',content:buildContent(user,{files,images})}],d=null,totalUsage=null;
 for(let turn=0;turn<5;turn++){
   const body={model:DEFAULT_MODEL,instructions:POLICY+' '+clean(instructions,6000),input,tools,store:false};
   const r=await fetch(OPENAI_URL,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+openaiKey()},body:JSON.stringify(body),signal:AbortSignal.timeout(180000)});
   d=await r.json().catch(()=>({}));
   if(!r.ok)throw Error(clean(d?.error?.message||('OpenAI Responses API '+r.status),1000));
   totalUsage=d.usage||totalUsage;
   const calls=functionCalls(d);
   if(!calls.length||approvalRequests(d).length)break;
   const outputs=[];
   for(const call of calls){
     let args={};try{args=JSON.parse(call.arguments||'{}')}catch{}
     try{
       const value=await runInternalFunction(call.name,args);
       outputs.push({type:'function_call_output',call_id:call.call_id,output:JSON.stringify(value).slice(0,60000)});
     }catch(e){
       outputs.push({type:'function_call_output',call_id:call.call_id,output:JSON.stringify({ok:false,error:String(e?.message||e).slice(0,1000)})});
     }
   }
   input=[...(d.output||[]),...outputs];
 }
 return {
   ok:true,provider:'openai',model:d?.model||DEFAULT_MODEL,responseId:d?.id||null,
   text:redactSecrets(extractOutputText(d)),
   citations:citations(d),
   approvalRequests:approvalRequests(d),
   images:imageOutputs(d),
   codeInterpreter:codeOutputs(d),
   webSearch:webSearchOutputs(d),
   usage:totalUsage,
   status:d?.status||'completed'
 };
}

function privateIp(ip){
 if(!isIP(ip))return true;
 if(ip==='127.0.0.1'||ip==='0.0.0.0'||ip==='::1')return true;
 if(ip.startsWith('10.')||ip.startsWith('192.168.')||ip.startsWith('169.254.'))return true;
 const m=ip.match(/^172\.(\d+)\./);if(m&&Number(m[1])>=16&&Number(m[1])<=31)return true;
 if(ip.startsWith('100.64.')||ip.startsWith('198.18.')||ip.startsWith('198.19.'))return true;
 if(ip.startsWith('fc')||ip.startsWith('fd')||ip.startsWith('fe80:'))return true;
 return false;
}
async function assertPublicHost(u){
 const host=u.hostname.toLowerCase();
 if(host==='localhost'||host.endsWith('.localhost'))throw Error('local/private targets are not allowed');
 const answers=await lookup(host,{all:true,verbatim:true});
 if(!answers.length||answers.some(x=>privateIp(x.address)))throw Error('local/private targets are not allowed');
}
export async function fetchUrlForModel(url){
 const u=new URL(url);
 if(!['http:','https:'].includes(u.protocol))throw Error('only http(s) URLs are allowed');
 await assertPublicHost(u);
 const r=await fetch(u,{headers:{'user-agent':'ULTRON-JARVIS/1.0','accept':'text/html,text/plain,application/json'},redirect:'follow',signal:AbortSignal.timeout(15000)});
 const finalUrl=new URL(r.url);await assertPublicHost(finalUrl);
 const type=r.headers.get('content-type')||'';
 const text=await r.text();
 return {url:r.url,status:r.status,ok:r.ok,contentType:type,text:clean(text,60000)};
}

export async function transcribeAudio({filename='audio.webm',mimeType='audio/webm',base64='',language}={}){
 if(!openaiConfigured())throw Error('OPENAI_API_KEY is not configured');
 if(!base64)throw Error('audio base64 required');
 const bytes=Buffer.from(base64,'base64');if(bytes.length>25*1024*1024)throw Error('audio input exceeds 25 MB JARVIS limit');
 const form=new FormData();
 form.append('file',new Blob([bytes],{type:mimeType}),clean(filename,255));
 form.append('model',process.env.OPENAI_TRANSCRIBE_MODEL||'gpt-transcribe');
 if(language)form.append('language',clean(language,20));
 const r=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{authorization:'Bearer '+openaiKey()},body:form,signal:AbortSignal.timeout(180000)});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(clean(d?.error?.message||('transcription '+r.status),1000));
 return {ok:true,text:redactSecrets(String(d.text||'')),model:d.model||process.env.OPENAI_TRANSCRIBE_MODEL||'gpt-transcribe'};
}
export async function generateSpeech({text='',voice='marin',format='mp3',instructions=''}={}){
 if(!openaiConfigured())throw Error('OPENAI_API_KEY is not configured');
 const input=clean(text,4096);if(!input)throw Error('text required');
 const allowedFormats=['mp3','opus','aac','flac','wav','pcm'];if(!allowedFormats.includes(format))format='mp3';
 const body={model:process.env.OPENAI_TTS_MODEL||'gpt-4o-mini-tts',voice:clean(voice,80)||'marin',input,response_format:format};
 if(instructions)body.instructions=clean(instructions,1000);
 const r=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{authorization:'Bearer '+openaiKey(),'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(180000)});
 if(!r.ok){const t=await r.text();throw Error(clean(t||('speech '+r.status),1000))}
 const buf=Buffer.from(await r.arrayBuffer());
 return {ok:true,format,mimeType:format==='mp3'?'audio/mpeg':'audio/'+format,base64:buf.toString('base64'),bytes:buf.length,model:body.model,voice:body.voice};
}

export function omniManifest(){
 const s=omniStatus();
 return {
   version:OMNI_VERSION,
   name:'JARVIS Omni Capability Runtime',
   objective:'Provide one instruction surface for reasoning, research, multimodal analysis, coding/data tools, connected systems, persistent memory, orchestration and business execution where credentials and approvals permit.',
   parityRule:'Capability parity is implemented through adapters and internal systems; JARVIS does not claim access to ChatGPT-internal tools or OAuth sessions that are not explicitly configured in its own runtime.',
   runtime:s,
   openaiResponses:{
     supportedWhenConfigured:['reasoning','web_search','image understanding','input_file analysis','code_interpreter','image_generation','remote MCP/service connectors'],
     model:DEFAULT_MODEL
   },
   security:securityManifest()
 };
}
