import test from 'node:test';
import assert from 'node:assert/strict';
import {refinanceScenario,screenCompanies} from './research-tools-v47.mjs';
import {createApp} from './server.js';
const property={value:1000000,debt:500000,ltvPct:65,costs:20000,annualNoi:80000,annualRatePct:0,months:360};
test('refinance accounts for debt, costs, zero interest, amortization and negative cash',()=>{
 const r=refinanceScenario(property);assert.equal(r.loanPrincipal,650000);assert.equal(r.cashAfterDebtAndCosts,130000);assert.equal(r.monthlyDebtService,1805.56);assert.equal(r.taxTreatment,'NOT_DETERMINED');assert.equal(r.financingApproved,false);
 assert.equal(refinanceScenario({...property,debt:800000}).cashAfterDebtAndCosts,-170000);
 const interest=refinanceScenario({...property,annualRatePct:6});assert.equal(interest.monthlyDebtService,3897.08);assert.equal(interest.dscr,1.71);
 for(const v of [null,'100',NaN,Infinity,-1])assert.throws(()=>refinanceScenario({...property,value:v}));assert.throws(()=>refinanceScenario({...property,months:2.5}));
});
test('screen keeps unknown ratios unknown, rejects invalid evidence and does not claim a backtest',()=>{
 const input={minRoePct:15,maxDebtEquity:1,maxPe:25,companies:[{symbol:'DEMO',roePct:18,debtEquity:0.5,pe:20,freeCashFlow:1000,source:'fixture',asOf:'2026-10-20'}]};
 let r=screenCompanies(input);assert.equal(r.records[0].status,'MATCH');assert.equal(r.backtestPerformed,false);
 r=screenCompanies({...input,companies:[{...input.companies[0],roePct:null}]});assert.equal(r.records[0].status,'INSUFFICIENT_DATA');
 for(const patch of [{freeCashFlow:0},{pe:0},{pe:-5},{debtEquity:-1},{roePct:2}])assert.equal(screenCompanies({...input,companies:[{...input.companies[0],...patch}]}).records[0].status,'NO_MATCH');
 assert.throws(()=>screenCompanies({...input,companies:[{...input.companies[0],source:''}]}));
});
test('HTTP scenarios perform calculations and reject malformed input or unknown tools',async()=>{
 const app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.address().port;
 try{const post=(tool,b)=>fetch(base+'/api/research/v47/'+tool,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)});const r=await post('refinance',property);assert.equal(r.status,200);assert.equal((await r.json()).result.cashAfterDebtAndCosts,130000);assert.equal((await post('refinance',{})).status,400);assert.equal((await post('constructor',{})).status,404);assert.equal((await post('screen',{companies:Array(101).fill({})})).status,400)}finally{app.closeAllConnections();await new Promise(r=>app.close(r))}
});
