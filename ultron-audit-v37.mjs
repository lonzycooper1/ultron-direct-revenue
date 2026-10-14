/** ULTRON V37: last-14-day request audit + safe owner triage.
 * This inventories user-requested outcomes rather than representing them as complete.
 * No external messaging, buying, banking, self-verification, video posting or trade orders.
 */
import {randomUUID} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
export const VERSION='37.0.0',WINDOW={start:'2026-10-01',end:'2026-10-14'};
export const LEAD_SHEET='https://docs.google.com/spreadsheets/d/1ZD-Utal-3e0CSrQ590QI7k0SulMeZFzbXe6HYOlaDKA/edit';
export const TRACKER='https://github.com/lonzycooper1/ultron-direct-revenue/issues/25';
export const WORKSTREAMS=Object.freeze([
 {id:'customers',rank:1,category:'REVENUE',name:'Find an independently verified corporate buyer and close a scoped deal',existing:'V35 B2B offer, demo, research queue and proposal generator',gate:'Buyer consent, qualified delivery partner, executed contract and provider payment proof',status:'BLOCKED_EXTERNAL_DEMAND'},
 {id:'outreach',rank:2,category:'REVENUE',name:'Send permissioned personalized outbound and process replies',existing:'Ten researched Houston roofing candidates and tailored message drafts in Google Sheet',gate:'Published contacts must be verified, postal address, compliant sending, runtime Gmail OAuth, suppression and recipient approval',status:'BLOCKED_SENDER'},
 {id:'agency',rank:3,category:'REVENUE',name:'Launch authentic AI automation agency and LinkedIn presentation',existing:'ULTRON Revenue Studio public growth page, authentic profile and five posts drafted',gate:'Owner-controlled real LinkedIn account, role/title verification and approval to change it',status:'BLOCKED_EXTERNAL_ACCOUNT'},
 {id:'booking',rank:4,category:'REVENUE',name:'Convert interested replies into confirmed booking and CRM',existing:'V35 booking design and prior Google Calendar and HubSpot adapters',gate:'Railway Gmail/HubSpot/Calendar runtime credentials and external QA',status:'BLOCKED_RUNTIME_INTEGRATION'},
 {id:'delivery',rank:5,category:'CUSTOMER',name:'Deliver scoped installations with acceptance and support',existing:'V35 workflow plan, QA templates, lead-intake synthetic demo',gate:'Qualified capacity, signed customer scope, real system permissions, quality and acceptance signoff',status:'BLOCKED_NO_CUSTOMERS'},
 {id:'payments',rank:6,category:'FINANCE',name:'Close PayPal checkout-to-fulfillment-to-bank settlement evidence',existing:'PayPal client credentials and signed webhook configured in last production status',gate:'Real unrelated paid order, reconciliation, refund/fee netting and settlement proof',status:'BLOCKED_NO_VERIFIED_PURCHASE'},
 {id:'identity',rank:7,category:'PLATFORM',name:'Branded domain, registered business identity, postal address and authenticated mail',existing:'Railway public domain, external domain not previously verified',gate:'Owned domain, business identity proof, DNS and sender registration',status:'BLOCKED_EXTERNAL_IDENTITY'},
 {id:'commerce',rank:8,category:'COMMERCE',name:'Approve store launch, refund/advertising policies and physical fulfillment',existing:'Shopify trial and agent commerce queue; three pending approvals in prior logs',gate:'Owner review of each approval, eligible paid plan, POD connection and policies',status:'BLOCKED_STORE_APPROVALS'},
 {id:'safety',rank:9,category:'SECURITY',name:'Verification agent and multi-layer platform security',existing:'V32 VerificationAgent and V23+ security/evidence controllers',gate:'MFA, ID verification, legal signatures, purchases and auth cannot be delegated to a bot; validate actual penetration and failure scenarios',status:'IMPLEMENTED_WITH_OWNER_GATES'},
 {id:'autonomy',rank:10,category:'PLATFORM',name:'24/7 supervised agent-of-agents, fallback, notifications and self-healing',existing:'V12+ agent runtime, reflections, supervisor cycles and postgresql queue',gate:'Trusted authorized providers, alert delivery enabled, failure-injection acceptance and bounded expenses',status:'PARTIAL'},
 {id:'content',rank:11,category:'MEDIA',name:'Script, narrate, caption and publish original AI educational videos',existing:'V36 ten original scripts, guide and private media draft console',gate:'Actual account access, footage and audio rights, verified posting integration and factual reviews',status:'BLOCKED_PUBLISHING'},
 {id:'product',rank:12,category:'MEDIA',name:'Sell original $49 digital guide and optional $99 community',existing:'Full original manuscript, public preview and downloadable PDF',gate:'Approved real checkout, clear customer support/refunds, lawful recurring terms and provider receipts',status:'BLOCKED_LIVE_CHECKOUT'},
 {id:'design',rank:13,category:'PLATFORM',name:'Futuristic 3D-themed owner and customer websites',existing:'Existing ULTRON interfaces and growth landing pages',gate:'Actual cross-browser UX/accessibility/performance testing, owner acceptance',status:'PARTIAL'},
 {id:'procurement',rank:14,category:'ENTERPRISE',name:'Complete legitimate Garland ISD Drupal bid and vendor readiness',existing:'Oct 11 proposal draft for Garland ISD RFP 122-27; not submitted',gate:'Official bid/Addenda 1–2, registered eligible vendor, qualified Drupal staff, truthful references, approved fees; deadline indicated Oct 20 2026 10:30am CDT',status:'BLOCKED_COMPLIANCE'},
 {id:'loan',rank:15,category:'FINANCE',name:'Lender readiness: financial books, verifiable revenue and responsible credit materials',existing:'V13 loan-readiness module and proposal checklist',gate:'Legal entity, bank statements, proper reporting, real invoices, taxes and lender documentation',status:'BLOCKED_EVIDENCE'},
 {id:'sports',rank:16,category:'RESEARCH',name:'Connect licensed real-time sports/props APIs and quality evaluation',existing:'Sports JARVIS and older simulated analytics interfaces',gate:'Licensed feed, sport-specific historical evaluation and legal platform compliance',status:'BLOCKED_DATA'},
 {id:'crypto',rank:17,category:'RESEARCH',name:'Paper-only trading research, accountable trade approvals, risk metrics',existing:'V23 research, safe order preparation and simulation',gate:'User-approved compatible venue route and deterministic risk engine; never discretionary live trading',status:'SIMULATION_ONLY'},
 {id:'opportunities',rank:18,category:'RESEARCH',name:'Authorized market research from short-form creator strategies',existing:'Oct 4 written source review and 50 indexed Instagram references (partial audiovisual coverage)',gate:'Proven demand, documented licensing, actual measured results before adapting',status:'RESEARCHED_PARTIAL'}
]);
export const VIDEO_COVERAGE=Object.freeze({
 discoveredLibraryFiles:86,reportIndexedSocialReferences:50,fullAudioTranscriptionsVerified:0,
 sampledHere:[
 {name:'ScreenRecording_10-05-2026 23-24-14_1(1).mp4',coverage:'Nine time-sampled frames, no spoken audio',observed:'AI coding-agent tools, workflow/repository marketing and speculative trading claims',adapt:'Test code, avoid unsupported product claims or treating dashboard earnings as real'},
 {name:'ScreenRecording_10-07-2026 10-31-42_1.mp4',coverage:'Nine time-sampled frames, no spoken audio',observed:'Founder marketing, bank credit products, business loan discussion and card offers',adapt:'Documented loan readiness and honest credit/evidence requirements'},
 {name:'ScreenRecording_10-08-2026 15-56-55_1.mp4',coverage:'Nine time-sampled frames, no spoken audio',observed:'Simplicity and time-savings positioning, OpenHands, UGC hooks, content assembly and financial stories',adapt:'Prioritize measurable customer ROI, supervised code assistant and editorial quality'},
 {name:'ScreenRecording_10-08-2026 17-19-08_1.mp4',coverage:'Nine time-sampled frames, no spoken audio',observed:'AI product ideas, holding-company diagrams, business cloning, no-budget agency pitch',adapt:'Select one truthful offer and customer first, model costs and demand'}
 ],
 unreviewedCaveat:'84+ files can be listed, but only the four named files were time-sampled in this pass; duplicated versions exist. Do not claim all clips fully watched or transcribed.'
});
const SKIP=['MFA','OTP','password','bank transfer','refund','publish','trade','contract','identity'];
const clean=x=>String(x??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,600);
const initial=()=>({version:VERSION,cycles:0,lastCycle:null,records:[]});
export function priorityQueue({buyerCount=0,verifiedOrders=0}={}){
 const sorted=[...WORKSTREAMS].sort((a,b)=>a.rank-b.rank);
 const jobs=sorted.map(x=>({...x,ownerRequired:!['IMPLEMENTED_WITH_OWNER_GATES','SIMULATION_ONLY'].includes(x.status)}));
 return {objective:buyerCount>0?'DELIVER_AND_REPEAT_VERIFIED_REVENUE':'FIRST_INDEPENDENT_VERIFIED_B2B_BUYER',
  orderVerified:verifiedOrders>0,jobs};
}
export function evidencePolicy(action,note){
 const a=clean(action).toUpperCase(),n=clean(note);
 if(!['ACKNOWLEDGE','OWNER_UPDATE','VERIFICATION_PENDING'].includes(a))throw Error('Only non-privileged evidence notes may be saved');
 if(n.length<12)throw Error('Provide a specific note, at least 12 characters');
 if(SKIP.some(word=>new RegExp('\\b'+word+'\\b','i').test(a)))throw Error('Forbidden action');
 return {action:a,note:n,verified:false,externalActionTaken:false};
}
export async function recordOwnerNote({workstreamId,action='OWNER_UPDATE',note='' }={}){
 const target=WORKSTREAMS.find(x=>x.id===workstreamId);if(!target)throw Error('Unrecognized workstream');
 const p=evidencePolicy(action,note),item={id:randomUUID(),workstreamId,target:target.name,createdAt:new Date().toISOString(),...p};
 await mutateJson('ultron-14-day-audit-v37',initial(),s=>{s.records.unshift(item);s.records=s.records.slice(0,250)});
 return item;
}
export async function cycle(){let output;await mutateJson('ultron-14-day-audit-v37',initial(),s=>{
 s.lastCycle=new Date().toISOString();s.cycles++;output={cycles:s.cycles,at:s.lastCycle,notes:s.records.length,priority:'FIRST_VERIFIED_B2B_BUYER'};});return output;}
export async function dashboard({privateView=false}={}){
 const s=await getJson('ultron-14-day-audit-v37',initial());
 return {version:VERSION,window:WINDOW,leadSheet:LEAD_SHEET,tracker:TRACKER,workstreams:WORKSTREAMS,
 queue:priorityQueue(),mediaEvidence:VIDEO_COVERAGE,
 metrics:{requestedWorkstreams:WORKSTREAMS.length,videoFilesIndexed:VIDEO_COVERAGE.discoveredLibraryFiles,
 clipsTimeSampled:VIDEO_COVERAGE.sampledHere.length,fullyTranscribedAudio:0,verifiedExternalSalesFromThisAudit:0},
 cycles:s.cycles,lastCycle:s.lastCycle,
 ...(privateView?{ownerNotes:s.records}:{}),
 note:'Implementation inventory only; unverified people, customers, integrations, videos and cash cannot be marked complete.'};
}
