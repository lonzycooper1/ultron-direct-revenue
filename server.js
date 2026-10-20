import {workflows,submitWorkflow,qualifyLead} from './reference-workflows.mjs';
import {companyMemory} from './company-memory-v47.mjs';
import {refinanceScenario,screenCompanies} from './research-tools-v47.mjs';
import {executive,startExecutive} from './executive-runtime.mjs';
import {enterpriseGateway} from './enterprise-gateway-v45.mjs';
import {deliverVerifiedDigitalOrder,eligibleDigitalDelivery,smtpReadiness} from './enterprise-mail-v45.mjs';
import {liveDemandListener} from './live-demand-v46.mjs';
import {demandAssetFactory} from './demand-asset-v46.mjs';
import {confirmCapturedOrderForDelivery} from './payment-runtime.mjs';
import {startEnterpriseCycle} from './enterprise-cycle-v45.mjs';
import {mainframe44} from './ultron-mainframe-v44.mjs';
import {payhipReceiver} from './payhip-runtime-v44.mjs';
import {businessRuntime,executiveBusinessPulse,verifyBusinessWebhook} from './executive-business.mjs';
import {productDeployer} from './product-deployer.mjs';
import {completionExecution as v43CompletionExecution} from './ultron-completion-execution-v43.mjs';
import {CINEMA_SKU,VIDEO_TERMS,makeStoryboard,createVideoJob,authorizeVideoJob,submitOneShot,pollVideoJob,recordVideoReview,cinematicState,publicJob,videoPreflight,salesReadiness,publicCinematic,cinematicCycle,recordVideoInquiry,makeVideoQuote,issueVideoQuote,claimVideoQuote,checkoutQuoteRecorded,ensurePaidVideoJob,customerVideo,acceptCustomerVideo,attachVideoArtifact,editVideoJob,retryVideoShot,sampleEligible} from './ultron-cinematic-v43.mjs';
import {videoLabManifest,videoLabActions,appPrototype,mediaPrototype,videoLabSafeCycle,videoLabState} from './ultron-video-lab-v42.mjs';
import {dispatchOperationalAlerts} from './ultron-alert-delivery-v41.mjs';
import {AUDIT_SKU,TERMS,validateAuditIntake,prepareAudit,reviewAudit,acceptAudit,recordSignedCapture,independentSale,operationsState,recordOps,operationsPulse,publicOperations,renderAuditDelivery} from './ultron-revenue-operations-v41.mjs';
import {ingestReplies} from './ultron-mail-ingestion-v41.mjs';
import {activationReport as v40ActivationReport} from './ultron-work-activation-v40.mjs';
import {quantumManifest,runCircuit,propertyScenario,pilotBlueprint} from './ultron-quantum-core-v39.mjs';
import {status as v24Status,pulse as v24Pulse,inspect as v24Inspect,browserRead as v24Browser,marketResearch as v24Market,writeCopy as v24Copy,reviewGrant as v24Grant} from './ultron-video-v24.mjs';
import {snapshot as operatorSnapshot,cycle as operatorCycle,publicReadiness as operatorPublic,registerOwnerEvidence as operatorEvidence,register500Evidence} from './ultron-operator-v23.mjs';
import {activationPlan} from './ultron-activation-v27.mjs';
import {finalLevelCheck,lookupCheckId,listFinalLevelChecks,finalLevelCsvLines} from './ultron-final-level-v29.mjs';
import {readFile} from 'node:fs/promises';
import {Readable} from 'node:stream';
import {inboundWorkQueue,draftInboundById,reviewInbound} from './ultron-inbound-ops-v28.mjs';
import {growthState as growthV19State,dashboard as growthDashboard,importProspects,auditProspect,prepareSales,approveOutbox,receiveReply,sendApproved,onVerifiedCapture,markFulfilled,customerProof,expense,queueExperiment,proposeContent,backgroundTick,unsubscribe,demoHtml} from './ultron-growth-runtime-v19.mjs';
import {operatingState,introspect,rememberReflection,runSafeJobs,registerPublicOpportunities,registerBusinessEvent,recordTrustedCapture,recordTrustedRefund,emergencyStop,operationalGate,recordQualityEvidence,addRealCost,authorizeBudget,recordCustomerSatisfaction,approveCampaignEnvelope,suppressContact,recordExperiment as registerV20Experiment,recordPartner,readinessRegistry} from './ultron-reflective-revenue-v20.mjs';
import {integrationSummary,dnsAudit,freeBusy,book as integrationBook,syncApprovedContact} from './ultron-integration-v21.mjs';
import {overview as flywheelOverview,safeCycle as flywheelCycle,discoveryFallback,generateEvidenceDemo,crmDiff,ownerCampaign,trustedDispatch,acceptance,scoreEvidence,sendPolicy} from './ultron-sales-v22.mjs';
import {report as financeReport,record as financeRecord,proposeExperiment,reviewCatalog} from './ultron-finance-v22.mjs';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {marketProduct,marketStats,marketStores,catalogPage,buildDigitalDelivery,featuredProducts} from './ai-market.mjs';
import {assertCaptureMatches,renderFulfillmentHtml,verifyPayPalRuntime} from './payment-runtime.mjs';
import {ledger,saveLedger} from './ledger-store.mjs';
import {V34_SKU,V34_VERSION,validateV34Intake,inspectV34Homepage,buildV34Report,auditPageHtml,publicV34Manifest,runRevenueDirector,readRevenueDirector,reconcileVerifiedRevenue} from './ultron-autonomous-revenue-v34.mjs';
import {B2B_OFFER,STEPS as B2B_STEPS,dashboard as b2bDashboard,cycle as b2bCycle,recordResearch as b2bResearch,recordPartnerCandidate as b2bPartner,recordOpportunity as b2bOpportunity,updateOpportunity as b2bAdvance,demonstration as b2bDemo,proposal as b2bProposal,publicLanding as b2bPublicLanding} from './ultron-b2b-90-day-v35.mjs';
import {dashboard as v36Dashboard,queueAsset as v36QueueAsset,makeAsset as v36MakeAsset,safeCycle as v36SafeCycle} from './ultron-growth-paths-v36.mjs';
import {dashboard as v37Dashboard,cycle as v37Cycle,recordOwnerNote as v37RecordOwnerNote} from './ultron-audit-v37.mjs';
import {commanderSnapshot} from './ultron-revenue-commander-v38.mjs';
import {storeHealth} from './state-store.mjs';
import {runAgentCycle,agentState} from './agents.mjs';
import {wizardFromConversation,generateCandidates,critiqueCandidate,buildAcquisitionPlan,prospectToPaymentWorkflow,capabilityManifest} from './ultron2-core.mjs';
import {saveProject,getProject,listProjects,updateProjectProgress} from './project-store.mjs';
import {productCritiqueSystem,appFactorySystem,prospectRevenueSystem,wizardOperatingSystem,unifiedVideoArchitecture} from './video-systems.mjs';
import {runBusinessOSCycle,businessOSState,businessOSManifest,opportunityMap,productIdeasForOpportunity,targetProfile,commandBridge} from './business-os.mjs';
import {agentFarmState,agentFarmManifest,missionPlan} from './agent-farm.mjs';
import {autopilotState,productionTerminal} from './autopilot-mode.mjs';
import {answerQuestion} from './support.js';
import {masterCapabilityManifest,marketVideoPlan,cryptoVideoPlan,buildMission} from './video-master-pack.mjs';
import {expansionManifest,contentMission,businessOpportunityMission,cryptoResearchMission,animatedMediaMission} from './video-expansion-pack.mjs';
import {acquisitionPlan,outreachDraft} from './audience-acquisition.mjs';
import {revenueLoopStatus,flagshipOffer,DEMAND_EVIDENCE} from './revenue-loop.mjs';
import {OCT05_CAPABILITY_PACK,OCT05_VIDEO_ANALYSIS,LOCAL_MODEL_RESOURCES} from './video-batch-1005.mjs';
import {oct06Manifest,capitalReadinessPlan,valuationRequirement,economicAgentDecision,institutionalReadinessScore} from './video-batch-1006.mjs';
import {caseStudyMasteryManifest,buildRevenuePortfolio,interpretOwnerDirective,OWNER_OPERATING_CONTRACT} from './chatgpt-business-mastery.mjs';
import {MILLIONAIRE_SPRINT,sprintPlan,sprintPace,scenarioMath} from './millionaire-sprint.mjs';
import {PROSPECT_MISSION,targetingMatrix,scoreProspect,personalizedEmailDraft,prospectMissionStatus} from './prospect-outreach.mjs';
import {securityManifest,agentSecurityProfile} from './agent-security.mjs';
import {agentOfAgentsManifest,agentOfAgentsState,createCommerceMission,decideApproval,visualAgentGraph} from './agent-of-agents.mjs';
import {ownerActionPage} from './ultron-owner-actions-v30.mjs';
import {startResilienceLoop,resilienceDetail,publicStatus as resiliencePublic,DEPARTMENTS} from './ultron-resilience-v31.mjs';
import {startVerificationLoop,verificationCycle,verifierState,publicVerifier,updateOwnerBusinessProfile,OWNER_MISSION,ACTION_AUTHORITY} from './ultron-verification-v32.mjs';
import {universalMarketManifest,marketplaceState,marketplaceSearch,marketplaceProduct,registerMerchant,upsertProduct,upsertOffer,recordInteraction} from './universal-marketplace.mjs';
import {podManifest,createPodOrder} from './pod-adapters.mjs';
import {revenueFrameworkManifest,executionPlan} from './revenue-business-models.mjs';
import {paypalBusinessBillingManifest,billingState,verifyBusinessBilling,ensureDefaultRetainer,createSubscriptionApproval,createDraftInvoice,sendInvoice} from './paypal-business-billing.mjs';
import {acquisitionManifest,nicheConfig,nicheIds,scoreResponseGap,captureLead,leadSummary,listLeads} from './acquisition-funnel.mjs';
import {nucleusManifest,vitalSnapshot,executiveCycle,system360Manifest} from './ultron-nucleus.mjs';
import {realEstatePortfolio,revenuePortfolio,founderPatternPlan} from './ultron-expansion-360.mjs';
import {growthManifest,growthState,unitEconomics,simulate} from './ultron-growth-os.mjs';
import {advantageManifest,advantageState,decomposeGoal,scenario} from './ultron-advantage-os.mjs';
import {unifiedManifest,unifiedState,economicDecision,validateProduct} from './ultron-unified-company.mjs';
import {v6Manifest,v6State,antiDelusionCheck,problemSeverity} from './ultron-discovery-economy-v6.mjs';
import {state as v7State} from './ultron-v7-runtime.mjs';
import {v7Manifest} from './ultron-v7-manifest-lite.mjs';
import {v8Manifest,v8State,flywheelScore,websiteFactory,productFactory,demandFactory,moneyCycleIntelligence} from './ultron-autonomous-revenue-v8.mjs';
import {compileOpportunity} from './ultron-revenue-controller-v8.mjs';
import {FINANCIAL_SYSTEM_LAYERS,capitalPosition,creditCycleContext,financialFoodChain} from './ultron-financial-system-v8.mjs';
import {v9Manifest,mainframeState,prospectScore,auditBlueprint,funnelDecision,contributionProfit,nicheOffers} from './ultron-revenue-mainframe-v9.mjs';
import {manifest as hvacManifest,state as hvacState,visibleProblemScore,diagnostic as hvacDiagnostic,miniAudit,productRoute,fulfillmentPlan,outcomeDecision} from './ultron-hvac-flagship-v10.mjs';
import {manifest as acquisitionV11Manifest,state as acquisitionV11State,scoreProspect as scoreProspectV11,intentSignals,outreachDraft as outreachDraftV11,trustPacket,attributionEvent,sampleGate} from './ultron-customer-acquisition-v11.mjs';
import {SPORTS_JARVIS_VERSION,SPORTS,PERSONA,DATA_POLICY,analyzeProp,rankBoard} from './sports-jarvis.mjs';
import {buildLiveBoard,mergePropLines} from './sports-live-feed.mjs';
import {v13Dashboard,paperTradingState,executePaperOrder,markPaperPrices,upsertProspect,listProspects,createWebsiteAudit,commandCenter,customerPortal,offerCatalog,createSubscriptionCandidate,revenueReconciliation,costProfitIntelligence,createExperiment,recordExperimentResult,requestApproval,decideV13Approval,ceoObjectiveEngine,lenderDashboard,projections,sportsCommercialStatus,securityAndOpsManifest} from './ultron-v13-control.mjs';
import {catalog as commercialCatalog,commercialDashboard,paypalCommercialEvent} from './ultron-commercial-v13.mjs';
import {ingestLead,advanceLead,createDiagnostic,createDemo,createProposal,enqueuePaidFulfillment,recordQc,retentionCandidates,createReferral,recordTraffic,attributeRevenue,recordExpense,openTicket,addKnowledge,executiveMetrics,unitEconomics as commercialUnitEconomics,forecast,northStar,dataRoomManifest,businessCreditReadiness,lenderPackage,osDashboard} from './ultron-commercial-os-v14.mjs';
import {firstSaleDashboard,recordVisit,runFreeDiagnostic,recordCheckoutClick,prepareProspectCampaign,prepareAllCampaigns,firstSaleScore} from './ultron-first-sale-v15.mjs';
import {dashboard as firstSaleV16Dashboard,approveBatch as firstSaleApproveBatch,demoFor as firstSaleDemoFor,proposalFor as firstSaleProposalFor,meetingRequest as firstSaleMeetingRequest,followupSignal as firstSaleFollowupSignal,caseStudy as firstSaleCaseStudy,referral as firstSaleReferral,paymentFailure as firstSalePaymentFailure,reconciliationAlert as firstSaleReconciliationAlert,ceoQueue as firstSaleCeoQueue,commercialReadiness as firstSaleCommercialReadiness,OFFERS as FIRST_SALE_OFFERS} from './ultron-first-sale-v16.mjs';
const BASE='https://api-m.paypal.com',ACQ_TOKEN=process.env.ULTRON_ACQUISITION_ADMIN_TOKEN||'',CID=process.env.PAYPAL_CLIENT_ID||'',SECRET=process.env.PAYPAL_CLIENT_SECRET||'',WH=process.env.PAYPAL_WEBHOOK_ID||'',PUBLIC=(process.env.PUBLIC_BASE_URL||'').replace(/\/$/,''),READY=Boolean(CID&&SECRET&&WH&&PUBLIC);
const WORKLOAD=Math.max(1,Math.min(10,Number(process.env.ULTRON_WORKLOAD_MULTIPLIER||3))),INTERVAL=Math.max(5,Number(process.env.AGENT_INTERVAL_MINUTES||5));
let cache={token:null,exp:0},payment={ok:false,checkedAt:null},businessBilling={productId:null,planId:null,invoiceApi:false,subscriptionApi:false,lastVerifiedAt:null,lastError:null},timer=null;
async function token(){if(cache.token&&Date.now()<cache.exp-60000)return cache.token;const r=await fetch(BASE+'/v1/oauth2/token',{method:'POST',headers:{authorization:'Basic '+Buffer.from(CID+':'+SECRET).toString('base64'),'content-type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'}),d=await r.json();if(!r.ok)throw Error('PayPal OAuth failed');cache={token:d.access_token,exp:Date.now()+Number(d.expires_in||300)*1000};return cache.token}
async function paypal(path,method='GET',body=null,rid=null){const h={authorization:'Bearer '+await token(),'content-type':'application/json'};if(rid)h['paypal-request-id']=rid;const r=await fetch(BASE+path,{method,headers:h,body:body?JSON.stringify(body):undefined}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.message||`PayPal ${r.status}`);return d}
async function createOrder(key,intake=null,assetId=null){const videoQuote=key===CINEMA_SKU?await claimVideoQuote(intake||{}):null;const p=videoQuote?{id:CINEMA_SKU,name:'Original Cinematic Short',price:videoQuote.priceUsd,storeId:'videostudio'}:marketProduct(key);if(!p)throw Error('Unknown product');const v34Intake=key===V34_SKU?validateV34Intake(intake||{}):null;const auditIntake=key===AUDIT_SKU?validateAuditIntake(intake||{}):null;if(assetId){if(videoQuote||v34Intake||auditIntake)throw Error('Only finished catalog guides eligible');await demandAssetFactory.getApprovedArtifact(assetId,key)}const amount=Number(p.price).toFixed(2),o=await paypal('/v2/checkout/orders','POST',{intent:'CAPTURE',purchase_units:[{reference_id:key,description:p.name,amount:{currency_code:'USD',value:amount}}],payment_source:{paypal:{experience_context:{user_action:'PAY_NOW',return_url:PUBLIC+'/paypal/return',cancel_url:PUBLIC+'/paypal/cancel'}}}},'create-'+key+'-'+crypto.randomUUID()),approve=(o.links||[]).find(x=>x.rel==='payer-action'||x.rel==='approve')?.href;if(!o.id||!approve)throw Error('No approval URL');await saveLedger(l=>{l.orders[o.id]={id:o.id,product:key,name:p.name,amount,currency:'USD',market:true,storeId:p.storeId,status:o.status,createdAt:new Date().toISOString(),v34Intake,auditIntake,videoQuote,auditTerms:auditIntake?{...TERMS}:null,demandAssetId:assetId||null}});if(videoQuote)await checkoutQuoteRecorded(videoQuote.id,o.id,approve);return approve}
async function capture(id){const o=await paypal('/v2/checkout/orders/'+encodeURIComponent(id)+'/capture','POST',{},'capture-'+id);return o.purchase_units?.flatMap(u=>u.payments?.captures||[])[0]||null}
async function fulfill(id,c){
 const known=(await ledger()).orders?.[id];if(!known)throw Error('Unknown order');assertCaptureMatches(known,c);
 const needsInspection=!known.fulfillment&&(known.v34Intake||known.auditIntake);
 const inspection=needsInspection?await inspectV34Homepage((known.auditIntake||known.v34Intake).website):null;
 let out,verifiedOffer=null;
 await saveLedger(l=>{
  const o=l.orders[id];if(!o)throw Error('Unknown order');assertCaptureMatches(o,c);
  o.status='COMPLETED';o.captureId=String(c.id||o.captureId||'');o.capturedAt??=new Date().toISOString();o.capturedAmount=Number(c.amount.value);
  if(c.seller_receivable_breakdown?.paypal_fee?.currency_code==='USD'&&Number.isFinite(Number(c.seller_receivable_breakdown.paypal_fee.value))){o.paypalFeeUsd=Number(c.seller_receivable_breakdown.paypal_fee.value);o.paypalFeeSource='PROVIDER';}
  if(!o.fulfillment){
   if(o.product===CINEMA_SKU)o.fulfillment={token:crypto.randomBytes(24).toString('hex'),title:'Cinematic video production',summary:'Payment received; storyboard and production are pending. A payment token is not a finished video.',sections:[{title:'Production',body:'Your paid project is queued for storyboard, rights confirmation, generation, editing and quality review. Use the private video delivery link for progress.'}],createdAt:new Date().toISOString()};
   else if(o.product===AUDIT_SKU)o.fulfillment=prepareAudit(o,inspection||{status:'UNAVAILABLE',reason:'Inspection unavailable'});
   else {const p=marketProduct(o.product),d=o.product===V34_SKU?buildV34Report(o.v34Intake,inspection||{status:'UNAVAILABLE',reason:'Inspection unavailable'}):buildDigitalDelivery(p,id);
    if(o.product===V34_SKU&&d.quality?.passed!==true)throw Error('Quality gate failed');
    o.fulfillment={token:crypto.randomBytes(24).toString('hex'),title:p.name,summary:'ULTRON digital product',sections:d.sections,createdAt:d.generatedAt||new Date().toISOString()};}
  }
  out=o.fulfillment;verifiedOffer=o.product;
 });
 try{await onVerifiedCapture({orderId:id,captureId:String(c.id),amountUsd:Number(c.amount.value),offerId:verifiedOffer,status:c.status})}catch(e){console.error('v19 capture sync',String(e?.message||e))}
 try{await recordTrustedCapture({orderId:id,captureId:String(c.id),amountUsd:Number(c.amount.value),offerId:verifiedOffer,status:c.status,currency:c.amount.currency_code})}catch(e){console.error('v20 trusted capture sync',String(e?.message||e))}
 // A paid consulting audit remains pending; a token alone cannot authorize completed-service dispatch.
 if(verifiedOffer===CINEMA_SKU)await ensurePaidVideoJob((await ledger()).orders[id]);
 if(verifiedOffer!==AUDIT_SKU&&verifiedOffer!==CINEMA_SKU)try{await trustedDispatch({orderId:id,captureId:String(c.id),offerId:verifiedOffer})}catch(e){console.error('v22 paid dispatch',String(e?.message||e))}
 await operationsPulse(Object.values((await ledger()).orders||{}));return out;
}
async function attemptVerifiedEmailDelivery(id){
 if(!smtpReadiness())return {status:'SMTP_RUNTIME_NOT_CONFIGURED'};
 const recorded=(await ledger()).orders?.[id];
 if(!eligibleDigitalDelivery(recorded))return {status:'NOT_AUTOMATICALLY_DELIVERABLE'};
 const confirmed=await confirmCapturedOrderForDelivery(paypal,recorded);
 return deliverVerifiedDigitalOrder({order:recorded,buyerEmail:confirmed.email,baseUrl:PUBLIC});
}
async function byToken(t){const l=await ledger();return Object.values(l.orders||{}).find(o=>o?.fulfillment?.token===t)?.fulfillment||null}
async function agentBurst(){const l=await ledger();for(let i=0;i<WORKLOAD;i++)await runAgentCycle({ledger:l,baseUrl:PUBLIC});await runBusinessOSCycle({ledger:l,baseUrl:PUBLIC})}
async function revenueCommanderReport(){const [g,i,c,l]=await Promise.all([growthV19State(),inboundWorkQueue(100),agentOfAgentsState(),ledger()]);return commanderSnapshot({env:process.env,payment,growth:g,inbound:i,commerce:c,orders:l?.orders||{}})}
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shell=(title,body,head='')=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title><meta name="theme-color" content="#020806"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="ULTRON ONE"><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/ultron-one-icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/ultron-one-icon.svg">${head}<style>:root{color-scheme:dark;--phosphor:#35ff9a;--phosphor2:#00e676;--amber:#ffd166;--danger:#ff6178;--ink:#020806;--panel:rgba(2,18,12,.88);--line:rgba(53,255,154,.30);--dim:#82b69d}
*{box-sizing:border-box}html{background:#010503}body{background:radial-gradient(circle at 50% -10%,rgba(0,255,128,.10),transparent 33%),linear-gradient(rgba(2,12,8,.97),rgba(0,4,2,.99));color:#caffdf;font:13px ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;max-width:1480px;margin:auto;padding:22px;min-height:100vh;letter-spacing:.015em}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background-image:linear-gradient(rgba(53,255,154,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(53,255,154,.045) 1px,transparent 1px),repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 4px);background-size:28px 28px,28px 28px,100% 4px}
body:after{content:"ULTRON // OPERATING SYSTEM";position:fixed;right:18px;bottom:12px;color:rgba(53,255,154,.28);font-size:10px;pointer-events:none}
h1,h2,h3{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.055em;color:#e7fff0;text-shadow:0 0 14px rgba(53,255,154,.25)}h1{font-size:clamp(26px,5vw,54px);border-bottom:1px solid var(--line);padding-bottom:12px}h2{font-size:16px}h3{font-size:13px}
nav{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0 18px;padding:8px;border:1px solid var(--line);background:rgba(0,12,7,.72);box-shadow:inset 0 0 18px rgba(53,255,154,.035)}
a{color:var(--phosphor);text-decoration:none;border-bottom:1px dotted rgba(53,255,154,.35)}a:hover{color:white;text-shadow:0 0 10px var(--phosphor)}
section{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:9px}
article{position:relative;background:linear-gradient(180deg,rgba(3,25,16,.94),rgba(1,12,8,.94));padding:14px;border-radius:2px;border:1px solid var(--line);box-shadow:inset 0 0 24px rgba(53,255,154,.025),0 0 18px rgba(0,0,0,.35);overflow:hidden}
article:before{content:"";position:absolute;left:0;top:0;width:32px;height:2px;background:var(--phosphor);box-shadow:0 0 8px var(--phosphor)}
article:hover{border-color:rgba(53,255,154,.7);box-shadow:inset 0 0 30px rgba(53,255,154,.05),0 0 18px rgba(53,255,154,.08)}
small{color:var(--dim);text-transform:uppercase;letter-spacing:.12em}b{font-size:24px;color:var(--phosphor);text-shadow:0 0 14px rgba(53,255,154,.30)}
input,button,select,textarea{padding:10px 12px;border-radius:1px;border:1px solid var(--line);font:inherit}input,select,textarea{min-width:240px;background:#021008;color:#dffff0;outline:none}input:focus,select:focus,textarea:focus{border-color:var(--phosphor);box-shadow:0 0 0 2px rgba(53,255,154,.08)}
button{background:#062a19;color:var(--phosphor);font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.08em}button:hover{background:#0a3c24;color:#fff;box-shadow:0 0 14px rgba(53,255,154,.15)}
.status{display:inline-block;padding:3px 7px;border:1px solid var(--line);color:var(--phosphor);text-transform:uppercase}.terminal{border:1px solid var(--line);background:#000b06;padding:12px;white-space:pre-wrap}.metric{font-size:26px;color:var(--phosphor)}
@media(max-width:640px){body{padding:12px}section{grid-template-columns:1fr}input,select,textarea{min-width:0;width:100%}article{padding:12px}nav{position:sticky;top:0;z-index:20;backdrop-filter:blur(10px)}}
</style></head><body>${body}</body></html>`;
function marketHtml(id,page=1,q=''){const stores=marketStores(),store=id?stores.find(x=>x.id===id):null,per=60,total=store?.products||marketStats().products,pages=Math.ceil(total/per),p=Math.max(1,Math.min(page,pages)),items=catalogPage({storeId:id||undefined,offset:(p-1)*per,limit:per,query:q}),nav=stores.map(x=>`<a href="/market/${x.id}">${esc(x.name)}</a>`).join(' ');return shell(store?.name||'ULTRON AI Market',`<h1>${esc(store?.name||'ULTRON AI Market Network')}</h1><p>${marketStats().stores} stores · ${marketStats().products.toLocaleString()} generated digital products + featured offers · $1–$10,000 · PayPal checkout · verified-payment fulfillment.</p><form><input name="q" value="${esc(q)}" placeholder="Search products"><button>Search</button></form><nav>${nav}</nav><section>${items.map(x=>`<article><small>${esc(x.category)}</small><h3><a href="/product/${x.id}">${esc(x.name)}</a></h3><b>$${x.price}</b><p>${esc(x.description)}</p><a href="/product/${x.id}">View product</a></article>`).join('')}</section><p>Page ${p}/${pages}</p>`)}
function productHtml(p){const url=`${PUBLIC}/product/${p.id}`,schema={"@context":"https://schema.org","@type":"Product",name:p.name,description:p.description,sku:p.id,category:p.category,brand:{"@type":"Brand",name:"ULTRON AI Market"},offers:{"@type":"Offer",url,priceCurrency:"USD",price:String(p.price),availability:"https://schema.org/InStock"}};return shell(p.name,`<nav><a href="/market">← AI Market</a><a href="/market/${p.storeId}">More in ${esc(p.category)}</a></nav><article><small>${esc(p.category)}</small><h1>${esc(p.name)}</h1><b>$${p.price}</b><p>${esc(p.description)}</p><h2>What you get</h2><p>An original digital implementation resource with a framework, execution worksheet, opportunity score, optimization loop and quality/compliance gate.</p><a href="${p.id===V34_SKU?'/autonomous-audit':'/buy?product='+p.id}">Buy securely with PayPal</a></article>`,`<meta name="description" content="${esc(p.description)}"><link rel="canonical" href="${esc(url)}"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`)}
function sitemap(index=0){const stores=marketStores(),chunk=10000,start=index*chunk,end=Math.min(marketStats().products,start+chunk),urls=[];for(let n=start;n<end;n++){const perStore=marketStats().productsPerStore,si=Math.floor(n/perStore),local=n%perStore+1;if(!stores[si])break;urls.push(`<url><loc>${PUBLIC}/product/${stores[si].id}-${String(local).padStart(8,'0')}</loc></url>`)}return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`}
function sitemapStatic(){const paths=['/flagship','/mission-control','/market','/solutions/missed-lead-recovery','/solutions/ai-implementation','/solutions/revenue-frameworks','/revenue-loop','/insights','/free-response-gap-scan','/autonomous-audit',...nicheIds().map(x=>'/solutions/'+x+'-ai-lead-response')];return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${PUBLIC}${p}</loc></url>`).join('')}</urlset>`}
function sitemapIndex(){return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${PUBLIC}/sitemap-static.xml</loc></sitemap></sitemapindex>`}
function acquisitionPage(nicheId='services'){
 const n=nicheConfig(nicheId);
 const offer=n.offer==='missed-lead-recovery-99'?marketProduct('missed-lead-recovery-99'):marketProduct('ai-revenue-audit-500');
 const title=nicheId==='services'?'Free AI Response-Gap Scan':n.headline;
 return shell(title,`
 <nav><a href="/">← ULTRON</a><a href="/solutions/revenue-frameworks">Revenue Frameworks</a></nav>
 <h1>${esc(n.headline)}</h1>
 <p>ULTRON maps where ${esc(n.pain)} are breaking down, then recommends the smallest useful fix before you spend more on software or ads.</p>
 <section>
  <article><h2>Free response-gap scan</h2><p>Answer five questions. The score is diagnostic only—no guaranteed revenue claim.</p>
   <form id="scan">
    <input name="company" required placeholder="Business name"><br><br>
    <input name="email" type="email" required placeholder="Business email"><br><br>
    <input name="monthlyLeads" type="number" min="0" placeholder="Approx. inbound leads/month"><br><br>
    <input name="missedCallRate" type="number" min="0" max="100" placeholder="Approx. % calls/inquiries missed"><br><br>
    <input name="responseMinutes" type="number" min="0" placeholder="Typical first-response minutes"><br><br>
    <input name="followup" placeholder="Follow-up: automated, manual, inconsistent, none"><br><br>
    <label><input name="followupConsent" type="checkbox"> You may email me personally about my scan and a relevant solution. Optional; no marketing emails otherwise.</label><br><br>
    <input name="website_url" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" value="">
    <button>Run free scan</button>
   </form><div id="result"></div>
  </article>
  <article><h2>Matched next step</h2><h3>${esc(offer.name)}</h3><b>${offer.price}</b><p>${esc(offer.description)}</p><p><a href="/buy?product=${encodeURIComponent(offer.id)}">Buy securely with PayPal</a></p></article>
 </section>
 <script>
 document.getElementById('scan').addEventListener('submit',async(e)=>{e.preventDefault();const fd=new FormData(e.target),b=Object.fromEntries(fd.entries());b.niche=${JSON.stringify(nicheId)};b.source=location.pathname;const r=await fetch('/api/acquisition/scan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)});const d=await r.json();const el=document.getElementById('result');if(!r.ok){el.textContent=d.error||'Unable to score';return}el.innerHTML='<h3>Response-gap score: '+d.score+'/100 ('+d.severity+')</h3><p>'+d.recommendation+'</p><p><a href="/buy?product='+encodeURIComponent(d.niche.offer)+'">Continue to matched solution</a></p>'});
 </script>`,`<meta name="description" content="${esc(n.headline)}. Free response-gap diagnostic for ${esc(n.label)} businesses."><link rel="canonical" href="${PUBLIC}/solutions/${nicheId}-ai-lead-response">`);
}
export function createApp(){return createServer(async(req,res)=>{const u=new URL(req.url,'http://local'),path=u.pathname,json=(s,d)=>{res.writeHead(s,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(d))};try{
const v13Owner=()=>Boolean(ACQ_TOKEN)&&((req.headers.authorization||'')==='Bearer '+ACQ_TOKEN||req.headers['x-ultron-admin']===ACQ_TOKEN);
if(path==='/workbench'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY','referrer-policy':'no-referrer'});return res.end(await readFile(new URL('./public/workbench-v47.html',import.meta.url),'utf8'))}
if(path.startsWith('/api/company-memory/v47/')){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 const action=path.slice('/api/company-memory/v47/'.length),scope=u.searchParams.get('scope');
 try{
  if(action==='snapshot'&&req.method==='GET')return json(200,{ok:true,result:await companyMemory.snapshot(scope)});
  if(req.method!=='POST'||!['save','search','relate','context'].includes(action))return json(404,{error:'Unknown memory operation'});
  if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
  let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>24000)return json(413,{error:'Request too large'})}
  const b=JSON.parse(raw||'{}');if(!b||typeof b!=='object'||Array.isArray(b))return json(400,{error:'JSON object required'});return json(200,{ok:true,result:await (action==='context'?companyMemory.context(scope,b.query):companyMemory[action](scope,b))});
 }catch(e){const message=String(e.message);if(e instanceof SyntaxError)return json(400,{error:'Invalid JSON'});if(/^(Invalid |Valid observedAt|Explicit evidence|Document changed|Document not found|Scope document limit|Scope relation limit|Both documents must|Distinct documents|Search terms|Limit must)/.test(message))return json(400,{error:message.slice(0,160)});return json(503,{error:'Company memory storage unavailable'})}
}
if(path.startsWith('/api/research/v47/')&&req.method==='POST'){
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 const action=path.slice('/api/research/v47/'.length),run={refinance:refinanceScenario,screen:screenCompanies}[action];
 if(typeof run!=='function'||!['refinance','screen'].includes(action))return json(404,{error:'Unknown research tool'});
 let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>64000)return json(413,{error:'Request too large'})}
 try{return json(200,{ok:true,result:run(JSON.parse(raw||'{}'))})}catch(e){return json(400,{error:String(e.message).slice(0,160)})}
}

if(path.startsWith('/api/enterprise/v45/')||path==='/webhooks/stripe'){
 await new Promise((resolve,reject)=>{
  const done=()=>{res.off('finish',done);resolve()};
  res.once('finish',done);
  enterpriseGateway(req,res,e=>{res.off('finish',done);if(e)reject(e);else resolve()});
 });
 if(!res.writableEnded)return json(404,{error:'Unknown enterprise route'});
 return;
}



if(path==='/api/demand/v46/offers'&&req.method==='GET')return json(200,{offers:await demandAssetFactory.publicOffers()});
if(path==='/api/demand/v46/review'&&req.method==='POST'){if(!v13Owner())return json(403,{error:'Owner login required'});let raw='';for await(const x of req){raw+=x;if(raw.length>2000)return json(413,{error:'Too large'})}const data=JSON.parse(raw||'{}');return json(200,await demandAssetFactory.approveForSale(data.id,data.productId,data.review||{}))}
if(path==='/digital-asset'&&req.method==='GET'){
 const t=u.searchParams.get('token')||'';
 if(!/^[a-f0-9]{48}$/.test(t))return json(404,{error:'Unavailable'});
 const order=Object.values((await ledger()).orders||{}).find(x=>x.status==='COMPLETED'&&x.captureId&&x.demandAssetId&&x.fulfillment?.token===t);
 if(!order)return json(404,{error:'Unavailable'});
 try{
  const file=await demandAssetFactory.getApprovedArtifact(order.demandAssetId,order.product);
  res.writeHead(200,{'content-type':'text/markdown; charset=utf-8',
   'content-disposition':'attachment; filename="'+file.filename+'"','content-length':file.bytes.length,
   'cache-control':'private,no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});
  return res.end(file.bytes);
 }catch{return json(404,{error:'Resource is not ready'})}
}
if(path==='/api/demand/v46/status'&&req.method==='GET'){
 const allowed=v13Owner();
 return json(200,{ok:true,discovery:await liveDemandListener.snapshot(allowed),assets:await demandAssetFactory.status(allowed)});
}
if(path==='/api/demand/v46/artifact'&&req.method==='GET'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 try{
  const artifact=await demandAssetFactory.getArtifact(u.searchParams.get('id'));
  res.writeHead(200,{'content-type':'text/markdown; charset=utf-8','content-disposition':'attachment; filename="'+artifact.filename+'"',
   'cache-control':'private,no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer',
   'content-length':artifact.bytes.length});
  return res.end(artifact.bytes);
 }catch{return json(404,{error:'Draft does not exist or failed integrity checks'})}
}
if((path==='/mainframe'||path==='/autonomy-mainframe')&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY','referrer-policy':'no-referrer'});return res.end(await readFile(new URL('./public/mainframe-v44.html',import.meta.url),'utf8'))}
if(path==='/api/mainframe/v44'&&req.method==='GET'){return json(200,await mainframe44.snapshot(false))}
if(path==='/api/mainframe/v44/owner'&&req.method==='GET'){if(!v13Owner())return json(403,{error:'Owner authorization required'});return json(200,await mainframe44.snapshot(true))}
if(path==='/api/mainframe/v44/payhip'&&req.method==='GET'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 return json(200,await payhipReceiver.status())
}
if(path==='/webhooks/payhip'&&req.method==='POST'){
 if(!process.env.ULTRON_PAYHIP_API_KEY)return json(503,{error:'Payhip webhook provider credentials not configured'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>16000)return json(413,{error:'Request too large'})}
 try{
  const receipt=await payhipReceiver.receive(JSON.parse(raw||'{}'));
  return json(200,{ok:true,...receipt});
 }catch(e){return json(401,{ok:false,error:'Invalid, conflicting or unverified Payhip event'})}
}
if(path==='/api/leads'&&req.method==='POST'){
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return json(413,{error:'Request too large'})}
 try{const lead=await mainframe44.publicIntake(JSON.parse(raw||'{}'));return json(201,{ok:true,...lead})}
 catch(e){return json(400,{ok:false,error:String(e.message).slice(0,160)})}
}
if(path==='/api/mainframe/v44/draft'&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>16000)return json(413,{error:'Request too large'})}
 try{const draft=await mainframe44.saveProductDraft(JSON.parse(raw||'{}'));return json(201,{ok:true,draft})}
 catch(e){return json(400,{ok:false,error:String(e.message).slice(0,170)})}
}
if(path==='/api/mainframe/v44/artifact'&&req.method==='GET'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 try{const draft=await mainframe44.getProductDraft(u.searchParams.get('id'));
  res.writeHead(200,{'content-type':'application/octet-stream','content-disposition':'attachment; filename="'+draft.filename+'"','content-length':draft.data.length,'cache-control':'private,no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});return res.end(draft.data)}
 catch{return json(404,{error:'Draft not found or failed integrity verification'})}
}
if(path==='/api/reference-workflows'&&req.method==='GET')return json(200,{workflows,executionVerified:false});
if(path==='/api/reference-workflows/qualify'&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>4000)return json(413,{error:'Request too large'})}
 try{return json(200,{result:qualifyLead(JSON.parse(raw))})}catch{return json(400,{error:'Provide valid source, asOf, consent and four boolean-or-null qualification answers'})}
}
if(path==='/api/reference-workflows'&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>20000)return json(413,{error:'Request too large'})}
 let input;try{input=JSON.parse(raw)}catch{return json(400,{error:'Invalid JSON'})}
 try{return json(202,await submitWorkflow(executive,input))}catch(e){
 const message=String(e.message);if(/^(Workflow object|Unknown workflow|Brief must|Stable requestId|Invalid memory scope|Idempotency key|Queue full)/.test(message))return json(400,{error:message});
 return json(503,{error:'Workflow queue unavailable'});
 }
}
if(path==='/executive'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});return res.end(await readFile(new URL('./public/executive.html',import.meta.url),'utf8'))}
if(path==='/api/executive/status'&&req.method==='GET')return json(200,await executive.status(v13Owner()));
if(path==='/api/executive/business'&&req.method==='GET'){if(!v13Owner())return json(403,{error:'Owner authorization required'});return json(200,await businessRuntime.status())}
if(path==='/api/executive/deployments'&&req.method==='GET'){if(!v13Owner())return json(403,{error:'Owner authorization required'});return json(200,await productDeployer.status())}
if(path==='/api/executive/artifact'&&req.method==='GET'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 const job=(await executive.status(true)).jobs.find(j=>j.id===u.searchParams.get('job'));
 const artifact=job?.result?.artifacts?.find(a=>a.id===u.searchParams.get('id')&&a.base64);
 if(!artifact)return json(404,{error:'Saved artifact not found'});
 const filename=String(artifact.path||'artifact').split('/').pop().replace(/[^a-zA-Z0-9_.-]/g,'_');
 res.writeHead(200,{'content-type':'application/octet-stream','content-disposition':'attachment; filename="'+filename+'"','cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(Buffer.from(artifact.base64,'base64'));
}
if(path==='/api/executive/events'&&req.method==='POST'){
 if(!process.env.ULTRON_BUSINESS_WEBHOOK_SECRET)return json(503,{error:'Authenticated event source is not configured'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>12000)return json(413,{error:'Request too large'})}
 try{const event=verifyBusinessWebhook(raw,req.headers,process.env.ULTRON_BUSINESS_WEBHOOK_SECRET);return json(202,await businessRuntime.receive(event))}catch{return json(401,{error:'Invalid authenticated business event'})}
}
if(path==='/api/executive/jobs'&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>32000)return json(413,{error:'Request too large'})}
 try{const input=JSON.parse(raw);
  if(input.kind==='support'){
   const order=input.orderId?(await ledger()).orders?.[String(input.orderId)]:null;
   input.prompt=String(input.prompt||'')+'\nApplication-verified payment context: '+JSON.stringify({orderFound:Boolean(order),paid:Boolean(order?.status==='COMPLETED'&&order?.captureId),status:order?.status||'UNKNOWN',source:'ULTRON payment ledger; not bank settlement'});
  }
  return json(202,{job:await executive.enqueue(input)})
 }catch(e){return json(400,{error:String(e.message)})}
}

if(path==='/video-studio'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});return res.end(await readFile(new URL('./public/cinematic-v43.html',import.meta.url),'utf8'))}
if(path==='/api/video-studio/v43'&&req.method==='GET')return json(200,{ok:true,studio:await publicCinematic()});
if(path==='/api/video-studio/v43/sample'&&req.method==='GET'){const state=await cinematicState(),j=state.jobs[state.sampleJobId];if(!sampleEligible(j))return json(404,{error:'No approved cinematic sample exists'});res.writeHead(200,{'content-type':'video/mp4','content-length':j.artifact.bytes,'cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(Buffer.from(j.artifact.base64,'base64'))}
if(path==='/api/video-studio/v43/owner'&&req.method==='GET'){if(!v13Owner())return json(403,{error:'Owner authorization required'});const state=await cinematicState();return json(200,{ok:true,state:{...state,jobs:Object.fromEntries(Object.entries(state.jobs).map(([id,j])=>[id,publicJob(j)]))}})}
if(path==='/api/video-studio/v43/preview'&&req.method==='GET'){if(!v13Owner())return json(403,{error:'Owner authorization required'});const j=(await cinematicState()).jobs[u.searchParams.get('id')];if(!j?.artifact)return json(404,{error:'No rendered artifact'});res.writeHead(200,{'content-type':'video/mp4','cache-control':'no-store','content-length':j.artifact.bytes});return res.end(Buffer.from(j.artifact.base64,'base64'))}
if(path.startsWith('/api/video-studio/v43/')&&req.method==='POST'){
 const action=path.split('/').at(-1),publicActions=['inquiry','checkout','accept'];if(!publicActions.includes(action)&&!v13Owner())return json(403,{error:'Owner authorization required'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 const limit=['artifact','assemble'].includes(action)?43000000:12000;let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>limit)return json(413,{error:'Request too large'})}
 try{const input=JSON.parse(raw||'{}');let result;
 if(action==='inquiry')result=await recordVideoInquiry(input,req.socket.remoteAddress||'');
 else if(action==='plan')result=makeStoryboard(input);
 else if(action==='create')result=publicJob(await createVideoJob(input));
 else if(action==='authorize')result=publicJob(await authorizeVideoJob(input.id,input));
 else if(action==='preflight')result=await videoPreflight();
 else if(action==='submit')result=await submitOneShot(input.id);
 else if(action==='retry')result=publicJob(await retryVideoShot(input.id,input));
 else if(action==='poll')result=publicJob(await pollVideoJob(input.id));
 else if(action==='artifact')result=publicJob(await attachVideoArtifact(input.id,input));
 else if(action==='assemble')result=publicJob(await editVideoJob(input.id,input));
 else if(action==='review')result=publicJob(await recordVideoReview(input.id,input));
 else if(action==='quote')result=await makeVideoQuote(input);
 else if(action==='issue')result=await issueVideoQuote(input.id);
 else if(action==='checkout'){if(input.acceptTerms!==true||input.termsVersion!==VIDEO_TERMS.version)throw Error('Accept the current video terms');const g=await operationalGate('checkout');if(!g.allowed||!READY||!payment.ok)return json(503,{error:'Checkout currently unavailable'});if(!(await salesReadiness()).ready)return json(503,{error:'A funded video provider and quality-approved sample are required'});const previous=Object.values((await cinematicState()).quotes).find(q=>q.token===input.quoteToken&&q.status==='AWAITING_CUSTOMER_PAYMENT'&&Date.parse(q.expiresAt)>Date.now());if(previous)return json(200,{ok:true,result:{checkoutUrl:previous.checkoutUrl}});result={checkoutUrl:await createOrder(CINEMA_SKU,input)}}
 else if(action==='accept'){const row=Object.values((await ledger()).orders||{}).find(o=>o.product===CINEMA_SKU&&o.fulfillment?.token===input.token&&input.token?.length>=32);if(!row)return json(404,{error:'Paid video not found'});result=publicJob(await acceptCustomerVideo(row,input))}
 else return json(404,{error:'Unknown video action'});return json(200,{ok:true,result});
 }catch(e){return json(400,{error:String(e?.message||e).slice(0,250)})}
}
if(path==='/video-quote'&&req.method==='GET'){
 const token=u.searchParams.get('token');if(!token||token.length<32)return json(404,{error:'Issued quote not found'});const q=Object.values((await cinematicState()).quotes).find(q=>q.token===token&&['ISSUED','AWAITING_CUSTOMER_PAYMENT','PAID_PRODUCTION_QUEUED'].includes(q.status));if(!q||Date.parse(q.expiresAt)<=Date.now())return json(404,{error:'Current issued quote not found'});
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','x-frame-options':'DENY'});return res.end(shell('Your original video quote','<h1>Original cinematic short</h1><p>Price: $'+esc(q.priceUsd)+' USD</p><p>'+esc(q.scope)+'</p>'+Object.entries(VIDEO_TERMS).filter(([k])=>k!=='version').map(([k,v])=>'<h2>'+esc(k)+'</h2><p>'+esc(v)+'</p>').join('')+'<label><input type="checkbox" id="accept"> I accept this scope and service terms.</label><button id="checkout">Continue to PayPal</button><p id="message"></p><script>document.getElementById("checkout").onclick=async()=>{if(!document.getElementById("accept").checked){document.getElementById("message").textContent="Accept terms before checkout";return}const r=await fetch("/api/video-studio/v43/checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quoteToken:new URL(location.href).searchParams.get("token"),acceptTerms:true,termsVersion:"43.1"})}),d=await r.json();if(r.ok)location.href=d.result.checkoutUrl;else document.getElementById("message").textContent=d.error||"Checkout unavailable"}</script>'));
}
if(path==='/video-delivery'&&req.method==='GET'){
 const row=Object.values((await ledger()).orders||{}).find(o=>o.product===CINEMA_SKU&&o.fulfillment?.token===u.searchParams.get('token')&&u.searchParams.get('token')?.length>=32);if(!row)return json(404,{error:'Video order not found'});const j=await customerVideo(row);
 if(u.searchParams.get('download')==='1'){if(!sampleEligible(j))return json(409,{error:'Video is not quality approved'});res.writeHead(200,{'content-type':'video/mp4','content-length':j.artifact.bytes,'cache-control':'no-store','referrer-policy':'no-referrer'});return res.end(Buffer.from(j.artifact.base64,'base64'))}
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer'});return res.end(shell('Private video delivery','<h1>Your original cinematic short</h1><p>Status: '+esc(j?.status||'PRODUCTION_QUEUED')+'</p>'+(sampleEligible(j)?'<video controls playsinline style="width:100%;max-width:480px" src="/video-delivery?download=1&token='+encodeURIComponent(row.fulfillment.token)+'"></video><p>Acceptance SHA-256: '+esc(j.artifact.sha256)+'</p><button id=acceptVideo>Accept this final video</button><p id=acceptMessage></p><script>document.getElementById("acceptVideo").onclick=async()=>{const r=await fetch("/api/video-studio/v43/accept",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token:new URL(location.href).searchParams.get("token"),accepted:true,sha256:"'+j.artifact.sha256+'"})});const d=await r.json();document.getElementById("acceptMessage").textContent=r.ok?"Acceptance recorded":d.error}</script>':'<p>Your video will appear after rendering and quality review.</p>')))
}


if(path==='/api/video-lab/v42/state'&&req.method==='GET'){if(!v13Owner())return json(403,{error:'Owner authorization required'});return json(200,{ok:true,state:await videoLabState()})}
if(path==='/api/video-lab/v42'&&req.method==='GET')return json(200,{ok:true,report:videoLabManifest()});
if(path==='/video-lab'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});return res.end(await readFile(new URL('./public/video-lab-v42.html',import.meta.url),'utf8'));
}
if(path.startsWith('/video-lab/prototype/')&&req.method==='GET'){
 const kind=path.split('/').at(-1);try{const page=['cleaner','reverse-audio','sounds'].includes(kind)?mediaPrototype(kind):appPrototype({kind});res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY','x-content-type-options':'nosniff'});return res.end(page)}catch(e){return json(400,{error:String(e.message)})}
}
if(path.startsWith('/api/video-lab/v42/')&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>300000)return json(413,{error:'Request too large'})}
 try{const input=JSON.parse(raw||'{}'),action=path.split('/').at(-1),fn=Object.hasOwn(videoLabActions,action)?videoLabActions[action]:null;if(!fn)return json(404,{error:'Unknown tool'});const result=fn(input);return json(200,{ok:true,result,externalActionTaken:false})}catch(e){return json(400,{error:String(e?.message||e).slice(0,200)})}
}


if(path==='/audit-intake'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer'});return res.end(await readFile(new URL('./public/audit-intake-v41.html',import.meta.url),'utf8'));
}
if(path==='/audit-terms'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(shell('Revenue Leak Audit service terms','<h1>Revenue Leak Audit service terms</h1><p>$500 USD · version '+esc(TERMS.version)+'</p><p>Delivery: five business days (Monday–Friday) after completed payment and intake. A reviewer checks the report before delivery.</p>'+['scope','exclusions','acceptance','refunds','support'].map(k=>'<h2>'+esc(k)+'</h2><p>'+esc(TERMS[k])+'</p>').join('')+'<p><a href="/audit-intake">Complete intake</a></p>'));
}
if(path==='/revenue-operations'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});return res.end(await readFile(new URL('./public/revenue-operations-v41.html',import.meta.url),'utf8'));
}
if(path==='/api/revenue-operations/v41'&&req.method==='GET')return json(200,{ok:true,report:publicOperations(Object.values((await ledger()).orders||{}),await operationsState(),process.env)});
if(path==='/api/revenue-operations/v41/owner'&&req.method==='GET'){
 if(!v13Owner())return json(403,{error:'Owner authorization required'});
 return json(200,{ok:true,state:await operationsState(),paidAudits:Object.values((await ledger()).orders||{}).filter(o=>o.product===AUDIT_SKU&&o.captureId)});
}
if((path.startsWith('/api/audit/v41/')||path==='/api/revenue-operations/v41/record')&&req.method==='POST'){
 const ownerPaths=['/api/audit/v41/review','/api/audit/v41/buyer-verification','/api/audit/v41/financial-review','/api/revenue-operations/v41/record'];
 if(ownerPaths.includes(path)&&!v13Owner())return json(403,{error:'Owner authorization required'});
 if(!String(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON required'});
 let raw='';for await(const ch of req){raw+=ch;if(raw.length>24000)return json(413,{error:'Request too large'})}
 let data;try{data=JSON.parse(raw||'{}')}catch{return json(400,{error:'Invalid JSON'})}
 try{
  if(path==='/api/audit/v41/checkout'){
   const intake=validateAuditIntake(data),g=await operationalGate('checkout');
   if(!g.allowed||!READY||!payment.ok)return json(503,{error:'Checkout currently unavailable'});
   return json(201,{ok:true,checkoutUrl:await createOrder(AUDIT_SKU,intake),priceUsd:500});
  }
  if(path==='/api/revenue-operations/v41/record'){await recordOps(data.kind,data);return json(200,{ok:true,message:'Owner record saved; no external effect inferred'})}
  const l=await ledger(),o=ownerPaths.includes(path)?l.orders?.[data.orderId]:Object.values(l.orders||{}).find(o=>typeof data.token==='string'&&data.token.length>=32&&o.fulfillment?.token===data.token);
  if(!o||o.product!==AUDIT_SKU||!o.captureId)return json(404,{error:'Paid audit not found'});
  if(path==='/api/audit/v41/review'){
   await saveLedger(z=>reviewAudit(z.orders[o.id],data));return json(200,{ok:true,message:'Quality-reviewed report available for customer review'});
  }
  if(path==='/api/audit/v41/onboarding'){
   if(o.fulfillment.status!=='ONBOARDING_REQUIRED')throw Error('Onboarding is not pending');
   const intake=validateAuditIntake(data),inspection=await inspectV34Homepage(intake.website);
   await saveLedger(z=>{const row=z.orders[o.id],token=row.fulfillment.token;row.auditIntake=intake;row.auditTerms={...TERMS};row.fulfillment={...prepareAudit({...row,capturedAt:new Date().toISOString()},inspection),token};});
   return json(200,{ok:true,message:'Intake received; your delivery deadline is now recorded'});
  }
  if(path==='/api/audit/v41/accept'){
   await saveLedger(z=>acceptAudit(z.orders[o.id],data));return json(200,{ok:true,message:'Customer acceptance recorded. Settlement is a separate step.'});
  }
  if(path==='/api/audit/v41/support'){
   if(!String(data.notes||'').trim())throw Error('Describe your request');
   await recordOps('MANUAL_TASK',{type:'SUPPORT',reference:o.id,notes:data.notes});return json(200,{ok:true,message:'Support request queued for review; no refund was initiated'});
  }
  if(path==='/api/audit/v41/buyer-verification'){
   if(data.ownerReviewedUnrelatedBuyer!==true)throw Error('Owner review of genuinely unrelated buyer required');
   const provider=await paypal('/v2/checkout/orders/'+encodeURIComponent(o.id));
   const cap=provider.purchase_units?.flatMap(x=>x.payments?.captures||[]).find(x=>x.id===o.captureId);
   assertCaptureMatches(o,cap);
   const payer=provider.payer?.payer_id,payee=provider.purchase_units?.[0]?.payee?.merchant_id;
   if(!payer||!payee||payer===payee)throw Error('Distinct provider payer and merchant evidence required');
   await saveLedger(z=>{const row=z.orders[o.id];row.independentBuyerVerified=true;row.independentBuyerEvidence={source:'PAYPAL_ORDER_READ_AND_OWNER_REVIEW',orderId:o.id,captureId:cap.id,payerId:payer,payeeId:payee,at:new Date().toISOString()};});
   return json(200,{ok:true,message:'Provider payer and owner unrelated-buyer review recorded'});
  }
  if(path==='/api/audit/v41/financial-review'){
   const amount=Number(data.costAmountUsd);if(data.costsComplete!==true||!data.costReference||!Number.isFinite(amount)||amount<0)throw Error('Complete documented nonnegative costs required');
   if(data.payoutReference||data.bankReference){if(!data.payoutReference||!data.bankReference||!Number.isFinite(Number(data.bankAmountUsd))||Number(data.bankAmountUsd)<0)throw Error('Matching payout and bank document references required');}
   await saveLedger(z=>{const row=z.orders[o.id];row.costReview={complete:true,amountUsd:amount,reference:String(data.costReference).slice(0,150),at:new Date().toISOString()};if(data.bankReference)row.settlement={source:'OWNER_RECONCILED_DOCUMENTS',payoutReference:String(data.payoutReference).slice(0,150),bankReference:String(data.bankReference).slice(0,150),bankAmountUsd:Number(data.bankAmountUsd),at:new Date().toISOString()};});
   return json(200,{ok:true,message:'Private financial document references recorded; independent verification remains separate'});
  }
  return json(404,{error:'Unknown audit operation'});
 }catch(e){return json(400,{error:String(e?.message||e).slice(0,220)});}
}

if(path==='/work-handoff'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/markdown; charset=utf-8','cache-control':'public,max-age=90','x-content-type-options':'nosniff','x-frame-options':'DENY'});
 return res.end(await readFile(new URL('./ULTRON_WORK_EXECUTION_HANDOFF.md',import.meta.url),'utf8'));
}
// v43: PUBLIC read-only and evidence-gated; no secrets, private orders, or external actions.
if((path==='/api/completion-execution/v43'||path==='/completion-execution')&&req.method==='GET'){
 const [l,commerce,supervisor,verifier,growth,ops]=await Promise.all([ledger(),agentOfAgentsState(),resilienceDetail(),verifierState(),growthV19State(),operationsState()]);
 const report=v43CompletionExecution({env:process.env,payment,commerce,supervisor,verifier,growth,ops,orders:Object.values(l.orders||{})});
 if(path==='/api/completion-execution/v43'){
  const offset=Math.max(0,Math.min(499,Number(u.searchParams.get('offset'))||0));
  const limit=Math.max(1,Math.min(100,Number(u.searchParams.get('limit'))||25));
  return json(200,{ok:true,...report,requirements:report.requirements.slice(offset,offset+limit),offset,limit,
   note:'A 500-task register is not 500 completed outcomes. No private customer record or credential is returned.'});
 }
 const cards=report.critical.map(x=>'<article><small>PRIORITY '+x.priority+'</small><h3>'+esc(x.id)+'</h3><p>'+esc(x.status)+'</p><p>'+esc(x.ownerAction)+'</p><a href="'+esc(x.actionUrl)+'">Open action</a></article>').join('');
 const groups=report.groups.map(x=>'<li>'+esc(x.name)+' — '+x.total+' requirements; independently verified here: '+x.verified+'</li>').join('');
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});
 return res.end(shell('ULTRON v43 — Evidence Execution Center',
  '<nav><a href="/">Mainframe</a><a href="/completion-500">500 Requirements</a><a href="/revenue-operations">Paid Work</a><a href="/owner-actions">Owner Actions</a></nav>'+
  '<h1>REVENUE EXECUTION — ALL 500 REQUIREMENTS</h1><p>Prioritize independent buyer and paid fulfillment evidence. Status is bounded, never self-certified.</p>'+
  '<section><article><h2>Requirements tracked</h2><b>'+report.totalRequirements+'</b></article><article><h2>Verified end to end here</h2><b>'+report.verifiedRequirements+'</b></article>'+
  '<article><h2>Unrelated customer acceptance evidence recorded</h2><b>'+report.customerAcceptanceEvidenceRecorded+'</b></article></section>'+
  '<h2>Highest-priority owner actions and fallback paths</h2><section>'+cards+'</section>'+
  '<h2>20 audited workstreams</h2><ol>'+groups+'</ol>'+
  '<p><a href="/api/completion-execution/v43?offset=0&limit=100">Read JSON task evidence and blockers</a> · <a href="/work-handoff">Work execution handoff</a></p>'+
  '<p>No sends, orders, refunds, trades, access grants, or credential changes occur on this page.</p>'));
}

if(path==='/api/work-activation/v40'&&req.method==='GET'){
 const l=await ledger();
 return json(200,{ok:true,report:v40ActivationReport({env:process.env,provider:{paypal:payment},orders:Object.values(l.orders||{})})});
}
if(path==='/api/work-activation/v40/owner'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'Owner authorization required'});
 const l=await ledger();
 return json(200,{ok:true,report:v40ActivationReport({env:process.env,provider:{paypal:payment},orders:Object.values(l.orders||{})}),commander:await revenueCommanderReport()});
}


if(path==='/api/quantum/v39'&&req.method==='GET')return json(200,{ok:true,core:quantumManifest()});
if(path==='/api/quantum/v39/examples'&&req.method==='GET')return json(200,{ok:true,
 bell:runCircuit({}),ghz:runCircuit({qubits:3,gates:[{op:'H',target:0},{op:'CX',control:0,target:1},{op:'CX',control:0,target:2}]}),
 caution:'CPU simulation only. No quantum processor was contacted.'});
if(path==='/quantum-core'&&req.method==='GET'){
 const x=quantumManifest();
 const links='<nav><a href="/">ULTRON</a> <a href="/api/quantum/v39">Core JSON</a> <a href="/api/quantum/v39/examples">Quantum circuit examples</a> <a href="https://quantum.cloud.ibm.com/learning">IBM free learning</a></nav>';
 const body='<h1>ULTRON / HYBRID QUANTUM CORE V39</h1>'+links+
  '<p>Live educational circuit simulation on a classical CPU. Not a real QPU and not proven faster than classical computing.</p>'+
  '<section><article><h2>Core</h2><p>Bounded 1-8 qubit circuits, H / X / Z / RY / CX, probability results.</p><b>SIMULATOR READY</b></article>'+
  '<article><h2>Physical quantum computer</h2><p>IBM Cloud sign-up, provider credential, quota check and isolated Python Qiskit worker still required.</p><b>NOT CONNECTED</b></article>'+
  '<article><h2>Durable memory</h2><p>Use Postgres, encrypted object storage, audit log and backups. Quantum hard-drive technology is not available for this service.</p><b>CLASSICAL STORAGE</b></article>'+
  '<article><h2>Revenue-first</h2><p>Existing real buyers and paid delivery take priority over quantum hype. No new real sales are asserted.</p><b>NO CLAIMED SALES</b></article></section>'+
  '<h2>Video-derived modules</h2><section>'+x.modules.map(m=>'<article><h3>'+esc(m.label)+'</h3><p>'+esc(m.state)+'</p></article>').join('')+'</section>'+
  '<p>All outputs are bounded research and educational prototypes; external actions require separate authorization.</p>';
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});
 return res.end(shell('ULTRON Quantum Core v39',body));
}
if((path==='/api/quantum/v39/simulate'||path==='/api/quantum/v39/property'||path==='/api/quantum/v39/pilot')&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'Owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8000)return json(413,{ok:false,error:'Request too large'})}
 let input;try{input=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'Invalid JSON'})}
 try{
 const result=path.endsWith('/simulate')?runCircuit(input):path.endsWith('/property')?propertyScenario(input):pilotBlueprint(input);
 return json(200,{ok:true,result,externalActionTaken:false});
 }catch(e){return json(400,{ok:false,error:String(e?.message||e).slice(0,200)})}
}


if(path==='/api/upgrades/v24'&&req.method==='GET')return json(200,{ok:true,report:await v24Status()});
if(path==='/upgrade-lab'&&req.method==='GET'){
 const z=await v24Status();
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON v24 Upgrade Lab',
 '<nav><a href="/">ULTRON</a><a href="/mission-control">Mission Control</a><a href="/flagship">Flagship</a><a href="/api/upgrades/v24">JSON status</a></nav>'+
 '<h1>ULTRON // VIDEO UPGRADE LAB</h1><p>Execution status is shown without overstating disconnected external services.</p>'+
 '<section>'+Object.entries(z.integrations).map(([name,d])=>'<article><small>'+esc(name)+'</small><h3>'+esc(d.state)+'</h3></article>').join('')+'</section>'+
 '<section><article><h2>Real captured orders</h2><b>'+z.sales.verifiedOrders+'</b></article><article><h2>Open paid delivery</h2><b>'+z.sales.outstandingDelivery+'</b></article></section>'+
 '<p>Owner authorization required for scans and integrations. No automatic funding applications, live trades, or outbound sends.</p>'));
}
if(path.startsWith('/api/upgrades/v24/')&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>16000)return json(413,{error:'request too large'});}
 let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'});}
 try{
  const op=path.slice('/api/upgrades/v24/'.length);
  let result;
  if(op==='pulse')result=await v24Pulse();
  else if(op==='scan')result=await v24Inspect(b);
  else if(op==='browser')result=await v24Browser(b);
  else if(op==='copy')result=await v24Copy(b);
  else if(op==='grant')result=await v24Grant(b);
  else if(op==='market')result=await v24Market();
  else return json(404,{error:'unknown action'});
  return json(200,{ok:true,result});
 }catch(e){return json(400,{error:String(e?.message||e).slice(0,200)})}
}




if(path==='/api/final-level'&&req.method==='GET'){
 const s=await operatorSnapshot();
 return json(200,{ok:true,report:s.finalLevel,supervisor:{objective:s.objective,asOf:s.asOf,verifiedOrders:s.verifiedOrders,verifiedCapturedUsd:s.verifiedCapturedUsd},
  notice:'100,000 designed evidence checks; 0 have been automatically executed or independently verified.'});
}
if(path==='/api/final-level/checks'&&req.method==='GET'){
 try{const p=listFinalLevelChecks({offset:u.searchParams.get('offset')||0,limit:u.searchParams.get('limit')||50,
   requirementId:u.searchParams.get('requirementId')||null});
  return json(200,{ok:true,...p});
 }catch(e){return json(400,{ok:false,error:String(e.message||e).slice(0,160)})}
}
if(path.startsWith('/api/final-level/checks/')&&req.method==='GET'){
 try{return json(200,{ok:true,check:lookupCheckId(path.slice('/api/final-level/checks/'.length))})}
 catch(e){return json(404,{ok:false,error:String(e.message||e).slice(0,160)})}
}
if(path==='/api/final-level/export.csv'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/csv; charset=utf-8','cache-control':'no-store','content-disposition':'attachment; filename="ultron-final-level-100000.csv"','x-content-type-options':'nosniff'});
 const stream=Readable.from(finalLevelCsvLines(),{encoding:'utf8'});
 stream.on('error',e=>{console.error('final-level CSV stream failed:',String(e?.message||e));res.destroy(e)});
 res.on('close',()=>stream.destroy());
 stream.pipe(res);return;
}
if(path==='/final-level'&&req.method==='GET'){
 const s=await operatorSnapshot(),x=s.finalLevel;
 const blockers=x.mandatoryExternalGates.map(g=>'<article><small>'+esc(g.status)+'</small><h3>'+esc(g.key.replaceAll('_',' '))+'</h3><p>'+esc(g.reason)+'</p></article>').join('');
 const top=x.priorityRequirements.map(t=>'<li><b>'+esc(t.requirementId)+'</b> '+esc(t.task)+' <small>'+esc(t.authorization)+'</small></li>').join('');
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON - Final Level QA Program',
  '<nav><a href="/">ULTRON</a><a href="/mission-control">Mission Control</a><a href="/completion-500">500 Requirements</a><a href="/activation-center">Activation</a></nav>'+
  '<h1>FINAL LEVEL / 100,000 EVIDENCE CHECKS</h1><p>500 requirements × 10 quality controls × 5 operating conditions × 4 lifecycle stages. These are checks to perform, not completed upgrades.</p>'+
  '<section><article><h2>Checks indexed</h2><b>'+Number(x.registeredQualityChecks).toLocaleString('en-US')+'</b></article>'+
  '<article><h2>Independently verified as passed</h2><b>'+x.verifiedPassed+'</b></article>'+
  '<article><h2>Reported customer revenue</h2><b>$'+Number(x.reportedVerifiedRevenueUsd).toLocaleString('en-US')+'</b></article></section>'+
  '<p><a href="/api/final-level/export.csv">Download complete 100,000-check CSV</a> · <a href="/api/final-level/checks?offset=0&limit=50">Browse first 50 checks</a> · <a href="/api/final-level">Structured status</a></p>'+
  '<h2>Highest-priority underlying requirements</h2><ol>'+top+'</ol><h2>External activation gates</h2><section>'+blockers+'</section>'+
  '<p>All 100,000 checks begin as NOT_EVALUATED. Generating them does not create working provider access, sales or lender eligibility. No external sending, spending or financial transactions are performed.</p>'));
}

if(path==='/api/completion-500'&&req.method==='GET'){
 const d=await operatorSnapshot(),p=d.completion500;
 const group=u.searchParams.get('group'),tier=u.searchParams.get('tier'),status=u.searchParams.get('status');
 const offset=Math.min(499,Math.max(0,Number(u.searchParams.get('offset')||0)||0));
 const limit=Math.min(100,Math.max(1,Number(u.searchParams.get('limit')||50)||50));
 const filtered=p.tasks.filter(x=>(!group||x.group===group)&&(!tier||x.tier===tier)&&(!status||x.status===status));
 return json(200,{ok:true,version:p.version,goalUsd:p.goalUsd,focus:p.focus,registeredRequirements:p.registeredRequirements,
 evidenceVerifiedCount:p.evidenceVerifiedCount,ownerEvidenceSubmittedCount:p.ownerEvidenceSubmittedCount,
 statuses:p.statuses,groups:p.groups,criticalBlockers:p.criticalBlockers,nextActions:p.nextActions,
 safeResearchOrImplementationCandidates:p.safeResearchOrImplementationCandidates,
 requiresExternalAction:p.requiresExternalAction,totalMatching:filtered.length,offset,limit,items:filtered.slice(offset,offset+limit),
 notice:'These 500 requirements are an evidence-gated operating backlog, not 500 completed integrations or verified outcomes.'});
}
if(path==='/api/completion-500/evidence'&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});
 let raw='';for await(const ch of req){raw+=ch;if(raw.length>5000)return json(413,{error:'request too large'});}
 let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'})}
 try{return json(202,{ok:true,result:await register500Evidence(b)})}
 catch(e){return json(400,{ok:false,error:String(e.message||e).slice(0,200)})}
}
if(path==='/completion-500'&&req.method==='GET'){
 const d=await operatorSnapshot(),p=d.completion500;
 const groups=p.groups.map(g=>{
  const rows=p.tasks.filter(x=>x.group===g.name).map(t=>
   '<li><b>'+esc(t.id)+'</b> '+esc(t.title)+' <small>('+esc(t.authority)+')</small></li>').join('');
  return '<details><summary><b>'+esc(g.name)+'</b> - '+esc(g.tier)+' - 25 requirements</summary><ol>'+rows+'</ol></details>';
 }).join('');
 const blockers=p.criticalBlockers.map(x=>'<li>'+esc(x.name)+' - '+esc(x.status)+'</li>').join('');
 const next=p.nextActions.slice(0,12).map(x=>'<li><b>'+esc(x.id)+'</b> '+esc(x.task)+' <small>'+esc(x.authority)+'</small></li>').join('');
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON - 500 Completion Requirements',
 '<nav><a href="/">ULTRON</a><a href="/mission-control">Mission Control</a><a href="/trillion-mission">Trillion Mission</a><a href="/api/completion-500">JSON</a></nav>'+
 '<h1>ULTRON / 500-ITEM COMPLETION COMMAND CENTER</h1><p>A real implementation and verification backlog. Registering work is not equivalent to finishing it.</p>'+
 '<section><article><h2>Requirements analyzed</h2><b>'+p.registeredRequirements+'</b></article><article><h2>Externally verified</h2><b>'+p.evidenceVerifiedCount+'</b></article><article><h2>Current objective</h2><b>'+esc(p.focus)+'</b></article></section>'+
 '<h2>Critical reported blockers</h2><ul>'+blockers+'</ul><h2>Next assignments</h2><ol>'+next+'</ol>'+
 '<h2>500 distinct requirements in 20 workstreams</h2>'+groups+
 '<p>Some items require domain ownership, provider authorization, external execution, actual customer payment or independent proof. Those are not automatically completed.</p>'));
}


if(path==='/api/owner/inbox-v28'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authentication required'});
 const limit=Math.min(100,Math.max(1,Number(u.searchParams.get('limit')||100)||100));
 return json(200,{ok:true,queue:await inboundWorkQueue(limit)});
}
if(path==='/api/owner/inbox-v28/draft'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authentication required'});
 const id=String(u.searchParams.get('id')||'');
 try{return json(200,{ok:true,draft:await draftInboundById(id)})}
 catch(e){return json(400,{ok:false,error:String(e.message||e).slice(0,160)})}
}
if(path==='/api/owner/inbox-v28/review'&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authentication required'});
 let raw='';for await(const ch of req){raw+=ch;if(raw.length>3000)return json(413,{ok:false,error:'request too large'})}
 let payload={};try{payload=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'})}
 try{return json(200,{ok:true,review:await reviewInbound(payload)})}
 catch(e){return json(400,{ok:false,error:String(e.message||e).slice(0,160)})}
}
if(path==='/inbound-inbox'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON Private Inbound Inbox',"<nav><a href=\"/\">ULTRON</a><a href=\"/activation-center\">Revenue Activation</a><a href=\"/flagship\">Flagship</a></nav>\n<h1>ULTRON / OWNER INBOUND INBOX</h1>\n<p>Voluntary diagnostic inquiries only. Owner authentication is required to view contact information. No messages are sent automatically from this page.</p>\n<section><article><label for=\"key\">Owner token (kept only on this page)</label><input type=\"password\" id=\"key\" autocomplete=\"off\" placeholder=\"Railway owner token\">\n<button type=\"button\" id=\"load\">Load qualified inquiries</button><p id=\"feedback\" role=\"status\" aria-live=\"polite\"></p></article></section>\n<h2>Inbound lead queue</h2><div id=\"queue\"></div>\n<script>\n(function(){\nlet token='';\nconst status=document.getElementById('feedback'),queue=document.getElementById('queue');\nconst button=(label,fn)=>{const el=document.createElement('button');el.textContent=label;el.type='button';el.addEventListener('click',fn);return el};\nasync function request(url,init={}){\nconst r=await fetch(url,{...init,headers:{'authorization':'Bearer '+token,...(init.headers||{})}});\nlet b={};try{b=await r.json()}catch{};\nif(!r.ok)throw Error(b.error||'Authorization or request failed');\nreturn b;\n}\nasync function load(){\ntoken=document.getElementById('key').value.trim();\nif(!token){status.textContent='Owner token required';return;}\nstatus.textContent='Loading owner-only inquiries';queue.replaceChildren();\ntry{const b=await request('/api/owner/inbox-v28?limit=100');\nstatus.textContent=b.queue.total+' received; '+b.queue.consentedOpen+' available for consented one-to-one follow-up; '+b.queue.newRequests+' new.';\nfor(const item of b.queue.items){\nconst card=document.createElement('article'),title=document.createElement('h3'),details=document.createElement('p'),scope=document.createElement('p');\ntitle.textContent=(item.company||'Unspecified business')+' • '+item.severity+' • '+item.score+'/100';\ndetails.textContent=item.email+' • '+item.niche+' • '+item.status;\nscope.textContent=item.contactPermitted?'Requested one-to-one diagnostic follow-up':'No contact permission';\ncard.append(title,details,scope);\ncard.append(button('Mark reviewed',async()=>{try{await request('/api/owner/inbox-v28/review',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:item.id,status:'reviewed'})});await load()}catch(e){status.textContent=e.message}}));\nif(item.contactPermitted){\ncard.append(button('Prepare reply in email app',async()=>{\ntry{const d=await request('/api/owner/inbox-v28/draft?id='+encodeURIComponent(item.id));\nconst href='mailto:'+encodeURIComponent(d.draft.to)+'?subject='+encodeURIComponent(d.draft.subject)+'&body='+encodeURIComponent(d.draft.body);\nwindow.location.href=href;status.textContent='Draft opened in your mail application. No email was sent by ULTRON.';}\ncatch(e){status.textContent=e.message;}\n}));\ncard.append(button('Mark qualified',async()=>{try{await request('/api/owner/inbox-v28/review',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:item.id,status:'qualified'})});await load()}catch(e){status.textContent=e.message}}));\n}\ncard.append(button('Suppress contact',async()=>{if(!confirm('Suppress all follow-up for this lead?'))return;try{await request('/api/owner/inbox-v28/review',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:item.id,status:'suppressed'})});await load()}catch(e){status.textContent=e.message}}));\nqueue.append(card);\n}\n}catch(e){status.textContent=e.message}\n}\ndocument.getElementById('load').addEventListener('click',load);\n})();\n</script>"));
}

if(path==='/api/activation/v27'&&req.method==='GET'){
 const s=await operatorSnapshot();
 const p=activationPlan({integrations:s.providerReadiness,paymentRuntime:payment,inbound:s.inboundLeads,
  paidOrders:s.verifiedOrders,interestedBuyers:s.interestedBuyers,verifiedRevenueUsd:s.verifiedCapturedUsd});
 return json(200,{ok:true,report:p,notice:'Real prospective buyers, authorized marketing and paid customer outcomes require external evidence.'});
}
if(path==='/api/activation/v27/inbound'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'authenticated owner required'});
 const limit=Math.min(100,Math.max(1,Number(u.searchParams.get('limit')||50)));
 return json(200,{ok:true,leads:await listLeads(limit),notice:'Personal contact data restricted to owner; contact consent is separate from scan submission.'});
}
if(path==='/activation-center'&&req.method==='GET'){
 const s=await operatorSnapshot();
 const a=activationPlan({integrations:s.providerReadiness,paymentRuntime:payment,inbound:s.inboundLeads,
  paidOrders:s.verifiedOrders,interestedBuyers:s.interestedBuyers,verifiedRevenueUsd:s.verifiedCapturedUsd});
 const cards=a.actions.map(x=>'<article><small>'+esc(x.status)+' / '+esc(x.mode)+'</small><h3>'+esc(x.action)+'</h3><p>'+esc(x.dependsOn)+'</p></article>').join('');
 const verified=a.providerGates.payments.status==='PRODUCTION_PROVIDER_VERIFIED'?'Production payment authorization verified (not a sale)':'Production payment verification pending';
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON Revenue Activation Center',
 '<nav><a href="/">ULTRON</a><a href="/mission-control">Mission Control</a><a href="/completion-500">500 Requirements</a><a href="/free-response-gap-scan">Free Diagnostic</a></nav>'+
 '<h1>ULTRON / REVENUE ACTIVATION</h1><p>First-party inbound demand remains usable even when third-party buyer discovery is unavailable. Running software is not proof of real sales.</p>'+
 '<section><article><h2>Voluntary inbound diagnostics</h2><b>'+a.firstPartyInbound.received+'</b></article><article><h2>Verified customer revenue</h2><b>$'+Number(a.verifiedRevenueUsd).toLocaleString('en-US')+'</b></article><article><h2>Current focus</h2><b>'+esc(a.focus)+'</b></article></section>'+
 '<p>'+esc(verified)+'</p><h2>CEO priority actions</h2><section>'+cards+'</section>'+
 '<p><a href="/api/activation/v27">Machine-readable status</a> | <a href="/flagship">Buy $500 Revenue Leak Audit</a></p>'+
 '<p>Scanning voluntarily does not grant permission for unsolicited email. Owner credentials, external sending and spending require separate authorization.</p>'));
}

if(path==='/api/trillion-mission'&&req.method==='GET'){
 const d=await operatorSnapshot();
 return json(200,{ok:true,mission:d.strategicMission,supervisor:{currentPriority:d.objective,verifiedCapturedUsd:d.verifiedCapturedUsd,verifiedOrders:d.verifiedOrders,blocked:d.blockedCount,lastCycle:d.lastCycle?.at||null},notice:'Long-horizon stretch goal; only externally verified payments count as customer revenue.'});
}
if(path==='/trillion-mission'&&req.method==='GET'){
 const d=await operatorSnapshot(),m=d.strategicMission;
 const cards=m.tasks.map(x=>'<article><small>'+esc(x.mode)+' / PRIORITY '+x.priority+'</small><h2>'+esc(x.delegate)+'</h2><p>'+esc(x.task)+'</p><p><b>Evidence:</b> '+esc(x.doneWhen)+'</p></article>').join('');
 const ideas=m.videoResearch.map(x=>'<li><b>'+esc(x.sourceIdea)+'</b>: '+esc(x.instruction)+'</li>').join('');
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON Trillion Mission',
 '<nav><a href="/">ULTRON</a><a href="/mission-control">Mission Control</a><a href="/api/trillion-mission">Machine-readable status</a></nav>'+
 '<h1>ULTRON - ONE TRILLION DOLLAR MISSION</h1><p>Aspirational long-horizon, cumulative verified external customer revenue objective; not a forecast or bank balance.</p>'+
 '<section><article><h2>Strategic target</h2><b>'+Number(m.targetUsd).toLocaleString('en-US')+' USD</b></article><article><h2>Verified captured customer revenue</h2><b>'+Number(m.currentEvidence.verifiedRevenueUsd).toLocaleString('en-US')+' USD</b></article><article><h2>Next milestone</h2><b>'+Number(m.nextMilestone.usd).toLocaleString('en-US')+' USD</b></article></section>'+
 '<h2>Mainframe directive</h2><p>'+esc(m.mainframeDirective)+'</p><h2>Assigned work</h2><section>'+cards+'</section>'+
 '<h2>Video ideas reviewed</h2><ul>'+ideas+'</ul><p>External sending, spending, legal and financial commitments remain approval-gated.</p>'));
}

if(path==='/mission-control'&&req.method==='GET'){
 const d=operatorPublic(await operatorSnapshot());
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON Mission Control v23','<nav><a href="/">ULTRON</a><a href="/flagship">Flagship</a><a href="/integrations">Integration Status</a><a href="/trillion-mission">Trillion Mission</a><a href="/completion-500">500 Requirements</a><a href="/activation-center">Revenue Activation</a><a href="/inbound-inbox">Owner Inbox</a></nav>'+
 '<h1>MISSION CONTROL</h1><p>Thirty separate commercial and technical objectives, managed by one durable supervisor. Only real transactions count as revenue.</p>'+
 '<section><article><h2>Priority</h2><p>'+esc(d.objective)+'</p></article><article><h2>Verified captured orders</h2><b>'+d.verifiedOrders+'</b></article><article><h2>Blocked objectives</h2><b>'+d.blockedCount+'</b></article></section>'+
 '<p>Domain purchase, provider approvals, actual paid clients and independent financial proof remain external requirements.</p>'));
}
if(path==='/flagship'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON Revenue Leak Audit','<nav><a href="/">ULTRON</a><a href="/free-response-gap-scan">Free Diagnostic</a><a href="/mission-control">Mission Control</a></nav>'+
 '<h1>Find where your business could be losing inquiries</h1><p>Get an evidence-based audit of inquiry, booking, website and follow-up friction. No revenue promises or simulated case studies.</p>'+
 '<section><article><h2>Revenue Leak Audit</h2><b>$500</b><p>Document what is observable and propose measured fixes.</p><a href="'+esc(FIRST_SALE_OFFERS.audit.checkout)+'">Secure checkout</a></article>'+
 '<article><h2>Automation Sprint</h2><b>$2,500</b><p>One scoped, owner-approved workflow.</p></article>'+
 '<article><h2>Revenue Operations</h2><b>$7,500</b><p>Connected lead intake, follow-up and conversion measurement.</p></article>'+
 '<article><h2>Business OS</h2><b>$10,000</b><p>Bounded multi-agent workflows with safety and quality controls.</p></article></section>'+
 '<p><a href="/audit-terms">Audit scope, delivery, acceptance and refund-review terms</a> · <a href="/free-response-gap-scan">Try the free diagnostic</a>. Paid implementations require an agreed scope and permission before accessing customer systems.</p>'));
}
if(path==='/api/operator/v23'&&req.method==='GET'){
 if(!v13Owner())return json(403,{error:'owner authorization required'});
 return json(200,{ok:true,report:await operatorSnapshot()});
}
if(path.startsWith('/api/operator/v23/')&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>12000)return json(413,{error:'payload too large'});}
 let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'});}
 try{if(path==='/api/operator/v23/cycle')return json(200,{ok:true,result:await operatorCycle()});
 if(path==='/api/operator/v23/evidence')return json(202,{ok:true,result:await operatorEvidence(b)});
 return json(404,{error:'unknown supervisor operation'});}catch(e){return json(400,{error:String(e?.message||e)})}
}


if(/^\/unsubscribe\/v19\/[^/]+$/.test(path)&&req.method==='GET'){
  try{await unsubscribe(decodeURIComponent(path.split('/')[3]),u.searchParams.get('token')||'');res.writeHead(200,{'content-type':'text/plain; charset=utf-8'});return res.end('ULTRON: unsubscribe confirmed');}catch{return json(400,{ok:false,error:'Invalid unsubscribe link'});}
}
if(/^\/demo\/v19\/[^/]+$/.test(path)&&req.method==='GET'){
  const d=(await growthV19State()).demonstrations[decodeURIComponent(path.split('/')[3])];if(!d)return json(404,{error:'demo not found'});
  res.writeHead(200,{'content-type':'text/html; charset=utf-8','x-robots-tag':'noindex,nofollow','cache-control':'no-store'});return res.end(demoHtml(d));
}
if(path==='/growth/v19'&&req.method==='GET'){
  const d=await growthDashboard(),m=d.metrics;
  res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
  return res.end(shell('ULTRON Growth v19','<nav><a href="/">ULTRON ONE</a><a href="/first-sale">First Sale</a><a href="/api/payment-status">PayPal Status</a></nav>'+
   '<h1>ULTRON Growth OS v19</h1><p>Research → proposals → verified payments → quality-checked fulfillment</p>'+
   '<section><article><h2>Sites researched</h2><b>'+m.researched+'</b></article><article><h2>Verified orders</h2><b>'+m.verifiedPayPalOrders+'</b></article>'+
   '<article><h2>Verified revenue</h2><b>$'+m.verifiedRevenueUsd.toFixed(2)+'</b></article><article><h2>Independent happy customers</h2><b>'+m.independentSatisfiedCustomers+'/3</b></article></section>'+
   '<h2>External adapters</h2><p>Discovery: '+esc(d.providers.discovery)+'; Gmail runtime: '+esc(d.providers.gmail)+'; Calendar runtime: '+esc(d.providers.calendar)+'</p>'+
   '<p>No synthetic revenue, contact claims, or guaranteed earnings. Owner approval required for outreach and spending.</p>'));
}
if(path==='/api/growth/v19'&&req.method==='GET'){if(!v13Owner())return json(403,{error:'owner authorization required'});return json(200,{ok:true,dashboard:await growthDashboard()});}
if(path==='/api/growth/v19/queue'&&req.method==='GET'){
  if(!v13Owner())return json(403,{error:'owner authorization required'});const t=await growthV19State();
  return json(200,{ok:true,prospects:Object.values(t.prospects).slice(-200),outbox:Object.values(t.outbox).filter(x=>x.status!=='SENT').slice(-100),
   proposals:Object.values(t.proposals).slice(-100),orders:Object.values(t.orders).slice(-100),fulfillment:Object.values(t.fulfillment).slice(-100)});
}
if(path.startsWith('/api/growth/v19/')&&req.method==='POST'){
  if(!v13Owner())return json(403,{error:'owner authorization required'});
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)return json(413,{error:'request too large'});}
  let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'});}
  try{
    let result;
    if(path==='/api/growth/v19/prospects/import')result=await importProspects(b.businesses||[],'OWNER_APPROVED_BATCH');
    else if(path.startsWith('/api/growth/v19/audit/'))result=await auditProspect(decodeURIComponent(path.slice('/api/growth/v19/audit/'.length)));
    else if(path.startsWith('/api/growth/v19/prepare/'))result=await prepareSales(decodeURIComponent(path.slice('/api/growth/v19/prepare/'.length)),b.offer||'mini');
    else if(path==='/api/growth/v19/outreach/approve')result=await approveOutbox(b.messageIds||[],b.owner||'owner');
    else if(path==='/api/growth/v19/outreach/send')result=await sendApproved(10);
    else if(path==='/api/growth/v19/reply')result=await receiveReply(b);
    else if(path==='/api/growth/v19/fulfillment/qc')result=await markFulfilled(b);
    else if(path==='/api/growth/v19/customer-proof')result=await customerProof(b);
    else if(path==='/api/growth/v19/expense')result=await expense(b);
    else if(path==='/api/growth/v19/experiment')result=await queueExperiment(b);
    else if(path==='/api/growth/v19/content')result=await proposeContent(b);
    else if(path==='/api/growth/v19/run')result=await backgroundTick();
    else return json(404,{error:'unknown v19 route'});
    return json(200,{ok:true,result});
  }catch(e){return json(400,{error:String(e?.message||e)});}
}


const reflectiveSnapshot=async()=>introspect({v19:await growthV19State(),legacyLedger:await ledger(),dbHealth:await storeHealth()});
if(path==='/cognition'&&req.method==='GET'){
 const d=await reflectiveSnapshot(),f=d.finances,e=d.evidence;
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'});
 return res.end(shell('ULTRON Reflective Executive v20',
 '<nav><a href="/">ULTRON ONE</a><a href="/growth/v19">Growth OS</a><a href="/first-sale">First Sale</a></nav>'+
 '<h1>ULTRON Reflective Executive v20</h1><p>Self-monitoring machine-control system — not conscious, sentient, or self-aware in a human sense.</p>'+
 '<section><article><h2>Operating mode</h2><p>'+esc(d.operatingMode)+'</p></article>'+
 '<article><h2>Verified PayPal captures tracked by v20</h2><b>'+e.verifiedCaptureEvents+'</b></article>'+
 '<article><h2>Collected USD events</h2><b>$'+f.grossRevenueUsd.toFixed(2)+'</b></article>'+
 '<article><h2>Independent satisfied customers</h2><b>'+e.independentlySatisfied+'/3</b></article></section>'+
 '<h2>Executive allocation</h2><p>'+esc(d.decisions.allocation.explanation)+'</p>'+
 '<section>'+Object.entries(d.decisions.allocation.weights).map(([k,v])=>'<article><h3>'+esc(k)+'</h3><b>'+v+'%</b></article>').join('')+'</section>'+
 '<h2>Present blockers</h2><ul>'+d.decisions.blockers.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+
 '<h2>Implementation truth</h2><p>Capabilities are labeled active, evidence-gated, or provider-required in the private owner API. No real-money trading, unapproved outbound campaigns, transfers or autonomous spending.</p>'));
}
if(path==='/api/reflective/v20'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});
 return json(200,{ok:true,reflection:await reflectiveSnapshot()});
}
if(path==='/api/reflective/v20/queue'&&req.method==='GET'){
 if(!v13Owner())return json(403,{error:'owner authorization required'});
 const s=await operatingState();return json(200,{ok:true,emergency:s.emergency,events:s.eventOrder.slice(-100).map(id=>s.businessEvents[id]),
 jobs:Object.values(s.jobs).slice(-100),opportunities:Object.values(s.opportunities).slice(-100),
 orders:Object.values(s.orders).slice(-50),unapprovedSpendUsd:0});
}
if(path.startsWith('/api/reflective/v20/')&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>130000)return json(413,{error:'payload too large'});}
 let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'});}
 try{
  let result;const action=path.slice('/api/reflective/v20/'.length);
  if(action==='reflect'){const d=await reflectiveSnapshot();result=await rememberReflection(d);}
  else if(action==='run-safe-jobs')result=await runSafeJobs(10);
  else if(action==='buyer-intent')result=await registerPublicOpportunities(b.opportunities||[]);
  else if(action==='event')result=await registerBusinessEvent(b);
  else if(action==='stop')result=await emergencyStop({...b,owner:'Authenticated ULTRON owner'});
  else if(action==='quality')result=await recordQualityEvidence(b);
  else if(action==='cost')result=await addRealCost(b);
  else if(action==='satisfaction')result=await recordCustomerSatisfaction(b);
  else if(action==='budget')result=await authorizeBudget({...b,owner:'Authenticated ULTRON owner'});
  else if(action==='campaign')result=await approveCampaignEnvelope({...b,owner:'Authenticated ULTRON owner'});
  else if(action==='suppress')result=await suppressContact(b);
  else if(action==='experiment')result=await registerV20Experiment({...b,owner:'Authenticated ULTRON owner'});
  else if(action==='partner')result=await recordPartner(b);
  else return json(404,{error:'unknown protected v20 operation'});
  return json(200,{ok:true,result});
 }catch(e){return json(400,{ok:false,error:String(e?.message||e)});}
}


if(path==='/integrations'&&req.method==='GET'){
 const d=await integrationSummary();
 const entries=Object.entries(d.readiness).filter(([,x])=>x&&typeof x==='object'&&'status'in x);
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON External Integration Readiness','<nav><a href="/">ULTRON ONE</a><a href="/growth/v19">Growth v19</a><a href="/cognition">Reflective OS</a></nav>'+
 '<h1>External Integration Readiness v21</h1><p>This report separates installed software, configured credentials and provider-verified connectivity.</p>'+
 '<section>'+entries.map(([name,d])=>'<article><h2>'+esc(name)+'</h2><p>'+esc(d.status)+'</p></article>').join('')+'</section>'+
 '<h2>Next required verifications</h2><ul>'+d.requirements.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+
 '<p>No automated purchase, trading, transfers or unauthorized communication will be attempted.</p>'));
}
if(path==='/api/integrations/v21'&&req.method==='GET'){
 if(!v13Owner())return json(403,{error:'owner authorization required'});
 return json(200,{ok:true,result:await integrationSummary()});
}
if(path.startsWith('/api/integrations/v21/')&&req.method==='POST'){
 if(!v13Owner())return json(403,{error:'owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>20000)return json(413,{error:'payload too large'});}
 let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'});}
 try{
  let result;
  if(path==='/api/integrations/v21/domain')result=await dnsAudit(b.domain);
  else if(path==='/api/integrations/v21/freebusy')result=await freeBusy(b);
  else if(path==='/api/integrations/v21/booking')result=await integrationBook(b);
  else if(path==='/api/integrations/v21/crm')result=await syncApprovedContact(b);
  else return json(404,{error:'unknown v21 operation'});
  return json(200,{ok:true,result});
 }catch(e){return json(400,{ok:false,error:String(e?.message||e)});}
}

if(path==='/v13'&&req.method==='GET'){const d=await v13Dashboard();res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(shell('ULTRON v13 Control Plane','<nav><a href="/">← ULTRON ONE</a><a href="/api/v13">JSON</a></nav><h1>ULTRON v13 Control Plane</h1><div class="terminal">'+esc(JSON.stringify(d,null,2))+'</div>'))}
if(path==='/api/v13'&&req.method==='GET')return json(200,{ok:true,...await v13Dashboard()});
if(path==='/api/commercial'&&req.method==='GET')return json(200,{ok:true,...await commercialDashboard()});
if(path==='/api/commercial/catalog'&&req.method==='GET')return json(200,{ok:true,...await commercialCatalog()});


if(path==='/api/first-sale/v16'&&req.method==='GET'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});return json(200,{ok:true,dashboard:await firstSaleV16Dashboard(),ceoQueue:await firstSaleCeoQueue(),readiness:await firstSaleCommercialReadiness()})}
if(path==='/api/first-sale/v16/approve-batch'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;try{const b=JSON.parse(raw||'{}');return json(201,{ok:true,approval:await firstSaleApproveBatch(b.prospectIds||[],b.owner||'owner'),sent:false,note:'Approval recorded; actual sending requires connected campaign adapter.'})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(/^\/api\/first-sale\/v16\/demo\/[^/]+$/.test(path)&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});try{return json(201,{ok:true,demo:await firstSaleDemoFor(decodeURIComponent(path.split('/')[5]))})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(/^\/demo\/[^/]+$/.test(path)&&req.method==='GET'){try{const id=decodeURIComponent(path.split('/')[2]),d=await firstSaleDemoFor(id);res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(shell('Private Demo','<nav><a href="/first-sale">ULTRON First Sale</a></nav><h1>PRIVATE CONVERSION DEMONSTRATION</h1><p><span class="status">DEMO — NOT CUSTOMER RESULTS</span></p><h2>'+esc(d.before.problem)+'</h2><p>Proposed recovery flow: '+d.after.flow.map(esc).join(' → ')+'</p><p><a href="/free-response-gap-scan">Run free diagnostic</a> · <a href="'+FIRST_SALE_OFFERS.mini.checkout+'">Get $99 Mini Audit</a></p>'))}catch(e){return json(404,{ok:false,error:String(e?.message||e)})}}
if(/^\/api\/first-sale\/v16\/proposal\/[^/]+$/.test(path)&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{};try{return json(201,{ok:true,proposal:await firstSaleProposalFor(decodeURIComponent(path.split('/')[5]),b.offer||'mini')})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/first-sale/v16/meeting'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;try{return json(201,{ok:true,meeting:await firstSaleMeetingRequest(JSON.parse(raw||'{}'))})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(/^\/api\/first-sale\/v16\/followup\/[^/]+$/.test(path)&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;try{const b=JSON.parse(raw||'{}');return json(201,{ok:true,followup:await firstSaleFollowupSignal(decodeURIComponent(path.split('/')[5]),b.signal)})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/first-sale/v16/case-study'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;try{return json(201,{ok:true,caseStudy:await firstSaleCaseStudy(JSON.parse(raw||'{}'))})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/first-sale/v16/referral'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;try{return json(201,{ok:true,referral:await firstSaleReferral(JSON.parse(raw||'{}'))})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/first-sale/v16/payment-failure'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;try{return json(201,{ok:true,recovery:await firstSalePaymentFailure(JSON.parse(raw||'{}'))})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/first-sale/v16/reconciliation-alert'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;try{return json(201,{ok:true,alert:await firstSaleReconciliationAlert(JSON.parse(raw||'{}'))})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/houston-auto-detailing-lead-recovery'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'});return res.end(shell('Houston Detailing Lead Recovery','<nav><a href="/first-sale">ULTRON</a></nav><h1>Houston Auto Detailing Lead-Recovery System</h1><p>Find where missed calls, slow responses, quote abandonment and booking friction may be costing appointments.</p><section><article><h2>Free</h2><p>Response Gap Diagnostic</p><a href="/free-response-gap-scan">Run diagnostic</a></article><article><h2>$99</h2><p>Missed Lead Recovery Mini Audit</p><a href="'+FIRST_SALE_OFFERS.mini.checkout+'">Get audit</a></article><article><h2>$500</h2><p>AI Revenue Leak Audit</p><a href="'+FIRST_SALE_OFFERS.audit.checkout+'">Get full audit</a></article><article><h2>$2,500</h2><p>Implementation</p><a href="'+FIRST_SALE_OFFERS.implementation.checkout+'">Start implementation</a></article></section><p>Monthly optimization: $1,500/month after fit and scope are confirmed.</p>'))}
if(path==='/proof'&&req.method==='GET'){const d=await firstSaleV16Dashboard();res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(shell('ULTRON Proof','<h1>Proof & Evidence</h1><p><span class="status">VERIFIED RESULTS ARE KEPT SEPARATE FROM DEMOS</span></p><h2>Verified customer results</h2><p>'+esc(d.proof.verifiedResults.length?d.proof.verifiedResults.join(', '):'No permissioned verified case studies published yet.')+'</p><h2>Demonstrations</h2><p>'+esc(d.proof.demos)+'</p><h2>Simulations</h2><p>'+esc(d.proof.simulations)+'</p>'))}
if(path==='/first-sale'&&req.method==='GET'){await recordVisit();const d=await firstSaleDashboard(),s=await firstSaleScore();res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(shell('ULTRON First Sale','<nav><a href="/">← ULTRON</a><a href="/free-response-gap-scan">Free Diagnostic</a><a href="/buy?product=ai-revenue-audit-500">Buy $500 Audit</a></nav><h1>FIRST-SALE MODE</h1><p><span class="status">ACQUIRE → DIAGNOSE → DEMONSTRATE → PAYPAL → FULFILL</span></p><section><article><small>Priority</small><h2>First unrelated external verified customer</h2></article><article><small>Offer</small><b>$500</b><p>AI Revenue Leak Audit</p></article><article><small>Researched prospects</small><div class="metric">'+esc(d.prospects.length)+'</div></article><article><small>Readiness</small><div class="metric">'+esc(s.score)+'/100</div></article></section><h2>Free diagnostic</h2><p>Use the existing response-gap diagnostic to turn real business interest into a qualified lead, then route the qualified buyer to the fixed-price PayPal audit.</p><p><a href="/free-response-gap-scan">Run the free diagnostic</a> · <a href="/buy?product=ai-revenue-audit-500">Buy securely with PayPal</a></p>'))}
if(path==='/api/first-sale'&&req.method==='GET'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});return json(200,{ok:true,dashboard:await firstSaleDashboard(),score:await firstSaleScore()})}
if(path==='/api/first-sale/diagnostic'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(201,{ok:true,diagnostic:await runFreeDiagnostic(b),checkout:'/buy?product=ai-revenue-audit-500'})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/first-sale/checkout-click'&&req.method==='POST')return json(200,{ok:true,stats:await recordCheckoutClick()});
if(path==='/api/first-sale/campaigns/prepare-all'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});return json(201,{ok:true,campaigns:await prepareAllCampaigns(),sent:false,approvalRequired:true})}
if(/^\/api\/first-sale\/campaign\/[^/]+\/prepare$/.test(path)&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});try{return json(201,{ok:true,campaign:await prepareProspectCampaign(decodeURIComponent(path.split('/')[4])),sent:false,approvalRequired:true})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/os/v14'&&req.method==='GET')return json(200,{ok:true,...await osDashboard()});
if(path==='/api/os/v14/executive'&&req.method==='GET')return json(200,{ok:true,metrics:await executiveMetrics(),unitEconomics:await commercialUnitEconomics(),forecast:await forecast(),northStar:await northStar()});
if(path==='/api/os/v14/lender'&&req.method==='GET')return json(200,{ok:true,dataRoom:await dataRoomManifest(),businessCredit:await businessCreditReadiness(),package:await lenderPackage()});
if(path==='/api/os/v14/retention'&&req.method==='GET')return json(200,{ok:true,candidates:await retentionCandidates()});
async function v14body(){let raw='';for await(const ch of req)raw+=ch;try{return JSON.parse(raw||'{}')}catch{throw Error('invalid JSON')}}
if(path==='/api/os/v14/lead'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});try{return json(201,{ok:true,result:await ingestLead(await v14body())})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(/^\/api\/os\/v14\/lead\/[^/]+\/stage$/.test(path)&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});try{const b=await v14body();return json(200,{ok:true,lead:await advanceLead(decodeURIComponent(path.split('/')[5]),b.stage,b.evidence||{})})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
for(const [route,fn,label] of [['/api/os/v14/diagnostic',createDiagnostic,'diagnostic'],['/api/os/v14/demo',createDemo,'demo'],['/api/os/v14/proposal',createProposal,'proposal'],['/api/os/v14/fulfillment',enqueuePaidFulfillment,'fulfillment'],['/api/os/v14/qc',recordQc,'qc'],['/api/os/v14/referral',createReferral,'referral'],['/api/os/v14/traffic',recordTraffic,'traffic'],['/api/os/v14/revenue-attribution',attributeRevenue,'attribution'],['/api/os/v14/expense',recordExpense,'expense'],['/api/os/v14/ticket',openTicket,'ticket'],['/api/os/v14/knowledge',addKnowledge,'knowledge']]){if(path===route&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});try{return json(201,{ok:true,[label]:await fn(await v14body())})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}}

if(path==='/api/v13/paper'&&req.method==='GET')return json(200,{ok:true,paper:await paperTradingState()});
if(path==='/api/v13/paper/order'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(201,{ok:true,mode:'SIMULATED_ONLY',result:await executePaperOrder(b)})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/v13/paper/mark'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,mode:'SIMULATED_ONLY',metrics:await markPaperPrices(b)})}
if(path==='/api/v13/prospects'&&req.method==='GET')return json(200,{ok:true,prospects:await listProspects()});
if(path==='/api/v13/prospects'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(201,{ok:true,prospect:await upsertProspect(b)})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/v13/audit'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(201,{ok:true,audit:await createWebsiteAudit(b)})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/v13/revenue-command'&&req.method==='GET')return json(200,{ok:true,command:await commandCenter()});
if(path==='/api/v13/offers'&&req.method==='GET')return json(200,{ok:true,offers:await offerCatalog()});
if(path==='/api/v13/subscription-candidate'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(201,{ok:true,candidate:await createSubscriptionCandidate(b)})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/v13/customer'&&req.method==='GET'){const p=await customerPortal(u.searchParams.get('token')||'');return p?json(200,{ok:true,portal:p}):json(404,{ok:false,error:'customer portal not found'})}
if(path==='/api/v13/reconciliation'&&req.method==='GET')return json(200,{ok:true,rows:await revenueReconciliation()});
if(path==='/api/v13/unit-economics'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:await costProfitIntelligence(b)})}
if(path==='/api/v13/experiment'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(201,{ok:true,experiment:await createExperiment(b)})}
if(/^\/api\/v13\/experiment\/[^/]+\/result$/.test(path)&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(200,{ok:true,experiment:await recordExperimentResult(decodeURIComponent(path.split('/')[4]),b)})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/v13/approval'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(201,{ok:true,approval:await requestApproval(b.action,b.detail||{})})}
if(/^\/api\/v13\/approval\/[^/]+\/decision$/.test(path)&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(200,{ok:true,approval:await decideV13Approval(decodeURIComponent(path.split('/')[4]),b.decision,b.note||'')})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/v13/ceo'&&req.method==='GET')return json(200,{ok:true,objective:await ceoObjectiveEngine()});
if(path==='/api/v13/lender'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,dashboard:await lenderDashboard(b)})}
if(path==='/api/v13/projections'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,model:projections(b)})}
if(path==='/api/v13/sports-commercial'&&req.method==='GET')return json(200,{ok:true,sports:sportsCommercialStatus()});
if(path==='/api/v13/ops'&&req.method==='GET')return json(200,{ok:true,ops:securityAndOpsManifest()});

if(path==='/manifest.webmanifest'){res.writeHead(200,{'content-type':'application/manifest+json','cache-control':'public,max-age=3600'});return res.end(JSON.stringify({name:'ULTRON ONE',short_name:'ULTRON',description:'Unified ULTRON command center',start_url:'/',scope:'/',display:'standalone',background_color:'#010503',theme_color:'#020806',icons:[{src:'/ultron-one-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]}))}
if(path==='/ultron-one-icon.svg'){res.writeHead(200,{'content-type':'image/svg+xml','cache-control':'public,max-age=86400'});return res.end(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><radialGradient id="g"><stop stop-color="#06351f"/><stop offset="1" stop-color="#010503"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="12" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="1024" height="1024" rx="210" fill="url(#g)"/><rect x="42" y="42" width="940" height="940" rx="180" fill="none" stroke="#35ff9a" stroke-width="18"/><g fill="none" stroke="#35ff9a" opacity=".35"><circle cx="512" cy="440" r="300"/><circle cx="512" cy="440" r="225"/><path d="M512 120V760M192 440H832M285 213L739 667M739 213L285 667"/></g><g filter="url(#glow)"><path d="M330 260v300c0 155 364 155 364 0V260h-92v292c0 74-180 74-180 0V260z" fill="#06140d" stroke="#eafff2" stroke-width="34"/><path d="M374 278v274c0 114 276 114 276 0V278" fill="none" stroke="#35ff9a" stroke-width="22"/></g><g fill="#35ff9a"><circle cx="512" cy="124" r="20"/><circle cx="806" cy="300" r="20"/><circle cx="806" cy="620" r="20"/><circle cx="218" cy="300" r="20"/><circle cx="218" cy="620" r="20"/></g><text x="512" y="825" text-anchor="middle" font-family="Arial,sans-serif" font-size="104" font-weight="900" fill="#fff">ULTRON</text><text x="512" y="902" text-anchor="middle" font-family="Arial,sans-serif" font-size="58" font-weight="700" letter-spacing="24" fill="#35ff9a">ONE</text></svg>`)}
if(path==='/customer-acquisition'||path==='/api/customer-acquisition'){const a=await acquisitionV11State(),m=acquisitionV11Manifest();if(path.startsWith('/api/'))return json(200,{ok:true,manifest:m,state:{controller:a.controller,truth:a.truth,dependencyHealth:a.dependencyHealth,experimentGate:a.experimentGate,prospects:a.prospects.length,qualified:a.prospects.filter(x=>x.scoring?.qualified).length,evidenceReady:a.prospects.filter(x=>x.evidence?.length).length,outreach:a.outreach.length,conversations:a.conversations.length},prospects:a.prospects.slice(0,100)});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Customer Acquisition',`<nav><a href="/">← ULTRON ONE</a><a href="/hvac-revenue-leak-audit">$500 HVAC Audit</a><a href="/api/customer-acquisition">API</a></nav><h1>ULTRON 11 // CUSTOMER ACQUISITION ENGINE</h1><p><span class="status">REAL PROSPECTS → EVIDENCE → INTENT → DIAGNOSTIC → CONVERSATION → PAYPAL → OUTCOME → PROOF → REPEAT</span></p><section><article><small>Public prospects seeded</small><div class="metric">${a.prospects.length}</div></article><article><small>Target</small><div class="metric">100</div></article><article><small>Evidence-ready target</small><div class="metric">20</div></article><article><small>Verified revenue</small><div class="metric">$ ${Number(a.truth?.verifiedRevenueUsd||0).toFixed(2)}</div></article></section><h2>Controller</h2><div class="terminal">${esc(JSON.stringify(a.controller||{},null,2))}</div><h2>Dependency truth</h2><div class="terminal">${esc(JSON.stringify(a.dependencyHealth||{},null,2))}</div><h2>Trust packet</h2><div class="terminal">${esc(JSON.stringify(trustPacket(),null,2))}</div><h2>Prospect graph</h2><section>${a.prospects.slice(0,100).map(p=>`<article><small>${esc(p.stage)} · ${esc(p.location)}</small><h2>${esc(p.businessName)}</h2><p>${esc(p.website)}</p><p>Source: ${esc(p.source)}</p></article>`).join('')}</section>`))}
if(path==='/api/v11/prospect-score'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:scoreProspectV11(b)})}
if(path==='/api/v11/intent-signals'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:intentSignals(b)})}
if(path==='/api/v11/outreach-draft'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:outreachDraftV11(b)})}
if(path==='/api/v11/trust')return json(200,{ok:true,result:trustPacket()});
if(path==='/hvac-revenue-leak-audit'){const h=await hvacState();res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('HVAC AI Revenue Leak Audit',`<nav><a href="/">← ULTRON ONE</a><a href="/hvac-lead-loss-calculator">Free HVAC Diagnostic</a><a href="/revenue-mainframe">Revenue Mainframe</a></nav><h1>HVAC AI Revenue Leak Audit</h1><p><span class="status">$500 · FLAGSHIP OFFER · 7-DAY FOCUS</span></p><p>ULTRON reviews publicly observable and customer-provided evidence around lead response, booking, mobile conversion, calls to action, forms and follow-up. We do not invent lost-revenue claims.</p><section><article><h2>What we check</h2><p>Lead-response path · booking friction · mobile conversion · CTA clarity · form friction · follow-up gaps.</p></article><article><h2>What you receive</h2><p>Evidence-backed findings, prioritized fixes, implementation map, measurement plan and next-step recommendation.</p></article><article><h2>Sample output</h2><p>Observed issue → evidence → operational impact scenario → recommended fix → measurement method.</p></article><article><h2>Price</h2><div class="metric">$500</div><p><a href="/buy?product=ai-revenue-audit-500">Buy securely with PayPal</a></p></article></section><h2>FAQ / trust</h2><div class="terminal">No guaranteed revenue claims. Findings are limited to available evidence.\nNo proof or case study is published without permission.\nPayment must be verified before fulfillment.\nCustomer outcome is measured separately from delivery.\nCurrent focus: HVAC only until the flagship learning window completes.</div><h2>Current operating state</h2><div class="terminal">${esc(JSON.stringify({lockUntil:h.flagshipLockUntil,publisher:h.publisher,messaging:h.messaging,prospectFeed:h.prospectFeed},null,2))}</div>`))}
if(path==='/hvac-lead-loss-calculator'){res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('HVAC Lead Loss Calculator',`<nav><a href="/hvac-revenue-leak-audit">← $500 Audit</a></nav><h1>How many HVAC leads could be slipping through?</h1><p>Enter your own operating assumptions. Results are scenarios, not guaranteed lost revenue.</p><form id="d"><input name="monthlyLeads" type="number" min="0" placeholder="Monthly leads" required><input name="responseRate" type="number" min="0" max="100" placeholder="Response rate %" required><input name="closeRate" type="number" min="0" max="100" placeholder="Close rate %" required><input name="averageJobValue" type="number" min="0" placeholder="Average job value $" required><button>Calculate</button></form><div id="r" class="terminal">Your scenario will appear here.</div><script>document.getElementById('d').onsubmit=async e=>{e.preventDefault();const b=Object.fromEntries(new FormData(e.target));const r=await fetch('/api/v10/hvac-diagnostic',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)});const j=await r.json();document.getElementById('r').textContent=JSON.stringify(j.result,null,2)}</script>`))}
if(path==='/api/v10/hvac-diagnostic'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:hvacDiagnostic(b)})}
if(path==='/api/v10/prospect-score'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:visibleProblemScore(b)})}
if(path==='/api/v10/mini-audit'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:miniAudit(b)})}
if(path==='/api/v10/fulfillment-plan'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:fulfillmentPlan(b)})}
if(path==='/api/v10/outcome-decision'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:outcomeDecision(b)})}
if(path==='/api/v10/hvac-flagship'){const h=await hvacState();return json(200,{ok:true,manifest:hvacManifest(),state:h})}
if(path==='/revenue-mainframe'||path==='/api/revenue-mainframe'){const m=v9Manifest(),s=await mainframeState(),l=await ledger(),orders=Object.values(l?.orders||{}),paid=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),rev=paid.reduce((z,x)=>z+Number(x?.capturedAmount||x?.amount||0),0),cp=contributionProfit({captured:rev,refunds:Number(s.costs?.refunds||0),fulfillment:Number(s.costs?.fulfillment||0),compute:Number(s.costs?.compute||0),support:Number(s.costs?.support||0),acquisition:Number(s.costs?.acquisition||0),operations:Number(s.costs?.operations||0)});if(path.startsWith('/api/'))return json(200,{ok:true,manifest:m,state:{metrics:s.metrics,controller:s.controller,events:s.events.length,prospects:s.prospects.length,audits:s.audits.length,proposals:s.proposals.length,products:s.products.length,businesses:s.businesses.length},truth:{verifiedRevenueUsd:+rev.toFixed(2),completedOrders:paid.length,contribution:cp},niches:['hvac','roofing','plumbing','med-spa','auto-services','home-services','realtors','restaurants'].map(nicheOffers)});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});const ladder=m.revenueLadder.map(x=>'$'+x.price+' '+x.name).join(' → ');return res.end(shell('ULTRON 9 Revenue Mainframe',`<nav><a href="/">← ULTRON ONE</a><a href="/revenue-organism">Revenue Organism</a><a href="/company-os">Company OS</a><a href="/api/revenue-mainframe">API</a></nav><h1>ULTRON 9.0 // REVENUE MAINFRAME</h1><p><span class="status">RESEARCH → DIAGNOSTIC → OFFER → PAYPAL → FULFILLMENT → OUTCOME → RETENTION → REFERRAL → REPEAT</span></p><section><article><small>Systems</small><div class="metric">${m.systems.length}</div></article><article><small>Verified revenue</small><div class="metric">$ ${rev.toFixed(2)}</div></article><article><small>Completed orders</small><div class="metric">${paid.length}</div></article><article><small>Current bottleneck</small><h2>${esc(s.controller?.bottleneck||'QUALIFIED_DEMAND')}</h2></article></section><h2>Fastest revenue ladder</h2><div class="terminal">${esc(ladder)}</div><h2>Closed loop</h2><div class="terminal">${esc(m.fastestLoop.join(' → '))}</div><h2>Controller</h2><div class="terminal">${esc(JSON.stringify(s.controller,null,2))}</div><h2>60 integrated systems</h2><section>${m.systems.map(x=>`<article><small>${x.index} · ${x.status}</small><h2>${esc(x.name)}</h2></article>`).join('')}</section>`))}
if(path==='/api/v9/prospect-score'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:prospectScore(b)})}
if(path==='/api/v9/audit-blueprint'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:auditBlueprint(b)})}
if(path==='/api/v9/funnel-decision'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,result:funnelDecision(b)})}
if(path==='/financial-system'||path==='/api/financial-system'){const l=await ledger(),orders=Object.values(l?.orders||{}),paid=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),rev=paid.reduce((z,x)=>z+Number(x?.capturedAmount||x?.amount||0),0),position=capitalPosition({capturedRevenue:rev}),food=financialFoodChain(),macro={...creditCycleContext({}),phase:'NO_CURRENT_EVIDENCE',note:'No live macro/credit source is asserted unless connected.'};if(path.startsWith('/api/'))return json(200,{ok:true,layers:FINANCIAL_SYSTEM_LAYERS,capital:position,macro,foodChain:food});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Financial System',`<nav><a href="/">← ULTRON ONE</a><a href="/revenue-organism">Revenue Organism</a><a href="/api/financial-system">API</a></nav><h1>ULTRON // FINANCIAL SYSTEM INTELLIGENCE</h1><p><span class="status">CUSTOMER VALUE → CASH TRUTH → RESERVES → REINVESTMENT → DURABLE ASSETS → REPEAT</span></p><section>${FINANCIAL_SYSTEM_LAYERS.map(x=>`<article><h2>${esc(x.name)}</h2><p>${esc(x.role)}</p></article>`).join('')}</section><h2>Economic position</h2><div class="terminal">${esc(food.positioning)}\n\n${food.cycle.join(' → ')}\n\nBOUNDARY: ${esc(food.boundary)}</div><h2>Current verified capital view</h2><div class="terminal">${esc(JSON.stringify(position,null,2))}</div><h2>Macro / credit context</h2><div class="terminal">${esc(JSON.stringify(macro,null,2))}</div>`))}
if(path==='/api/v8/compile-opportunity'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,compiled:compileOpportunity(b)})}
if(path==='/revenue-organism'||path==='/api/revenue-organism'){const m=v8Manifest(),s=await v8State(),l=await ledger(),orders=Object.values(l?.orders||{}),paid=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),rev=paid.reduce((z,x)=>z+Number(x?.capturedAmount||x?.amount||0),0),fly=s.flywheels?.[0]||flywheelScore({demandCreation:20,acquisition:20,conversion:paid.length?50:15,fulfillment:paid.length?70:20,customerOutcome:paid.length?40:10,retention:10,referral:10,margin:50,reinvestment:20,learning:60}),site=websiteFactory({name:'Validated Opportunity Example',slug:'validated-opportunity',validated:false,validationScore:0}),product=productFactory({name:'Example problem',severity:0,evidence:[]}),demand=demandFactory({validatedProduct:false}),money=s.moneyCycle?.regime? s.moneyCycle : {...moneyCycleIntelligence({}),regime:'NO_CURRENT_EVIDENCE'};if(path.startsWith('/api/'))return json(200,{ok:true,manifest:m,state:{sites:s.sites.length,products:s.products.length,businesses:s.businesses.length,flywheels:s.flywheels.length},truth:{verifiedRevenueUsd:+rev.toFixed(2),completedOrders:paid.length},flywheel:fly,moneyCycle:money,examples:{site,product,demand}});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON 8 Revenue Organism',`<nav><a href="/">← ULTRON ONE</a><a href="/company-os">Company OS</a><a href="/strategic-edge">Strategic Edge</a><a href="/api/revenue-organism">API</a></nav><h1>ULTRON 8.0 // AUTONOMOUS REVENUE FLYWHEEL</h1><p><span class="status">PROBLEM → PRODUCT → WEBSITE → DEMAND → PAYPAL → FULFILLMENT → OUTCOME → REINVEST → REPEAT</span></p><section><article><small>Systems</small><div class="metric">${m.systems.length}</div></article><article><small>Verified revenue</small><div class="metric">$ ${rev.toFixed(2)}</div></article><article><small>Completed orders</small><div class="metric">${paid.length}</div></article><article><small>Flywheel score</small><div class="metric">${fly.score}</div></article><article><small>Weakest stage</small><h2>${esc(fly.weakest?.stage||'NO EVIDENCE')}</h2></article><article><small>Money-cycle regime</small><h2>${esc(money.regime||'NO_CURRENT_EVIDENCE')}</h2></article></section><h2>Top objective</h2><div class="terminal">${esc(m.objective)}</div><h2>Closed-loop architecture</h2><div class="terminal">${m.architecture.join(' → ')}</div><h2>100 systems</h2><section>${m.systems.map(x=>`<article><small>${x.index} · ${x.status}</small><h2>${esc(x.name)}</h2></article>`).join('')}</section>`))}
if(path==='/strategic-edge'||path==='/api/strategic-edge'){const m=v7Manifest(),s=await v7State();if(path.startsWith('/api/'))return json(200,{ok:true,manifest:m,state:{worldState:s.world,attentionQueue:s.attention.length,forecasts:s.forecasts.length,metricLineage:s.metricLineage.length,proprietaryIntelligence:s.proprietaryIntelligence.length}});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON 7 Strategic Edge',`<nav><a href="/">← ULTRON ONE</a><a href="/company-os">Company OS</a><a href="/discovery-economy">Discovery Economy</a><a href="/api/strategic-edge">API</a></nav><h1>ULTRON 7.0 // STRATEGIC EDGE</h1><section><article><small>Systems</small><div class="metric">${m.systems.length}</div></article><article><small>World-state domains</small><div class="metric">9</div></article><article><small>Proprietary intelligence records</small><div class="metric">${s.proprietaryIntelligence.length}</div></article></section><h2>Strategic Attention</h2><div class="terminal">${esc(m.strategicAttention)}</div><h2>Intelligence Factory</h2><div class="terminal">${m.intelligenceFactory.join(' → ')}</div><h2>Architecture</h2><div class="terminal">${m.architecture.join(' → ')}</div><h2>Capability Map</h2><section>${m.systems.map(x=>`<article><small>${x.index} · ${x.status}</small><h2>${esc(x.name)}</h2></article>`).join('')}</section>`))}
if(path==='/discovery-economy'||path==='/api/discovery-economy'){const m=v6Manifest(),s=await v6State();if(path.startsWith('/api/'))return json(200,{ok:true,manifest:m,state:{proposals:s.discoveryEconomy.proposals.length,snapshots:s.timeMachine.snapshots.length,goalGenomes:s.goalGenomes.length,assumptions:s.assumptions.length,prototypes:s.prototypes.active.length,graveyard:s.prototypes.graveyard.length},examples:{problemSeverity:problemSeverity({frequency:50,financialImpact:50,urgency:50,willingnessToSolve:50,solutionDissatisfaction:50}),antiDelusion:antiDelusionCheck({activity:true,outcome:false})}});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON 6 Discovery Economy',`<nav><a href="/">← ULTRON ONE</a><a href="/company-os">Company OS</a><a href="/api/discovery-economy">API</a></nav><h1>ULTRON 6.0 // DISCOVERY ECONOMY</h1><p><span class="status">TRUTH → CAUSALITY → DISCOVERY → EXPERIMENT → REALITY → LEARNING</span></p><section><article><small>Systems</small><div class="metric">${m.systems.length}</div></article><article><small>Idea proposals</small><div class="metric">${s.discoveryEconomy.proposals.length}</div></article><article><small>Time snapshots</small><div class="metric">${s.timeMachine.snapshots.length}</div></article></section><h2>Architecture</h2><div class="terminal">${m.architecture.join(' → ')}</div><h2>Evidence ladder</h2><div class="terminal">${m.antiDelusion.evidenceLadder.join(' → ')}</div><h2>40 systems</h2><section>${m.systems.map(x=>`<article><small>${x.index} · ${x.status}</small><h2>${esc(x.name)}</h2></article>`).join('')}</section>`))}
if(path==='/company-os'||path==='/api/company-os'){const m=unifiedManifest(),s=await unifiedState(),l=await ledger(),ls=await leadSummary(),orders=Object.values(l?.orders||{}),paid=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),revenue=paid.reduce((z,x)=>z+Number(x?.capturedAmount||x?.amount||0),0),actions=economicDecision([{name:'improve-qualified-organic-acquisition',expectedContributionProfit:100,confidence:55,cost:0,risk:10,reversible:true},{name:'paid-acquisition-test',expectedContributionProfit:150,confidence:30,cost:50,risk:35,reversible:false}]);if(path.startsWith('/api/'))return json(200,{...m,state:{events:s.events.length,facts:s.facts.length,segments:s.segments.length,pipeline:s.pipeline.length,evaluations:s.evaluations.length,pendingApprovals:s.approvals.filter(x=>x.status==='pending').length,continuity:s.continuity,killSwitch:s.killSwitch},truth:{verifiedRevenueUsd:+revenue.toFixed(2),completedOrders:paid.length,leads:ls.total||0,qualifiedOpportunities:(ls.high||0)+(ls.medium||0)},economicAutopilot:actions,productGateExample:validateProduct({problemSeverity:70,buyerIntent:70,willingnessToPay:60,differentiation:65,fulfillmentAbility:90,margin:80,distributionPath:65})});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Company OS',`<nav><a href="/">← ULTRON ONE</a><a href="/growth-os">Growth OS</a><a href="/advantage-os">Advantage OS</a><a href="/company-os">Company OS</a><a href="/api/company-os">API</a></nav><h1>ULTRON COMPANY OS // UNIFIED ECONOMIC AUTOPILOT</h1><p><span class="status">MARKET LOOP + CUSTOMER LOOP + INTELLIGENCE LOOP</span></p><section><article><small>Verified revenue</small><div class="metric">${revenue.toFixed(2)}</div></article><article><small>Completed orders</small><div class="metric">${paid.length}</div></article><article><small>Leads</small><div class="metric">${ls.total||0}</div></article><article><small>Qualified opportunities</small><div class="metric">${(ls.high||0)+(ls.medium||0)}</div></article><article><small>Pending approvals</small><div class="metric">${s.approvals.filter(x=>x.status==='pending').length}</div></article><article><small>Continuity</small><div class="metric">${esc(s.continuity.mode)}</div></article></section><h2>Three unified loops</h2><section>${Object.entries(m.loops).map(([k,v])=>`<article><small>${esc(k)} LOOP</small><h2>${v.map(esc).join(' → ')}</h2></article>`).join('')}</section><h2>Economic Autopilot</h2><div class="terminal">ABOVE ALL LOOPS: ${esc(m.aboveLoops)}\nNORTH STAR: ${esc(m.northStar)}\nSAFE/REVERSIBLE WORK MAY EXECUTE WITHIN CONSTRAINTS. CONSEQUENTIAL ACTIONS ENTER APPROVAL.</div><h2>40 merged systems</h2><section>${m.systems.map(x=>`<article><small>${String(x.index).padStart(2,'0')} · ${x.status}</small><h2>${esc(x.name)}</h2><p>${esc(x.purpose)}</p></article>`).join('')}</section>`))}
if(path==='/advantage-os'||path==='/api/advantage-os'){const m=advantageManifest(),s=await advantageState(),l=await ledger(),ls=await leadSummary(),orders=Object.values(l?.orders||{}),paid=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),revenue=paid.reduce((z,x)=>z+Number(x?.capturedAmount||x?.amount||0),0),goal=decomposeGoal({revenueTarget:1000000,aov:500,leadToSale:.08,trafficToLead:.04,days:86}),sim=scenario({traffic:1000,conversion:.02,aov:500,cac:50,grossMargin:.8,refundRate:.03});if(path.startsWith('/api/'))return json(200,{...m,state:{demandSignals:s.demandSignals.length,creativePredictions:s.creativePredictions.length,tournaments:s.tournaments.length,utilities:s.utilities.length,partners:s.partners.length,failures:s.failures.length,predictions:s.predictions.length,decisions:s.decisionJournal.length,approvals:s.approvals.filter(x=>x.status==='pending').length},live:{leads:ls.total||0,qualifiedOpportunities:(ls.high||0)+(ls.medium||0),verifiedRevenueUsd:+revenue.toFixed(2),completedOrders:paid.length},goalExample:goal,scenarioExample:sim});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Advantage OS',`<nav><a href="/">← ULTRON ONE</a><a href="/growth-os">Growth OS</a><a href="/advantage-os">Advantage OS</a><a href="/acquisition-command">Acquisition</a><a href="/api/advantage-os">API</a></nav><h1>ULTRON ADVANTAGE OS // 40 SYSTEMS</h1><p><span class="status">DEMAND → ATTENTION → CONVERSION → RETENTION → LEARNING → SCALE</span></p><section><article><small>Demand signals</small><div class="metric">${s.demandSignals.length}</div></article><article><small>Creative predictions</small><div class="metric">${s.creativePredictions.length}</div></article><article><small>Active tournaments</small><div class="metric">${s.tournaments.length}</div></article><article><small>Free utilities</small><div class="metric">${s.utilities.length}</div></article><article><small>Partners</small><div class="metric">${s.partners.length}</div></article><article><small>Verified revenue</small><div class="metric">${revenue.toFixed(2)}</div></article></section><h2>Scale rule</h2><div class="terminal">${esc(m.rule)}</div><h2>Priority build stack</h2><div class="terminal">${m.priority.join(' → ')}</div><h2>40 operating systems</h2><section>${m.systems.map(x=>`<article><small>${String(x.index).padStart(2,'0')} · ${x.status}</small><h2>${esc(x.name)}</h2><p>${esc(x.purpose)}</p></article>`).join('')}</section><h2>Operating loop</h2><div class="terminal">${m.operatingLoop.join(' → ')}</div>`))}
if(path==='/growth-os'||path==='/api/growth-os'){const g=growthManifest(),s=await growthState(),l=await ledger(),ls=await leadSummary(),orders=Object.values(l?.orders||{}),paid=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),revenue=paid.reduce((z,x)=>z+Number(x?.capturedAmount||x?.amount||0),0),econ=unitEconomics({revenue,customers:paid.length,acquisitionCost:s.costs?.acquisition||0,cogs:s.costs?.cogs||0,refunds:s.costs?.refunds||0});if(path.startsWith('/api/'))return json(200,{...g,state:{experiments:s.experiments.length,attention:s.attention.length,customerProfiles:Object.keys(s.customers||{}).length},live:{qualifiedAttention:s.attention.filter?.(x=>x.qualified).length||0,leads:ls.total||0,qualifiedOpportunities:(ls.high||0)+(ls.medium||0),conversion:orders.length?paid.length/orders.length:0,verifiedRevenueUsd:+revenue.toFixed(2),grossProfitUsd:econ.grossProfit,cac:econ.cac,ltv:econ.ltv,cashAvailableUsd:+revenue.toFixed(2),systemHealth:'ONLINE'},economics:econ,simulationExample:simulate({traffic:1000,conversion:.02,aov:99,grossMargin:.8,refundRate:.03,cac:15})});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Growth OS',`<nav><a href="/">← ULTRON ONE</a><a href="/acquisition-command">Acquisition</a><a href="/growth-os">Growth OS</a><a href="/api/growth-os">API</a></nav><h1>ULTRON GROWTH OS // 20 SYSTEMS</h1><p><span class="status">SENSE → ATTENTION → INTENT → CONVERT → RETAIN → LEARN</span></p><section><article><small>Qualified attention</small><div class="metric">${s.attention.filter?.(x=>x.qualified).length||0}</div></article><article><small>Leads</small><div class="metric">${ls.total||0}</div></article><article><small>Qualified opportunities</small><div class="metric">${(ls.high||0)+(ls.medium||0)}</div></article><article><small>Verified revenue</small><div class="metric">${revenue.toFixed(2)}</div></article><article><small>CAC</small><div class="metric">${econ.cac.toFixed(2)}</div></article><article><small>LTV</small><div class="metric">${econ.ltv.toFixed(2)}</div></article></section><h2>Operating systems</h2><section>${g.systems.map((x,i)=>`<article><small>${String(i+1).padStart(2,'0')} · ${x.status}</small><h2>${esc(x.name)}</h2><p>${esc(x.purpose)}</p></article>`).join('')}</section><h2>Closed economic loop</h2><div class="terminal">${g.loop.join(' → ')}</div>`))}
if(path==='/acquisition-command'){const l=await ledger(),a=await agentState(),ls=await leadSummary(),orders=Object.values(l?.orders||{}),completed=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),rev=completed.reduce((s,x)=>s+Number(x?.capturedAmount||x?.amount||0),0),qualified=Number(ls.high||0)+Number(ls.medium||0),bottleneck=completed.length?'RETENTION + SCALE':orders.length?'CHECKOUT → PAYMENT':qualified?'QUALIFIED LEAD → OFFER':'TRAFFIC → QUALIFIED LEAD';res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Acquisition Command',`<nav><a href="/">← ULTRON ONE</a><a href="/free-response-gap-scan">Free Diagnostic</a><a href="/solutions/missed-lead-recovery">Flagship Offer</a><a href="/revenue-loop">Revenue Loop</a></nav><h1>ACQUISITION COMMAND</h1><p><span class="status">DISTRIBUTION BEFORE MORE CATALOG</span></p><section><article><small>Verified revenue</small><div class="metric">${rev.toFixed(2)}</div></article><article><small>Completed orders</small><div class="metric">${completed.length}</div></article><article><small>Captured leads</small><div class="metric">${ls.total||0}</div></article><article><small>Qualified leads</small><div class="metric">${qualified}</div></article><article><small>Agent cycles</small><div class="metric">${a?.metrics?.cycles||0}</div></article><article><small>Current bottleneck</small><h2>${esc(bottleneck)}</h2></article></section><h2>Revenue ladder</h2><section><article><h3>$99 · ENTRY</h3><p>Missed-Lead Recovery System</p></article><article><h3>$500 · DIAGNOSTIC</h3><p>AI Revenue Leak Audit</p></article><article><h3>$2,500 · IMPLEMENT</h3><p>AI Automation Sprint</p></article><article><h3>$7,500 · SCALE</h3><p>AI Revenue Operations Build</p></article><article><h3>$10,000 · PLATFORM</h3><p>AI Business OS Implementation</p></article></section><h2>Acquisition priority</h2><div class="terminal">01 OWNED SEO / NICHE LANDING PAGES\n02 FREE RESPONSE-GAP DIAGNOSTIC\n03 QUALIFIED BUSINESS CONVERSATIONS\n04 VERIFIED CHECKOUT + FULFILLMENT\n05 CASE-STUDY / REFERRAL LOOP\n\nRULE: scale only what produces measured buyer response and verified payment.</div>`))}
if(path==='/lead-intake-pilot'&&req.method==='GET'){
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public,max-age=300'});
 return res.end(shell('ULTRON | Lead Intake Automation Pilot',`
 <nav><a href="/">ULTRON</a><a href="/free-response-gap-scan">Live Diagnostic</a><a href="/flagship">Professional Audit</a><a href="/support">Support</a></nav>
 <small>FIXED-SCOPE AUTOMATION · FIRST CUSTOMERS</small><h1>ONE LEAD SOURCE. ONE CRM. NO LOST FOLLOW-UPS.</h1>
 <p>ULTRON designs a narrow, reviewable workflow that captures inbound inquiries, logs them in a client-owned CRM, prepares a concise AI-assisted summary and reply draft, and queues a follow-up reminder. A human must approve outbound messages.</p>
 <section>
 <article><small>STEP 01</small><h2>Capture</h2><p>Connect one authorized website form or inbox to one CRM. Map source, contact fields and inquiry details.</p></article>
 <article><small>STEP 02</small><h2>Review before send</h2><p>Summarize requests, prepare response drafts, route exceptions to the owner. No unattended external messages.</p></article>
 <article><small>STEP 03</small><h2>Follow-up &amp; safeguards</h2><p>Create reminders, handle duplicates and missing fields, record integration errors and opt-outs.</p></article>
 <article><small>STEP 04</small><h2>Handoff</h2><p>Run owner-authorized acceptance tests, record results, document setup, and explain how to change the workflow.</p></article>
 </section>
 <h2>Start with a $200 scoped pilot</h2><p>Illustrative fixed-price pilot offer for one inbound source and one CRM, subject to the client's confirmed tools, access, feature limits and written scope. Any subscription or API costs are disclosed separately before commitment. Expanded integrations require a separate quote.</p>
 <p><a href="/free-response-gap-scan">Try ULTRON's operating public diagnostic</a> · <a href="/activation-center">View production authorization gates</a> · <a href="/support">Ask about delivery</a></p>
 <h2>Real production evidence, not a fabricated case study</h2><p>ULTRON has a deployed web diagnostic and owner-only request review flow. Those components demonstrate technical patterns, <strong>not</strong> a completed client-specific CRM integration, satisfied external client, or guaranteed sales lift. A new installation requires the client's permission, access, testing and acceptance.</p>
 <p><small>Do not submit passwords or sensitive information through this page. Project proposals and contract acceptance should remain on the client's designated hiring platform.</small></p>
 `));
}
if(path==='/'){res.writeHead(200,{'content-type':'text/html'});return res.end(shell('ULTRON ONE',`<nav><a href="/">ULTRON ONE</a><a href="/90-day-revenue">Revenue Recovery</a><a href="/growth-paths">Corporate AI + Media</a><a href="/14-day-audit">Completion Audit</a><a href="/flagship">Hire ULTRON</a><a href="/mission-control">Mission Control</a><a href="/sports">Sports JARVIS</a><a href="/acquisition-command">Acquisition</a><a href="/system-360">360</a><a href="/real-estate">Real Estate</a><a href="/revenue-100">Revenue</a><a href="/market">Market</a></nav><section><article><small>FOR SERVICE BUSINESSES · FREE FIRST STEP</small><h1>Find the gaps between a new inquiry and a booked customer</h1><p>Use the free Response Gap Scan to review your own lead response, follow-up and booking process. It is a self-reported starting point, not a measurement of lost sales.</p><p><a class="cta" href="/free-response-gap-scan">Run the free scan →</a> &nbsp; <a href="/audit-intake">Request the $500 Revenue Leak Audit →</a> &nbsp; <a href="/audit-terms">Scope and service terms</a></p><p>Paid audits provide a customer-specific workflow map, evidence-backed findings and prioritized next steps within five business days after complete intake and payment. No revenue or lead-generation results are guaranteed.</p></article></section><h2>More ULTRON services and operating tools</h2><section><article><h2>Instant $99 Lead Conversion Audit</h2><p>Submit business details and purchase a personalized digital report with customer-reported inputs clearly distinguished from publicly inspected homepage findings.</p><a href="/autonomous-audit">Get your $99 audit →</a></article><article><h2>Get a free response-gap scan</h2><p>See potential inquiry and booking problems in your business and request a voluntary follow-up.</p><a href="/free-response-gap-scan">Start free diagnostic →</a></article><article><h2>Get a $500 Revenue Leak Audit</h2><p>Review a scoped consulting offer. Results are not guaranteed.</p><a href="/flagship">View audit →</a></article><article><h2>Owner actions</h2><p>Review pending commerce approvals and provider readiness.</p><a href="/owner-actions">Open action center →</a></article></section><p><span class="status">ONE ICON · EIGHT SYSTEMS</span></p><section><article><small>01 · COMMAND</small><h2><a href="/system-360">360 Operating System</a></h2><p>Nucleus, cognition, memory, security, learning and governance.</p></article><article><small>02 · BUSINESS</small><h2><a href="/revenue-loop">Business Command</a></h2><p>Verified revenue, leads, commerce agents and business health.</p></article><article><small>03 · SPORTS</small><h2><a href="/sports">Sports JARVIS 2.0</a></h2><p>Projection analysis, MORE / LESS / PASS decisions, confidence, line movement and evidence-quality checks.</p></article><article><small>04 · MARKETS</small><h2><a href="https://ultron-trading-engine-production.up.railway.app/markets">Markets Research</a></h2><p>Stocks, ETFs, crypto and market research.</p></article><article><small>05 · CRYPTO</small><h2><a href="https://ultron-trading-engine-production.up.railway.app/dashboard">Crypto Intelligence</a></h2><p>Short-horizon research signals and approval-gated execution.</p></article><article><small>06 · REAL ESTATE</small><h2><a href="/real-estate">Real Estate Portfolio</a></h2><p>Deal intelligence, partner workflows and property operations.</p></article><article><small>07 · AI MARKET</small><h2><a href="/market">AI Market</a></h2><p>Products, checkout, fulfillment and commerce infrastructure.</p></article><article><small>08 · GROWTH</small><h2><a href="/revenue-100">100 Revenue Engines</a></h2><p>Revenue portfolio, founder patterns and opportunity experiments.</p></article></section><h2>Quick Controls</h2><nav><a href="/sports">Sports</a><a href="/nucleus">Nucleus</a><a href="/agent-of-agents">Agents</a><a href="/founder-patterns">Founder Patterns</a><a href="/capital-readiness">Capital</a><a href="/support">Support</a></nav>`))}

/* legacy-home-disabled
if(path==='/'){res.writeHead(200,{'content-type':'text/html'});return res.end(shell('ULTRON','<h1>ULTRON</h1><p><a href="/mainframe">AUTONOMOUS MAINFRAME V44</a> · <a href="/system-360">360 OS</a> · <a href="/real-estate">Real Estate OS</a> · <a href="/revenue-100">100 Revenue Engines</a> · <a href="/founder-patterns">Founder Patterns</a> · <a href="/free-response-gap-scan">Free Response-Gap Scan</a> · <a href="/market">Open AI Market</a> · <a href="/solutions/ai-implementation">AI implementation offers</a> · <a href="/solutions/revenue-frameworks">Revenue frameworks</a> · <a href="/revenue-loop">Revenue Loop</a> · <a href="/api/prospect-mission">1,000 Prospect Mission</a> · <a href="/api/security">20-Layer Security</a> · <a href="/agent-of-agents">Agent-of-Agents</a> · <a href="/capital-readiness">Institutional Power</a> · <a href="/everything">Everything Market</a> · <a href="/support">Support</a></p>'))}
*/

if(path==='/sports'){
 res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});
 return res.end(shell('Sports JARVIS 2.0',`<nav><a href="/">← ULTRON ONE</a><a href="/api/sports">Sports API</a></nav><h1>Sports JARVIS 2.1 LIVE</h1><nav><a href="/sports">All Sports</a><a href="/sports?sport=NBA">NBA</a><a href="/sports?sport=NFL">NFL</a><a href="/sports?sport=MLB">MLB</a><a href="/sports?sport=NHL">NHL</a><a href="/sports?sport=NCAAF">NCAAF</a><a href="/sports?sport=NCAAB">NCAAB</a></nav><section><article><small>LIVE BOARD</small><h2>Games · Players · Projections</h2><div id="live-board" class="terminal">Loading live sports feed…</div></article><article><small>EASIEST PICKS</small><h2>JARVIS Top 3</h2><div id="top-three" class="terminal">Waiting for verified comparison lines. JARVIS will not manufacture picks.</div></article></section><p><span class="status">EVIDENCE-FIRST · MORE / LESS / PASS</span></p><section><article><small>ANALYSIS CORE</small><h2>Projection Analyzer</h2><p>Uses recent results, projection line, sportsbook odds and line history. Missing or weak evidence returns PASS instead of fabricating certainty.</p><form id="sports-form"><input name="sport" required placeholder="Sport e.g. NBA"><br><br><input name="player" required placeholder="Player"><br><br><input name="stat" required placeholder="Stat e.g. Points"><br><br><input name="line" type="number" step="0.01" required placeholder="Projection line"><br><br><textarea name="recent" rows="4" placeholder="Recent results, comma-separated e.g. 24,31,28,19,35"></textarea><br><br><input name="sportsbookOdds" type="number" step="1" placeholder="Sportsbook over odds e.g. -115"><br><br><button>Analyze projection</button></form><div id="sports-result" class="terminal">Awaiting verified inputs.</div></article><article><small>MODEL COVERAGE</small><h2>NFL · NBA · WNBA · MLB · NHL · NCAAF · NCAAB · Soccer · Tennis · MMA · Golf · Esports</h2><p>Checks recent and season form, usage/minutes/opportunity, matchup, pace/game environment, injuries, starting status, rest/travel, market consensus, volatility, line movement and sport-specific context when those inputs are verified.</p><h3>Data policy</h3><p>Use current PrizePicks data only through permitted sources or user-provided snapshots. Never bypass authentication or private APIs.</p><p>Analysis only. Never submit a lineup, wager, deposit, withdraw, or transfer funds.</p></article></section><script>
document.getElementById('sports-form').addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.target),b=Object.fromEntries(fd.entries());b.line=Number(b.line);b.sportsbookOdds=b.sportsbookOdds===''?null:Number(b.sportsbookOdds);b.recent=String(b.recent||'').split(',').map(x=>Number(x.trim())).filter(Number.isFinite);const out=document.getElementById('sports-result');out.textContent='Analyzing…';const r=await fetch('/api/sports/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)});const d=await r.json();if(!r.ok){out.textContent=d.error||'Analysis failed';return}const x=d.analysis;out.textContent=[x.player+' · '+x.stat+' · line '+x.line,'DECISION: '+x.direction,'CONFIDENCE: '+x.confidence+'%','MODEL PROJECTION: '+(x.projection==null?'insufficient data':Number(x.projection).toFixed(2)),'EDGE: '+(x.edge==null?'insufficient data':(x.edge*100).toFixed(1)+' percentage points'),'SAMPLE: '+x.history.sample+' games','VERDICT: '+x.verdict,'','Required checks: '+x.requiredChecks.join(' | '),'Risks: '+x.risks.join(' | ')].join('\\n')});

async function liveBoard(){const sport=new URLSearchParams(location.search).get('sport')||'ALL';const r=await fetch('/api/sports/live?sport='+encodeURIComponent(sport));const d=await r.json();const board=document.getElementById('live-board'),top=document.getElementById('top-three');if(!r.ok){board.textContent=d.error||'Live feed unavailable';return}const games=(d.events||[]).slice(0,12).map(x=>x.sport+' · '+x.shortName+' · '+x.status).join('\\n');const players=(d.projections||[]).slice(0,12).map(x=>x.player+' · '+x.stat+' · '+x.modelProjection+' projected · '+x.direction+' · '+x.confidence+'%').join('\\n');board.textContent='UPDATED '+d.updatedAt+'\\n\\nGAMES\\n'+(games||'No current games returned.')+'\\n\\nPLAYER PROJECTIONS\\n'+(players||'No live player projections yet.');top.textContent=(d.top3||[]).length?d.top3.map((x,i)=>(i+1)+'. '+x.player+' '+x.direction+' '+x.stat+' '+x.line+' · '+x.confidence+'%').join('\\n'):'No verified Top 3 yet — current projection lines are required before MORE/LESS ranking.';}liveBoard();setInterval(liveBoard,30000);
</script>`,`<meta name="description" content="ULTRON Sports JARVIS 2.0 evidence-first sports projection analysis.">`))
}
if(path==='/api/sports/live'&&req.method==='GET'){try{const board=await buildLiveBoard({sport:u.searchParams.get('sport')||'ALL'});return json(200,board)}catch(e){return json(503,{ok:false,error:'live sports feed unavailable',detail:String(e?.message||e)})}}
if(path==='/api/sports/live/compare'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{const board=await buildLiveBoard({sport:b.sport||'ALL'});return json(200,mergePropLines(board,b.lines||[]))}catch(e){return json(503,{ok:false,error:'live sports comparison unavailable',detail:String(e?.message||e)})}}
if(path==='/api/sports'&&req.method==='GET')return json(200,{ok:true,name:'Sports JARVIS 2.0',version:SPORTS_JARVIS_VERSION,sports:SPORTS,persona:PERSONA,dataPolicy:DATA_POLICY,execution:'analysis-only'});
if(path==='/api/sports/analyze'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(200,{ok:true,analysis:analyzeProp(b)})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/sports/rank'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{return json(200,{ok:true,board:rankBoard(Array.isArray(b)?b:(b.props||[]))})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}

if(path==='/capital-readiness'){
 const target=Math.max(1,Number(u.searchParams.get('target')||1000000000));
 const multiple=Math.max(.1,Number(u.searchParams.get('multiple')||10));
 const p=capitalReadinessPlan({targetValuation:target,revenueMultiple:multiple});
 const v=p.valuation;
 const phases=p.phases.map(x=>`<article><h3>${esc(x.horizon)} — ${esc(x.goal)}</h3><ul>${x.actions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></article>`).join('');
 res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});
 return res.end(shell('ULTRON Institutional Power',`<nav><a href="/">← ULTRON</a><a href="/api/video-batch-1006">Upgrade JSON</a></nav><h1>ULTRON Institutional Power</h1><p>Build real enterprise value, lender readiness and financing optionality from verified business fundamentals.</p><section><article><h2>Illustrative valuation target</h2><b>${Number(v.targetValuation).toLocaleString()}</b><p>At an illustrative ${v.illustrativeRevenueMultiple}× revenue multiple, the implied annual revenue requirement is <strong>${Number(v.requiredAnnualRevenue).toLocaleString()}</strong> (~${Number(v.requiredMonthlyRevenue).toLocaleString()}/month).</p><small>${esc(v.note)}</small></article><article><h2>Financing principle</h2><p>${esc(p.financingPrinciple)}</p><p>No fabricated valuation, assets, customers, contracts, ownership or credit applications.</p></article></section><h2>Execution roadmap</h2><section>${phases}</section>`));
}
if(path==='/api/video-batch-1006'&&req.method==='GET')return json(200,{ok:true,manifest:oct06Manifest()});
if(path==='/api/capital-readiness'&&req.method==='GET'){
 const target=Math.max(1,Number(u.searchParams.get('target')||1000000000));
 const multiple=Math.max(.1,Number(u.searchParams.get('multiple')||10));
 return json(200,{ok:true,plan:capitalReadinessPlan({targetValuation:target,revenueMultiple:multiple}),valuation:valuationRequirement({targetValuation:target,revenueMultiple:multiple})});
}
if(path==='/api/economic-agent'&&req.method==='GET')return json(200,{ok:true,result:economicAgentDecision({
 verifiedRevenue:Number(u.searchParams.get('revenue')||0),grossProfit:Number(u.searchParams.get('grossProfit')||0),
 computeCost:Number(u.searchParams.get('compute')||0),toolCost:Number(u.searchParams.get('tools')||0),
 acquisitionCost:Number(u.searchParams.get('acquisition')||0),refundCost:Number(u.searchParams.get('refunds')||0),
 otherDirectCost:Number(u.searchParams.get('other')||0)
})});
if(path==='/api/institutional-readiness'&&req.method==='GET')return json(200,{ok:true,result:institutionalReadinessScore({
 recurringRevenue:Number(u.searchParams.get('recurringRevenue')||0),grossMargin:Number(u.searchParams.get('grossMargin')||0),
 growthRate:Number(u.searchParams.get('growthRate')||0),retention:Number(u.searchParams.get('retention')||0),
 auditedOrReviewedFinancials:u.searchParams.get('financials')==='1',cleanCapTable:u.searchParams.get('capTable')==='1',
 governance:u.searchParams.get('governance')==='1',contractedBacklog:Number(u.searchParams.get('backlog')||0),
 concentrationRisk:Number(u.searchParams.get('concentrationRisk')||100),dataRoomComplete:u.searchParams.get('dataRoom')==='1'
})});

