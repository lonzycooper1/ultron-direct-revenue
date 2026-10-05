import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import crypto from 'node:crypto';

const PATH=process.env.JARVIS_AUTOMATION_STATE_PATH||'/data/jarvis-automations.json';
const MAX_TASKS=200,MAX_RUNS=500;
let state=null,writeChain=Promise.resolve();

function seed(){return {version:'1.0.0',createdAt:new Date().toISOString(),tasks:[],runs:[]}}
async function persist(){
 const tmp=PATH+'.tmp',snap=JSON.stringify(state,null,2);
 writeChain=writeChain.then(async()=>{await mkdir(dirname(PATH),{recursive:true});await writeFile(tmp,snap,'utf8');await rename(tmp,PATH)});
 await writeChain;
}
export async function initAutomations(){
 if(state)return state;
 try{state=JSON.parse(await readFile(PATH,'utf8'))}catch{state=seed();await persist()}
 if(!Array.isArray(state.tasks))state.tasks=[];
 if(!Array.isArray(state.runs))state.runs=[];
 return state;
}
const clean=(v,max=4000)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);

function scheduleNext(schedule,from=new Date()){
 if(schedule?.type==='once'){
   const d=new Date(schedule.at);if(!Number.isFinite(d.getTime()))throw Error('invalid once schedule at');
   return d.toISOString();
 }
 if(schedule?.type==='interval'){
   const minutes=Math.max(60,Math.floor(Number(schedule.minutes)||0));
   if(!minutes)throw Error('interval minutes required');
   return new Date(from.getTime()+minutes*60000).toISOString();
 }
 if(schedule?.type==='daily'){
   const hour=Math.max(0,Math.min(23,Math.floor(Number(schedule.hour)||0)));
   const minute=Math.max(0,Math.min(59,Math.floor(Number(schedule.minute)||0)));
   const d=new Date(from);d.setUTCSeconds(0,0);d.setUTCHours(hour,minute,0,0);
   if(d<=from)d.setUTCDate(d.getUTCDate()+1);
   return d.toISOString();
 }
 throw Error('schedule.type must be once, interval, or daily');
}

export async function createAutomation({title='',prompt='',schedule}={}){
 await initAutomations();
 const p=clean(prompt,12000);if(!p)throw Error('prompt required');
 const now=new Date(),task={
   id:'auto-'+crypto.randomUUID(),title:clean(title||p.slice(0,60),120),prompt:p,
   schedule,enabled:true,createdAt:now.toISOString(),updatedAt:now.toISOString(),
   nextRunAt:scheduleNext(schedule,now),lastRunAt:null,lastStatus:'never',runCount:0
 };
 state.tasks.unshift(task);state.tasks=state.tasks.slice(0,MAX_TASKS);await persist();return task;
}
export async function listAutomations(){await initAutomations();return {tasks:state.tasks,runs:state.runs.slice(0,100)}}
export async function updateAutomation(id,{enabled,schedule,title,prompt}={}){
 await initAutomations();const t=state.tasks.find(x=>x.id===id);if(!t)throw Error('automation not found');
 if(typeof enabled==='boolean')t.enabled=enabled;
 if(title!==undefined)t.title=clean(title,120);
 if(prompt!==undefined){const p=clean(prompt,12000);if(!p)throw Error('prompt required');t.prompt=p}
 if(schedule){t.schedule=schedule;t.nextRunAt=scheduleNext(schedule,new Date())}
 t.updatedAt=new Date().toISOString();await persist();return t;
}

export async function runDueAutomations(executor,{now=new Date(),limit=5}={}){
 await initAutomations();
 const due=state.tasks.filter(t=>t.enabled&&t.nextRunAt&&new Date(t.nextRunAt)<=now).sort((a,b)=>new Date(a.nextRunAt)-new Date(b.nextRunAt)).slice(0,limit);
 const results=[];
 for(const t of due){
   const startedAt=new Date().toISOString();let result,status='completed',error=null;
   try{result=await executor(t)}catch(e){status=/not configured|No configured model/i.test(String(e?.message||e))?'blocked':'failed';error=String(e?.message||e).slice(0,1000)}
   t.lastRunAt=startedAt;t.lastStatus=status;t.runCount=(t.runCount||0)+1;t.updatedAt=new Date().toISOString();
   if(t.schedule?.type==='once')t.enabled=false;
   else t.nextRunAt=scheduleNext(t.schedule,now);
   const run={id:'run-'+crypto.randomUUID(),taskId:t.id,title:t.title,startedAt,finishedAt:new Date().toISOString(),status,error,output:result?.text?String(result.text).slice(0,4000):null};
   state.runs.unshift(run);state.runs=state.runs.slice(0,MAX_RUNS);results.push(run);
 }
 if(due.length)await persist();
 return results;
}
export function automationManifest(){
 return {version:'1.0.0',persistent:true,statePath:'persistent-volume',supportedSchedules:['once','interval >=60 minutes','daily UTC'],maxTasks:MAX_TASKS,maxRuns:MAX_RUNS};
}
