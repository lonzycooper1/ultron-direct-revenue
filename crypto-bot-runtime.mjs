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

function dashboardPage(){
 return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#05070a"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ULTRON Crypto"><link rel="manifest" href="/manifest.webmanifest">
<title>ULTRON Crypto Signals</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#05070a;color:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif;padding:env(safe-area-inset-top) 16px calc(28px + env(safe-area-inset-bottom));}
.wrap{max-width:720px;margin:auto}.top{display:flex;justify-content:space-between;align-items:center;padding:16px 2px 8px}.brand{font-weight:900;letter-spacing:.12em}.live{font-size:12px;padding:6px 9px;border:1px solid #2a343f;border-radius:999px}.muted{color:#96a0ad}.hero{margin:12px 0;padding:18px;border:1px solid #1d2630;background:#0c1117;border-radius:22px}.hero h1{font-size:30px;margin:0 0 8px}.grid{display:grid;gap:12px}.card{border:1px solid #1d2630;background:#0c1117;border-radius:22px;padding:18px}.row{display:flex;justify-content:space-between;gap:12px;align-items:center}.coin{font-size:21px;font-weight:800}.action{font-size:30px;font-weight:950;letter-spacing:.03em}.BUY{color:#55e58a}.SELL{color:#ff6b74}.HOLD{color:#ffd166}.meter{height:9px;background:#1b2530;border-radius:99px;overflow:hidden;margin:11px 0}.fill{height:100%;background:linear-gradient(90deg,#5bc0ff,#82ffad);border-radius:99px}.small{font-size:13px}.facts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}.fact{background:#111923;padding:10px;border-radius:13px}.btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}button,a.btn{border:0;border-radius:15px;padding:14px 12px;font-weight:800;text-align:center;text-decoration:none;background:#eaf2ff;color:#06111e}button.secondary,a.secondary{background:#151e28;color:#eaf2ff;border:1px solid #2b3744}.install{display:none;margin:12px 0;padding:14px;border-radius:16px;background:#101820;border:1px solid #263442}.footer{font-size:12px;color:#7e8997;margin-top:16px;line-height:1.5}.empty{padding:30px;text-align:center;color:#8f9aa7;border:1px dashed #26313e;border-radius:18px}
</style></head><body><main class="wrap">
<div class="top"><div class="brand">ULTRON CRYPTO</div><div id="live" class="live">CONNECTING</div></div>
<section class="hero"><h1>Live Trade Signals</h1><div class="muted">BUY / SELL / HOLD ranked by ULTRON's live research stack. Real-money orders still require your explicit approval.</div></section>
<div id="install" class="install"><b>Add ULTRON to your iPhone:</b><br>Tap Safari's Share button → <b>Add to Home Screen</b> → Add.</div>
<div class="btns"><button id="alerts">Enable on-screen alerts</button><button class="secondary" id="refresh">Refresh now</button></div>
<div id="cards" class="grid"><div class="empty">Loading live market signals…</div></div>
<div class="footer"><span id="updated">Waiting for first update…</span><br>Dashboard refreshes every 20 seconds. Browser alerts work while this app is open. Strong-signal ChatGPT alerts are configured separately.</div>
</main>
<script>
const cards=document.getElementById('cards'),updated=document.getElementById('updated'),live=document.getElementById('live');
const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent), standalone=window.navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;
if(ios&&!standalone)document.getElementById('install').style.display='block';
let previous={};
function actionOf(x){if(!x||!['BULLISH','BEARISH'].includes(x.direction)||Number(x.score)<0.65)return 'HOLD';return x.direction==='BULLISH'?'BUY':'SELL'}
function money(n){return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2})}
function pct(n){return Math.round(Number(n||0)*100)}
function maybeNotify(x,a){
 if(Notification.permission!=='granted'||a==='HOLD')return;
 const old=previous[x.instrument]; if(old===a)return;
 new Notification('ULTRON '+a+' signal',{body:x.instrument+' · '+pct(x.score)+'% confidence · {const u=new URL(req.url,'http://local');try{
 const cfg=liveExecutionConfig();prune();
 if(u.pathname==='/dashboard'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(dashboardPage())}
 if(u.pathname==='/manifest.webmanifest'){res.writeHead(200,{'content-type':'application/manifest+json','cache-control':'public,max-age=300'});return res.end(JSON.stringify(manifest()))}
 if(u.pathname==='/sw.js'){res.writeHead(200,{'content-type':'application/javascript; charset=utf-8','cache-control':'no-cache','service-worker-allowed':'/'});return res.end(serviceWorker())}
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
 return json(res,200,{service:'ULTRON Crypto Intelligence',mode:state.mode,endpoints:['/dashboard','/health','/agents','/state','/api/config','/opportunities','/approval?key=...','POST /api/proposals','POST /api/proposals/:id/approve','POST /cycle','POST /live/disable','POST /kill']});
 }catch(e){return json(res,500,{ok:false,error:String(e?.message||e)})}}).listen(PORT,'0.0.0.0',()=>{const cfg=liveExecutionConfig();console.log('ULTRON crypto intelligence listening on',PORT,'mode='+state.mode);console.log('ULTRON live config',JSON.stringify({apiConfigured:cfg.apiConfigured,liveTradingEnabled:cfg.liveTradingEnabled,humanApprovalRequired:cfg.humanApprovalRequired,autonomousLiveOrders:cfg.autonomousLiveOrders,approvalControlConfigured:Boolean(APPROVAL_SECRET),intervalMinutes:INTERVAL,maxOrderUsd:LIVE_APPROVAL_RULES.maxOrderUsd,maxPositionPct:LIVE_APPROVAL_RULES.maxPositionPct,maxDailyLossPct:LIVE_APPROVAL_RULES.maxDailyLossPct}));});
