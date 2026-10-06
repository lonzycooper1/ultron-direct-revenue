import { recordLine } from './sports-jarvis.mjs';

export const PRIZEPICKS_PUBLIC_SOURCES = Object.freeze({
  home: 'https://www.prizepicks.com/',
  waysToPick: 'https://www.prizepicks.com/ways-to-pick',
  nfl: 'https://www.prizepicks.com/nfl'
});

export const FEED_POLICY = Object.freeze({
  access: 'public-only',
  authentication: false,
  bypassAntiBot: false,
  submitLineups: false,
  financialActions: false,
  sourceOfTruth: 'PrizePicks public pages for observed projections; official league/scoring sources for settled statistics',
  staleRule: 'Never label cached/search-indexed content live. Every observation carries observedAt and source URL.'
});

export function normalizePublicProjection(p={}) {
  const line = Number(p.line);
  if (!p.player || !p.stat || !Number.isFinite(line)) throw new Error('player, stat and numeric line required');
  return {
    provider: 'PrizePicks',
    access: 'public-web',
    sport: p.sport || null,
    player: String(p.player).trim(),
    team: p.team || null,
    opponent: p.opponent || null,
    stat: String(p.stat).trim(),
    line,
    gameTime: p.gameTime || null,
    observedAt: p.observedAt || new Date().toISOString(),
    sourceUrl: p.sourceUrl || PRIZEPICKS_PUBLIC_SOURCES.home,
    freshness: p.freshness || 'observed',
    verified: p.verified !== false
  };
}

export function ingestPublicProjection(projection, priorHistory=[]) {
  const p = normalizePublicProjection(projection);
  const history = recordLine(p, priorHistory);
  const prior = priorHistory.at(-1) || null;
  return {
    projection: p,
    history,
    changed: !!prior && Number(prior.line) !== p.line,
    delta: prior ? p.line - Number(prior.line) : 0,
    previousLine: prior ? Number(prior.line) : null
  };
}

export function ingestPublicBoard(rows=[], existing={}) {
  const next = structuredClone(existing);
  const events=[];
  for (const row of rows) {
    const p=normalizePublicProjection(row);
    const key=[p.sport,p.player,p.stat].map(x=>String(x||'').toLowerCase()).join('|');
    const result=ingestPublicProjection(p,next[key]||[]);
    next[key]=result.history;
    events.push({key,player:p.player,stat:p.stat,line:p.line,changed:result.changed,delta:result.delta,previousLine:result.previousLine,observedAt:p.observedAt,sourceUrl:p.sourceUrl});
  }
  return {provider:'PrizePicks',mode:'public-read-only',events,history:next};
}

export function feedStatus(board={}) {
  const histories=Object.values(board);
  const observations=histories.reduce((n,h)=>n+(Array.isArray(h)?h.length:0),0);
  return {provider:'PrizePicks',mode:'public-read-only',trackedProps:Object.keys(board).length,observations,canSubmit:false,canMoveMoney:false};
}
