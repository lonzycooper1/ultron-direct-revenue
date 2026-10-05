import {createServer} from 'node:http';
import {CRYPTO_BOT_RULES,CRYPTO_AGENTS,researchDecision,cryptoCapabilityManifest} from './crypto-bots.mjs';

const PORT=Number(process.env.PORT||3000);
const INTERVAL=Math.max(5,Number(process.env.CRYPTO_BOT_INTERVAL_MINUTES||5));
const state={mode:'live-market-research',cycles:0,lastCycleAt:null,lastResults:[],journal:[],startedAt:new Date().toISOString()};

async function candles(product='BTC-USD',granularity=300){
 const u=new URL('https://api.exchange.coinbase.com/products/'+encodeURIComponent(product)+'/candles');
 u.searchParams.set('granularity',String(granularity));
 const r=await fetch(u,{headers:{'user-agent':'ULTRON-CryptoIntelligence/2.0'}});
 if(!r.ok) throw Error('market data '+r.status);
 const rows=await r.json();
 return rows.slice().sort((a,b)=>a[0]-b[0]).map(x=>Number(x[4])).filter(Number.isFinite);
}
export async function cycle(){
 const results=[];
 for(const instrument of CRYPTO_BOT_RULES.instruments){
   try{results.push(researchDecision({instrument,prices:await candles(instrument)}))}
   catch(e){results.push({instrument,error:String(e?.message||e),mode:'live-market-research'})}
 }
 state.cycles++;state.lastCycleAt=new Date().toISOString();state.lastResults=results;
 state.journal.push({at:state.lastCycleAt,results});if(state.journal.length>500)state.journal.splice(0,state.journal.length-500);
 return results;
}
let timer=setInterval(()=>cycle().catch(()=>{}),INTERVAL*60_000);timer.unref?.();cycle().catch(()=>{});
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data))};
createServer(async(req,res)=>{const u=new URL(req.url,'http://local');try{
 if(u.pathname==='/health')return json(res,200,{ok:true,service:'ULTRON Crypto Intelligence',mode:state.mode,liveMarketData:true,liveOrders:false,approvalGated:true,agents:CRYPTO_AGENTS.length,cycles:state.cycles,lastCycleAt:state.lastCycleAt,intervalMinutes:INTERVAL});
 if(u.pathname==='/agents')return json(res,200,{agents:CRYPTO_AGENTS,flow:'live public market data -> multi-signal analysis -> regime/catalyst/risk review -> evidence-backed hypothesis -> approval-gated external action',capabilities:cryptoCapabilityManifest()});
 if(u.pathname==='/state')return json(res,200,state);
 if(u.pathname==='/cycle'&&req.method==='POST')return json(res,200,{ok:true,results:await cycle(),state});
 if(u.pathname==='/kill'&&req.method==='POST'){clearInterval(timer);timer=null;return json(res,200,{ok:true,killed:true,message:'Continuous market-intelligence cycles stopped.'})}
 return json(res,200,{service:'ULTRON Crypto Intelligence',mode:state.mode,endpoints:['/health','/agents','/state','POST /cycle','POST /kill']});
 }catch(e){return json(res,500,{ok:false,error:String(e?.message||e)})}}).listen(PORT,'0.0.0.0',()=>console.log('ULTRON crypto intelligence listening on',PORT,'mode='+state.mode));
