import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeProp,recordLine,rankBoard,SPORTS_JARVIS_VERSION,DATA_POLICY} from './sports-jarvis.mjs';

test('version',()=>assert.equal(SPORTS_JARVIS_VERSION,'2.0.0'));
test('historical hit rate',()=>{const r=analyzeProp({sport:'NFL',player:'Example',stat:'Passing Yards',line:265.5,recent:[291,151,217,245,331,254,262,291]});assert.equal(r.history.over,3);assert.equal(r.history.sample,8);});
test('sportsbook implied probability',()=>{const r=analyzeProp({sport:'NFL',player:'Example',stat:'Passing Yards',line:265.5,recent:[291,151,217,245,331,254,262,291],sportsbookOdds:-119});assert.ok(r.market.impliedProbability>.54&&r.market.impliedProbability<.55);});
test('line history is append-only',()=>{const h=recordLine({player:'A',stat:'Points',line:22.5},[]);const h2=recordLine({player:'A',stat:'Points',line:23.5},h);assert.equal(h.length,1);assert.equal(h2.length,2);assert.equal(h2[0].line,22.5);});
test('pass when no evidence',()=>assert.equal(analyzeProp({sport:'NBA',player:'A',stat:'Points',line:20,recent:[]}).direction,'PASS'));
test('board ranking',()=>assert.equal(rankBoard([{sport:'NBA',player:'A',stat:'Points',line:20,recent:[]},{sport:'NBA',player:'B',stat:'Points',line:20,recent:[30,31,29,28,27,30,29,31,32,30]}])[0].player,'B'));
test('analysis only safety',()=>assert.match(DATA_POLICY.execution,/Never submit/));
test('missing odds do not synthesize a probability or bias a historical lean',()=>{
 const empty=analyzeProp({sport:'NBA',player:'A',stat:'Points',line:20,recent:[]});assert.equal(empty.modelProbability,null);assert.equal(empty.market.impliedProbability,null);
 const high=analyzeProp({sport:'NBA',player:'A',stat:'Points',line:20,recent:[30,31,32,29,28,30]});assert.equal(high.direction,'MORE');assert.ok(high.modelProbability>.5);
});
test('missing history values are not counted as zero performances',()=>{
 assert.equal(analyzeProp({sport:'NBA',player:'A',stat:'Points',line:20,recent:[null,'',false,22]}).history.sample,1);
});
test('one-sided market odds alone never establish a model edge',()=>{
 assert.equal(analyzeProp({sport:'NBA',player:'A',stat:'Points',line:20,recent:[],sportsbookOdds:-150}).direction,'PASS');
 assert.throws(()=>analyzeProp({sport:'NBA',player:'A',stat:'Points',line:20,lineHistory:null}),/required/);
});
