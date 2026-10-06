const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const sd=a=>{if(a.length<2)return null;const m=avg(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));};
const implied=o=>o<0?(-o)/((-o)+100):100/(o+100);

export const SPORTS_JARVIS_VERSION='2.0.0';
export const SPORTS=['NFL','NBA','WNBA','MLB','NHL','NCAAF','NCAAB','Soccer','Tennis','MMA','Golf','Esports'];

export const PERSONA=`You are Sports JARVIS 2.0, ULTRON's evidence-first sports analyst. Analyze every projection objectively. Never invent statistics, injuries, odds, line movement, scores, or availability. Separate observed facts from model inference. Use timestamped sources. Evaluate recent and season form, L5/L10/L20, minutes/snaps/usage/opportunity, matchup, opponent strength, pace/game environment, injuries/starting status, home-away and relevant splits, role changes, rest/travel, weather when relevant, blowout/game-script risk, market consensus and no-vig probability, PrizePicks line movement, correlation, volatility and sample quality. Return MORE/LESS only when evidence supports an edge; otherwise PASS. Always expose uncertainty, key risks, projection, edge, probability, confidence and evidence freshness. Never guarantee an outcome.`;

export function analyzeProp(input={}){
  const {sport,player,stat,line,recent=[],sportsbookOdds=null,marketConsensus=null,context={},lineHistory=[]}=input;
  if(!sport||!player||!stat||!Number.isFinite(Number(line))) throw new Error('sport, player, stat and numeric line are required');
  const vals=recent.map(Number).filter(Number.isFinite);
  const target=Number(line);
  const over=vals.filter(x=>x>target).length;
  const under=vals.filter(x=>x<target).length;
  const ties=vals.length-over-under;
  const hitRate=vals.length?over/vals.length:null;
  const mean=avg(vals), volatility=sd(vals);
  const marketProb=Number.isFinite(Number(sportsbookOdds))?implied(Number(sportsbookOdds)):null;
  const consensus=Number.isFinite(Number(marketConsensus))?Number(marketConsensus):null;
  const projection=mean;
  const modelProb=vals.length>=5?clamp(0.5+((mean-target)/(volatility||Math.max(Math.abs(target)*.12,1)))*.18,.05,.95):null;
  const blended=modelProb==null?marketProb==null?null:marketProb:marketProb==null?modelProb:modelProb*.6+marketProb*.4;
  const edge=blended==null?null:blended-.5;
  const direction=blended==null||Math.abs(edge)<.035?'PASS':edge>0?'MORE':'LESS';
  const movement=lineHistory.length>1?Number(lineHistory.at(-1).line)-Number(lineHistory[0].line):0;
  const confidence=blended==null?0:Math.round(clamp(50+Math.abs(blended-.5)*100-(vals.length<10?5:0),50,95));
  return {version:SPORTS_JARVIS_VERSION,sport,player,stat,line:target,direction,projection,modelProbability:blended,confidence,edge,history:{sample:vals.length,over,under,ties,hitRate,mean,volatility},market:{sportsbookOdds,impliedProbability:marketProb,consensusProbability:consensus},lineMovement:{observations:lineHistory.length,delta:movement,history:lineHistory},context,verdict:direction==='PASS'?'PASS — insufficient verified edge':`${direction} — evidence-based lean, not a guarantee`,requiredChecks:['current PrizePicks line','official player/game status','injuries and starters','role/minutes/usage','matchup and opponent strength','pace/game environment','recent + season sample','sportsbook consensus/no-vig','line movement','correlation and payout impact','sport-specific scoring/reboot rules'],risks:['small-sample noise','late injury/news changes','role changes','market movement','outlier performance']};
}

export function rankBoard(props=[]){
  return props.map(analyzeProp).sort((a,b)=>(b.direction==='PASS'?0:b.confidence)-(a.direction==='PASS'?0:a.confidence));
}

export function recordLine(snapshot, history=[]){
  if(!snapshot?.player||!snapshot?.stat||!Number.isFinite(Number(snapshot?.line))) throw new Error('valid line snapshot required');
  return [...history,{...snapshot,line:Number(snapshot.line),observedAt:snapshot.observedAt||new Date().toISOString()}];
}

export const DATA_POLICY={
  prizePicks:'Use user-visible/current PrizePicks data only through permitted sources or user-provided snapshots. Do not bypass authentication, anti-bot controls, or private APIs.',
  truth:'Official league/scoring-provider results override convenience Last-5 displays when they disagree.',
  memory:'Persist timestamped line snapshots, never overwrite history; distinguish OPEN/CURRENT/CLOSE.',
  execution:'Analysis only. Never submit a lineup, wager, deposit, withdraw, or transfer funds.'
};
