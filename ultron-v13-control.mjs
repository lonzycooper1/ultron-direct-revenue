import {getJson,mutateJson} from './state-store.mjs';
import {ledger} from './ledger-store.mjs';
import {scoreLoanReadiness,buildCapitalPacket,debtCapacity} from './ultron-loan-readiness-v13.mjs';

export const V13_VERSION='13.1.0';
const KEY='ultron-v13-control';
const now=()=>new Date().toISOString();
const uid=p=>p+'_'+crypto.randomUUID();
const money=n=>Math.round((Number(n)||0)*100)/100;
const initial=()=>({
 version:V13_VERSION,updatedAt:null,
 paper:{startingCash:10000,cash:10000,positions:{},fills:[],journal:[],equityHistory:[{at:now(),equity:10000}],benchmark:{symbol:'SPY',start:null,current:null}},
 prospects:{},audits:{},projects:{},subscriptions:{},experiments:{},approvals:{},evidence:[],
 offers:{
  'lead-conversion-upgrade':{name:'Website + Lead Conversion Upgrade',price:1500,scope:['conversion audit','CTA/lead capture rebuild','booking-path optimization','analytics validation'],checklist:['baseline captured','changes reviewed','QA complete','measurement active'],outcome:'reduce measurable lead/booking friction'},
  'booking-automation':{name:'Booking Automation',price:750,scope:['booking-flow audit','automation design','reminder/recovery workflow'],checklist:['booking source verified','workflow tested','owner approval before messaging'],outcome:'reduce abandoned booking opportunities'},
  'ai-receptionist':{name:'AI Receptionist / Lead Response Workflow',price:2500,scope:['lead intake','routing','response drafting','handoff rules'],checklist:['channels mapped','escalation rules tested','approval policy active'],outcome:'shorten response time'},
  'follow-up-automation':{name:'Follow-up Automation',price:1000,scope:['pipeline stages','follow-up logic','CRM tracking'],checklist:['consent/compliance checked','messages approval-gated','conversion tracked'],outcome:'improve qualified follow-up coverage'},
  'monthly-optimization':{name:'Monthly Optimization',price:1500,recurring:true,scope:['monitoring','conversion review','one controlled improvement cycle','reporting'],checklist:['monthly baseline','experiment selected','results reviewed'],outcome:'continuous evidence-based optimization'}
 },
 settings:{highImpactApproval:true,ownerOnlyMutations:true}
});
async function state(){return getJson(KEY,initial())}
async function mutate(fn){return mutateJson(KEY,initial(),s=>{s.version=V13_VERSION;s.updatedAt=now();return fn(s)})}
function addEvidence(s,type,ref,status,detail={}){const e={id:uid('evd'),type,ref,status,at:now(),detail};s.evidence.push(e);if(s.evidence.length>2000)s.evidence.splice(0,s.evidence.length-2000);return e}
function paperMetrics(p){
 const positions=Object.values(p.positions||{});
 const marketValue=positions.reduce((a,x)=>a+Number(x.qty||0)*Number(x.mark||x.avgPrice||0),0);
 const equity=money(Number(p.cash||0)+marketValue);
 const realized=money((p.fills||[]).reduce((a,f)=>a+Number(f.realizedPnl||0),0));
 const unrealized=money(positions.reduce((a,x)=>a+(Number(x.mark||x.avgPrice||0)-Number(x.avgPrice||0))*Number(x.qty||0),0));
 const closed=(p.fills||[]).filter(x=>Number.isFinite(Number(x.realizedPnl))&&Number(x.realizedPnl)!==0);
 const wins=closed.filter(x=>Number(x.realizedPnl)>0).length;
 let peak=-Infinity,maxDd=0;for(const h of p.equityHistory||[]){peak=Math.max(peak,Number(h.equity||0));if(peak>0)maxDd=Math.max(maxDd,(peak-Number(h.equity||0))/peak)}
 const b=p.benchmark||{},benchReturn=(Number.isFinite(Number(b.start))&&Number.isFinite(Number(b.current))&&Number(b.start)!==0)?money((Number(b.current)/Number(b.start)-1)*100):null;
 return {cash:money(p.cash),marketValue,equity,realizedPnl:realized,unrealizedPnl:unrealized,totalPnl:money(equity-p.startingCash),returnPct:money((equity/p.startingCash-1)*100),maxDrawdownPct:money(maxDd*100),winRatePct:closed.length?money(wins/closed.length*100):null,closedTrades:closed.length,benchmark:{symbol:b.symbol||'SPY',returnPct:benchReturn,alphaPct:benchReturn==null?null:money((equity/p.startingCash-1)*100-benchReturn)}};
}
export async function paperTradingState(){const s=await state();return {...s.paper,metrics:paperMetrics(s.paper),mode:'SIMULATED_ONLY'}}
export async function markPaperPrices({prices={},benchmarkPrice=null}={}){
 return mutate(s=>{for(const [symbol,price] of Object.entries(prices||{})){const p=s.paper.positions[symbol.toUpperCase()];if(p&&Number(price)>0)p.mark=Number(price)}
 if(Number(benchmarkPrice)>0){if(!s.paper.benchmark.start)s.paper.benchmark.start=Number(benchmarkPrice);s.paper.benchmark.current=Number(benchmarkPrice)}
 const m=paperMetrics(s.paper);s.paper.equityHistory.push({at:now(),equity:m.equity});if(s.paper.equityHistory.length>5000)s.paper.equityHistory.shift();addEvidence(s,'paper_mark','portfolio','SIMULATION',m);return m})}
