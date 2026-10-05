const DEFAULT_LIMITS=Object.freeze({maxRiskScore:65,maxAllocationPct:2,maxDailyLossPct:3,minConfidence:0.6});

function clamp(n,min=0,max=1){return Math.max(min,Math.min(max,Number(n)||0))}
function usd(n){return Number((Number(n)||0).toFixed(2))}
function now(){return new Date().toISOString()}

export function normalizeOpportunity(input={}){
 const kind=['revenue','market-research'].includes(input.kind)?input.kind:'revenue';
 return {id:String(input.id||crypto.randomUUID()),kind,title:String(input.title||'Untitled opportunity').slice(0,160),source:String(input.source||'internal').slice(0,80),confidence:clamp(input.confidence),expectedValueUsd:usd(input.expectedValueUsd),riskScore:Math.round(clamp(input.riskScore,0,100)),evidence:Array.isArray(input.evidence)?input.evidence.slice(0,10).map(String):[],createdAt:input.createdAt||now()};
}

export function scoreOpportunity(raw,limits=DEFAULT_LIMITS){
 const x=normalizeOpportunity(raw);let score=x.confidence*60;
 score+=Math.min(25,Math.max(-25,x.expectedValueUsd/100));
 score-=x.riskScore*.25;
 const blocked=x.riskScore>limits.maxRiskScore||x.confidence<limits.minConfidence;
 return {...x,score:Number(score.toFixed(2)),decision:blocked?'REJECT':'REVIEW'};
}

export function riskReview(candidate,{equityUsd=0,dailyPnlPct=0,limits=DEFAULT_LIMITS}={}){
 const c=scoreOpportunity(candidate,limits);
 if(c.decision==='REJECT')return {...c,approved:false,reason:'Opportunity failed confidence/risk threshold'};
 if(Number(dailyPnlPct)<=-Math.abs(limits.maxDailyLossPct))return {...c,approved:false,reason:'Daily loss circuit breaker active'};
 if(c.kind==='market-research'){
  const maxNotional=usd(Math.max(0,Number(equityUsd))*limits.maxAllocationPct/100);
  return {...c,approved:true,executionMode:'SIMULATION_ONLY',maxNotionalUsd:maxNotional,reason:'Approved for research/backtest/paper simulation only; no live trade transmission'};
 }
 return {...c,approved:true,executionMode:'AUTHORIZED_WORKFLOW',reason:'Approved for an existing authorized revenue workflow'};
}

export function buildAgentPlan({opportunities=[],ledgerSnapshot={},marketContext={}}={}){
 const ranked=opportunities.map(x=>scoreOpportunity(x)).sort((a,b)=>b.score-a.score);
 const revenue=ranked.filter(x=>x.kind==='revenue');
 const market=ranked.filter(x=>x.kind==='market-research');
 return {createdAt:now(),commander:{objective:'Prioritize measurable revenue workflows while keeping market activity research-only until separately validated and authorized',queue:ranked.slice(0,20).map(x=>x.id)},revenue:{agent:'RevenueOpportunityAgent',queue:revenue.slice(0,10)},market:{agent:'MarketResearchAgent',queue:market.slice(0,10),mode:'SIMULATION_ONLY',context:marketContext},risk:{agent:'RiskAgent',limits:DEFAULT_LIMITS},analytics:{agent:'PerformanceAgent',ledgerSnapshot},review:{agent:'IndependentReviewerAgent',requiredFor:['external-publishing','financial-commitment','live-trading']}};
}

export function paperTrade({symbol,side='BUY',entry,exit,quantity=1,fees=0}={}){
 const e=Number(entry),x=Number(exit),q=Math.max(0,Number(quantity)||0),f=Math.max(0,Number(fees)||0);
 if(!symbol||!Number.isFinite(e)||!Number.isFinite(x)||e<=0||x<=0||q<=0)throw Error('Invalid paper trade');
 const direction=String(side).toUpperCase()==='SELL'?-1:1;
 const gross=(x-e)*q*direction;const pnl=gross-f;
 return {symbol:String(symbol).toUpperCase().slice(0,20),side:direction===1?'BUY':'SELL',entry:e,exit:x,quantity:q,fees:usd(f),grossPnlUsd:usd(gross),netPnlUsd:usd(pnl),returnPct:Number(((pnl/(e*q))*100).toFixed(4)),mode:'PAPER',executedAt:now()};
}

export function performanceSummary(trades=[]){
 const valid=trades.filter(t=>t&&t.mode==='PAPER'&&Number.isFinite(Number(t.netPnlUsd)));const pnl=valid.reduce((s,t)=>s+Number(t.netPnlUsd),0);const wins=valid.filter(t=>Number(t.netPnlUsd)>0).length;
 return {trades:valid.length,wins,losses:valid.length-wins,winRate:valid.length?Number((wins/valid.length*100).toFixed(2)):0,netPnlUsd:usd(pnl),mode:'PAPER'};
}

export const ORCHESTRATOR_LIMITS=DEFAULT_LIMITS;
