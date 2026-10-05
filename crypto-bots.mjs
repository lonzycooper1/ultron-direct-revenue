// ULTRON Crypto Bots — autonomous market analysis and paper-trading only.
export const CRYPTO_BOT_RULES=Object.freeze({
 mode:'paper-trading',
 liveOrders:false,
 withdrawals:false,
 custody:false,
 instruments:['BTC-USD','ETH-USD'],
 maxPositionPct:0.10,
 maxTradePct:0.02,
 minConfidence:0.65,
 prohibited:['real-money-orders','withdrawals','leverage','borrowed-funds','fabricated-performance','guaranteed-returns']
});
export const CRYPTO_AGENTS=Object.freeze([
 'CryptoMarketDataAgent','CryptoSignalAgent','CryptoMomentumAgent','CryptoVolatilityAgent',
 'CryptoRiskAgent','CryptoPortfolioAgent','CryptoExecutionSimAgent','CryptoAuditAgent','CryptoKillSwitchAgent'
]);

const mean=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:0;
const sd=x=>{const m=mean(x);return Math.sqrt(mean(x.map(v=>(v-m)**2)))};
export function analyzePrices(prices=[]){
 const p=prices.map(Number).filter(Number.isFinite);
 if(p.length<12)return {signal:'HOLD',confidence:0,trend:0,momentum:0,volatility:0,score:0};
 const rets=p.slice(1).map((v,i)=>v/p[i]-1),fast=mean(p.slice(-5)),slow=mean(p.slice(-12));
 const trend=p.at(-1)/p[0]-1,momentum=(fast-slow)/slow,volatility=sd(rets),score=.55*trend+.35*momentum-.10*volatility;
 const confidence=Math.min(.95,Math.max(.05,Math.abs(score)/(volatility+.0001)));
 return {signal:confidence>=CRYPTO_BOT_RULES.minConfidence?(score>0?'BUY':'SELL'):'HOLD',confidence:+confidence.toFixed(3),trend:+trend.toFixed(6),momentum:+momentum.toFixed(6),volatility:+volatility.toFixed(6),score:+score.toFixed(6)};
}
export function riskGate({signal,confidence,price,equity=10000,positionUsd=0}={}){
 const maxPosition=equity*CRYPTO_BOT_RULES.maxPositionPct,maxTrade=equity*CRYPTO_BOT_RULES.maxTradePct;
 if(!['BUY','SELL'].includes(signal)||confidence<CRYPTO_BOT_RULES.minConfidence)return {approved:false,reason:'signal gate',notional:0};
 if(!(price>0)||!(equity>0))return {approved:false,reason:'invalid market/account state',notional:0};
 if(signal==='BUY'&&positionUsd>=maxPosition)return {approved:false,reason:'position cap',notional:0};
 const room=signal==='BUY'?Math.max(0,maxPosition-positionUsd):Math.max(0,positionUsd);
 const notional=Math.min(maxTrade,room);
 return {approved:notional>=1,reason:notional>=1?'approved':'insufficient room',notional:+notional.toFixed(2)};
}
export function simulateExecution({instrument,signal,price,notional}={}){
 if(!CRYPTO_BOT_RULES.instruments.includes(instrument))throw Error('instrument not allowed');
 if(!['BUY','SELL'].includes(signal))throw Error('invalid signal');
 if(!(price>0)||!(notional>0))throw Error('invalid execution');
 const qty=notional/price,slippageBps=5,fillPrice=signal==='BUY'?price*(1+slippageBps/10000):price*(1-slippageBps/10000);
 return {mode:'paper',instrument,side:signal,notional:+notional.toFixed(2),quantity:+qty.toFixed(8),fillPrice:+fillPrice.toFixed(2),slippageBps,status:'SIMULATED',executedAt:new Date().toISOString()};
}
export function runPaperDecision({instrument,prices,equity=10000,positionUsd=0}={}){
 const analysis=analyzePrices(prices),price=Number(prices?.at?.(-1)||0),risk=riskGate({signal:analysis.signal,confidence:analysis.confidence,price,equity,positionUsd});
 const execution=risk.approved?simulateExecution({instrument,signal:analysis.signal,price,notional:risk.notional}):null;
 return {instrument,analysis,risk,execution,agents:CRYPTO_AGENTS,mode:'paper-trading'};
}