export async function executePaperOrder(input={}){
 const side=String(input.side||'').toUpperCase(),symbol=String(input.symbol||'').toUpperCase(),qty=Number(input.qty),price=Number(input.price);
 if(!['BUY','SELL'].includes(side)||!symbol||!(qty>0)||!(price>0))throw Error('valid simulated side, symbol, qty and price required');
 return mutate(s=>{const p=s.paper,pos=s.paper.positions[symbol]||{symbol,qty:0,avgPrice:0,mark:price};let realized=0;
  if(side==='BUY'){const cost=money(qty*price);if(cost>p.cash)throw Error('insufficient simulated cash');const newQty=pos.qty+qty;pos.avgPrice=((pos.qty*pos.avgPrice)+(qty*price))/newQty;pos.qty=newQty;p.cash=money(p.cash-cost)}
  else {if(qty>pos.qty)throw Error('cannot sell more than simulated position');realized=money((price-pos.avgPrice)*qty);pos.qty-=qty;p.cash=money(p.cash+qty*price);if(pos.qty===0)pos.avgPrice=0}
  pos.mark=price;if(pos.qty===0)delete p.positions[symbol];else p.positions[symbol]=pos;
  const fill={id:uid('fill'),mode:'SIMULATION',side,symbol,qty,price,realizedPnl:realized,at:now(),note:String(input.note||'')};p.fills.push(fill);p.journal.push({...fill,rationale:String(input.rationale||''),source:String(input.source||'owner/private cycle')});
  const m=paperMetrics(p);p.equityHistory.push({at:now(),equity:m.equity});addEvidence(s,'paper_fill',fill.id,'SIMULATION',{symbol,side,qty,price});return {fill,metrics:m}})}
export async function upsertProspect(input={}){
 const name=String(input.name||'').trim();if(!name)throw Error('prospect name required');return mutate(s=>{const id=String(input.id||name.toLowerCase().replace(/[^a-z0-9]+/g,'-')).slice(0,80);
 const x=s.prospects[id]||{id,createdAt:now()};Object.assign(x,{name,website:input.website||x.website||null,contactPage:input.contactPage||x.contactPage||null,bookingTool:input.bookingTool||x.bookingTool||null,city:input.city||x.city||null,problem:input.problem||x.problem||null,discoveryQuestion:input.discoveryQuestion||x.discoveryQuestion||null,proposedService:input.proposedService||x.proposedService||null,followupStatus:input.followupStatus||x.followupStatus||'NOT_CONTACTED',opportunityScore:Number.isFinite(Number(input.opportunityScore))?Number(input.opportunityScore):(x.opportunityScore??null),updatedAt:now()});s.prospects[id]=x;addEvidence(s,'prospect',id,'DRAFT',{source:input.source||'research'});return x})}
