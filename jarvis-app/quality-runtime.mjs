import {invokeOpenAIOmni,omniStatus} from './omni-runtime.mjs';

const clean=(v,max=16000)=>String(v??'').replace(/[\u0000-\u001F]/g,' ').trim().slice(0,max);

export function qualityManifest(){
 return {
  version:'1.0.0',
  mode:'draft -> verifier -> optional revision',
  default:process.env.JARVIS_QUALITY_MODE||'high',
  verifier:'GPT-based second-pass quality review',
  goals:['instruction following','factual restraint','tool-result fidelity','completeness','clarity','uncertainty labeling','no fabricated actions'],
  researchRule:'Do not rewrite externally grounded research unless the verifier can preserve source-backed claims.'
 };
}

export async function reviewAndImprove({prompt='',draft='',mode='reason',feedbackGuidance=''}={}){
 if(!omniStatus().openai.configured)return {applied:false,reason:'model-not-configured',text:draft,score:null,issues:[]};
 if(!draft)return {applied:false,reason:'empty-draft',text:draft,score:null,issues:[]};
 if(['image','image-edit','research','deep-research'].includes(mode))return {applied:false,reason:'mode-preserves-primary-tool-output',text:draft,score:null,issues:[]};

 const reviewPrompt=[
  'You are JARVIS Quality Verifier.',
  'Evaluate the draft against the user instruction. Improve it only if needed.',
  'Rules:',
  '- Do not claim an external action happened unless the draft already has verified tool evidence.',
  '- Do not add new factual claims that are not supported by the draft/context.',
  '- Preserve numbers, code semantics, and stated uncertainty unless correcting an obvious internal contradiction.',
  '- Prefer direct, useful, complete answers over filler.',
  '- Respect this runtime owner-feedback guidance when relevant:',
  clean(feedbackGuidance,5000),
  '',
  'USER REQUEST:',
  clean(prompt,8000),
  '',
  'DRAFT:',
  clean(draft,14000),
  '',
  'Return ONLY valid JSON with this shape:',
  '{"score":0.0,"issues":["..."],"improved":"..."}',
  'Use a score from 0 to 1.'
 ].join('\n');
 const result=await invokeOpenAIOmni({prompt:reviewPrompt,mode:'quality'});
 let parsed=null;
 try{parsed=JSON.parse(result.text)}catch{
   const m=String(result.text||'').match(/\{[\s\S]*\}/);
   if(m)try{parsed=JSON.parse(m[0])}catch{}
 }
 if(!parsed||typeof parsed.improved!=='string')return {applied:false,reason:'verifier-parse-failed',text:draft,score:null,issues:[]};
 const score=Math.max(0,Math.min(1,Number(parsed.score)||0));
 const issues=Array.isArray(parsed.issues)?parsed.issues.slice(0,12).map(x=>clean(x,500)):[];
 const improved=clean(parsed.improved,16000)||draft;
 return {applied:improved!==draft,reason:improved!==draft?'verifier-revision':'verifier-pass',text:improved,score,issues};
}
