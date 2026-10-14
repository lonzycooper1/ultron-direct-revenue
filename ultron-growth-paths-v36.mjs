/** ULTRON V36: corporate AI and media growth programs, internal drafts only. */
import {randomUUID} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
export const VERSION='36.0.0',START='2026-10-14',END='2027-01-12',GOAL_USD=1000000;
export const PACKAGES=[
 {name:'AI Feasibility Pilot',usd:10000,status:'PROPOSED'},
 {name:'AI Workflow Implementation',usd:25000,status:'PROPOSED'},
 {name:'AI Operations Integration',usd:50000,status:'PROPOSED'},
 {name:'Optional support',monthlyUsd:5000,status:'NOT_ACTIVE'}];
export const MEDIA_PRODUCT={title:'Practical AI Workflow Starter Guide',usd:49,status:'DRAFT_NOT_LIVE',
 optionalCommunityUsd:99,communityStatus:'NOT_ACTIVE'};
export const PHASES=[
 {days:'1–15',corporate:'Prove use cases, real brand profile, five educational posts, delivery partner capability and safe prototype.',
 media:'Choose practical AI niche, create original scripts and useful guide before monetization.'},
 {days:'16–45',corporate:'Research public, licensed or permissioned company sources; draft tailored messages for approved review and voluntary meetings.',
 media:'Make factual, licensed proof-of-concept shorts; publish only from authorized social accounts after review.'},
 {days:'46–75',corporate:'Conduct consented audits, calculate baselines, demo using fictional data, scope signed $10K/$25K/$50K projects.',
 media:'Measure platform-verified reach, clicks, refunds and sales without predicting virality.'},
 {days:'76–90',corporate:'Deliver approved systems, QA, real acceptance, settlement reconciliation and relevant customer referrals.',
 media:'Evaluate ethical subscriptions and disclosed affiliate offers only after actual demand.'}];
export const TOOLKIT=[
 ['Make','https://www.make.com/en/pricing','Prototype automations'],
 ['Zapier','https://zapier.com/pricing','Basic workflow automation'],
 ['v0','https://v0.app/','UI prototype'],
 ['Bolt','https://bolt.new/','App prototype'],
 ['Cursor','https://cursor.com/','AI-supported code'],
 ['GitHub Copilot','https://github.com/features/copilot','Assisted coding'],
 ['CapCut','https://www.capcut.com/','Captions and editing'],
 ['ElevenLabs','https://elevenlabs.io/','Licensed voice with consent'],
 ['Pexels','https://www.pexels.com/','Licensed video assets'],
 ['Gumroad','https://gumroad.com/','Optional product checkout'],
 ['Skool','https://www.skool.com/','Optional community']
 ].map(([name,url,use])=>({name,url,use,connected:false}));
