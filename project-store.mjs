import {getJson,mutateJson} from './state-store.mjs';
const KEY='ultron2-projects';
const fresh=()=>({version:1,projects:{},history:[]});
export async function saveProject(project){if(!project?.id)throw Error('project.id required');const s=await mutateJson(KEY,fresh(),async state=>{state.projects[project.id]=project;state.history.unshift({at:new Date().toISOString(),type:'project-saved',projectId:project.id});state.history=state.history.slice(0,1000)});return s.projects[project.id]}
export async function updateProjectProgress(projectId,milestoneId,status){const allowed=['blocked','ready','active','done'];if(!allowed.includes(status))throw Error('invalid status');let out=null;await mutateJson(KEY,fresh(),async state=>{const p=state.projects[projectId];if(!p)throw Error('project not found');const m=p.milestones.find(x=>x.id===milestoneId);if(!m)throw Error('milestone not found');m.status=status;m.updatedAt=new Date().toISOString();if(status==='done'){const next=p.milestones.find(x=>x.order===m.order+1&&x.status==='blocked');if(next)next.status='ready'}state.history.unshift({at:new Date().toISOString(),type:'milestone-updated',projectId,milestoneId,status});out=p});return out}
export async function getProject(projectId){const s=await getJson(KEY,fresh());return s.projects[projectId]||null}
export async function listProjects(){const s=await getJson(KEY,fresh());return Object.values(s.projects).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))}

/** Adds a durable execution request without changing existing project JSONB semantics.
 * A stable project ID is the worker dedupe key: safe to retry after interruption.
 */
export async function queueProjectExecution(projectId,kind='RESEARCH'){
 if(!/^[A-Za-z0-9_.:-]{1,160}$/.test(String(projectId))||!['RESEARCH','PRODUCT_DRAFT'].includes(kind))throw Error('Invalid project execution');
 const project=await getProject(projectId);
 if(!project)throw Error('Project not found');
 const {enqueueEnterpriseJob}=await import('./enterprise-store-v45.mjs');
 return enqueueEnterpriseJob({kind,dedupeKey:'project:'+projectId+':'+kind,payload:{
  projectId,description:String(project.goal||project.title||'').slice(0,1200),
  requiresReview:true}});
}
