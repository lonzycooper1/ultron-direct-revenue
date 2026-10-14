/**
 * ULTRON V39 — Video Intelligence + Evidence Lab.
 * Clips supplied 2026-10-14: screen recordings 16-04-16 (128.27s), 16-06-32 (117.7s).
 * Frame-observed ideas are research inputs, never provider, scientific or revenue proof.
 * No scraping, external publication, email sends, identity action, live trades or spending.
 */
import {randomUUID,createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
export const VERSION='39.0.0',STATE_KEY='ultron-video-intelligence-v39';
const now=()=>new Date().toISOString();
const clean=(v,max=200)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
const slug=s=>clean(s,100).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,58);
const hash=s=>createHash('sha256').update(s).digest('hex').slice(0,20);
const SEED=()=>({version:VERSION,createdAt:now(),drafts:[],experiments:[],events:[],updatedAt:now()});
export const EVIDENCE_LEVELS=Object.freeze(['DOCUMENTED_OFFICIAL','OBSERVED_VIDEO','UNVERIFIED_SOCIAL_CLAIM','EXTERNAL_VALIDATION_REQUIRED']);
export const VIDEO_ITEMS=Object.freeze([
 {id:'flow-studio',clip:1,second:17,topic:'ElevenLabs Flows and node-based agent media pipelines',level:'DOCUMENTED_OFFICIAL',value:'Reusable scene -> audio -> caption -> review flow; rerun a failed node without restarting the whole project',firstSale:91,effort:2,risk:1,workstream:'ORIGINAL_CONTENT_STUDIO',source:'https://elevenlabs.io/blog/introducing-flows-agent'},
 {id:'media-agents',clip:1,second:28,topic:'Multi-agent video generation and tool orchestration',level:'OBSERVED_VIDEO',value:'Bounded writer, creative producer, rights reviewer and evidence verifier coordinated by a single queue',firstSale:83,effort:2,risk:1,workstream:'CREATIVE_ORCHESTRATOR'},
 {id:'market-forecast',clip:1,second:23,topic:'Bitcoin next-15-minute price forecasts',level:'UNVERIFIED_SOCIAL_CLAIM',value:'Evaluate forecast calibration, timestamped prices, slippage and out-of-sample baselines; paper research only',firstSale:7,effort:3,risk:5,workstream:'PAPER_MARKET_RESEARCH'},
 {id:'data-filter',clip:1,second:59,topic:'Claimed Stanford Jev system filtering large data workloads',level:'UNVERIFIED_SOCIAL_CLAIM',value:'Prototype bounded anomaly-detection and dedupe on customer-approved records; do not repeat 40-billion-record claim',firstSale:70,effort:3,risk:3,workstream:'DATA_QUALITY_GATE'},
 {id:'alphachip',clip:1,second:73,topic:'Google AlphaChip AI-assisted chip placement',level:'DOCUMENTED_OFFICIAL',value:'Benchmark-and-reward design for optimizing ULTRON schedules, without claiming our scheduler matches AlphaChip',firstSale:58,effort:4,risk:1,workstream:'OPTIMIZATION_BENCHMARK',source:'https://deepmind.google/blog/how-alphachip-transformed-computer-chip-design/'},
 {id:'ai-discoveries',clip:1,second:88,topic:'AI discoveries in math, science, weather and medicine',level:'OBSERVED_VIDEO',value:'Original AI discoveries explainer series tied to primary citations and honest outcome wording',firstSale:74,effort:1,risk:2,workstream:'EVIDENCE_BACKED_MEDIA'},
 {id:'coding-assistants',clip:1,second:116,topic:'Continue, Aider and Tabby open-source coding tools',level:'DOCUMENTED_OFFICIAL',value:'Reuse code review, diff-first patching, CI checks, and optional self-hosted coding assistance, never install unknown repos automatically',firstSale:81,effort:2,risk:2,workstream:'CODE_REVIEW_AGENT',source:'https://github.com/TabbyML/tabby'},
 {id:'ai-six-layers',clip:2,second:11,topic:'36 companies across six layers of the AI supply chain',level:'OBSERVED_VIDEO',value:'Vendor inventory for compute, data, foundation models, tooling, distribution and end-user applications',firstSale:84,effort:1,risk:2,workstream:'PROVIDER_DEPENDENCY_GRAPH'},
 {id:'abundance-story',clip:2,second:18,topic:'Technology-driven cost reductions and AI service price pressure',level:'OBSERVED_VIDEO',value:'Track cost per completed useful customer outcome, rather than headline product counts',firstSale:89,effort:2,risk:1,workstream:'UNIT_ECONOMICS'},
 {id:'market-dashboards',clip:2,second:42,topic:'High-polish AI trading heatmaps and simulation dashboards',level:'UNVERIFIED_SOCIAL_CLAIM',value:'Build honest visual analytics with backtest provenance, drawdown and net-of-fee returns; no promise of trading profits',firstSale:10,effort:4,risk:5,workstream:'PAPER_MARKET_RESEARCH'},
 {id:'trading-bot-profit',clip:2,second:69,topic:'Claude trading bot $600 to $10,000 and 92% win rate in a reel',level:'UNVERIFIED_SOCIAL_CLAIM',value:'Reject screenshot-only profit evidence; require broker statements, duration, fees, risk and independent verification',firstSale:4,effort:1,risk:5,workstream:'ANTI_FRAUD_EVIDENCE'},
 {id:'launch-supply-chain',clip:2,second:79,topic:'SpaceX launch video emphasizing five external companies',level:'OBSERVED_VIDEO',value:'Identify which external services every customer deliverable depends on and define compliant fallbacks',firstSale:83,effort:2,risk:2,workstream:'DELIVERY_DEPENDENCIES'},
 {id:'wealth-structures',clip:2,second:104,topic:'ChatGPT wealth blueprint, trusts, holding companies, LLCs and debt reduction',level:'OBSERVED_VIDEO',value:'Business bookkeeping and lender-readiness document checklists, separate from licensed legal, tax, credit or financial advice',firstSale:38,effort:3,risk:4,workstream:'BUSINESS_READINESS'},
 {id:'social-viral-hooks',clip:2,second:115,topic:'Strong visual hooks, screenshots, scripts and platform-native reel layouts',level:'OBSERVED_VIDEO',value:'Make original short-form explainers with citations, visible caveats, customer CTA and clearly identified AI-generated media',firstSale:94,effort:1,risk:2,workstream:'ORIGINAL_CONTENT_STUDIO'}
]);
export const DEPENDENCY_LAYERS=Object.freeze([
 {id:'compute',examples:['Railway','hosting capacity'],fallback:'bounded operation with maintenance notices'},
 {id:'data',examples:['opt-in lead intake','documented authorized buyer feed'],fallback:'owned voluntary submissions; no fabricated prospects'},
 {id:'models',examples:['video/image/speech API'],fallback:'original editable motion graphics while video model is unavailable'},
 {id:'orchestration',examples:['Revenue Commander','bounded agent workers','CI'],fallback:'internal manual approval queue'},
 {id:'distribution',examples:['authorized Metricool social publishing','approved Gmail'],fallback:'downloadable publish-ready assets and owner export'},
 {id:'revenue',examples:['PayPal signed webhook','customer acceptance','settlement records'],fallback:'direct owner-approved proposals and payment links, never synthetic orders'}
]);
export const CONTROLS=Object.freeze({
 externalAction:'SCOPED_OWNER_AND_PROVIDER_APPROVAL',
 unverifiedClaims:'NEVER_PRESENT_AS_FACT',
 liveTrading:'DISABLED',
 copyingOtherVideos:'DISALLOWED',
 identityMFA:'OWNER_ONLY',
 creditAndLegal:'REVIEW_BY_QUALIFIED_PROFESSIONAL',
 outbound:'CONSENT_AND_APPROVED_CAMPAIGN_REQUIRED',
 aiMediaLabel:'ENABLED',
 maxDrafts:60,
 maxBatch:10
});
export function rankOpportunities(items=VIDEO_ITEMS){
 return [...items].map(x=>({...x,priority:Math.max(0,Math.min(100,Math.round(x.firstSale-x.effort*4-x.risk*8)))}))
   .sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
}
export function verifyClaim({text='',sources=[],level='UNVERIFIED_SOCIAL_CLAIM'}={}){
 const claim=clean(text,350);
 const arr=Array.isArray(sources)?sources:[];
 const evidence=arr.filter(x=>typeof x==='string'&&/^https:\/\/[a-z0-9.-]+\//i.test(x)&&!/(?:localhost|\.local|example\.)/i.test(x)).slice(0,6);
 const riskSignals=[/\$\s?\d[\d,]*\s*(?:to|→|->)\s*\$?\s?\d/i,/(?:win rate|guaranteed|risk.free|\b\d{2,3}%\b)/i,/(?:billion records|secret|no human|instantly)/i].filter(p=>p.test(claim)).length;
 const needsCheck=!claim||!evidence.length||level!=='DOCUMENTED_OFFICIAL';
 return {claim,reportedLevel:EVIDENCE_LEVELS.includes(level)?level:'UNVERIFIED_SOCIAL_CLAIM',
  sourceUrls:evidence,claimRisk:riskSignals>=1?'HIGH':'NORMAL',
  canPublishAsVerifiedFact:false,needsIndependentSourceInspection:true,
  suggestedWording:needsCheck?'Social-media claim; not independently verified.':'Documented source is attached; independently verify its precise wording before publication.'};
}
function checkVideoInput(raw={}){
 const topic=clean(raw.topic,120),audience=clean(raw.audience||'Local service-business owners',90);
 if(topic.length<8)throw Error('Specific original video topic required');
 if(!['AI_EXPLAINER','DEMO','SERVICE_OFFER','CASE_STUDY','MARKET_RESEARCH'].includes(raw.format||'AI_EXPLAINER'))throw Error('Invalid format');
 const claims=Array.isArray(raw.claims)?raw.claims.slice(0,8).map(x=>verifyClaim(x)):[];
 const ref=clean(raw.inspiration||'',220);
 if(/(?:reupload|rip |copy exactly|clone original|duplicate video|remove watermark)/i.test(topic+' '+ref))throw Error('Only original work with permission or appropriately licensed assets');
 return {topic,audience,format:raw.format||'AI_EXPLAINER',claims,inspiration:ref,
  hook:clean(raw.hook||'What most businesses miss about '+topic,160),
  promise:clean(raw.promise||'A practical, verifiable improvement—not an income guarantee.',180),
  cta:clean(raw.cta||'See ULTRON’s free response-gap scan.',160),
  intent:clean(raw.intent||'Help an actual buyer understand and evaluate the service',220)};
}
export function storyboard(raw={}){
 const b=checkVideoInput(raw);
 const warning=b.claims.some(x=>x.claimRisk==='HIGH'||x.needsIndependentSourceInspection);
 const shots=[
  {seconds:'0-3',type:'ORIGINAL_HOOK',visual:'Original high-contrast animated shapes, readable 6-word hook',voice:b.hook},
  {seconds:'3-10',type:'PROBLEM',visual:'Custom animated before/after workflow or annotated non-client demo',voice:'Here is the actual operational problem.'},
  {seconds:'10-20',type:'MECHANISM',visual:'Original flow diagram with three labeled, evidence-safe steps',voice:'Here is a simple way to improve it.'},
  {seconds:'20-27',type:'PROOF_AND_CAVEAT',visual:'Source labels or clearly stated demo assumptions',voice:warning?'Claims in this video are examples or require independent verification.':'Results depend on the actual business; this is a proposed workflow.'},
  {seconds:'27-30',type:'CTA',visual:'Branded ULTRON card and short service URL',voice:b.cta}
 ];
 return {format:'VERTICAL_9_16',targetDurationSeconds:30,originalOnly:true,aiGeneratedDisclosureRequired:true,
  audience:b.audience,topic:b.topic,claims:b.claims,shots,
  requiredAssetChecks:['OWNERSHIP_OR_LICENSE','SOURCE_ACCURACY','VOICE_AND_MUSIC_RIGHTS','AI_LABEL','OWNER_APPROVAL','PUBLISHING_ACCOUNT_CONNECTED'],
  publication:'NOT_AUTHORIZED_BY_SCRIPT_GENERATION',offerFocus:b.format==='SERVICE_OFFER'?'$200 lead-intake pilot':'free response-gap scan'};
}
export function economics({verifiedCustomers=0,grossRevenueUsd=0,processingFeesUsd=0,fulfillmentCostUsd=0,acquisitionCostUsd=0,refundsUsd=0,period=''}={}){
 const money=x=>Number.isFinite(Number(x))&&Number(x)>=0?Number(x):0;
 const revenue=money(grossRevenueUsd),fees=money(processingFeesUsd),fulfillment=money(fulfillmentCostUsd),
 acquisition=money(acquisitionCostUsd),refunds=money(refundsUsd);
 const contribution=+(revenue-fees-fulfillment-acquisition-refunds).toFixed(2);
 return {period:clean(period,80),evidence:'USER_SUPPLIED_VALUES_NOT_VERIFIED',verifiedCustomerCountProvided:Math.floor(money(verifiedCustomers)),
  grossRevenueUsd:revenue,feesUsd:fees,fulfillmentCostUsd:fulfillment,acquisitionCostUsd:acquisition,refundsUsd:refunds,
  contributionUsd:contribution,contributionMargin:revenue?+(contribution/revenue).toFixed(4):null,
  interpretation:'Arithmetic scenario only. Revenue, actual payout, accounting profit and cash-in-bank must be reconciled separately.'};
}
export async function queueOriginalDraft(raw={}){
 const b=checkVideoInput(raw),plan=storyboard(raw);
 const dedupe=hash(b.topic+'|'+b.audience+'|'+b.format);
 let selected;
 const state=await mutateJson(STATE_KEY,SEED(),s=>{
  selected=s.drafts.find(x=>x.dedupe===dedupe&&x.status!=='REJECTED');
  if(selected)return;
  if(s.drafts.filter(x=>x.status!=='REJECTED').length>=CONTROLS.maxDrafts)throw Error('Draft queue full; review existing assets before adding more');
  selected={id:randomUUID(),dedupe,topic:b.topic,audience:b.audience,format:b.format,
    createdAt:now(),status:'NEEDS_SOURCE_AND_RIGHTS_REVIEW',storyboard:plan,
    rightsVerified:false,claimsIndependentlyChecked:false,ownerApproved:false,mediaProduced:false,
    connectedPublisherVerified:false,publishResultEvidence:null};
  s.drafts.unshift(selected);s.events.unshift({at:now(),action:'ORIGINAL_DRAFT_QUEUED',id:selected.id});
  s.events=s.events.slice(0,80);s.updatedAt=now();
 });
 return {draft:selected,queueLength:state.drafts.length,externalActionTaken:false};
}
export async function updateDraftReview({id='',claimsChecked=false,rightsVerified=false,ownerApproved=false,mediaProduced=false,publisherConnected=false,publicationUrl=''}={}){
 let result;
 await mutateJson(STATE_KEY,SEED(),s=>{
  const d=s.drafts.find(x=>x.id===id);if(!d)throw Error('Draft not found');
  if(publicationUrl)throw Error('Publication cannot be asserted via internal API; verify independently from publisher and record with dedicated evidence');
  if(claimsChecked&&!d.storyboard.claims.every(x=>x.sourceUrls.length))throw Error('A claim cannot be checked without recorded sources');
  d.claimsIndependentlyChecked=Boolean(claimsChecked);
  d.rightsVerified=Boolean(rightsVerified);
  d.ownerApproved=Boolean(ownerApproved);
  d.mediaProduced=Boolean(mediaProduced);
  d.connectedPublisherVerified=Boolean(publisherConnected);
  d.status=d.claimsIndependentlyChecked&&d.rightsVerified&&d.ownerApproved&&d.mediaProduced&&d.connectedPublisherVerified?'READY_FOR_OWNER_APPROVED_PUBLICATION':'NEEDS_SOURCE_AND_RIGHTS_REVIEW';
  result={id:d.id,status:d.status,gates:{source:d.claimsIndependentlyChecked,rights:d.rightsVerified,approval:d.ownerApproved,media:d.mediaProduced,publisher:d.connectedPublisherVerified}};
  s.events.unshift({at:now(),action:'DRAFT_INTERNAL_REVIEW',id:d.id,status:d.status});s.events=s.events.slice(0,80);s.updatedAt=now();
 });return {...result,externalActionTaken:false};
}
export async function report({privateView=false,env={}}={}){
 const s=await getJson(STATE_KEY,SEED());
 const accountAvailability={
  runwayVideoGeneration:{status:'CURRENTLY_BLOCKED_EXTERNAL_PLAN',basis:'Free Runway workspace confirmed 2026-10-14; do not infer future entitlement'},
  metricoolPublishing:{status:'CURRENTLY_BLOCKED_EXTERNAL_CONNECTION',basis:'No connected social channel confirmed 2026-10-14'},
  productionEmail:{status:env.ULTRON_GMAIL_REFRESH_TOKEN?'CREDENTIAL_PRESENT_NOT_VERIFIED':'BLOCKED_RUNTIME_OAUTH'},
  providerProof:'Live status requires a fresh provider check; these integration notes are not connection tests.'
 };
 const draftStats={total:s.drafts.length,needsReview:s.drafts.filter(x=>x.status==='NEEDS_SOURCE_AND_RIGHTS_REVIEW').length,readyForOwnerApprovedPublication:s.drafts.filter(x=>x.status==='READY_FOR_OWNER_APPROVED_PUBLICATION').length,confirmedPublishedByProvider:0};
 return {version:VERSION,mission:'FIRST_REAL_CUSTOMER_USING_ORIGINAL_VERIFIED_CONTENT_AND_WORKFLOWS',
  videoSources:[{clip:1,file:'ScreenRecording_10-14-2026 16-04-16_1.mp4',durationSeconds:128.27},
   {clip:2,file:'ScreenRecording_10-14-2026 16-06-32_1.mp4',durationSeconds:117.7}],
  observations:rankOpportunities(),dependencies:DEPENDENCY_LAYERS,controls:CONTROLS,
  summary:{observationCount:VIDEO_ITEMS.length,verifiedByOfficialSource:VIDEO_ITEMS.filter(x=>x.level==='DOCUMENTED_OFFICIAL').length,unverifiedSocialClaims:VIDEO_ITEMS.filter(x=>x.level==='UNVERIFIED_SOCIAL_CLAIM').length,queue:draftStats},
  accountAvailability,docs:['https://elevenlabs.io/blog/introducing-flows-agent','https://deepmind.google/blog/how-alphachip-transformed-computer-chip-design/','https://github.com/TabbyML/tabby'],
  drafts:privateView?s.drafts.map(d=>({id:d.id,topic:d.topic,status:d.status,createdAt:d.createdAt,gates:{claims:d.claimsIndependentlyChecked,rights:d.rightsVerified,approved:d.ownerApproved,media:d.mediaProduced,publisher:d.connectedPublisherVerified}})):undefined,
  status:'ENGINE_DEPLOYED_RESEARCH_AND_DRAFTS_ONLY',
  warning:'Frame-observed content does not authenticate the creator, trading results, claim provenance, private footage rights, social access or a paid customer. No publication is made from this module.'};
}