export async function listProspects(){const s=await state();return Object.values(s.prospects).sort((a,b)=>(b.opportunityScore||0)-(a.opportunityScore||0))}
export async function createWebsiteAudit(input={}){
 const prospectId=String(input.prospectId||'');if(!prospectId)throw Error('prospectId required');return mutate(s=>{const p=s.prospects[prospectId];if(!p)throw Error('prospect not found');
 const checks=['mobileUX','pageSpeed','bookingFriction','ctaQuality','leadCapture','followup','seoBasics'];const findings={};for(const c of checks)findings[c]=input.findings?.[c]??'INSUFFICIENT_EVIDENCE';
 const score=checks.reduce((a,c)=>a+(typeof findings[c]==='object'&&Number.isFinite(Number(findings[c].score))?Number(findings[c].score):0),0);
 const id=uid('audit');const audit={id,prospectId,website:p.website,findings,score,summary:String(input.summary||''),proposal:{service:input.proposedService||p.proposedService||'lead-conversion-upgrade',status:'DRAFT',measurableOutcome:input.measurableOutcome||'Establish baseline and improve verified conversion friction points'},createdAt:now()};s.audits[id]=audit;addEvidence(s,'website_audit',id,'DRAFT',{prospectId});return audit})}
export async function commandCenter(){
 const s=await state(),l=await ledger(),orders=Object.values(l.orders||{});
 const paid=orders.filter(o=>o.capturedAt||String(o.status||'').toUpperCase()==='COMPLETED');
 const settled=paid.filter(o=>o.settledAt),deposited=paid.filter(o=>o.bankDepositedAt),refunds=orders.filter(o=>/REFUND/i.test(String(o.status||'')));
 return {generatedAt:now(),pipeline:{visitors:'INSUFFICIENT_EVIDENCE',leads:Object.keys(s.prospects).length,qualifiedLeads:Object.values(s.prospects).filter(x=>(x.opportunityScore||0)>=70).length,proposals:Object.values(s.audits).filter(x=>x.proposal).length,checkouts:orders.length,verifiedPayments:paid.length,fulfillment:paid.filter(o=>o.fulfillment).length,refunds:refunds.length,settled:settled.length,bankDeposits:deposited.length},money:{verifiedPaidUsd:money(paid.reduce((a,o)=>a+Number(o.capturedAmount||o.amount||0),0)),settledUsd:money(settled.reduce((a,o)=>a+Number(o.capturedAmount||o.amount||0),0)),bankDepositedUsd:money(deposited.reduce((a,o)=>a+Number(o.capturedAmount||o.amount||0),0))},truth:{simulationsExcluded:true,pendingExcluded:true,checkoutIsNotRevenue:true,bankDepositRequiresEvidence:true}}}
export async function customerPortal(token=''){
 const l=await ledger(),o=Object.values(l.orders||{}).find(x=>x?.fulfillment?.token===token);if(!o)return null;
 return {orderId:o.id,status:o.status,product:o.name||o.product,verifiedPayment:Boolean(o.capturedAt||o.captureId),paidAt:o.capturedAt||null,fulfillment:o.fulfillment?{title:o.fulfillment.title,summary:o.fulfillment.summary,createdAt:o.fulfillment.createdAt}:null,settlement:o.settledAt?{status:'SETTLED',at:o.settledAt}:{status:'INSUFFICIENT_EVIDENCE'},bankDeposit:o.bankDepositedAt?{status:'BANK_DEPOSITED',at:o.bankDepositedAt}:{status:'INSUFFICIENT_EVIDENCE'}}}
export async function offerCatalog(){const s=await state();return s.offers}
export async function createSubscriptionCandidate({customerId,offerId='monthly-optimization',sourceOrderId=null}={}){
 return mutate(s=>{if(!customerId)throw Error('customerId required');const id=uid('sub');s.subscriptions[id]={id,customerId,offerId,sourceOrderId,status:'PROPOSED_NOT_BILLED',createdAt:now()};addEvidence(s,'subscription_candidate',id,'DRAFT',{});return s.subscriptions[id]})}
export async function recordEvidence({type,ref,status,detail={}}={}){return mutate(s=>addEvidence(s,String(type||'event'),String(ref||uid('ref')),String(status||'DRAFT'),detail))}
export async function revenueReconciliation(){
 const l=await ledger(),orders=Object.values(l.orders||{});return orders.map(o=>({orderId:o.id,checkout:true,verifiedPayment:Boolean(o.capturedAt||o.captureId),invoice:Boolean(o.invoiceId),fulfilled:Boolean(o.fulfillment),settled:Boolean(o.settledAt),bankDeposited:Boolean(o.bankDepositedAt),amount:money(o.capturedAmount||o.amount),status: o.bankDepositedAt?'BANK_DEPOSITED':o.settledAt?'SETTLED':o.fulfillment?'FULFILLED':(o.capturedAt||o.captureId)?'PAID':'PENDING'}))}