if(path==='/api/real-estate'&&req.method==='GET')return json(200,{ok:true,...realEstatePortfolio()})
if(path==='/api/revenue-100'&&req.method==='GET')return json(200,{ok:true,...revenuePortfolio({limit:100})})
if(path==='/api/founder-patterns'&&req.method==='GET')return json(200,{ok:true,...founderPatternPlan()})
if(path==='/real-estate'){const r=realEstatePortfolio(),lanes=r.manifest.lanes.map(x=>`<article><small>${esc(x.model)}</small><h2>${esc(x.name)}</h2><p>${esc(x.actions.join(' · '))}</p></article>`).join('');res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Real Estate OS',`<nav><a href="/">← ULTRON</a><a href="/revenue-100">100 Revenue Engines</a><a href="/api/real-estate">JSON</a></nav><h1>Real Estate Portfolio OS</h1><p><span class="status">ACTIVE</span> Deal intelligence, licensed-partner workflows, property operations and transaction support.</p><section>${lanes}</section><h2>Pipeline</h2><div class="terminal">${esc(r.pipelineStages.join('  →  '))}</div><h2>Compliance Layer</h2><section>${r.manifest.guardrails.map(x=>`<article><p>${esc(x)}</p></article>`).join('')}</section>`))}
if(path==='/revenue-100'){const r=revenuePortfolio({limit:100}),groups={};for(const x of r.sources)(groups[x.category]??=[]).push(x);const blocks=Object.entries(groups).map(([cat,items])=>`<article><small>${esc(cat)}</small><h2>${items.length} Engines</h2><p>${items.map(x=>esc(x.name)).join(' · ')}</p></article>`).join('');res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON 100 Revenue Engines',`<nav><a href="/">← ULTRON</a><a href="/real-estate">Real Estate</a><a href="/founder-patterns">Founder Patterns</a></nav><h1>100 Revenue Engines</h1><p><b>100</b> candidate income systems sharing one ULTRON infrastructure. Candidates are validated before scale; they are not represented as current revenue.</p><section>${blocks}</section>`))}
if(path==='/founder-patterns'){const p=founderPatternPlan(),cards=p.patterns.map(x=>`<article><h2>${esc(x.pattern)}</h2><p>${esc(x.ultron)}</p></article>`).join('');res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Founder Pattern Engine',`<nav><a href="/">← ULTRON</a><a href="/revenue-100">100 Revenue Engines</a></nav><h1>Founder Pattern Engine</h1><p>Patterns extracted from young-billionaire wealth creation are converted into product strategy, not copied businesses.</p><section>${cards}</section>`))}
if(path==='/api/system-360'&&req.method==='GET')return json(200,{ok:true,system:system360Manifest()})
if(path==='/system-360'){const s=system360Manifest(),cards=Object.entries(s.systems).map(([k,v])=>`<article><small>${esc(k.toUpperCase())}</small><h2>${esc(v.role)}</h2><p><strong>Outputs:</strong> ${v.outputs.map(esc).join(' · ')}</p></article>`).join('');res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON 360',`<nav><a href="/">← ULTRON</a><a href="/nucleus">Nucleus</a><a href="/api/system-360">Architecture JSON</a></nav><h1>ULTRON 360 Operating System</h1><p><b>ACTIVE</b></p><p>${s.loop.join(' → ')}</p><section>${cards}</section><h2>Definition of complete</h2><section>${Object.entries(s.completionDefinition).map(([k,v])=>`<article><h3>${esc(k)}</h3><p>${esc(v)}</p></article>`).join('')}</section>`))}
if(path==='/api/nucleus'&&req.method==='GET'){const l=await ledger(),a=await agentState(),orders=Object.values(l?.orders||{}),completed=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),revenue=completed.reduce((s,x)=>s+Number(x?.capturedAmount||x?.amount||0),0);const services=[{name:'revenue-core',online:true,lastSeenAt:new Date().toISOString()},{name:'agent-runtime',online:Boolean(a),lastSeenAt:a?.metrics?.lastCycleAt||null}];const vitals=vitalSnapshot({services,business:{verifiedRevenueUsd:revenue,completedOrders:completed.length},memory:{events:Number(a?.cycles||0)}});return json(200,{ok:true,nucleus:nucleusManifest(),vitals,executive:executiveCycle({metrics:vitals})})}
if(path==='/nucleus'){const m=nucleusManifest();const cards=Object.entries(m.organs).map(([k,v])=>`<article><small>${esc(k.toUpperCase())}</small><h2>${esc(v.name)}</h2><p>${esc(v.purpose)}</p></article>`).join('');res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Nucleus',`<nav><a href="/">← ULTRON</a><a href="/api/nucleus">Live vitals JSON</a></nav><h1>ULTRON Nucleus</h1><p><b>ONLINE</b></p><p>Observe → reason → plan → permissioned action → measure → learn. This is the shared life-support architecture connecting every division.</p><section>${cards}</section>`))}
if(path==='/free-response-gap-scan'){res.writeHead(200,{'content-type':'text/html','cache-control':'public,max-age=300'});return res.end(acquisitionPage('services'))}
if(/^\/solutions\/(hvac|plumbing|roofing|medspa|auto|services)-ai-lead-response$/.test(path)){const id=path.match(/^\/solutions\/([a-z]+)-ai-lead-response$/)[1];res.writeHead(200,{'content-type':'text/html','cache-control':'public,max-age=300'});return res.end(acquisitionPage(id))}
if(path==='/api/acquisition'&&req.method==='GET')return json(200,{ok:true,manifest:acquisitionV11Manifest(),summary:await leadSummary()});
if(path==='/api/acquisition/scan'&&req.method==='POST'){let raw='';for await(const ch of req){raw+=ch;if(raw.length>100000)return json(413,{ok:false,error:'request too large'})}let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}if(b.website_url)return json(400,{ok:false,error:'invalid submission'});try{const lead=await captureLead(b);await recordOps('DEMAND',{leadId:lead.leadId,source:'FIRST_PARTY_DIAGNOSTIC',contactPermission:lead.contactStatus==='OPT_IN_TO_ONE_TO_ONE_REPLY'});return json(201,{ok:true,...lead})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/acquisition/leads'&&req.method==='GET'){if(!ACQ_TOKEN||req.headers['x-ultron-owner-token']!==ACQ_TOKEN)return json(401,{ok:false,error:'owner authorization required'});return json(200,{ok:true,leads:await listLeads(Number(u.searchParams.get('limit')||100))})}
if(path==='/support'){res.writeHead(200,{'content-type':'text/html'});return res.end(shell('ULTRON Support','<h1>ULTRON Support</h1><p>Ask about products, checkout, delivery or refund policy through the support API.</p><p><a href="/market">Back to AI Market</a></p>'))}
if(path==='/everything'){const m=universalMarketManifest(),s=await marketplaceState(),q=u.searchParams.get('q')||'',results=q?await marketplaceSearch(q,30):[];const cards=results.map(x=>`<article><small>${esc(x.product.type)} · ${esc(x.product.category)}</small><h3>${esc(x.product.title)}</h3><p>${esc(x.product.description)}</p>${x.featuredOffer?`<b>${Number(x.featuredOffer.priceUsd+x.featuredOffer.shippingUsd).toFixed(2)}</b><p>Featured offer · ${esc(x.featuredOffer.fulfillmentMode)}</p>`:'<p>No eligible live offer yet.</p>'}</article>`).join('');res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('ULTRON Everything Market',`<nav><a href="/">← ULTRON</a><a href="/market">AI Market</a><a href="/agent-of-agents">Agent-of-Agents</a></nav><h1>ULTRON Everything Market</h1><p>Universal mediator for digital products, software, services, subscriptions, POD, merchant goods, supplier fulfillment and partner offers.</p><p>${m.domains.length} marketplace domains · ${s.stats.merchants} merchants · ${s.stats.canonicalProducts} canonical products · ${s.stats.offers} live/staged offers</p><form><input name="q" value="${esc(q)}" placeholder="Search everything"><button>Search</button></form><section>${cards}</section><p><small>Only authorized sellers and compliant inventory can become eligible offers. Featured-offer ranking favors buyer value: price, availability, delivery and seller quality.</small></p>`))}
if(path==='/api/verifier/v32'&&req.method==='GET'){
 return json(200,{ok:true,report:publicVerifier(await verifierState())});
}
if(path==='/api/verifier/v32/owner'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});
 const s=await verifierState();
 return json(200,{ok:true,report:publicVerifier(s),mission:OWNER_MISSION,authority:ACTION_AUTHORITY,
  ownerBusinessProfile:s.ownerBusinessProfile,history:(s.history||[]).slice(0,40),lastError:s.lastError});
}
if(path==='/api/verifier/v32/run'&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});
 return json(200,{ok:true,result:await verificationCycle(payment)});
}
if(path==='/api/verifier/v32/profile'&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2500)return json(413,{ok:false,error:'business profile too large'});}
 let body={};try{body=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}
 try{return json(200,await updateOwnerBusinessProfile(body))}
 catch(e){return json(400,{ok:false,error:String(e?.message||e).slice(0,160)})}
}
if(path==='/verifier'&&req.method==='GET'){
 const report=publicVerifier(await verifierState());
 const checks=report.checks.map(x=>'<article><small>'+esc(x.id)+'</small><h3>'+esc(x.status)+'</h3><p>'+esc(x.why)+'</p></article>').join('');
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});
 return res.end(shell('ULTRON Verification Agent',
 '<nav><a href="/">ULTRON</a> · <a href="/resilience">Resilience</a> · <a href="/owner-actions">Approvals</a> · <a href="/activation-center">Activation</a></nav>'+
 '<h1>VERIFICATION AGENT // V32</h1><p>Owner mission: independently check internal claims, providers and evidence. When the owner is unavailable, audit safe operations and queue consequential decisions.</p>'+
 '<section><article><small>Verifier status</small><h2>'+esc(report.status)+'</h2></article><article><small>Last check</small><p>'+esc(report.lastRun||'Not yet started')+'</p></article><article><small>Verification cycles</small><b>'+esc(report.cycles)+'</b></article></section>'+
 '<h2>Evidence check results</h2><section>'+checks+'</section>'+
 '<h2>Owner-only review and business instructions</h2><p>Enter the same Railway acquisition-admin token used in the Owner Action Center. Never put it in a link or message. It is not stored by this page.</p>'+
 '<input id="verify-token" type="password" autocomplete="off" placeholder="Railway owner token" aria-label="Railway owner token"><button id="verify-load" type="button">Load private report</button><button id="verify-run" type="button">Run safe verification</button><p><label for="verify-notes">Additional business instructions (owner-only, max 600 characters)</label><textarea id="verify-notes" maxlength="600" rows="4" placeholder="Business operating preferences only. Do not include passwords, ID numbers, or personal secrets."></textarea><button id="verify-save" type="button">Save instructions</button></p>'+
 '<p id="verify-response" role="status">No owner action taken.</p>'+
 '<script>(function(){const status=document.getElementById("verify-response");async function run(path,method){const token=document.getElementById("verify-token").value.trim();if(!token){status.textContent="Enter the owner token first";return;}try{const r=await fetch(path,{method,headers:{"authorization":"Bearer "+token}});const d=await r.json();status.textContent=r.ok?JSON.stringify(method==="GET"?{status:d.report.status,mission:d.mission?.purpose,profile:d.ownerBusinessProfile}:d.result):d.error||"Request failed";}catch(e){status.textContent="Unable to verify: "+e.message}}document.getElementById("verify-load").onclick=()=>run("/api/verifier/v32/owner","GET");document.getElementById("verify-run").onclick=()=>run("/api/verifier/v32/run","POST");document.getElementById("verify-save").onclick=async()=>{const token=document.getElementById("verify-token").value.trim(),notes=document.getElementById("verify-notes").value.trim();if(!token){status.textContent="Enter the owner token";return;}if(!notes){status.textContent="Write business instructions first";return;}try{const r=await fetch("/api/verifier/v32/profile",{method:"POST",headers:{"authorization":"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({instructions:notes})});const d=await r.json();status.textContent=r.ok?"Business instructions saved privately":d.error||"Save failed";}catch(e){status.textContent="Unable to save: "+e.message}};})();</script>'+
 '<p>Identity and MFA require the owner. A configured provider is not a real sale. Verification notes may contain only business instructions, never passwords or identity data.</p>'));
}
if(path==='/api/resilience/v31'&&req.method==='GET'){
 const s=await resilienceDetail();return json(200,{ok:true,report:resiliencePublic(s)});
}
if(path==='/api/resilience/v31/owner'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});
 const s=await resilienceDetail();
 return json(200,{ok:true,report:resiliencePublic(s),departments:DEPARTMENTS,latest:s.latest,
  jobs:Object.values(s.jobs||{}).sort((a,b)=>b.priority-a.priority).slice(0,80),
  events:(s.events||[]).slice(0,30),lastError:s.lastError});
}
if(path==='/resilience'&&req.method==='GET'){
 const s=resiliencePublic(await resilienceDetail());
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
 return res.end(shell('ULTRON Resilience v31','<nav><a href="/">ULTRON</a> · <a href="/owner-actions">Owner actions</a> · <a href="/activation-center">Activation</a> · <a href="/free-response-gap-scan">Free diagnostic</a> · <a href="/flagship">Audit offer</a></nav>'+
 '<h1>ULTRON // RESILIENT OPERATIONS</h1><p>12 departmental managers, 12 worker assignments, and 12 independent verification roles. Jobs run in bounded scheduled cycles. Human approval is still required for spending, publication, messages, and financial changes.</p>'+
 '<section><article><small>Heartbeat</small><p>'+esc(s.lastHeartbeat||'NOT YET RUNNING')+'</p></article><article><small>Cycles</small><b>'+s.cycles+'</b></article><article><small>Verified customer orders</small><b>'+s.verifiedOrders+'</b></article><article><small>Verified captured revenue</small><b>$'+s.verifiedRevenueUsd+'</b></article></section>'+
 '<h2>Provider gates</h2><section>'+Object.entries(s.gateStatus).map(([k,v])=>'<article><small>'+esc(k)+'</small><p>'+esc(v)+'</p></article>').join('')+'</section>'+
 '<h2>Internal job ledger</h2><pre>'+esc(JSON.stringify(s.jobCounts,null,2))+'</pre>'+
 '<p><a href="/api/resilience/v31">Public machine status</a>. For task ownership and private incident details use the authorized owner endpoint.</p>'));
}
if(path==='/owner-actions'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});return res.end(ownerActionPage())}
if(path==='/agent-of-agents'){const s=await agentOfAgentsState(),pending=(s.approvals||[]).filter(x=>x.status==='pending');const cards=Object.entries(agentOfAgentsManifest().agents).map(([name,a])=>`<article><h3>${esc(name)}</h3><p>${esc(a.purpose)}</p><small>${esc(a.defaultMode||'')}</small></article>`).join('');const approvals=pending.map(a=>`<article><h3>${esc(a.owner)}</h3><p>${esc(a.action)}</p><code>${esc(a.id)}</code><p>Approval required before this consequential action can proceed.</p></article>`).join('')||'<p>No pending approvals.</p>';res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(shell('Agent-of-Agents',`<nav><a href="/">← ULTRON</a><a href="/api/agent-of-agents">JSON</a><a href="/api/agent-of-agents/graph">Graph</a></nav><h1>Agent-of-Agents Commerce Layer</h1><p>JARVIS → CEO Orchestrator → Product Scout → Store Builder → Media Buyer → Customer Support → analytics feedback.</p><p><b>Editor-in-Chief:</b> you approve public publishing, paid spend, budget changes and refunds.</p><h2>Commerce agents</h2><section>${cards}</section><h2>Pending approvals</h2><section>${approvals}</section>`))}
if(path==='/api/support'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let body;try{body=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'})}try{return json(200,{ok:true,...answerQuestion(body.question)})}catch(e){return json(400,{error:String(e?.message||e)})}}
if(path==='/health'){const db=await storeHealth(),a=await agentState();return json(db.ok?200:503,{ok:db.ok,database:db,aiMarket:{ready:true,...marketStats()},paymentReady:READY&&payment.ok,agents:{lastCycleAt:a.metrics?.lastCycleAt||null,intervalMinutes:INTERVAL,workloadMultiplier:WORKLOAD}})}
if(path==='/robots.txt'){res.writeHead(200,{'content-type':'text/plain'});return res.end(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /inbound-inbox
Disallow: /activation-center
Disallow: /completion-500
Disallow: /mission-control
Disallow: /product/
Sitemap: ${PUBLIC}/sitemap.xml
`)}
if(path==='/sitemap.xml'){res.writeHead(200,{'content-type':'application/xml'});return res.end(sitemapIndex())}
if(path==='/sitemap-static.xml'){res.writeHead(200,{'content-type':'application/xml','cache-control':'public,max-age=3600'});return res.end(sitemapStatic())}
if(/^\/sitemap-\d+\.xml$/.test(path)){res.writeHead(200,{'content-type':'application/xml','cache-control':'public,max-age=86400'});return res.end(sitemap(Number(path.match(/\d+/)[0])))}
if(path.startsWith('/product/')){const p=marketProduct(decodeURIComponent(path.slice(9)));if(!p)return json(404,{error:'product not found'});res.writeHead(200,{'content-type':'text/html','cache-control':'public,max-age=3600'});return res.end(productHtml(p))}
if(path==='/api/market')return json(200,{ok:true,stats:marketStats(),stores:marketStores(),featured:featuredProducts()});
if(path==='/api/revenue-loop'){const l=await ledger(),a=await agentState();return json(200,{ok:true,...revenueLoopStatus({baseUrl:PUBLIC,ledger:l,agentState:a,paymentReady:READY&&payment.ok})})}
if(path==='/revenue-loop'){const l=await ledger(),a=await agentState(),s=revenueLoopStatus({baseUrl:PUBLIC,ledger:l,agentState:a,paymentReady:READY&&payment.ok});const rows=s.stages.map(x=>`<article><small>${esc(x.deployment)} · ${esc(x.operation)}</small><h3>${esc(x.name)}</h3><p>${esc(typeof x.output==='string'?x.output:JSON.stringify(x.output))}</p></article>`).join('');res.writeHead(200,{'content-type':'text/html'});return res.end(shell('ULTRON Revenue Loop',`<h1>Demand → Revenue Loop</h1><p>The deployment is complete; recurring acquisition, measurement and agent feedback continue running.</p><p><a href="/solutions/missed-lead-recovery">Open flagship offer</a> · <a href="/market">AI Market</a></p><section>${rows}</section>`))}
if(path==='/solutions/missed-lead-recovery'){const o=flagshipOffer(PUBLIC);const evidence=DEMAND_EVIDENCE.map(x=>`<li>${esc(x.signal)}</li>`).join('');res.writeHead(200,{'content-type':'text/html','cache-control':'public,max-age=900'});return res.end(shell(o.name,`<nav><a href="/market">← AI Market</a><a href="/revenue-loop">Revenue Loop</a></nav><article><small>For ${esc(o.targetBuyer)}</small><h1>${esc(o.name)}</h1><b>${o.price}</b><p>${esc(o.positioning)}</p><h2>Why this problem</h2><ul>${evidence}</ul><h2>What you get</h2><p>Response map, lead qualification flow, booking recovery workflow, response scripts, KPI scorecard, QA/compliance gate and a 30-day optimization loop.</p><p><a href="${esc(o.checkoutPath)}">Buy securely with PayPal</a></p><p><small>No guaranteed revenue claims. Results depend on implementation, demand and the business.</small></p></article>`,`<meta name="description" content="Missed-lead response and booking recovery workflow for local service businesses."><link rel="canonical" href="${esc(o.landingUrl)}">`))}
if(path==='/solutions/ai-implementation'){const ids=['ai-revenue-audit-500','ai-automation-sprint-2500','ai-revenue-ops-7500','ai-business-os-10000','ai-optimization-1500'],cards=ids.map(id=>marketProduct(id)).filter(Boolean).map(p=>`<article><small>${esc(p.targetBuyer)}</small><h2>${esc(p.name)}</h2><b>${Number(p.price).toLocaleString()}</b><p>${esc(p.description)}</p><p><a href="/buy?product=${encodeURIComponent(p.id)}">Buy securely with PayPal</a></p></article>`).join('');res.writeHead(200,{'content-type':'text/html','cache-control':'public,max-age=600'});return res.end(shell('AI Implementation Services',`<nav><a href="/market">← AI Market</a><a href="/revenue-loop">Revenue Loop</a></nav><h1>AI implementation packages</h1><p>Fixed-scope offers focused on measurable workflow outcomes. No income guarantees; implementation results depend on the business, inputs and adoption.</p><section>${cards}</section>`,`<meta name="description" content="Fixed-scope AI audit, automation sprint, revenue operations and business operating-system implementation packages."><link rel="canonical" href="${PUBLIC}/solutions/ai-implementation">`))}
if(path==='/solutions/revenue-frameworks'){const m=revenueFrameworkManifest(),ids=['content-growth-sprint-1250','niche-ai-tool-sprint-3500','digital-product-launch-750'],cards=ids.map(id=>marketProduct(id)).filter(Boolean).map(p=>`<article><small>${esc(p.targetBuyer)}</small><h2>${esc(p.name)}</h2><b>${Number(p.price).toLocaleString()}</b><p>${esc(p.description)}</p><p><a href="/buy?product=${encodeURIComponent(p.id)}">Buy securely with PayPal</a></p></article>`).join('');const sub=businessBilling.planId?`<article><small>Recurring service</small><h2>AI Growth & Automation Retainer</h2><b>$1,500/mo</b><p>Monthly optimization, support, operating review and one controlled improvement cycle.</p><div id="paypal-subscribe"></div></article>`:'<article><h2>Recurring service</h2><p>PayPal subscription provisioning is not active yet; one-time services remain available.</p></article>';const script=businessBilling.planId?`<script src="https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CID)}&vault=true&intent=subscription"></script><script>paypal.Buttons({style:{shape:'rect',layout:'vertical'},createSubscription:(data,actions)=>actions.subscription.create({plan_id:${JSON.stringify(businessBilling.planId)}})}).render('#paypal-subscribe');</script>`:'';res.writeHead(200,{'content-type':'text/html','cache-control':'public,max-age=300'});return res.end(shell('ULTRON Revenue Frameworks',`<nav><a href="/market">← AI Market</a><a href="/solutions/ai-implementation">AI implementation</a></nav><h1>Three ways ULTRON solves paid problems</h1><p>Content & copy services, niche AI software/workflows, and original digital products. Every offer uses verified payment accounting and scoped fulfillment.</p><section>${cards}${sub}</section><h2>Current problem priorities</h2><section>${m.buyerProblems.map(x=>`<article><h3>${esc(x.problem)}</h3><p>${esc(x.buyers.join(', '))}</p></article>`).join('')}</section>${script}`,`<meta name="description" content="AI content services, niche automation software and original digital products with PayPal checkout and subscriptions."><link rel="canonical" href="${PUBLIC}/solutions/revenue-frameworks">`))}
if(path==='/api/revenue-frameworks'&&req.method==='GET')return json(200,{ok:true,framework:revenueFrameworkManifest(),billing:businessBilling});
if(path==='/api/revenue-frameworks/plan'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}return json(200,{ok:true,plan:executionPlan(b)})}
if(path==='/api/paypal-business-billing'&&req.method==='GET')return json(200,{ok:true,manifest:paypalBusinessBillingManifest(),state:businessBilling});
if(path==='/api/ultron2'){const bos=await businessOSState();return json(200,{ok:true,manifest:capabilityManifest(),businessOS:businessOSManifest(),businessState:{cycles:bos.cycles,lastCycleAt:bos.lastCycleAt,metrics:bos.metrics,topOpportunities:bos.opportunities?.slice(0,5)},market:marketStats(),agentIntervalMinutes:INTERVAL,workloadMultiplier:WORKLOAD})}
if(path==='/api/business-os')return json(200,{ok:true,manifest:businessOSManifest(),state:await businessOSState()});
if(path==='/api/agent-farm')return json(200,{ok:true,manifest:agentFarmManifest(),state:await agentFarmState()});
if(path==='/api/agent-farm/plan'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;return json(200,{ok:true,plan:missionPlan(raw?JSON.parse(raw):{})})}
if(path==='/api/agent-state')return json(200,{ok:true,state:await agentState()});
if(path==='/api/autopilot'){const s=await autopilotState();return json(200,{ok:true,terminal:productionTerminal(),state:s});}
if(path==='/api/opportunities')return json(200,{ok:true,opportunities:opportunityMap(await ledger())});
if(path.startsWith('/api/opportunities/')&&path.endsWith('/products')){const id=decodeURIComponent(path.split('/')[3]);const o=opportunityMap(await ledger()).find(x=>x.id===id);if(!o)return json(404,{error:'opportunity not found'});return json(200,{ok:true,opportunity:o,target:targetProfile(o),products:productIdeasForOpportunity(o,12),commandBridge:commandBridge()})}
if(path==='/api/wizard'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;const project=wizardFromConversation(raw?JSON.parse(raw):{});await saveProject(project);return json(200,{ok:true,project})}
if(path==='/api/projects'&&req.method==='GET')return json(200,{ok:true,projects:await listProjects()});
if(path.startsWith('/api/projects/')&&req.method==='GET'){const id=decodeURIComponent(path.slice('/api/projects/'.length));const project=await getProject(id);return project?json(200,{ok:true,project}):json(404,{error:'project not found'})}
if(path==='/api/project-progress'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;const b=raw?JSON.parse(raw):{};return json(200,{ok:true,project:await updateProjectProgress(b.projectId,b.milestoneId,b.status)})}
if(path==='/api/candidates'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;return json(200,{ok:true,candidates:generateCandidates(raw?JSON.parse(raw):{})})}
if(path==='/api/critique'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;const b=raw?JSON.parse(raw):{};return json(200,{ok:true,result:critiqueCandidate(b.candidate||{},b.metrics||{})})}
if(path==='/api/acquisition-plan'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;return json(200,{ok:true,plan:buildAcquisitionPlan(raw?JSON.parse(raw):{})})}
if(path==='/api/sales-workflow'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;return json(200,{ok:true,workflow:prospectToPaymentWorkflow(raw?JSON.parse(raw):{})})}
if(path==='/api/video-systems'&&req.method==='GET')return json(200,{ok:true,architecture:unifiedVideoArchitecture(),master:masterCapabilityManifest(),market:marketVideoPlan(),crypto:cryptoVideoPlan()});
if(path==='/api/video-master'&&req.method==='GET')return json(200,{ok:true,manifest:masterCapabilityManifest(),expansion:expansionManifest()});
if(path==='/api/video-expansion'&&req.method==='GET')return json(200,{ok:true,manifest:expansionManifest(),content:contentMission({}),animatedMedia:animatedMediaMission({}),business:businessOpportunityMission({}),crypto:cryptoResearchMission({})});
if(path==='/api/video-batch-1005'&&req.method==='GET')return json(200,{ok:true,pack:OCT05_CAPABILITY_PACK,analysis:OCT05_VIDEO_ANALYSIS,localModels:LOCAL_MODEL_RESOURCES,market:marketStats()});
if(path==='/api/business-mastery'&&req.method==='GET'){const l=await ledger();const orders=Object.values(l?.orders||{}),completed=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),revenue=completed.reduce((s,x)=>s+Number(x?.capturedAmount||x?.amount||0),0);return json(200,{ok:true,mastery:caseStudyMasteryManifest(),portfolio:buildRevenuePortfolio({verifiedRevenueUsd:revenue,completedOrders:completed.length}),ownerOperatingContract:OWNER_OPERATING_CONTRACT})}
if(path==='/api/millionaire-sprint'&&req.method==='GET'){const l=await ledger();const orders=Object.values(l?.orders||{}),completed=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),revenue=completed.reduce((s,x)=>s+Number(x?.capturedAmount||x?.amount||0),0);return json(200,{ok:true,sprint:sprintPlan({verifiedRevenueUsd:revenue,completedOrders:completed.length}),pace:sprintPace({verifiedRevenueUsd:revenue}),scenarios:scenarioMath(),definition:MILLIONAIRE_SPRINT})}
if(path==='/api/security'&&req.method==='GET')return json(200,{ok:true,security:securityManifest(),agentExample:agentSecurityProfile('ProspectResearchAgent')});
if(path==='/api/agent-of-agents'&&req.method==='GET'){const s=await agentOfAgentsState();return json(200,{ok:true,manifest:agentOfAgentsManifest(),state:s})}
if(path==='/api/agent-of-agents/mission'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'authenticated owner required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}const s=await createCommerceMission({goal:b.goal||'Launch a validated low-inventory ecommerce offer',context:b.context||{}});return json(201,{ok:true,state:s,mission:s.missions?.[0]||null})}
if(path==='/api/agent-of-agents/approvals'&&req.method==='GET'){if(!v13Owner())return json(403,{ok:false,error:'authenticated owner required'});const s=await agentOfAgentsState();return json(200,{ok:true,pending:(s.approvals||[]).filter(x=>x.status==='pending'),recent:(s.approvals||[]).slice(0,50)})}
if(/^\/api\/agent-of-agents\/approvals\/[^/]+\/decision$/.test(path)&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'authenticated owner required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}const id=decodeURIComponent(path.split('/')[4]);try{const s=await decideApproval({approvalId:id,decision:b.decision,note:b.note||''});return json(200,{ok:true,state:s})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/agent-of-agents/graph'&&req.method==='GET')return json(200,{ok:true,graph:visualAgentGraph()});
if(path==='/api/universal-marketplace'&&req.method==='GET'){const s=await marketplaceState();return json(200,{ok:true,manifest:universalMarketManifest(),stats:s.stats})}
if(path==='/api/pod'&&req.method==='GET')return json(200,{ok:true,pod:podManifest()});
if(path==='/api/pod/order'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'authenticated owner required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}try{const result=await createPodOrder(b.provider,b.payload,{ownerApproved:Boolean(b.ownerApproved)});return json(201,{ok:true,provider:b.provider,result})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/universal-marketplace/search'&&req.method==='GET')return json(200,{ok:true,query:u.searchParams.get('q')||'',results:await marketplaceSearch(u.searchParams.get('q')||'',Number(u.searchParams.get('limit')||24))});
if(path.startsWith('/api/universal-marketplace/product/')&&req.method==='GET'){const id=decodeURIComponent(path.slice('/api/universal-marketplace/product/'.length));const p=await marketplaceProduct(id);return p?json(200,{ok:true,...p}):json(404,{ok:false,error:'product not found'})}
if(path==='/api/universal-marketplace/interaction'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}await recordInteraction(b);return json(202,{ok:true})}
if(path==='/api/universal-marketplace/merchant'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'authenticated owner required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}if(!b.ownerApproved)return json(403,{ok:false,error:'ownerApproved required for merchant onboarding'});try{const s=await registerMerchant(b);return json(201,{ok:true,merchant:s.merchants?.[b.id]||null,stats:s.stats})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/universal-marketplace/product'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'authenticated owner required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}if(!b.ownerApproved)return json(403,{ok:false,error:'ownerApproved required for catalog mutation'});try{const s=await upsertProduct(b);return json(201,{ok:true,product:s.products?.[b.id]||null,stats:s.stats})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/universal-marketplace/offer'&&req.method==='POST'){if(!v13Owner())return json(403,{ok:false,error:'authenticated owner required'});let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'invalid JSON'})}if(!b.ownerApproved)return json(403,{ok:false,error:'ownerApproved required for offer mutation'});try{const s=await upsertOffer(b);return json(201,{ok:true,offer:s.offers?.[b.id]||null,stats:s.stats})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/prospect-mission'&&req.method==='GET')return json(200,{ok:true,mission:PROSPECT_MISSION,matrix:targetingMatrix(),status:prospectMissionStatus([]),instagramSource:{url:'https://www.instagram.com/reel/DcrR7aGJTZ8/',status:'queued-content-unavailable'}});
if(path==='/api/prospect-score'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{}return json(200,{ok:true,result:scoreProspectV11(b)})}
if(path==='/api/prospect-draft'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{}try{return json(200,{ok:true,draft:personalizedEmailDraft(b)})}catch(e){return json(400,{ok:false,error:String(e?.message||e)})}}
if(path==='/api/interpret-directive'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;let b={};try{b=JSON.parse(raw||'{}')}catch{}return json(200,{ok:true,interpretation:interpretOwnerDirective(b.text||b.goal||'')})}
if(path==='/api/acquisition'&&req.method==='GET')return json(200,{ok:true,plan:acquisitionPlan({target:Number(u.searchParams.get('target')||1000)}),draft:outreachDraft({})});
if(path==='/api/video-master/mission'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;const b=raw?JSON.parse(raw):{};return json(200,{ok:true,mission:buildMission(b)})}
if(path==='/api/video-systems/critique'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;return json(200,{ok:true,result:productCritiqueSystem(raw?JSON.parse(raw):{})})}
if(path==='/api/video-systems/app-factory'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;return json(200,{ok:true,result:appFactorySystem(raw?JSON.parse(raw):{})})}
if(path==='/api/video-systems/revenue'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;return json(200,{ok:true,result:prospectRevenueSystem(raw?JSON.parse(raw):{})})}
if(path==='/api/video-systems/wizard'&&req.method==='POST'){let raw='';for await(const ch of req)raw+=ch;const result=wizardOperatingSystem(raw?JSON.parse(raw):{});await saveProject(result.project);return json(200,{ok:true,result})}
if(path==='/api/search')return json(200,{ok:true,items:catalogPage({storeId:u.searchParams.get('store')||undefined,offset:Number(u.searchParams.get('offset')||0),limit:Math.min(100,Number(u.searchParams.get('limit')||20)),query:u.searchParams.get('q')||''})});
if(path==='/market'||path.startsWith('/market/')){res.writeHead(200,{'content-type':'text/html'});return res.end(marketHtml(path==='/market'?null:decodeURIComponent(path.slice(8)),Number(u.searchParams.get('page')||1),u.searchParams.get('q')||''))}

if(path==='/14-day-audit'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public,max-age=60'});return res.end(await readFile(new URL('./public/14-day-audit.html',import.meta.url),'utf8'))}
if(path==='/api/14-day-audit/v37'&&req.method==='GET'){return json(200,{ok:true,...await v37Dashboard()})}
if(path==='/api/14-day-audit/v37/owner'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'Owner authorization required'});
 return json(200,{ok:true,...await v37Dashboard({privateView:true})});
}
if(path==='/api/14-day-audit/v37/owner-note'&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'Owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>9000)return json(413,{ok:false,error:'Request too large'})}
 let data;try{data=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'Invalid JSON'})}
 try{const item=await v37RecordOwnerNote(data);return json(201,{ok:true,item,externalActionTaken:false})}
 catch(e){return json(400,{ok:false,error:String(e?.message||e).slice(0,230)})}
}
if(path==='/growth-paths'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public,max-age=120'});return res.end(await readFile(new URL('./public/growth-paths.html',import.meta.url),'utf8'))}
if(path==='/ai-workflow-guide-preview'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public,max-age=120'});return res.end(await readFile(new URL('./public/ai-workflow-guide-preview.html',import.meta.url),'utf8'))}
if(path==='/growth-paths-command'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});return res.end(await readFile(new URL('./public/growth-paths-command.html',import.meta.url),'utf8'))}
if(path==='/api/revenue-commander/v38'&&req.method==='GET'){
 const report=await revenueCommanderReport();
 return json(200,{ok:true,report,notice:'Observed state and recommended work only. No external authorizations or customer purchases are inferred.'});
}
if(path==='/revenue-commander'&&req.method==='GET'){
 const report=await revenueCommanderReport();
 const serviceCards=report.providerGates.map(g=>'<article><small>'+esc(g.id)+' / '+esc(g.status)+'</small><h3>'+esc(g.next)+'</h3><p>Proof: '+esc(g.proof)+'</p></article>').join('');
 const actionCards=report.queue.slice(0,12).map((a,i)=>'<article><small>PRIORITY '+(i+1)+' / '+esc(a.mode)+'</small><h3>'+esc(a.action)+'</h3><p>'+esc(a.why)+'</p><small>RECOMMENDATION, NOT EXECUTED</small></article>').join('');
 const upgradeCards=report.upgrades.map((a,i)=>'<article><small>'+esc(a.phase)+' / '+(i+1)+'</small><h3>'+esc(a.name)+'</h3><p>Acceptance evidence: '+esc(a.proof)+'</p></article>').join('');
 const m=report.metrics;
 res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});
 return res.end(shell('ULTRON Revenue Commander v38',
 '<nav><a href="/">ULTRON HOME</a><a href="/activation-center">ACTIVATION</a><a href="/inbound-inbox">OWNER INBOX</a><a href="/flagship">AUDIT OFFER</a><a href="/lead-intake-pilot">PILOT</a><a href="/api/revenue-commander/v38">JSON</a></nav>'+
 '<h1>ULTRON // REVENUE COMMANDER V38</h1><p>The first real customer, verified delivery, and repeatability take priority over more bots or synthetic catalogs.</p>'+
 '<section><article><small>MISSION</small><h3>'+esc(report.phase)+'</h3></article>'+
 '<article><small>PROSPECT CANDIDATES</small><b>'+m.prospectCandidates+'</b><p>Not independently verified buyers.</p></article>'+
 '<article><small>VOLUNTARY INBOUND</small><b>'+m.inboundDiagnostics+'</b><p>'+m.consentedInbound+' open permissioned inquiries.</p></article>'+
 '<article><small>RECORDED CAPTURED ORDERS</small><b>'+m.capturedOrderRecords+'</b><p>Provider, independent buyer and settlement evidence remain distinct.</p></article>'+
 '<article><small>INDEPENDENT ACCEPTED CUSTOMERS WITH EXPLICIT RECORD PROOF</small><b>'+m.independentAcceptedCustomersWithExplicitProof+'</b></article>'+
 '<article><small>PENDING COMMERCE APPROVALS</small><b>'+m.pendingCommerceApprovals+'</b></article></section>'+
 '<h2>Highest-priority next actions</h2><section>'+actionCards+'</section>'+
 '<h2>External provider gates</h2><section>'+serviceCards+'</section>'+
 '<h2>All 16 screenshot upgrades and their acceptance criteria</h2><section>'+upgradeCards+'</section>'+
 '<p>Security, account authorizations, owner signatures, payment/refund operations, ads and trades are never bypassed. Source configuration alone is not a verified connection, and recommendations are not already executed.</p>'));
}

if(path==='/api/growth-paths/v36'&&req.method==='GET'){return json(200,{ok:true,...await v36Dashboard(false)})}
if(path==='/api/growth-paths/v36/owner'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'Owner authorization required'});
 return json(200,{ok:true,...await v36Dashboard(true)});
}
if(path==='/api/growth-paths/v36/draft'&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'Owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>12000)return json(413,{ok:false,error:'Request too large'})}
 let data;try{data=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'Invalid JSON'})}
 try{
  const type=String(data.type||'').toUpperCase();
  const asset=await v36QueueAsset(type,data);
  return json(201,{ok:true,asset,externalActionTaken:false});
 }catch(e){return json(400,{ok:false,error:String(e?.message||e).slice(0,230)})}
}
if(path==='/90-day-demo'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public,max-age=120'});return res.end(await readFile(new URL('./public/90-day-demo.html',import.meta.url),'utf8'))}
if(path==='/90-day-command'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'});return res.end(await readFile(new URL('./public/90-day-command.html',import.meta.url),'utf8'))}
if(path==='/90-day-revenue'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public,max-age=120'});return res.end(b2bPublicLanding())}
if(path==='/api/b2b-90-day'&&req.method==='GET'){const d=await b2bDashboard();return json(200,{ok:true,...d})}
if(path==='/api/b2b-90-day/owner'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'Owner authorization required'});
 return json(200,{ok:true,...await b2bDashboard({privateView:true})});
}
if(path==='/api/b2b-90-day/record'&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'Owner authorization required'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>16000)return json(413,{ok:false,error:'Request too large'})}
 let data;try{data=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'Invalid JSON'})}
 try{
  const action=String(data.action||'').trim().toUpperCase();
  let result;
  if(action==='RESEARCH')result=await b2bResearch(data);
  else if(action==='PARTNER_CANDIDATE')result=await b2bPartner(data);
  else if(action==='OPPORTUNITY')result=await b2bOpportunity(data);
  else if(action==='OPPORTUNITY_EVENT')result=await b2bAdvance({...data,action:data.eventAction});
  else if(action==='PREVIEW_DEMO')result=b2bDemo(data);
  else if(action==='PREVIEW_PROPOSAL')result=b2bProposal(data);
  else return json(400,{ok:false,error:'Unknown or prohibited B2B action'});
  return json(200,{ok:true,action,result});
 }catch(e){return json(400,{ok:false,error:String(e?.message||e).slice(0,230)})}
}
if(path==='/autonomous-audit'&&req.method==='GET'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public,max-age=120'});return res.end(auditPageHtml())}
if(path==='/api/revenue-autonomy/v34'&&req.method==='GET'){
 const l=await ledger(),rows=Object.values(l.orders||{}),mine=rows.filter(x=>x.product===V34_SKU);
 return json(200,{ok:true,mission:publicV34Manifest(),metrics:{initiated:mine.length,verifiedFulfilled:mine.filter(x=>x.status==='COMPLETED'&&x.captureId&&x.fulfillment?.token).length,
 grossCapturedUsd:mine.filter(x=>x.status==='COMPLETED'&&x.captureId).reduce((sum,x)=>sum+Number(x.capturedAmount||0),0)},testCustomersCountedAsSales:0});
}
if(path==='/api/revenue-autonomy/v34/owner'&&req.method==='GET'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});
 return json(200,{ok:true,mission:publicV34Manifest(),director:await readRevenueDirector(),reconciliation:reconcileVerifiedRevenue(Object.values((await ledger()).orders||{}))});
}
if(path==='/api/revenue-autonomy/v34/cycle'&&req.method==='POST'){
 if(!v13Owner())return json(403,{ok:false,error:'owner authorization required'});
 return json(200,{ok:true,cycle:await runRevenueDirector()});
}
if(path==='/api/v34/checkout'&&req.method==='POST'){
 const g=await operationalGate('checkout');
 if(!g.allowed)return json(503,{ok:false,error:'Checkout paused by owner'});
 if(!READY||!payment.ok)return json(503,{ok:false,error:'Live PayPal is not verified'});
 let raw='';for await(const piece of req){raw+=piece;if(raw.length>12000)return json(413,{ok:false,error:'Request too large'});}
 let request;try{request=JSON.parse(raw||'{}')}catch{return json(400,{ok:false,error:'Invalid JSON'})}
 let intake;try{intake=validateV34Intake(request)}catch(e){return json(400,{ok:false,error:String(e?.message||e).slice(0,140)})}
 try{const checkoutUrl=await createOrder(V34_SKU,intake);return json(201,{ok:true,checkoutUrl,priceUsd:99})}
 catch(e){console.error('v34 checkout',String(e?.message||e));return json(502,{ok:false,error:'Unable to create PayPal checkout'})}
}

if(path==='/buy'){if(u.searchParams.get('product')===CINEMA_SKU)return json(409,{error:'Use your issued video quote and accepted service terms for checkout'});if(u.searchParams.get('product')===AUDIT_SKU){res.writeHead(303,{location:'/audit-intake'});return res.end()}if(u.searchParams.get('product')===V34_SKU){res.writeHead(303,{location:'/autonomous-audit'});return res.end()}const g=await operationalGate('checkout');if(!g.allowed)return json(503,{error:'ULTRON new checkout paused by owner emergency control'});if(!READY)return json(503,{error:'PayPal not configured'});res.writeHead(303,{location:await createOrder(u.searchParams.get('product')||'',null,u.searchParams.get('assetId')||null)});return res.end()}
if((path==='/webhooks/paypal'||path==='/api/paypal/webhook'||path==='/api/checkout-webhook')&&req.method==='POST'){let raw='';for await(const ch of req){raw+=ch;if(Buffer.byteLength(raw)>131072)return json(413,{error:'Webhook too large'})}const required=['paypal-auth-algo','paypal-cert-url','paypal-transmission-id','paypal-transmission-sig','paypal-transmission-time'];if(!required.every(k=>typeof req.headers[k]==='string'&&req.headers[k].length>0&&req.headers[k].length<=2048))return json(400,{error:'Missing PayPal signature headers'});let event;try{event=JSON.parse(raw||'{}')}catch{return json(400,{error:'invalid JSON'})}const verify=await paypal('/v1/notifications/verify-webhook-signature','POST',{auth_algo:req.headers['paypal-auth-algo'],cert_url:req.headers['paypal-cert-url'],transmission_id:req.headers['paypal-transmission-id'],transmission_sig:req.headers['paypal-transmission-sig'],transmission_time:req.headers['paypal-transmission-time'],webhook_id:WH,webhook_event:event});if(verify?.verification_status!=='SUCCESS')return json(400,{error:'invalid webhook signature'});if(event.event_type==='PAYMENT.CAPTURE.REFUNDED'){const refund=event.resource||{},captureId=refund?.supplementary_data?.related_ids?.capture_id||refund.capture_id||'';if(captureId&&refund.id&&refund.status==='COMPLETED'){if(refund.amount?.currency_code==='USD')await saveLedger(l=>{const order=Object.values(l.orders||{}).find(o=>o.captureId===captureId);if(order){order.refunds??=[];if(!order.refunds.some(r=>r.id===refund.id))order.refunds.push({id:refund.id,amountUsd:Number(refund.amount.value),source:'PAYPAL_SIGNED_EVENT',at:new Date().toISOString()});}});try{await recordTrustedRefund({refundId:refund.id,captureId,amountUsd:Number(refund.amount?.value||0),status:refund.status})}catch(e){console.error('v20 refund reconciliation',String(e?.message||e))}}}
if(event.event_type==='PAYMENT.CAPTURE.COMPLETED'){const cap=event.resource||{},id=cap?.supplementary_data?.related_ids?.order_id||'';if(id){await fulfill(id,cap);await saveLedger(l=>recordSignedCapture(l.orders[id],{eventId:event.id,captureId:cap.id,receivedAt:new Date().toISOString()}));await attemptVerifiedEmailDelivery(id).catch(()=>console.error('PayPal delivery requires reconciliation'));await agentBurst()}}try{await paypalCommercialEvent(event)}catch(e){console.error('commercial PayPal mapping',e)}return json(200,{ok:true})}
if(path==='/paypal/return'){const id=u.searchParams.get('token')||'';const existing=(await ledger()).orders?.[id];if(!existing)return json(404,{error:'Unknown order'});if(existing.status==='COMPLETED'&&existing.fulfillment?.token){if(existing.product===CINEMA_SKU)await ensurePaidVideoJob(existing);res.writeHead(303,{location:'/fulfillment?token='+existing.fulfillment.token});return res.end()}const providerOrder=await paypal('/v2/checkout/orders/'+encodeURIComponent(id));let c=providerOrder.purchase_units?.flatMap(x=>x.payments?.captures||[]).find(x=>x.status==='COMPLETED');if(!c)c=await capture(id);if(!c||c.status!=='COMPLETED')return json(409,{error:'Capture not completed'});const f=await fulfill(id,c);await attemptVerifiedEmailDelivery(id).catch(()=>console.error('PayPal return delivery requires reconciliation'));await agentBurst();res.writeHead(303,{location:'/fulfillment?token='+f.token});return res.end()}
if(path==='/fulfillment'){const videoOrder=Object.values((await ledger()).orders||{}).find(o=>o.product===CINEMA_SKU&&o.fulfillment?.token===u.searchParams.get('token'));if(videoOrder){res.writeHead(303,{location:'/video-delivery?token='+encodeURIComponent(videoOrder.fulfillment.token)});return res.end()}const row=Object.values((await ledger()).orders||{}).find(o=>o.fulfillment?.token===u.searchParams.get('token')),f=row?.fulfillment;if(!f)return json(404,{error:'Not found'});res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','x-frame-options':'DENY'});return res.end(row.product===AUDIT_SKU&&f.status?renderAuditDelivery(row):renderFulfillmentHtml(f))}
if(path==='/paypal/cancel')return res.end('<h1>Payment canceled</h1>');
if(path==='/api/payment-status')return json(200,{provider:'PayPal',mode:'live',ready:READY&&payment.ok,runtime:payment});
return json(404,{error:'Not found'})}catch(e){console.error(e);return json(500,{error:'Request failed'})}})}
async function boot(){try{payment=await verifyPayPalRuntime({paypal,webhookId:WH,publicBaseUrl:PUBLIC})}catch(e){payment={ok:false,checkedAt:new Date().toISOString(),error:String(e?.message||e)}}console.log('ULTRON payment runtime',JSON.stringify({ok:Boolean(payment.ok),apiAuthorized:Boolean(payment.apiAuthorized),webhookEndpointVerified:Boolean(payment.webhookEndpointVerified),captureEventsSubscribed:Boolean(payment.captureEventsSubscribed),checkedAt:payment.checkedAt||null,error:payment.error||null}));try{businessBilling=await verifyBusinessBilling(paypal);if(businessBilling.subscriptionApi&&process.env.PAYPAL_AUTO_PROVISION_RETAINER!=='false')businessBilling=await ensureDefaultRetainer(paypal);console.log('ULTRON business billing',JSON.stringify({invoiceApi:Boolean(businessBilling.invoiceApi),subscriptionApi:Boolean(businessBilling.subscriptionApi),planReady:Boolean(businessBilling.planId),planStatus:businessBilling.planStatus||null,lastVerifiedAt:businessBilling.lastVerifiedAt||null}))}catch(e){businessBilling={...(await billingState().catch(()=>({}))),lastError:String(e?.message||e),lastVerifiedAt:new Date().toISOString()};console.error('ULTRON business billing unavailable',String(e?.message||e))}try{const l=await ledger(),orders=Object.values(l?.orders||{}),completed=orders.filter(x=>String(x?.status||'').toUpperCase()==='COMPLETED'||x?.capturedAt),revenue=completed.reduce((s,x)=>s+Number(x?.capturedAmount||x?.amount||0),0);console.log('ULTRON sprint status',JSON.stringify({verifiedRevenueUsd:+revenue.toFixed(2),completedOrders:completed.length,...sprintPace({verifiedRevenueUsd:revenue})}))}catch(e){console.error('ULTRON sprint status unavailable',String(e?.message||e))}if(process.env.AGENT_AUTORUN!=='false'){await agentBurst().catch(console.error);timer=setInterval(()=>agentBurst().catch(console.error),INTERVAL*60000);timer.unref?.()}}
if(process.argv[1]===fileURLToPath(import.meta.url)){createApp().listen(Number(process.env.PORT||3000),'0.0.0.0',()=>{console.log(`ULTRON market listening: ${marketStats().products} products, ${INTERVAL}m cycle, ${WORKLOAD}x workload`);boot();startExecutive(async()=>{const orders=Object.values((await ledger()).orders||{});await executiveBusinessPulse(orders);return orders});startEnterpriseCycle();const reflectAndWork=async()=>{await cinematicCycle().catch(e=>console.error('v43 video task polling unavailable',String(e?.message||e)));await videoLabSafeCycle().catch(e=>console.error('v42 safe draft cycle',String(e?.message||e)));await operationsPulse(Object.values((await ledger()).orders||{}));await dispatchOperationalAlerts().catch(()=>console.error('v41 alert delivery requires owner reconciliation'));await ingestReplies().catch(e=>console.error('v41 scoped mail ingestion',String(e?.message||e)));const s=await introspect({v19:await growthV19State(),legacyLedger:await ledger(),dbHealth:await storeHealth()});await rememberReflection(s);const j=await runSafeJobs(10);await b2bCycle().catch(e=>console.error('v35 campaign tick',String(e?.message||e)));await v36SafeCycle().catch(e=>console.error('v36 growth paths cycle',String(e?.message||e)));await v37Cycle().catch(e=>console.error('v37 evidence audit cycle',String(e?.message||e)));const v34=await runRevenueDirector().catch(e=>{console.error('V34 director cycle failed',String(e?.message||e));return null});if(v34)console.log('V34 director',JSON.stringify({objective:v34.objective,initiated:v34.initiated,verifiedFulfilled:v34.verifiedFulfilled}));console.log('ULTRON reflective controller',JSON.stringify({mode:s.operatingMode,objective:s.objective,allocation:s.decisions.allocation.weights,verifiedCaptures:s.evidence.verifiedCaptureEvents,handledJobs:j.handled,blockers:s.decisions.blockers.length}))};v24Pulse().then(x=>console.log('ULTRON v24 startup',JSON.stringify(x))).catch(e=>console.error('ULTRON v24 startup',String(e?.message||e)));setInterval(()=>v24Pulse().then(x=>console.log('ULTRON v24 hourly',JSON.stringify(x))).catch(e=>console.error('ULTRON v24 hourly',String(e?.message||e))),60*60000).unref();reflectAndWork().catch(e=>console.error('ULTRON v20 start',String(e?.message||e)));setInterval(()=>reflectAndWork().catch(e=>console.error('ULTRON v20 tick',String(e?.message||e))),10*60000).unref();firstSaleV16Dashboard().then(d=>importProspects(d.prospects.filter(x=>x.site).map(x=>({name:x.name,website:x.site,city:'Houston',vertical:'auto detailing',fit:x.fit,source:'EXISTING_V16_CANDIDATE'})),'EXISTING_V16_CANDIDATE')).then(()=>backgroundTick()).then(x=>console.log('ULTRON v19 boot',JSON.stringify(x))).catch(e=>console.error('ULTRON v19 boot failed',String(e?.message||e)));setInterval(()=>backgroundTick().catch(e=>console.error('ULTRON v19 tick',String(e?.message||e))),30*60*1000).unref();startResilienceLoop().then(x=>console.log('ULTRON v31 resilience supervisor',JSON.stringify(x))).catch(e=>console.error('ULTRON v31 supervisor start',String(e?.message||e)));startVerificationLoop(()=>payment).then(x=>console.log('ULTRON v32 verification agent',JSON.stringify(x))).catch(e=>console.error('ULTRON v32 verification boot',String(e?.message||e)));operatorCycle().then(x=>console.log('ULTRON v23 supervisor',JSON.stringify(x))).catch(e=>console.error('ULTRON v23 boot',String(e?.message||e)));setInterval(()=>operatorCycle().catch(e=>console.error('ULTRON v23 tick',String(e?.message||e))),15*60*1000).unref()})}
