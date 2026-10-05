import {createServer} from 'node:http';
import {CRYPTO_BOT_RULES,CRYPTO_AGENTS,runPaperDecision} from './crypto-bots.mjs';

const PORT=Number(process.env.PORT||3000);
const INTERVAL=Math.max(5,Number(process.env.CRYPTO_BOT_INTERVAL_MINUTES||15));
const START_EQUITY=Math.max(100,Number(process.env.CRYPTO_PAPER_EQUITY||10000));
const state={mode:'paper-trading',equity:START_EQUITY,positions:{'BTC-USD':0,'ETH-USD':0},cycles:0,lastCycleAt:null,lastResults:[],journal:[]};

async function candles(product='BTC-USD',granularity=300){
 const u=new URL('https://api.exchange.coinbase.com/products/'+encodeURIComponent(product)+'/candles');
 u.searchParams.set('granularity',String(granularity));
 const r=await fetch(u,{headers:{'user-agent':'ULTRON-CryptoBot/1.0'}});
 if(!r.ok) throw Error('market data '+r.status);
 const rows=await r.json();
 return rows.slice().sort((a,b)=>a[0]-b[0]).map(x=>Number(x[4])).filter(Number.isFinite);
}
function applyPaper(result){
 const x=result.execution;if(!x)return;
 const signed=x.side==='BUY'?x.notional:-x.notional;
 state.positions[x.instrument]=Math.max(0,(state.positions[x.instrument]||0)+signed);
}
export async function cycle(){
 const results=[];
 for(const instrument of CRYPTO_BOT_RULES.instruments){
   try{
    const prices=await candles(instrument);
    const result=runPaperDecision({instrument,prices,equity:state.equity,positionUsd:state.positions[instrument]||0});
    applyPaper(result); results.push(result);
   }catch(e){results.push({instrument,error:String(e?.message||e),mode:'paper-trading'})}
 }
 state.cycles++;state.lastCycleAt=new Date().toISOString();state.lastResults=results;
 state.journal.push({at:state.lastCycleAt,results});if(state.journal.length>200)state.journal.splice(0,state.journal.length-200);
 return results;
}
let timer=setInterval(()=>cycle().catch(()=>{}),INTERVAL*60_000);timer.unref?.();
cycle().catch(()=>{});

const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(data))};
createServer(async(req,res)=>{
 const u=new URL(req.url,'http://local');
 try{
  if(u.pathname==='/health')return json(res,200,{ok:true,service:'ULTRON Crypto Bots',mode:'paper-trading',liveOrders:false,agents:CRYPTO_AGENTS.length,cycles:state.cycles,lastCycleAt:state.lastCycleAt});
  if(u.pathname==='/agents')return json(res,200,{agents:CRYPTO_AGENTS,flow:'market data -> signal -> momentum -> volatility -> risk -> portfolio -> simulated execution -> audit',rules:CRYPTO_BOT_RULES});
  if(u.pathname==='/state')return json(res,200,state);
  if(u.pathname==='/cycle'&&req.method==='POST')return json(res,200,{ok:true,results:await cycle(),state});
  if(u.pathname==='/kill'&&req.method==='POST'){clearInterval(timer);timer=null;return json(res,200,{ok:true,killed:true,message:'Autonomous paper cycles stopped. No live-order capability exists in this runtime.'})}
  return json(res,200,{service:'ULTRON Crypto Bots',mode:'paper-trading',endpoints:['/health','/agents','/state','POST /cycle','POST /kill']});
 }catch(e){return json(res,500,{ok:false,error:String(e?.message||e)})}
}).listen(PORT,'0.0.0.0',()=>console.log('ULTRON crypto bots listening on',PORT,'mode=paper-trading'));
