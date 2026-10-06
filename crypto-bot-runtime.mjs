import {createServer} from 'node:http';
import crypto from 'node:crypto';
import {CRYPTO_BOT_RULES,CRYPTO_AGENTS,researchDecision,cryptoCapabilityManifest} from './crypto-bots.mjs';
import {LIVE_APPROVAL_RULES,proposeLiveOrder,approveProposal,executionEnvelope} from './crypto-live-approval.mjs';
import {liveExecutionConfig,executeApprovedSpotOrder} from './crypto-exchange.mjs';
import {evaluateStrategies,rankOpportunities,buildProposalCandidates,portfolioRiskSummary} from './crypto-opportunity-engine.mjs';

const PORT=Number(process.env.PORT||3000);
const INTERVAL=Math.max(1,Number(process.env.CRYPTO_BOT_INTERVAL_MINUTES||1));
const APPROVAL_SECRET=String(process.env.CRYPTO_APPROVAL_SECRET||'');
const state={mode:'live-market-research',cycles:0,lastCycleAt:null,lastResults:[],rankedOpportunities:[],proposalCandidates:[],portfolioRisk:null,journal:[],startedAt:new Date().toISOString(),liveExecutionDisabled:false};
const proposals=new Map();

async function candles(product='BTC-USD',granularity=300){
 const u=new URL('https://api.exchange.coinbase.com/products/'+encodeURIComponent(product)+'/candles');
 u.searchParams.set('granularity',String(granularity));
 const r=await fetch(u,{headers:{'user-agent':'ULTRON-CryptoIntelligence/3.0'}});
 if(!r.ok) throw Error('market data '+r.status);
 const rows=await r.json();
 return rows.slice().sort((a,b)=>a[0]-b[0]).map(x=>Number(x[4])).filter(Number.isFinite);
}
export async function cycle(){
 const results=[];
 for(const instrument of CRYPTO_BOT_RULES.instruments){
   try{
     const prices=await candles(instrument);
     const result=researchDecision({instrument,prices});
     result.strategyPack=evaluateStrategies(prices);
     results.push(result);
   }catch(e){results.push({instrument,error:String(e?.message||e),mode:'live-market-research'})}
 }
 const ranked=rankOpportunities(results);
 const referenceEquity=Math.max(1,Number(process.env.CRYPTO_PAPER_EQUITY||1000));
 const candidates=buildProposalCandidates(ranked,{
   maxOrderUsd:LIVE_APPROVAL_RULES.maxOrderUsd,
   referenceEquity,
   maxPositionPct:LIVE_APPROVAL_RULES.maxPositionPct,
   minScore:Math.max(.50,Number(process.env.CRYPTOCOM_MIN_CONFIDENCE||CRYPTO_BOT_RULES.minConfidence))
 });
 state.cycles++;state.lastCycleAt=new Date().toISOString();state.lastResults=results;
 state.rankedOpportunities=ranked;state.proposalCandidates=candidates;
 state.portfolioRisk=portfolioRiskSummary(candidates,{referenceEquity});
 state.journal.push({at:state.lastCycleAt,type:'research-cycle',ranked,candidates,portfolioRisk:state.portfolioRisk});
 if(state.journal.length>500)state.journal.splice(0,state.journal.length-500);
 return results;
}
let timer=setInterval(()=>cycle().catch(()=>{}),INTERVAL*60_000);timer.unref?.();cycle().catch(()=>{});
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data))};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function suppliedKey(req,u){
 const auth=String(req.headers.authorization||'');
 return String(u.searchParams.get('key')||req.headers['x-ultron-approval-key']||(auth.startsWith('Bearer ')?auth.slice(7):''));
}
function authorized(req,u){
 const got=suppliedKey(req,u);
 if(!APPROVAL_SECRET||!got)return false;
 const a=Buffer.from(APPROVAL_SECRET),b=Buffer.from(got);
 return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
async function body(req){let raw='';for await(const ch of req)raw+=ch;try{return JSON.parse(raw||'{}')}catch{throw Error('invalid JSON')}}
function latest(instrument){return state.lastResults.find(x=>x.instrument===instrument&&!x.error)||null}
function prune(){const now=Date.now();for(const [id,p] of proposals){if(p.status==='AWAITING_HUMAN_APPROVAL'&&now>Date.parse(p.expiresAt)+60000)proposals.delete(id)}}
function approvalPage(key){
 const cfg=liveExecutionConfig(), rows=state.lastResults.map(r=>`<tr><td>${esc(r.instrument)}</td><td>${esc(r.lastPrice||'')}</td><td>${esc(r.analysis?.signal||r.error||'')}</td><td>${esc(r.analysis?.confidence||'')}</td></tr>`).join(''), ranked=state.rankedOpportunities.map(r=>`<tr><td>${esc(r.instrument)}</td><td>${esc(r.direction)}</td><td>${esc(r.score)}</td><td>${esc(r.regime)}</td></tr>`).join('');
 return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ULTRON Crypto Approval</title><style>body{font:16px system-ui;background:#090c10;color:#fff;max-width:900px;margin:auto;padding:24px}article{background:#141920;padding:18px;border-radius:14px;margin:12px 0}input,select,button{padding:12px;margin:5px 0;width:100%;box-sizing:border-box}button{font-weight:700}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #333}.ok{color:#7dff8a}.warn{color:#ffd26e}pre{white-space:pre-wrap;overflow:auto}</style><h1>ULTRON Crypto Approval</h1><article><p><b>Mode:</b> live market intelligence + human-approved real spot orders.</p><p class="${cfg.liveTradingEnabled&&cfg.apiConfigured?'ok':'warn'}">API configured: ${cfg.apiConfigured} · live adapter enabled: ${cfg.liveTradingEnabled} · autonomous live orders: ${cfg.autonomousLiveOrders}</p><p>Every live order requires a fresh proposal and this page's explicit approval. No withdrawals. Live execution is spot-only and leverage is fixed at 1.</p></article><article><h2>Latest research</h2><table><tr><th>Market</th><th>Price</th><th>Signal</th><th>Confidence</th></tr>${rows}</table></article><article><h2>Ranked opportunities</h2><table><tr><th>Market</th><th>Direction</th><th>Score</th><th>Regime</th></tr>${ranked}</table><pre>${esc(JSON.stringify({proposalCandidates:state.proposalCandidates,portfolioRisk:state.portfolioRisk},null,2))}</pre></article><article><h2>Create one live-order proposal</h2><form id="f"><label>Instrument<select name="instrument"><option>BTC-USD</option><option>ETH-USD</option></select></label><label>Side<select name="side"><option>BUY</option><option>SELL</option></select></label><label>Order value (USD)<input name="notional" type="number" min="1" max="${LIVE_APPROVAL_RULES.maxOrderUsd}" value="25"></label><label>Account equity for risk cap (USD)<input name="equity" type="number" min="1" value="1000"></label><label>Rationale<input name="rationale" value="Manual approval from ULTRON control"></label><button>Create proposal</button></form><div id="result"></div></article><script>
const key=${JSON.stringify(key)};
const out=document.getElementById('result');
document.getElementById('f').onsubmit=async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));v.notional=Number(v.notional);v.equity=Number(v.equity);const r=await fetch('/api/proposals?key='+encodeURIComponent(key),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(v)});const d=await r.json();if(!r.ok){out.innerHTML='<pre>'+JSON.stringify(d,null,2)+'</pre>';return}out.innerHTML='<h3>Review carefully</h3><pre>'+JSON.stringify(d.proposal,null,2)+'</pre><button id="approve">APPROVE & PLACE THIS ONE REAL-MONEY ORDER</button>';document.getElementById('approve').onclick=async()=>{if(!confirm('This will submit one real-money market order to Crypto.com. Continue?'))return;const x=await fetch('/api/proposals/'+encodeURIComponent(d.proposal.id)+'/approve?key='+encodeURIComponent(key),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({approved:true,confirmation:d.proposal.id})});const y=await x.json();out.innerHTML='<pre>'+JSON.stringify(y,null,2)+'</pre>'}}
</script>`;
}
createServer(async(req,res)=>{const u=new URL(req.url,'http://local');try{
 const cfg=liveExecutionConfig();prune();
 if(u.pathname==='/health')return json(res,200,{ok:true,service:'ULTRON Crypto Intelligence',mode:state.mode,liveMarketData:true,liveOrders:cfg.liveTradingEnabled&&cfg.apiConfigured&&!state.liveExecutionDisabled,approvalGated:true,approvalControlConfigured:Boolean(APPROVAL_SECRET),autonomousLiveOrders:false,agents:CRYPTO_AGENTS.length,cycles:state.cycles,lastCycleAt:state.lastCycleAt,intervalMinutes:INTERVAL,rankedOpportunities:state.rankedOpportunities.length,proposalCandidates:state.proposalCandidates.length});
 if(u.pathname==='/agents')return json(res,200,{agents:CRYPTO_AGENTS,flow:'live public market data -> multi-signal analysis -> proposal -> explicit human approval -> one live spot order',capabilities:cryptoCapabilityManifest(),approvalRules:LIVE_APPROVAL_RULES});
 if(u.pathname==='/state')return json(res,200,{...state,proposals:Array.from(proposals.values()).map(p=>({...p,approvalSecret:undefined})),liveConfig:cfg});
 if(u.pathname==='/api/config')return json(res,200,{ok:true,liveConfig:cfg,approvalRules:LIVE_APPROVAL_RULES,liveExecutionDisabled:state.liveExecutionDisabled});
 if(u.pathname==='/opportunities')return json(res,200,{ok:true,ranked:state.rankedOpportunities,proposalCandidates:state.proposalCandidates,portfolioRisk:state.portfolioRisk,lastCycleAt:state.lastCycleAt});
 if(u.pathname==='/approval'){if(!authorized(req,u))return json(res,401,{error:'approval key required'});res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});return res.end(approvalPage(suppliedKey(req,u)))}
 if(u.pathname==='/api/proposals'&&req.method==='POST'){if(!authorized(req,u))return json(res,401,{error:'approval key required'});if(state.liveExecutionDisabled)return json(res,423,{error:'live execution disabled by kill switch'});const b=await body(req),m=latest(b.instrument);if(!m||!(m.lastPrice>0))return json(res,409,{error:'no fresh market price available'});const p=proposeLiveOrder({instrument:b.instrument,side:String(b.side||'').toUpperCase(),price:m.lastPrice,notional:b.notional,leverage:1,equity:b.equity,dailyPnlPct:Number(b.dailyPnlPct||0),rationale:b.rationale||('Latest signal: '+(m.analysis?.signal||'unknown'))});proposals.set(p.id,p);state.journal.push({at:new Date().toISOString(),type:'live-proposal-created',proposalId:p.id,instrument:p.instrument,side:p.side,notional:p.notional});return json(res,201,{ok:true,proposal:p,execution:'NOT_SUBMITTED_UNTIL_APPROVED'})}
 const approveMatch=/^\/api\/proposals\/([^/]+)\/approve$/.exec(u.pathname);
 if(approveMatch&&req.method==='POST'){if(!authorized(req,u))return json(res,401,{error:'approval key required'});if(state.liveExecutionDisabled)return json(res,423,{error:'live execution disabled by kill switch'});const id=decodeURIComponent(approveMatch[1]),p=proposals.get(id);if(!p)return json(res,404,{error:'proposal not found or expired'});const b=await body(req),a=approveProposal(p,b),env=executionEnvelope(a);try{const execution=await executeApprovedSpotOrder(env);const done={...a,status:'SUBMITTED',execution};proposals.set(id,done);state.journal.push({at:new Date().toISOString(),type:'live-order-submitted',proposalId:id,execution});return json(res,200,{ok:true,proposal:done,execution})}catch(e){const failed={...a,status:'EXECUTION_FAILED',error:String(e?.message||e)};proposals.set(id,failed);state.journal.push({at:new Date().toISOString(),type:'live-order-failed',proposalId:id,error:failed.error});return json(res,502,{ok:false,proposal:failed,error:failed.error})}}
 if(u.pathname==='/cycle'&&req.method==='POST')return json(res,200,{ok:true,results:await cycle(),state});
 if(u.pathname==='/live/disable'&&req.method==='POST'){if(!authorized(req,u))return json(res,401,{error:'approval key required'});state.liveExecutionDisabled=true;return json(res,200,{ok:true,liveExecutionDisabled:true,message:'New live order submissions are disabled until service restart or redeploy.'})}
 if(u.pathname==='/kill'&&req.method==='POST'){if(!authorized(req,u))return json(res,401,{error:'approval key required'});clearInterval(timer);timer=null;state.liveExecutionDisabled=true;return json(res,200,{ok:true,killed:true,message:'Continuous market-intelligence cycles and new live order submissions stopped.'})}
 return json(res,200,{service:'ULTRON Crypto Intelligence',mode:state.mode,endpoints:['/health','/agents','/state','/api/config','/opportunities','/approval?key=...','POST /api/proposals','POST /api/proposals/:id/approve','POST /cycle','POST /live/disable','POST /kill']});
 }catch(e){return json(res,500,{ok:false,error:String(e?.message||e)})}}).listen(PORT,'0.0.0.0',()=>{const cfg=liveExecutionConfig();console.log('ULTRON crypto intelligence listening on',PORT,'mode='+state.mode);console.log('ULTRON live config',JSON.stringify({apiConfigured:cfg.apiConfigured,liveTradingEnabled:cfg.liveTradingEnabled,humanApprovalRequired:cfg.humanApprovalRequired,autonomousLiveOrders:cfg.autonomousLiveOrders,approvalControlConfigured:Boolean(APPROVAL_SECRET),intervalMinutes:INTERVAL,maxOrderUsd:LIVE_APPROVAL_RULES.maxOrderUsd,maxPositionPct:LIVE_APPROVAL_RULES.maxPositionPct,maxDailyLossPct:LIVE_APPROVAL_RULES.maxDailyLossPct}));});