+money(x.lastPrice)});
}
async function load(){
 try{
  const r=await fetch('/opportunities',{cache:'no-store'}); if(!r.ok)throw Error('HTTP '+r.status);
  const d=await r.json(), ranked=Array.isArray(d.ranked)?d.ranked:[];
  live.textContent='LIVE';live.style.color='#55e58a';
  cards.innerHTML=ranked.length?'':'<div class="empty">No ranked opportunities yet. ULTRON is still scanning.</div>';
  ranked.forEach(x=>{
   const a=actionOf(x); maybeNotify(x,a); previous[x.instrument]=a;
   const div=document.createElement('section');div.className='card';
   div.innerHTML='<div class="row"><div><div class="coin">'+x.instrument+'</div><div class="muted small">'+(x.regime||'unknown')+' regime</div></div><div class="action '+a+'">'+a+'</div></div>'+
    '<div class="meter"><div class="fill" style="width:'+Math.min(100,pct(x.score))+'%"></div></div>'+
    '<div class="row"><b>'+pct(x.score)+'% confidence</b><b>{const u=new URL(req.url,'http://local');try{
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
+money(x.lastPrice)+'</b></div>'+
    '<div class="facts"><div class="fact"><span class="muted small">Market model</span><br><b>'+pct(x.marketConfidence)+'%</b></div><div class="fact"><span class="muted small">Strategy model</span><br><b>'+pct(x.strategyConfidence)+'%</b></div><div class="fact"><span class="muted small">Agreement</span><br><b>'+(x.agreement?'YES':'MIXED')+'</b></div><div class="fact"><span class="muted small">Direction</span><br><b>'+(x.direction||'NEUTRAL')+'</b></div></div>'+
    '<p class="small muted">'+(x.rationale||'')+'</p>';
   cards.appendChild(div);
  });
  updated.textContent='Last ULTRON cycle: '+(d.lastCycleAt?new Date(d.lastCycleAt).toLocaleString():'not available');
 }catch(e){live.textContent='RETRYING';live.style.color='#ffd166';updated.textContent='Signal refresh error: '+e.message}
}
document.getElementById('refresh').onclick=load;
document.getElementById('alerts').onclick=async()=>{if(!('Notification'in window)){alert('Notifications are not supported in this browser view.');return}const p=await Notification.requestPermission();document.getElementById('alerts').textContent=p==='granted'?'Alerts enabled':'Alerts not enabled'};
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
load();setInterval(load,20000);
</script></body></html>`;
}
function manifest(){
 return {name:'ULTRON Crypto Signals',short_name:'ULTRON Crypto',start_url:'/dashboard',display:'standalone',background_color:'#05070a',theme_color:'#05070a',description:'ULTRON live crypto BUY / SELL / HOLD signal dashboard'};
}
function serviceWorker(){
 return "const CACHE='ultron-crypto-v1';self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/dashboard'])));self.skipWaiting()});self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))})";
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
