import test from 'node:test';import assert from 'node:assert/strict';
import {buildRevenueBotSuite,runMicroTool} from './revenue-engines.mjs';

test('suite contains all six requested revenue bot classes',()=>{
 const s=buildRevenueBotSuite({baseUrl:'https://example.com'});
 assert.equal(s.bots.length,6);
 assert.deepEqual(s.bots.map(b=>b.agent),['DigitalProductBot','LeadGenBot','AffiliateContentBot','MicroSaaSBot','DataResearchBot','MarketResearchBot']);
});
test('affiliate bot waits without approved programs',()=>{const s=buildRevenueBotSuite();assert.equal(s.bots.find(b=>b.agent==='AffiliateContentBot').status,'waiting-for-approved-program')});
test('market bot is simulation only',()=>{const s=buildRevenueBotSuite();assert.equal(s.bots.find(b=>b.agent==='MarketResearchBot').mode,'SIMULATION_ONLY')});
test('roi estimator returns deterministic math',()=>{const r=runMicroTool('roi-estimator',{monthlyLeads:100,closeRate:10,averageSale:200,hoursSaved:5});assert.equal(r.monthlySalesValue,2000)});
test('pricing helper never promises revenue',()=>{const r=runMicroTool('offer-pricer',{deliveryHours:2,softwareCost:20,targetMargin:50,hourlyRate:50});assert.equal(r.costFloor,120);assert.equal(r.suggestedPrice,240)});
