const LEAGUES=Object.freeze([
 {sport:'NBA',path:'basketball/nba'},{sport:'WNBA',path:'basketball/wnba'},
 {sport:'NFL',path:'football/nfl'},{sport:'NCAAF',path:'football/college-football'},
 {sport:'NCAAB',path:'basketball/mens-college-basketball'},{sport:'MLB',path:'baseball/mlb'},
 {sport:'NHL',path:'hockey/nhl'},{sport:'Soccer',path:'soccer/eng.1'}
]);
const cache=new Map();
const TTL=30_000;
const base='https://site.api.espn.com/apis/site/v2/sports';
const now=()=>Date.now();
const n=v=>{if(v===null||v===undefined||v==='')return null;const x=Number(v);return Number.isFinite(x)?x:null};
const txt=v=>String(v??'').trim();
async function cachedJson(url,ttl=TTL){
 const hit=cache.get(url);if(hit&&now()-hit.at<ttl)return hit.value;
 let r;for(let attempt=0;attempt<2;attempt++){r=await fetch(url,{headers:{'user-agent':'ULTRON-Sports-JARVIS/2.1','accept':'application/json'},signal:AbortSignal.timeout(8000),redirect:'error'});if(r.ok||!(r.status===429||r.status>=500)||attempt===1)break;await new Promise(resolve=>setTimeout(resolve,250));}
 if(!r.ok)throw new Error('feed '+r.status);
 const value=await r.json();if(!Array.isArray(value)&&value&&typeof value==='object')value._observedAt=new Date().toISOString();cache.set(url,{at:now(),value});return value;
}
function eventFrom(e,sport,observedAt){
 const c=e.competitions?.[0]||{}, teams=(c.competitors||[]).map(x=>({
  id:txt(x.id),name:txt(x.team?.displayName),abbr:txt(x.team?.abbreviation),homeAway:txt(x.homeAway),
  score:n(x.score),winner:Boolean(x.winner),records:(x.records||[]).map(r=>r.summary).filter(Boolean)
 }));
 return {id:txt(e.id),sport,name:txt(e.name),shortName:txt(e.shortName),date:e.date||null,
  state:txt(e.status?.type?.state),status:txt(e.status?.type?.shortDetail||e.status?.type?.detail),
  period:n(e.status?.period),clock:txt(e.status?.displayClock),teams,
  venue:txt(c.venue?.fullName),broadcasts:(c.broadcasts||[]).flatMap(b=>b.names||[]),
  source:'ESPN public scoreboard',fetchedAt:observedAt||new Date().toISOString()};
}
export async function liveScoreboard(){
 const settled=await Promise.allSettled(LEAGUES.map(async l=>{
  const j=await cachedJson(base+'/'+l.path+'/scoreboard');
  return (j.events||[]).map(e=>eventFrom(e,l.sport,j._observedAt));
 }));
 const events=settled.flatMap(x=>x.status==='fulfilled'?x.value:[]);
 return {ok:settled.some(x=>x.status==='fulfilled'),providerHealth:settled.map((x,i)=>({sport:LEAGUES[i].sport,status:x.status==='fulfilled'?'RESPONDED':'UNAVAILABLE'})),events,providers:{scoreboard:'ESPN public scoreboard',odds:process.env.THE_ODDS_API_KEY?'The Odds API configured':'not configured',prizePicks:'manual/permitted source only'},fetchedAt:new Date().toISOString(),refreshSeconds:30};
}
function playerRows(summary,event){
 const rows=[];
 for(const box of summary.boxscore?.players||[]){
  const team=txt(box.team?.abbreviation||box.team?.displayName);
  for(const statGroup of box.statistics||[]){
   const labels=statGroup.labels||[];
   for(const a of statGroup.athletes||[]){
    const stats=a.stats||[]; const map={};labels.forEach((k,i)=>map[k]=stats[i]);
    rows.push({eventId:event.id,sport:event.sport,team,player:txt(a.athlete?.displayName),playerId:txt(a.athlete?.id),group:txt(statGroup.name),stats:map,active:Boolean(a.active),starter:Boolean(a.starter)});
   }
  }
 }
 return rows;
}
export async function liveEventPlayers(event){
 const league=LEAGUES.find(x=>x.sport===event.sport);if(!league)return [];
 try{const j=await cachedJson(base+'/'+league.path+'/summary?event='+encodeURIComponent(event.id),20_000);return playerRows(j,event)}catch{return []}
}
export function projectionCandidates(players,event){
 const live=event.state==='in';
 const quarter=event.sport==='WNBA'?10:12;const parts=String(event.clock||'').split(':').map(Number);const remaining=parts.length===2&&parts.every(Number.isFinite)?parts[0]+parts[1]/60:null;
 const pct=(event.sport==='NBA'||event.sport==='WNBA')&&remaining!==null?Math.min(.98,Math.max(.08,((event.period||1)-1+(quarter-remaining)/quarter)/4)):
  event.sport==='NHL'&&remaining!==null?Math.min(.98,Math.max(.08,((event.period||1)-1+(20-remaining)/20)/3)):null;
 if(!live||!pct)return [];
 const keys=['PTS','REB','AST','3PT','FG','YDS','CAR','REC','H','R','RBI','G','A','SOG'];
 const out=[];
 for(const p of players){
  for(const [k,v] of Object.entries(p.stats||{})){
   if(!keys.includes(k))continue;const cur=n(String(v).split('-')[0]);if(cur==null||cur<=0)continue;
   const proj=cur/pct;if(!Number.isFinite(proj)||proj>1000)continue;
   out.push({eventId:event.id,sport:event.sport,game:event.shortName,player:p.player,team:p.team,stat:k,current:cur,modelProjection:+proj.toFixed(1),projectionType:'live pace',line:null,direction:'PASS',confidence:null,calibration:'UNCALIBRATED_LIVE_PACE_ESTIMATE',reason:'No verified external prop line is attached; model projection is informational until a line is supplied.',source:'live box score',updatedAt:new Date().toISOString()});
  }
 }
 return out.sort((a,b)=>b.confidence-a.confidence).slice(0,80);
}
async function oddsForSport(sport){
 const key=process.env.THE_ODDS_API_KEY;if(!key)return [];
 const map={NBA:'basketball_nba',WNBA:'basketball_wnba',NFL:'americanfootball_nfl',NCAAF:'americanfootball_ncaaf',NCAAB:'basketball_ncaab',MLB:'baseball_mlb',NHL:'icehockey_nhl'};
 const sk=map[sport];if(!sk)return [];
 try{
  const u='https://api.the-odds-api.com/v4/sports/'+sk+'/odds/?apiKey='+encodeURIComponent(key)+'&regions=us&markets=h2h,spreads,totals&oddsFormat=american';
  const j=await cachedJson(u,60_000);return Array.isArray(j)?j:[];
 }catch{return []}
}
export async function buildLiveBoard({sport='ALL'}={}){
 if(sport!=='ALL'&&!LEAGUES.some(x=>x.sport===sport))throw Error('Invalid sport: feed not supported');
 const score=await liveScoreboard();
 const available=sport==='ALL'?score.ok:score.providerHealth.some(x=>x.sport===sport&&x.status==='RESPONDED');
 let events=score.events.filter(e=>sport==='ALL'||e.sport===sport);
 const focus=events.filter(e=>e.state==='in').slice(0,8);
 const playerSets=await Promise.all(focus.map(e=>liveEventPlayers(e)));
 const projections=focus.flatMap((e,i)=>projectionCandidates(playerSets[i],e));
 const oddsSports=[...new Set(events.map(e=>e.sport))].slice(0,8);
 const odds=(await Promise.all(oddsSports.map(async s=>({sport:s,markets:await oddsForSport(s)})))).filter(x=>x.markets.length);
 return {ok:available,mode:available?'PROVIDER_OBSERVATIONS':'UNAVAILABLE',providerHealth:score.providerHealth,refreshSeconds:30,events,projections,odds,top3:projections.filter(x=>x.direction!=='PASS').sort((a,b)=>b.confidence-a.confidence).slice(0,3),providers:score.providers,updatedAt:new Date().toISOString(),truthNote:'Top picks require a verified comparison line. ULTRON does not label a live-pace estimate as MORE/LESS without one.'};
}
export function mergePropLines(board,lines=[]){
 const clean=(Array.isArray(lines)?lines:[]).filter(x=>x&&x.line!==null&&x.line!==''&&Number.isFinite(Number(x.line)));
 const keyed=new Map(clean.map(x=>[(txt(x.player)+'|'+txt(x.stat)).toLowerCase(),Number(x.line)]));
 const projections=(board.projections||[]).map(p=>{
  const line=keyed.get((p.player+'|'+p.stat).toLowerCase());if(!Number.isFinite(line))return p;
  const diff=p.modelProjection-line, edge=line?diff/line:0;
  const confidence=null;
  const direction=Math.abs(edge)<.04?'PASS':diff>0?'MORE':'LESS';
  return {...p,line,direction,confidence,edgePct:+(edge*100).toFixed(1),reason:direction==='PASS'?'Edge below decision threshold.':'User-supplied line compared with uncalibrated live-pace estimate; line freshness and period are unverified.'};
 });
 return {...board,projections,top3:projections.filter(x=>x.direction!=='PASS').sort((a,b)=>b.confidence-a.confidence||Math.abs(b.edgePct)-Math.abs(a.edgePct)).slice(0,3)};
}
