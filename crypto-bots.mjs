import {cryptoResearchMission,expansionManifest} from './video-expansion-pack.mjs';
import {cryptoVideoPlan} from './video-master-pack.mjs';
import {strategyExperimentLab,tradePreflight,brainBridgeArchitecture,publicPortfolioResearchPlan,lateNightVideoManifest} from './late-night-video-pack.mjs';
// ULTRON Crypto Intelligence — live public-market research, evidence review and approval-gated hypotheses.
export const CRYPTO_BOT_RULES=Object.freeze({
 mode:'live-market-research',
 liveOrders:false,
 withdrawals:false,
 custody:false,
 instruments:['BTC-USD','ETH-USD','SOL-USD','XRP-USD','ADA-USD','DOGE-USD','AVAX-USD','LINK-USD','DOT-USD','LTC-USD','BCH-USD','XLM-USD','UNI-USD','AAVE-USD','SUI-USD','NEAR-USD','ATOM-USD','FIL-USD'],
 minConfidence:0.65,
 prohibited:['unilateral-real-money-orders','withdrawals','leverage-escalation','borrowed-funds','fabricated-performance','guaranteed-returns']
});
export const CRYPTO_AGENTS=Object.freeze([
 'CryptoMarketDataAgent','CryptoSignalAgent','CryptoMomentumAgent','CryptoVolatilityAgent','CryptoRegimeAgent','CryptoLiquidityAgent',
 'CryptoRelativeStrengthAgent','CryptoMeanReversionAgent','CryptoBreakoutAgent','CryptoMacroAgent','CryptoCatalystAgent','CryptoSentimentAgent',
 'CryptoRiskAgent','CryptoScenarioAgent','CryptoPortfolioResearchAgent','PublicFilingsResearchAgent','StrategyExperimentAgent','TradePreflightAgent','BotExplainabilityAgent','CryptoExecutionProposalAgent','CryptoBacktestAgent','CryptoBenchmarkAgent','CryptoBiasCheckAgent','CryptoAuditAgent','CryptoDriftAgent','CryptoKillSwitchAgent','RSIStrategyAgent','EMACrossoverAgent','OpportunityRankerAgent','PortfolioRiskAgent','ProposalDraftAgent','ExecutionGuardAgent'
]);
const mean=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:0;
const sd=x=>{const m=mean(x);return Math.sqrt(mean(x.map(v=>(v-m)**2)))};
export function analyzePrices(prices=[]){
 const p=prices.map(Number).filter(Number.isFinite);
 if(p.length<24)return {signal:'HOLD',confidence:0,trend:0,momentum:0,volatility:0,breakout:0,meanReversion:0,regime:'insufficient-data',score:0,ensemble:{}};
 const rets=p.slice(1).map((v,i)=>v/p[i]-1),fast=mean(p.slice(-5)),mid=mean(p.slice(-12)),slow=mean(p.slice(-24));
 const trend=p.at(-1)/p[0]-1,momentum=(fast-mid)/mid,volatility=sd(rets),prevHigh=Math.max(...p.slice(-12,-1)),breakout=(p.at(-1)-prevHigh)/prevHigh;
 const z=(p.at(-1)-mid)/(sd(p.slice(-12))||1),meanReversion=-z*volatility,regime=fast>mid&&mid>slow?'uptrend':fast<mid&&mid<slow?'downtrend':'range';
 const ensemble={trend:.35*trend,momentum:.25*momentum,breakout:.20*breakout,meanReversion:.10*meanReversion,volatilityPenalty:-.10*volatility};
 const score=Object.values(ensemble).reduce((a,b)=>a+b,0),confidence=Math.min(.95,Math.max(.05,Math.abs(score)/(volatility+.0001)));
 return {signal:confidence>=CRYPTO_BOT_RULES.minConfidence?(score>0?'BULLISH':'BEARISH'):'NEUTRAL',confidence:+confidence.toFixed(3),trend:+trend.toFixed(6),momentum:+momentum.toFixed(6),volatility:+volatility.toFixed(6),breakout:+breakout.toFixed(6),meanReversion:+meanReversion.toFixed(6),regime,score:+score.toFixed(6),ensemble};
}
export function researchDecision({instrument,prices=[]}={}){
 if(!CRYPTO_BOT_RULES.instruments.includes(instrument))throw Error('instrument not allowed');
 const analysis=analyzePrices(prices),lastPrice=Number(prices?.at?.(-1)||0);
 const evidence=analysis.signal==='NEUTRAL'?['Signal ensemble did not clear confidence threshold.']:[`Regime: ${analysis.regime}`,`Trend score: ${analysis.trend}`,`Momentum: ${analysis.momentum}`,`Volatility: ${analysis.volatility}`];
 return {instrument,lastPrice,analysis,evidence,agents:CRYPTO_AGENTS,videoPlan:cryptoVideoPlan(),expansion:expansionManifest().crypto,lateNightVideoPack:lateNightVideoManifest(),strategyLab:strategyExperimentLab(prices),brainBridge:brainBridgeArchitecture(),publicFilings:publicPortfolioResearchPlan({subject:instrument}),researchMission:cryptoResearchMission({instrument}),mode:'live-market-research',realMoneyAction:{available:false,reason:'Research and experiment outputs never place money. Consequential real-money actions require the separate explicit one-order approval path.'}};
}
export function cryptoCapabilityManifest(){return {agents:CRYPTO_AGENTS,rules:CRYPTO_BOT_RULES,videoPlan:cryptoVideoPlan(),expansion:expansionManifest().crypto,lateNightVideoPack:lateNightVideoManifest(),brainBridge:brainBridgeArchitecture(),publicFilings:publicPortfolioResearchPlan({}),preflightExample:tradePreflight({liquidityScore:.8,slippagePct:.2,topHolderConcentrationPct:10}),researchMission:cryptoResearchMission({})}}
