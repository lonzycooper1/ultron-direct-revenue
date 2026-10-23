import test from 'node:test';
import assert from 'node:assert/strict';
import {projectionCandidates,mergePropLines} from './sports-live-feed.mjs';
test('live pace uses WNBA ten-minute quarters and accepts 0:00 as a real clock',()=>{
 const players=[{player:'Fixture',stats:{PTS:'10'}}];
 const w=projectionCandidates(players,{sport:'WNBA',period:1,clock:'0:00',state:'in'});
 assert.equal(w[0].modelProjection,40);assert.equal(w[0].confidence,null);
 const n=projectionCandidates(players,{sport:'NBA',period:1,clock:'6:30',state:'in'});
 assert.equal(n[0].modelProjection,87.3);
 assert.deepEqual(projectionCandidates(players,{sport:'NBA',period:1,clock:'',state:'in'}),[]);
});
test('user lines never become provider-verified or calibrated probabilities',()=>{
 const board={projections:[{player:'Fixture',stat:'PTS',modelProjection:25,direction:'PASS',confidence:null}]};
 const result=mergePropLines(board,[{player:'Fixture',stat:'PTS',line:20}]);assert.equal(result.top3[0].confidence,null);assert.match(result.top3[0].reason,/User-supplied/);
 assert.equal(mergePropLines(board,[{player:'Fixture',stat:'PTS',line:null}]).top3.length,0);
});
