import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePublicProjection,ingestPublicBoard,feedStatus,FEED_POLICY} from './prizepicks-public-feed.mjs';

test('normalizes a public projection',()=>{const p=normalizePublicProjection({sport:'NFL',player:'D. Prescott',stat:'Passing Yards',line:263.5,sourceUrl:'https://www.prizepicks.com/nfl'});assert.equal(p.line,263.5);assert.equal(p.provider,'PrizePicks');assert.equal(p.access,'public-web');});
test('tracks line movement without overwriting history',()=>{const a=ingestPublicBoard([{sport:'NFL',player:'D. Prescott',stat:'Passing Yards',line:263.5,observedAt:'2026-10-06T12:00:00Z'}]);const b=ingestPublicBoard([{sport:'NFL',player:'D. Prescott',stat:'Passing Yards',line:266.5,observedAt:'2026-10-06T13:00:00Z'}],a.history);assert.equal(b.events[0].changed,true);assert.equal(b.events[0].delta,3);assert.equal(Object.values(b.history)[0].length,2);});
test('feed is strictly read only',()=>{assert.equal(FEED_POLICY.authentication,false);assert.equal(FEED_POLICY.bypassAntiBot,false);assert.equal(FEED_POLICY.submitLineups,false);assert.equal(FEED_POLICY.financialActions,false);const s=feedStatus({});assert.equal(s.canSubmit,false);assert.equal(s.canMoveMoney,false);});
