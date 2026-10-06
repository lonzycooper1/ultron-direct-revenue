// ULTRON crypto opportunity engine.
// Research/ranking/draft layer only. It never submits real-money orders.

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
function ema(values,period){
  const a=values.map(Number).filter(Number.isFinite);
  if(!a.length)return 0;
  const k=2/(period+1);let out=a[0];
  for(let i=1;i<a.length;i++)out=a[i]*k+out*(1-k);
  return out;
}
function rsi(values,period=14){
  const a=values.map(Number).filter(Number.isFinite);
  if(a.length<period+1)return 50;
  let gains=0,losses=0;
  for(let i=a.length-period;i<a.length;i++){
    const d=a[i]-a[i-1];
    if(d>=0)gains+=d; else losses-=d;
  }
  if(losses===0)return 100;
  const rs=(gains/period)/(losses/period||1e-12);
  return 100-(100/(1+rs));
}

export function evaluateStrategies(prices=[]){
  const p=prices.map(Number).filter(Number.isFinite);
  if(p.length<24)return {ready:false,signal:'NEUTRAL',confidence:0,agreement:0,strategies:{}};
  const last=p.at(-1),fast=ema(p,8),slow=ema(p,21),r=rsi(p,14);
  const recent=p.slice(-20),high=Math.max(...recent.slice(0,-1)),low=Math.min(...recent.slice(0,-1));
  const rets=p.slice(1).map((v,i)=>v/p[i]-1),vol=sd(rets);
  const mid=mean(p.slice(-20)),z=(last-mid)/(sd(p.slice(-20))||1);
  const strategies={
    emaCross:fast>slow?1:fast<slow?-1:0,
    rsi:r<35?1:r>65?-1:0,
    breakout:last>high?1:last<low?-1:0,
    meanReversion:z<-1?1:z>1?-1:0,
    momentum:last>p.at(-6)?1:last<p.at(-6)?-1:0
  };
  const votes=Object.values(strategies),sum=votes.reduce((a,b)=>a+b,0),active=votes.filter(Boolean).length;
  const agreement=active?Math.abs(sum)/active:0;
  const direction=sum>0?1:sum<0?-1:0;
  const volatilityPenalty=clamp(vol/0.05,0,1);
  const confidence=clamp((active/5)*0.45+agreement*0.45+(1-volatilityPenalty)*0.10);
  return {
    ready:true,
    signal:direction>0?'BULLISH':direction<0?'BEARISH':'NEUTRAL',
    confidence:+confidence.toFixed(3),
    agreement:+agreement.toFixed(3),
    rsi:+r.toFixed(2),
    emaFast:+fast.toFixed(2),
    emaSlow:+slow.toFixed(2),
    volatility:+vol.toFixed(6),
    zScore:+z.toFixed(3),
    strategies
  };
}

export function rankOpportunities(results=[]){
  return results.filter(x=>!x.error&&x.lastPrice>0).map(x=>{
    const base=Number(x.analysis?.confidence||0);
    const strat=Number(x.strategyPack?.confidence||0);
    const same=x.analysis?.signal===x.strategyPack?.signal&&['BULLISH','BEARISH'].includes(x.analysis?.signal);
    const directional=['BULLISH','BEARISH'].includes(x.analysis?.signal)||['BULLISH','BEARISH'].includes(x.strategyPack?.signal);
    const score=clamp(base*.45+strat*.45+(same?.10:0));
    const direction=same?x.analysis.signal:(base>=strat?x.analysis?.signal:x.strategyPack?.signal);
    return {
      instrument:x.instrument,
      direction:directional?direction:'NEUTRAL',
      score:+score.toFixed(3),
      marketConfidence:+base.toFixed(3),
      strategyConfidence:+strat.toFixed(3),
      agreement:Boolean(same),
      lastPrice:x.lastPrice,
      regime:x.analysis?.regime||'unknown',
      rationale:same?'Research ensemble and strategy pack agree.':'Ranked by the stronger of the research ensemble and strategy pack.'
    };
  }).sort((a,b)=>b.score-a.score);
}

export function buildProposalCandidates(ranked=[],{
  maxOrderUsd=100,
  referenceEquity=1000,
  maxPositionPct=.05,
  minScore=.65
}={}){
  const cap=Math.max(1,Math.min(Number(maxOrderUsd)||100,(Number(referenceEquity)||0)*Math.max(.001,Number(maxPositionPct)||.05)));
  return ranked.filter(x=>x.score>=minScore&&['BULLISH','BEARISH'].includes(x.direction)).slice(0,5).map((x,i)=>({
    id:`candidate-${i+1}-${x.instrument}`,
    instrument:x.instrument,
    side:x.direction==='BULLISH'?'BUY':'SELL',
    referencePrice:x.lastPrice,
    suggestedNotional:+cap.toFixed(2),
    score:x.score,
    rationale:x.rationale,
    status:'READY_FOR_OWNER_REVIEW',
    execution:'NONE',
    ownerApprovalRequired:true,
    note:'Research-generated draft only. A fresh one-order proposal and explicit owner approval are required before exchange submission.'
  }));
}

export function portfolioRiskSummary(candidates=[],{referenceEquity=1000}={}){
  const eq=Math.max(1,Number(referenceEquity)||1000);
  const gross=candidates.reduce((s,x)=>s+Math.max(0,Number(x.suggestedNotional)||0),0);
  const maxSingle=Math.max(0,...candidates.map(x=>Number(x.suggestedNotional)||0));
  const concentration=gross?maxSingle/gross:0;
  const grossPct=gross/eq;
  return {
    referenceEquity:+eq.toFixed(2),
    candidateCount:candidates.length,
    grossDraftExposureUsd:+gross.toFixed(2),
    grossDraftExposurePct:+(grossPct*100).toFixed(2),
    largestDraftUsd:+maxSingle.toFixed(2),
    concentrationPct:+(concentration*100).toFixed(2),
    band:grossPct<=.10?'LOW':grossPct<=.25?'MODERATE':'HIGH',
    note:'Draft exposure only; this is not a live account-balance or holdings read.'
  };
}