export const SAFETY=[
 'Keep verified corporate buyer acquisition and delivery ahead of optional media expansion.',
 'Represent the founder truthfully; a company logo is preferable to a fictional headshot.',
 'Research approved public sources only; no automated LinkedIn extraction or unauthorized access.',
 'Draft outreach for owner review; external communication requires sender authentication, opt-out, postal address and compliance checks.',
 'No guaranteed cost reduction, jobs replaced, views, sales or income.',
 'Use fictional data until a client authorizes integrations; protected medical data requires appropriate HIPAA safeguards and agreements.',
 'Use original, licensed or authorized audio and footage with accurate captions and factual review.',
 'No social publishing, new accounts, subscriptions, payments or contracts without real account permissions.',
 'Marketing models are hypothetical; count revenue only from independently verified provider evidence.'
];
const c=(x,n=250)=>String(x??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const m=x=>Math.round(Math.max(0,Number(x)||0)*100)/100;
const blank=()=>({version:VERSION,createdAt:new Date().toISOString(),assets:[],cycles:0,lastCycle:null});
export function corporateModel(clients=20,unitPrice=50000){
 const n=Math.max(0,Math.floor(Number(clients)||0));
 return {clients:n,unitPriceUsd:m(unitPrice),modeledGrossUsd:m(n*m(unitPrice)),
 cases:[{clients:20,unitPriceUsd:50000,grossUsd:1000000},{clients:40,unitPriceUsd:25000,grossUsd:1000000}],
 retainer:'$10K setup plus six $5K monthly payments is $40K over six paid months, not necessarily within 90 days.',
 verifiedCollectionsUsd:0,status:'HYPOTHETICAL'};
}
export function mediaModel(views=10000000,conversionPct=0.2,priceUsd=49){
 const v=Math.max(0,Math.floor(Number(views)||0)),rate=Math.min(100,Math.max(0,Number(conversionPct)||0));
 const buyers=Math.floor(v*rate/100);
 return {views:v,conversionPct:rate,illustrativeBuyers:buyers,modeledGrossUsd:m(buyers*m(priceUsd)),verifiedSalesUsd:0,
 caveat:'Views are not product visits or buyers; conversion is not guaranteed.'};
}
export function profileKit(brand='ULTRON Revenue Studio'){
 return {headline:c(brand,70)+' | Responsible AI integrations, CRM handoffs and workflow audits',
 about:'We help service businesses identify repetitive work, define honest baseline metrics, and pilot useful AI-assisted processes with human oversight. All commercial claims require evidence.',
 identity:'REAL_BUSINESS_BRAND_ONLY',image:'Use verified founder photo or clearly branded logo; no fabricated human credentials.',
 posts:[
 'Measure a manual task before automating it. Track time, exceptions and error rates.',
 'An effective AI assistant needs a safe knowledge boundary and human escalation.',
 'Lead follow-up works when staff ownership, consent and CRM data are consistent.',
 'A free workflow tool can still create subscription, debugging and compliance costs.',
 'Start with a small synthetic-data pilot and document objective acceptance tests.'
 ].map((body,i)=>({title:'ULTRON operations insight '+(i+1),body,status:'UNPUBLISHED'}))};
}
export function audit(industry='hvac',volume=0,minutes=0,hourlyCost=0){
 const types={hvac:'missed inquiries and booking handoffs',plumbing:'quote and dispatch follow-up',
 legal:'nonprivileged administrative document routing',realestate:'property inquiries and showings',
 medical:'nonclinical admin scheduling'};
 const niche=c(industry,25).toLowerCase(),pain=types[niche]||types.hvac;
 return {industry:niche,unverifiedHypothesis:pain,
 estimatedHoursMonthly:Math.round(Math.max(0,Number(volume)||0)*Math.max(0,Number(minutes)||0)/6)/10,
 estimatedBaselineMonthlyLaborUsd:m(Math.max(0,Number(volume)||0)*Math.max(0,Number(minutes)||0)/60*m(hourlyCost)),
 questions:['What repetitive task takes the most staff time?','Which measured baseline can be confirmed?',
 'What data and systems may be accessed?','Who reviews exceptions?','What acceptance tests and rollback plan are needed?'],
 prototype:'Fictional data only; no unapproved access or workforce replacement.',
 compliance:niche==='medical'?'No PHI before required HIPAA review and agreements':niche==='legal'?'Protect privilege and confidentiality':'Owner-approved access only',
 status:'FEASIBILITY_DRAFT_NO_VERIFIED_SAVINGS'};
}
export function outreachPreview({company='',source='',observation='',niche='hvac'}={}){
 let u;try{u=new URL(source)}catch{throw Error('Official public source HTTPS URL required')}
 if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.'))throw Error('Public HTTPS source required');
 if(c(company,100).length<2||c(observation,200).length<15)throw Error('Grounded observed detail required');
 const body='I reviewed '+c(company,80)+' and noticed '+c(observation,180)+' based on '+u.href+'. Our team explores whether '+audit(niche).unverifiedHypothesis+' can be improved with a small measured AI feasibility pilot. Would a free 15–30 minute conversation be worthwhile?';
 return {subject:'Workflow question for '+c(company,80),body,status:'REQUIRES_REVIEW_NOT_SENT',
 sourceProvidedByOperator:true,required:'Compliant sender, address, unsubscribe, lawful contact basis, owner approval'};
}
const concepts=[
 ['AI ROI needs measurement','A chatbot can sound right even when the workflow is wrong.'],
 ['Cut the copy-paste loop','How often does your team re-enter identical information?'],
 ['When humans should approve','Three automation decisions not to delegate blindly.'],
 ['A cleaner lead log','Five useful fields before another sales bot.'],
 ['No shortcut to viral income','Why a million views do not imply a million customers.'],
 ['The missed-call workflow','What happens between an unanswered call and a booking?'],
 ['Use fictional records first','Safe AI testing begins with made-up customer records.'],
 ['Free-tier limitations','Free software still has caps and maintenance costs.'],
 ['Measure response time','Follow-up delays are measurable; revenue losses need evidence.'],
 ['Pilot checklist','Track quality, training, errors and a rollback plan.']
];
export function mediaScripts(count=10){
 return concepts.slice(0,Math.max(1,Math.min(10,Math.floor(Number(count)||10)))).map(([topic,hook],i)=>({
 id:'draft-'+(i+1),topic,hook,
 script:hook+' First observe the current task and its limitations. Next, build a fictional example, check mistakes and obtain a human review. Compare measurements against a baseline before changing any customer system. That is how useful automation improves step by step. We share educational examples, not earnings guarantees.',
 scenes:['0–3s hook','4–15s original diagram','16–32s practical workflow','33–41s limitation','42–45s truthful CTA'],
 status:'DRAFT_UNFACTCHECKED_UNPUBLISHED',rightsApproved:false,voicePermission:false,platformAuthorization:false}));
}
export function membershipModel(members=0,price=99,affiliateSalesUsd=0,affiliateRate=30){
 return {illustrativeMonthlyUsd:m(Math.max(0,Number(members)||0)*m(price)),
 illustrativeAffiliateUsd:m(m(affiliateSalesUsd)*Math.min(100,Math.max(0,Number(affiliateRate)||0))/100),
 caveat:'Affiliate commissions and subscriptions require actual provider agreements, customers, disclosures and settlement.',verifiedUsd:0};
}
export function makeAsset(type,input={}){
 const makers={PROFILE:()=>profileKit(input.brand),AUDIT:()=>audit(input.industry,input.volume,input.minutes,input.hourlyCost),
 OUTREACH:()=>outreachPreview(input),SHORTS:()=>mediaScripts(input.count),
 MODEL:()=>({corporate:corporateModel(input.clients,input.unitPrice),media:mediaModel(input.views,input.rate,input.price),
 membership:membershipModel(input.members,input.memberPrice,input.affiliateSalesUsd,input.affiliateRate)})};
 if(!Object.hasOwn(makers,type))throw Error('Unknown internal asset type');
 return {type,status:'DRAFT_NOT_PUBLISHED',createdAt:new Date().toISOString(),result:makers[type]()};
}
export async function queueAsset(type,input={}){
 const asset=makeAsset(type,input),id=randomUUID();
 await mutateJson('ultron-growth-paths-v36',blank(),s=>{
  if(s.assets.length>=150)throw Error('Draft queue full');
  s.assets.unshift({id,...asset});});
 return {id,...asset};
}
export async function safeCycle(){let result;await mutateJson('ultron-growth-paths-v36',blank(),s=>{
 s.lastCycle=new Date().toISOString();s.cycles++;result={lastCycle:s.lastCycle,cycles:s.cycles,drafts:s.assets.length,
 priority:'FIRST_VERIFIED_B2B_BUYER_AND_DELIVERY'};});return result}
export async function dashboard(privateView=false){
 const state=await getJson('ultron-growth-paths-v36',blank());
 return {version:VERSION,start:START,end:END,goalUsd:GOAL_USD,packages:PACKAGES,mediaProduct:MEDIA_PRODUCT,
 phases:PHASES,toolkit:TOOLKIT,safety:SAFETY,models:{corporate:corporateModel(),viral:mediaModel()},
 runtime:{gmail:Boolean(process.env.ULTRON_GMAIL_REFRESH_TOKEN),hubspot:Boolean(process.env.ULTRON_HUBSPOT_PRIVATE_APP_TOKEN),
 calendar:Boolean(process.env.ULTRON_GOOGLE_CALENDAR_REFRESH_TOKEN),mediaPublisherVerified:false,
 externalSignupVerified:false},metrics:{internalAssets:state.assets.length,verifiedClientDeals:0,verifiedMediaRevenueUsd:0,
 externalPostsVerified:0},cycles:state.cycles,lastCycle:state.lastCycle,
 ...(privateView?{assets:state.assets}:{}),
 note:'Workflow implementation is not proof of customers, external accounts, published videos or captured payments.'};
}
