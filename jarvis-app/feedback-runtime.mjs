import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import crypto from 'node:crypto';

const PATH=process.env.JARVIS_FEEDBACK_STATE_PATH||'/data/jarvis-feedback.json';
const MAX_FEEDBACK=2000,MAX_CORRECTIONS=80;
let state=null,writeChain=Promise.resolve();

const clean=(v,max=6000)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);
function seed(){return {version:'1.0.0',createdAt:new Date().toISOString(),feedback:[],stats:{up:0,down:0,corrections:0}}}
async function persist(){
 const tmp=PATH+'.tmp',snap=JSON.stringify(state,null,2);
 writeChain=writeChain.then(async()=>{await mkdir(dirname(PATH),{recursive:true});await writeFile(tmp,snap,'utf8');await rename(tmp,PATH)});
 await writeChain;
}
export async function initFeedback(){
 if(state)return state;
 try{state=JSON.parse(await readFile(PATH,'utf8'))}catch{state=seed();await persist()}
 if(!Array.isArray(state.feedback))state.feedback=[];
 if(!state.stats)state.stats={up:0,down:0,corrections:0};
 return state;
}
export async function recordFeedback({chatId='',messageId='',rating='',prompt='',response='',correction='',tags=[]}={}){
 await initFeedback();
 if(!['up','down'].includes(rating))throw Error('rating must be up or down');
 const item={
  id:'fb-'+crypto.randomUUID(),chatId:clean(chatId,160),messageId:clean(messageId,160),rating,
  prompt:clean(prompt,8000),response:clean(response,8000),correction:clean(correction,8000),
  tags:(Array.isArray(tags)?tags:[]).slice(0,20).map(x=>clean(x,80)).filter(Boolean),
  createdAt:new Date().toISOString()
 };
 state.feedback.unshift(item);state.feedback=state.feedback.slice(0,MAX_FEEDBACK);
 state.stats.up=state.feedback.filter(x=>x.rating==='up').length;
 state.stats.down=state.feedback.filter(x=>x.rating==='down').length;
 state.stats.corrections=state.feedback.filter(x=>x.correction).length;
 await persist();return item;
}
export async function feedbackGuidance(){
 await initFeedback();
 const corrections=state.feedback.filter(x=>x.rating==='down'&&x.correction).slice(0,MAX_CORRECTIONS);
 const positives=state.feedback.filter(x=>x.rating==='up'&&x.tags?.length).slice(0,30);
 if(!corrections.length&&!positives.length)return '';
 const lines=['OWNER FEEDBACK ADAPTATION (runtime preference layer; not base-model retraining):'];
 for(const x of corrections.slice(0,12))lines.push('- Correction to respect: '+clean(x.correction,700));
 const preferredTags=[...new Set(positives.flatMap(x=>x.tags))].slice(0,15);
 if(preferredTags.length)lines.push('- Repeated positive preference tags: '+preferredTags.join(', '));
 return lines.join('\n');
}
export async function feedbackSummary(){
 await initFeedback();
 return {
  stats:state.stats,
  recent:state.feedback.slice(0,50).map(({id,chatId,messageId,rating,correction,tags,createdAt})=>({id,chatId,messageId,rating,correction,tags,createdAt})),
  adaptation:'Feedback changes JARVIS runtime guidance, evals and future response shaping. It does not directly modify GPT model weights.'
 };
}
export async function exportPreferenceDataset(){
 await initFeedback();
 const rows=state.feedback.filter(x=>x.prompt&&x.response).map(x=>({
  prompt:x.prompt,
  response:x.response,
  rating:x.rating,
  preferred_response:x.correction||null,
  tags:x.tags||[],
  created_at:x.createdAt
 }));
 return rows.map(x=>JSON.stringify(x)).join('\n');
}
export function feedbackManifest(){
 return {
  version:'1.0.0',
  mode:'RLHF-inspired runtime preference adaptation',
  baseModelWeightTraining:false,
  capabilities:['thumbs up/down','owner corrections','preference tags','future-response guidance','evaluation dataset export'],
  persistence:'Railway volume',
  privacy:'owner-gated endpoints only'
 };
}