export async function costProfitIntelligence({adSpend=0,deliveryCost=0,activeCustomers=0,churnedCustomers=0}={}){
 const c=await commandCenter(),rev=c.money.verifiedPaidUsd,paid=c.pipeline.verifiedPayments,cac=paid?money(Number(adSpend)/paid):null,gross=money(rev-Number(deliveryCost)),contribution=money(gross-Number(adSpend)),churn=(activeCustomers+churnedCustomers)>0?money(churnedCustomers/(activeCustomers+churnedCustomers)*100):null;
 return {verifiedRevenue:rev,customerAcquisitionCost:cac,grossMarginPct:rev?money(gross/rev*100):null,contributionMarginPct:rev?money(contribution/rev*100):null,churnPct:churn,lifetimeValue:'INSUFFICIENT_EVIDENCE',paybackPeriod:'INSUFFICIENT_EVIDENCE'}}
export async function createExperiment(input={}){
 return mutate(s=>{const id=uid('exp');s.experiments[id]={id,name:String(input.name||'Unnamed experiment'),hypothesis:String(input.hypothesis||''),metric:String(input.metric||'verified_conversion'),status:'ACTIVE',baseline:input.baseline??null,variant:input.variant??null,createdAt:now(),results:[]};addEvidence(s,'experiment',id,'EXECUTED',{lowRisk:true});return s.experiments[id]})}
export async function recordExperimentResult(id,result={}){
 return mutate(s=>{const e=s.experiments[id];if(!e)throw Error('experiment not found');e.results.push({...result,at:now()});if(result.complete)e.status='COMPLETE';return e})}
export async function requestApproval(action,detail={}){
 return mutate(s=>{const id=uid('apr');s.approvals[id]={id,action:String(action),detail,status:'PENDING',createdAt:now()};addEvidence(s,'approval',id,'DRAFT',{action});return s.approvals[id]})}
export async function decideV13Approval(id,decision,note=''){
 const d=String(decision||'').toUpperCase();if(!['APPROVED','REJECTED'].includes(d))throw Error('decision must be APPROVED or REJECTED');return mutate(s=>{const a=s.approvals[id];if(!a)throw Error('approval not found');a.status=d;a.note=String(note||'');a.decidedAt=now();addEvidence(s,'approval',id,d,{note});return a})}
export async function ceoObjectiveEngine(){
 const c=await commandCenter(),s=await state();const candidates=[
  {area:'prospecting',score:c.pipeline.qualifiedLeads<10?95:60,action:'Research and qualify additional prospects'},
  {area:'conversion',score:c.pipeline.proposals<c.pipeline.qualifiedLeads?90:55,action:'Generate evidence-backed audits/proposals'},
  {area:'fulfillment',score:c.pipeline.verifiedPayments>c.pipeline.fulfillment?100:40,action:'Complete paid fulfillment and QA'},
  {area:'retention',score:c.pipeline.fulfillment>0?75:30,action:'Prepare recurring optimization offer'},
  {area:'financeability',score:c.pipeline.bankDeposits===0?80:65,action:'Reconcile verified revenue and evidence'}
 ].sort((a,b)=>b.score-a.score);return {generatedAt:now(),objective:'maximize verified, fulfilled, reconciled revenue while preserving approval gates',next:candidates[0],ranked:candidates,pendingApprovals:Object.values(s.approvals).filter(x=>x.status==='PENDING').length}}
export async function lenderDashboard(input={}){
 const readiness=scoreLoanReadiness({completed:input.completed||[]}),capital=buildCapitalPacket(input),capacity=debtCapacity(input);
 const c=await commandCenter();return {readiness,capital,capacity,verifiedOperatingEvidence:{revenue:c.money.verifiedPaidUsd,settled:c.money.settledUsd,bankDeposited:c.money.bankDepositedUsd},rule:'Missing evidence is reported as insufficient evidence; no lender approval is implied.'}}
