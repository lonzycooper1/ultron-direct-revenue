/** Cinematic video production. Provider execution is budget-bound; sales require a real approved sample. */
import {randomUUID,createHash,randomBytes} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
const KEY='cinematic-v43',fresh=()=>({version:'43.0.0',jobs:{},inquiries:[],quotes:{},sampleJobId:null});
const text=(x,n=500)=>String(x??'').trim().slice(0,n);
const validMoney=x=>typeof x==='number'&&Number.isFinite(x)&&x>0&&x<=500;
export const CRITERIA=['characterConsistency','anatomyAndPhysics','motionAndTiming','lightingAndDetail','storyAndEditing','audioAndSync','originalityAndRights'];
export const VIDEO_TERMS={version:'43.1',scope:'One original 15-second vertical AI-assisted short, 3 shots, 720×1280 minimum, final MP4 with sound and one revision round.',delivery:'Five business days after approved storyboard, cleared payment and authorized assets.',limits:'AI artifacts may require regeneration. No promise of virality, platform monetization, revenue or exact reproduction of third-party footage.',rights:'Customer must own or license supplied assets. Music, voices, likenesses and third-party characters need documented authorization. No copied reference footage is sold.',refunds:'If production cannot start or the agreed deliverable cannot be supplied, review for refund through PayPal; each refund is recorded separately. Revision requests must refer to the agreed scope.'};
export const REFERENCE_ANALYSIS={source:'ScreenRecording_10-14-2026 19-28-15_1.mp4',seconds:64.067,observations:[{range:'0–19s',type:'Photoreal staged animal/human comedy',features:['Detailed fur and skin','Consistent setting and lighting','Anticipation, physical action and reaction','Shallow depth of field and audience context']},{range:'20–35s',type:'Live-action retail reaction scene',features:['Facial performance','Hand and prop interaction','Believable location detail','Pacing and dialogue context']},{range:'36–51s',type:'Stylized 3D family comedy',features:['Consistent original-looking cast','Expressive faces','Warm practical lighting','Multiple camera framings and reaction shots']},{range:'52–64s',type:'Chat interface footage',features:['Not part of the cinematic production reference']}],oldOutput:'The previous 45-second video contains animated text cards and abstract graphics, not character-based generated scenes.',target:'Original expressive scenes with consistent character design, motion, scene continuity, sound, editing and review; no promise to surpass the reference without measured output.'};
export function makeStoryboard(input={}){
 const title=text(input.title||'The Midnight Delivery',100),style=['photoreal','stylized-3d'].includes(input.style)?input.style:'stylized-3d';
 const character=text(input.character||'An original small copper delivery robot with round amber eyes, a teal messenger bag, three fingers per hand and scuffed brass panels',400);
 const setting=text(input.setting||'A cozy city bakery at blue hour, warm window light, flour-dusted wooden counter, rain outside',400);
 const premise=text(input.premise||'A delivery robot tries to carry a towering cake, nearly drops it, then finds a clever gentle solution',600);
 const look=style==='stylized-3d'?'High-end original 3D animated short, tactile materials, expressive eyes, soft film lighting, rich background detail':'Cinematic photoreal scene, natural material detail, plausible physics, motivated practical light';
 const beats=[['Establish and hook','Slow dolly toward the character; reveal the problem with a readable surprised expression.'],['Action and escalation','Medium tracking shot; a deliberate careful physical action causes a brief wobble; show hands and props clearly.'],['Payoff and reaction','Close-up reaction then wider reveal of a clever nonviolent solution; end on a readable satisfying expression.']];
 const shots=beats.map(([beat,motion],i)=>({id:'shot-'+(i+1),seconds:5,beat,prompt:`${look}. Same character in every shot: ${character}. Same location: ${setting}. Story premise: ${premise}. This shot: ${beat}. ${motion} Consistent proportions, clothing, screen direction and prop positions. Natural eye and hand movement. Original characters, no logos, no text overlays, no copied footage.`,anchorUrl:null,status:'PLANNED'}));
 return {title,style,character,setting,premise,shots,durationSeconds:15,ratio:'720:1280',audioPlan:'Original licensed music/foley or documented customer audio, mixed after picture lock; do not reuse reference audio',referencePolicy:'Analyze technique; create new characters, setting, script, voices and music',soundRequired:true,qualityCriteria:CRITERIA};
}
export function costEnvelope(story,{maxCredits,creditsPerSecond,maxAttemptsPerShot=1}={}){
 if(!Number.isInteger(maxCredits)||maxCredits<1||maxCredits>10000)throw Error('maxCredits must be an integer 1–10000');
 if(!Number.isInteger(creditsPerSecond)||creditsPerSecond<12||creditsPerSecond>100)throw Error('Verified current creditsPerSecond required');
 if(!Number.isInteger(maxAttemptsPerShot)||maxAttemptsPerShot<1||maxAttemptsPerShot>3)throw Error('Attempts must be 1–3');
 const ceiling=story.shots.reduce((n,s)=>n+s.seconds*creditsPerSecond*maxAttemptsPerShot,0);
 if(ceiling>maxCredits)throw Error('Shot generation exceeds the authorized credit ceiling');
 return {maxCredits,creditsPerSecond,maxAttemptsPerShot,plannedMaximumCredits:ceiling,reservedCredits:0,pricing:'Owner supplied current API rate; validate against the provider before execution'};
}
export async function cinematicState(){return getJson(KEY,fresh())}
export async function createVideoJob(input={}){
 const story=makeStoryboard(input),budget=costEnvelope(story,input.budget),id=randomUUID();
 const job={id,story,budget,status:'STORYBOARD_READY',createdAt:new Date().toISOString(),shots:story.shots.map(s=>({...s,attempts:0})),rights:{confirmed:false},review:null,artifact:null,providerCheck:null,orderId:input.orderId?text(input.orderId,100):null};
 await mutateJson(KEY,fresh(),s=>{s.jobs[id]=job});return job;
}
export async function updateVideoJob(id,fn){let out;await mutateJson(KEY,fresh(),async s=>{const job=s.jobs[id];if(!job)throw Error('Video job not found');await fn(job,s);job.updatedAt=new Date().toISOString();out=job});return out}
export async function authorizeVideoJob(id,input={}){
 if(input.originalAssetsConfirmed!==true||!text(input.rightsReference)||input.approvedStoryboard!==true)throw Error('Storyboard and documented rights confirmation required');
 return updateVideoJob(id,j=>{if(!['STORYBOARD_READY','BLOCKED_PROVIDER','GENERATION_FAILED'].includes(j.status))throw Error('Job cannot be authorized in this state');j.rights={confirmed:true,reference:text(input.rightsReference,500)};j.authorizedAt=new Date().toISOString();j.status='AUTHORIZED';if(j.orderId){let d=new Date();for(let n=0;n<5;){d.setUTCDate(d.getUTCDate()+1);if(![0,6].includes(d.getUTCDay()))n++}j.deadline=d.toISOString()}if(input.anchors){if(!Array.isArray(input.anchors)||input.anchors.length!==j.shots.length)throw Error('One approved first-frame URL per shot required');j.shots.forEach((s,i)=>{const u=new URL(input.anchors[i]);if(u.protocol!=='https:'||u.username||u.password)throw Error('Approved anchor must be HTTPS');s.anchorUrl=u.href})}});
}
async function runway(path,{method='GET',body,fetchImpl=fetch,env=process.env}={}){
 if(!env.RUNWAYML_API_SECRET)throw Error('RUNWAYML_API_SECRET is not configured on ULTRON');
 const r=await fetchImpl('https://api.dev.runwayml.com/v1'+path,{method,headers:{Authorization:'Bearer '+env.RUNWAYML_API_SECRET,'X-Runway-Version':'2024-11-06','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 const d=await r.json().catch(()=>({}));if(!r.ok){const e=Error('Video provider returned HTTP '+r.status);e.status=r.status;throw e}return d;
}
export async function videoPreflight(options={}){
 const env=options.env||process.env;if(!env.RUNWAYML_API_SECRET)return {ok:false,reason:'RUNTIME_API_KEY_MISSING',checkedAt:new Date().toISOString()};
 try{const org=await runway('/organization',options),model=org.tier?.models?.['gen4.5'],modelAvailable=Boolean(model)&&(model.maxConcurrentGenerations===null||model.maxConcurrentGenerations>0);return {ok:Number(org.creditBalance)>=60&&modelAvailable,creditBalance:Number(org.creditBalance)||0,modelAvailable,checkedAt:new Date().toISOString(),reason:Number(org.creditBalance)>=60&&modelAvailable?'API_MODEL_AND_CREDITS_PRESENT_EXECUTION_UNVERIFIED':'API_MODEL_OR_CREDITS_UNAVAILABLE'}}catch(e){return {ok:false,reason:'PROVIDER_AUTH_OR_AVAILABILITY_FAILED',httpStatus:e.status||null,checkedAt:new Date().toISOString()}}
}
export function reserveGeneration(j,check){
 if(j.rights.confirmed!==true||!j.authorizedAt)throw Error('Job is not authorized');j.providerCheck=check;
 if(!check.ok){j.status='BLOCKED_PROVIDER';return null}
 if(!['AUTHORIZED','GENERATING','GENERATION_FAILED'].includes(j.status))throw Error('Job is not ready for generation');
 const shot=j.shots.find(x=>['PLANNED','RETRY_APPROVED'].includes(x.status));if(!shot)return null;
 if(!shot.anchorUrl)throw Error('Approved shot anchor images are required for character consistency');
 if(shot.prompt.length>1000)throw Error('Shot prompt must be at most 1000 characters');
 const cost=shot.seconds*j.budget.creditsPerSecond;
 if(shot.attempts>=j.budget.maxAttemptsPerShot||j.budget.reservedCredits+cost>j.budget.maxCredits||cost>check.creditBalance)throw Error('Generation credit budget exhausted');
 shot.status='SUBMITTING';shot.attempts++;j.budget.reservedCredits+=cost;j.status='GENERATING';return {shotId:shot.id,body:{model:'gen4.5',promptImage:shot.anchorUrl,promptText:shot.prompt,ratio:j.story.ratio,duration:shot.seconds}};
}
export async function submitOneShot(id,options={}){
 const check=await videoPreflight(options);let reservation;
 await updateVideoJob(id,j=>{reservation=reserveGeneration(j,check)});if(!reservation)return {submitted:false,check};
 if(reservation.body.promptText.length>1000){await updateVideoJob(id,j=>{j.status='RECONCILIATION_REQUIRED';j.lastError='Prompt exceeds provider limit; no request sent'});throw Error('Shot prompt must be at most 1000 characters')}

 try{const task=await runway('/image_to_video',{...options,method:'POST',body:reservation.body});if(!task.id)throw Error('Provider returned no task ID');await updateVideoJob(id,j=>{const shot=j.shots.find(x=>x.id===reservation.shotId);shot.taskId=task.id;shot.status='PENDING';if(Number(task.estimatedCost?.credits)>shot.seconds*j.budget.creditsPerSecond){j.status='RECONCILIATION_REQUIRED';j.lastError='Provider estimate exceeds supplied rate; reconcile before additional submissions'}});return {submitted:true,taskId:task.id}}
 catch(e){await updateVideoJob(id,j=>{const shot=j.shots.find(x=>x.id===reservation.shotId);shot.status='SUBMISSION_UNKNOWN';j.status='RECONCILIATION_REQUIRED';j.lastError='Submission failed or timed out; reconcile provider usage before retrying'});throw e}
}
export async function pollVideoJob(id,options={}){
 const job=(await cinematicState()).jobs[id];if(!job)throw Error('Video job not found');
 for(const shot of job.shots.filter(s=>s.taskId&&['PENDING','RUNNING','THROTTLED'].includes(s.status))){const t=await runway('/tasks/'+encodeURIComponent(shot.taskId),options);await updateVideoJob(id,j=>{const x=j.shots.find(x=>x.id===shot.id);if(t.status==='SUCCEEDED'&&Array.isArray(t.output)&&t.output[0]){const u=new URL(t.output[0]);if(u.protocol!=='https:')throw Error('Invalid provider asset URL');x.status='SUCCEEDED';x.outputUrl=u.href}else if(['FAILED','CANCELED'].includes(t.status)){x.status=t.status;j.status='GENERATION_FAILED'}else x.status=['PENDING','RUNNING','THROTTLED'].includes(t.status)?t.status:'PENDING';if(j.shots.every(s=>s.status==='SUCCEEDED'))j.status='EDITING_REQUIRED'});}
 return (await cinematicState()).jobs[id];
}
export function reviewVideo(job,input={}){
 if(!job.artifact?.sha256||!job.artifact?.technical?.passed)throw Error('A real technically checked final MP4 is required');
 if(input.watchedEntireVideo!==true||input.originalAssetsConfirmed!==true||!text(input.reviewer)||!text(input.rightsReference)||!text(input.audioLicenseReference))throw Error('Full playback, reviewer and rights/audio evidence required');
 const scores=Object.fromEntries(CRITERIA.map(k=>{const n=input.scores?.[k];if(!Number.isInteger(n)||n<1||n>5)throw Error('Score each quality criterion 1–5');return [k,n]}));
 const passed=Object.values(scores).every(n=>n>=4)&&job.rights.confirmed===true;
 return {passed,scores,reviewer:text(input.reviewer,100),reviewedArtifactSha256:job.artifact.sha256,rightsReference:text(input.rightsReference),audioLicenseReference:text(input.audioLicenseReference),watchedEntireVideo:true,at:new Date().toISOString(),status:passed?'QUALITY_APPROVED':'REVISION_REQUIRED'};
}
export function sampleEligible(job){return Boolean(job?.review?.passed&&job.artifact?.technical?.passed&&job.review.reviewedArtifactSha256===job.artifact.sha256&&job.shots?.length>=3&&job.shots.every(s=>s.status==='SUCCEEDED'&&s.taskId)&&job.rights?.confirmed)}
export async function recordVideoReview(id,input){return updateVideoJob(id,(j,s)=>{j.review=reviewVideo(j,input);j.status=j.review.status;if(input.releaseAsSample===true){if(!sampleEligible(j))throw Error('Sample must pass full quality review');s.sampleJobId=j.id}})}
export async function salesReadiness(options={}){
 const state=options.state||await cinematicState(),provider=await videoPreflight(options),sample=state.jobs[state.sampleJobId];
 const ready=provider.ok&&sampleEligible(sample);
 return {ready,provider,sampleVerified:sampleEligible(sample),reason:ready?'SAMPLE_AND_PROVIDER_VERIFIED':'GENERATION_AND_APPROVED_SAMPLE_REQUIRED',terms:VIDEO_TERMS,paymentEnabled:ready,guaranteedIncome:false};
}
export async function recordVideoInquiry(input={},ip=''){
 const name=text(input.name,100),email=text(input.email,200),brief=text(input.brief,2000);if(!name||!/^\S+@\S+\.\S+$/.test(email)||brief.length<20||input.serviceContactConsent!==true)throw Error('Name, email, detailed brief and service-contact consent required');
 const key=createHash('sha256').update(ip).digest('hex'),id=randomUUID(),now=Date.now();
 await mutateJson(KEY,fresh(),s=>{if(s.inquiries.filter(x=>x.ipHash===key&&now-x.receivedMs<3600000).length>=3)throw Error('Please wait before another request');s.inquiries.push({id,name,email,brief,receivedMs:now,ipHash:key,createdAt:new Date().toISOString(),status:'REQUEST_RECEIVED',marketingConsent:false});s.inquiries=s.inquiries.slice(-1000)});return {id,status:'REQUEST_RECEIVED',charged:false};
}
export async function makeVideoQuote(input={}){
 const s=await cinematicState(),inquiry=s.inquiries.find(x=>x.id===input.inquiryId);if(!inquiry)throw Error('Inquiry not found');if(!validMoney(input.priceUsd)||input.priceUsd<100)throw Error('Price must be $100–$500');if(!Number.isInteger(input.maxGenerationCredits)||input.maxGenerationCredits<180||input.maxGenerationCredits>10000)throw Error('Generation ceiling required');
 const id=randomUUID(),quote={id,inquiryId:inquiry.id,priceUsd:input.priceUsd,maxGenerationCredits:input.maxGenerationCredits,scope:text(input.scope||VIDEO_TERMS.scope,1000),terms:VIDEO_TERMS,token:randomBytes(24).toString('hex'),status:'DRAFT',expiresAt:new Date(Date.now()+7*86400000).toISOString(),customerEmail:inquiry.email};
 await mutateJson(KEY,fresh(),s=>{s.quotes[id]=quote});return quote;
}
export async function cinematicCycle(){const s=await cinematicState();let polled=0,submitted=0;if(!Object.keys(s.jobs).length)await createVideoJob({budget:{maxCredits:180,creditsPerSecond:12}});for(const j of Object.values(s.jobs).filter(x=>x.status==='GENERATING').slice(0,2)){await pollVideoJob(j.id).catch(()=>{});polled++}const next=await cinematicState();for(const j of Object.values(next.jobs).filter(x=>['AUTHORIZED','GENERATING'].includes(x.status)&&x.shots.some(s=>s.status==='PLANNED')).slice(0,1)){const result=await submitOneShot(j.id).catch(()=>null);if(result?.submitted)submitted++}return {polled,billableSubmissions:submitted}}
export async function publicCinematic(){const s=await cinematicState();return {version:'43.0.0',reference:REFERENCE_ANALYSIS,terms:VIDEO_TERMS,sampleVerified:sampleEligible(s.jobs[s.sampleJobId]),runtimeCredentialConfigured:Boolean(process.env.RUNWAYML_API_SECRET),generationVerified:sampleEligible(s.jobs[s.sampleJobId]),checkout:'LOCKED_UNTIL_APPROVED_SAMPLE_AND_PROVIDER_CHECK',qualityCriteria:CRITERIA}}

export async function attachVideoArtifact(id,input){const {verifyEncodedVideo}=await import('./media/cinematic-edit-v43.mjs');const j=(await cinematicState()).jobs[id];if(!j||!j.shots.every(s=>s.status==='SUCCEEDED'))throw Error('Completed provider shots required');const artifact=await verifyEncodedVideo(input.base64,{duration:j.story.durationSeconds});return updateVideoJob(id,j=>{j.artifact=artifact;j.review=null;j.status='QUALITY_REVIEW_REQUIRED'})}
export async function editVideoJob(id,input){const {assembleVideo}=await import('./media/cinematic-edit-v43.mjs');const j=(await cinematicState()).jobs[id];if(!j)throw Error('Job not found');const artifact=await assembleVideo(j,input);return updateVideoJob(id,j=>{j.artifact=artifact;j.review=null;j.status='QUALITY_REVIEW_REQUIRED'})}
export function publicJob(j){if(!j)return null;const out=structuredClone(j);if(out.artifact)delete out.artifact.base64;return out}
export const CINEMA_SKU='cinematic-short-v43';
export async function issueVideoQuote(id){const ready=await salesReadiness();if(!ready.ready)throw Error('A generated quality-approved sample and funded runtime API are required before issuing a paid quote');let quote;await mutateJson(KEY,fresh(),s=>{const q=s.quotes[id];if(!q||q.status!=='DRAFT')throw Error('Draft quote not found');q.status='ISSUED';quote=q});return quote}
export async function claimVideoQuote(input={}){
 if(input.acceptTerms!==true||input.termsVersion!==VIDEO_TERMS.version)throw Error('Accept the current video terms');const ready=await salesReadiness();if(!ready.ready)throw Error('Video production checkout is not ready');let quote;
 await mutateJson(KEY,fresh(),s=>{const q=Object.values(s.quotes).find(q=>q.token===input.quoteToken);if(!q||q.status!=='ISSUED'||Date.parse(q.expiresAt)<=Date.now())throw Error('Current issued quote required');q.status='CHECKOUT_CREATING';quote=structuredClone(q)});return quote;
}
export async function checkoutQuoteRecorded(quoteId,orderId,url){await mutateJson(KEY,fresh(),s=>{const q=s.quotes[quoteId];if(q){q.status='AWAITING_CUSTOMER_PAYMENT';q.orderId=orderId;q.checkoutUrl=url}})}
export async function ensurePaidVideoJob(order){
 if(!order.captureId||order.status!=='COMPLETED'||!order.videoQuote)throw Error('Verified paid video order required');
 const state=await cinematicState(),existing=Object.values(state.jobs).find(j=>j.orderId===order.id);if(existing)return existing;
 const q=state.quotes[order.videoQuote.id],inquiry=state.inquiries.find(i=>i.id===q?.inquiryId);if(!q||!inquiry)throw Error('Paid order intake not found');
 // Create atomically by order ID to avoid duplicate fulfillment on webhook replay.
 let result;await mutateJson(KEY,fresh(),s=>{const previous=Object.values(s.jobs).find(j=>j.orderId===order.id);if(previous){result=previous;return}const id=randomUUID(),story=makeStoryboard({premise:inquiry.brief}),budget=costEnvelope(story,{maxCredits:q.maxGenerationCredits,creditsPerSecond:12});result={id,story,budget,status:'STORYBOARD_READY',createdAt:new Date().toISOString(),shots:story.shots.map(x=>({...x,attempts:0})),rights:{confirmed:false},review:null,artifact:null,orderId:order.id,deadline:null};s.jobs[id]=result;s.quotes[q.id].status='PAID_PRODUCTION_QUEUED'});return result;
}
export async function customerVideo(order){const state=await cinematicState(),j=Object.values(state.jobs).find(j=>j.orderId===order.id);return j||null}
export async function acceptCustomerVideo(order,input){const j=await customerVideo(order);if(!j||!sampleEligible(j)||input.accepted!==true||input.sha256!==j.artifact.sha256)throw Error('Quality-approved matching video and explicit acceptance required');return updateVideoJob(j.id,j=>{j.customerAcceptance={sha256:input.sha256,at:new Date().toISOString()};j.status='CUSTOMER_ACCEPTED'})}