export function projections({startingMonthlyRevenue=0,monthlyGrowthPct=0,grossMarginPct=70,fixedMonthlyCost=0,fundingAmount=0,newMonthlyDebtService=0}={}){
 const build=(growthAdj)=>{let r=Number(startingMonthlyRevenue||0),cash=Number(fundingAmount||0),months=[];for(let m=1;m<=12;m++){r*=1+(Number(monthlyGrowthPct||0)+growthAdj)/100;const gross=r*Number(grossMarginPct||0)/100,net=gross-Number(fixedMonthlyCost||0)-Number(newMonthlyDebtService||0);cash+=net;months.push({month:m,revenue:money(r),grossProfit:money(gross),netCashFlow:money(net),endingCash:money(cash)})}return months};
 const base=build(0),downside=build(-Math.abs(Number(monthlyGrowthPct||0))*0.5-2),upside=build(Math.abs(Number(monthlyGrowthPct||0))*0.5+2);
 const annual=arr=>money(arr.reduce((a,x)=>a+x.revenue,0));return {base,downside,upside,threeYear:{year1:annual(base),year2:money(annual(base)*Math.pow(1+Number(monthlyGrowthPct||0)/100,12)),year3:money(annual(base)*Math.pow(1+Number(monthlyGrowthPct||0)/100,24))},breakEvenMonthlyRevenue:Number(grossMarginPct)>0?money((Number(fixedMonthlyCost||0)+Number(newMonthlyDebtService||0))/(Number(grossMarginPct)/100)):null,assumptionWarning:'Scenario model only; not a guarantee or lender forecast.'}}
export function sportsCommercialStatus(){
 const configured=Boolean(process.env.SPORTS_DATA_API_KEY&&process.env.SPORTS_DATA_BASE_URL);return {status:configured?'CONFIGURED':'EXTERNAL_CREDENTIAL_REQUIRED',provider:process.env.SPORTS_DATA_PROVIDER||null,licensedFeedConfigured:configured,features:{odds:configured||Boolean(process.env.THE_ODDS_API_KEY),injuries:configured,lineMovement:configured,schedules:configured,playerProps:configured,probabilityModel:true,expectedValueModel:true,confidenceCalibration:true,backtestingFramework:true,historicalScoring:true},truth:'Public scoreboard data is not represented as a licensed commercial feed.'}}
export function securityAndOpsManifest(){return {observability:{railwayTracing:true,healthcheck:'/health',deploymentTests:'npm test',errorMetrics:true},rollback:{healthGate:true,preDeployTests:true,automaticProviderRollback:false,reason:'Railway connector exposes redeploy/rollback actions but no autonomous rollback policy switch'},staging:{codeReviewBranch:true,railwayEnvironment:false,reason:'No environment-creation action is available through the connected Railway tool'},memory:{backend:'Postgres',persistent:true},security:{leastPrivilege:'application routes gated by owner token where mutated',requestSigning:'payment webhooks verified by provider',rateLimits:'respect upstream/provider limits',killSwitches:'existing autonomy emergency stop + approval gateway'},backup:{databasePersistent:true,offsiteBackupTarget:'NOT_CONFIGURED'} ,domain:{customDomain:'NOT_CONFIGURED'},brandedEmail:{status:'NOT_CONFIGURED'}}}
export async function v13Dashboard(){
 const s=await state(),[paper,revenue,ceo,recon]=await Promise.all([paperTradingState(),commandCenter(),ceoObjectiveEngine(),revenueReconciliation()]);
 return {version:V13_VERSION,generatedAt:now(),paper:{metrics:paper.metrics,positions:paper.positions},sports:sportsCommercialStatus(),revenue,crm:{prospects:Object.keys(s.prospects).length,audits:Object.keys(s.audits).length},offers:s.offers,subscriptions:Object.values(s.subscriptions),experiments:Object.values(s.experiments),approvals:Object.values(s.approvals).filter(x=>x.status==='PENDING'),ceo,reconciliation:recon,ops:securityAndOpsManifest(),evidence:s.evidence.slice(-50).reverse(),statusLegend:{DRAFT:'not executed',SIMULATION:'no real money',APPROVED:'owner approved',EXECUTED:'action executed',PAID:'verified payment',FULFILLED:'delivery complete',SETTLED:'processor settlement evidenced',BANK_DEPOSITED:'bank deposit evidenced'}}}
