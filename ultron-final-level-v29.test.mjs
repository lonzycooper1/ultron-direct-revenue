import test from 'node:test';
import assert from 'node:assert/strict';
import {COMPLETION_ITEMS} from './ultron-500-completion-v26.mjs';
import {CONTROLS,CONDITIONS,STAGES,CHECKS_PER_REQUIREMENT,FINAL_LEVEL_TOTAL,finalLevelCheck,lookupCheckId,listFinalLevelChecks,finalLevelCsvLines,finalLevelSummary} from './ultron-final-level-v29.mjs';

test('Exactly 500 requirements x 10 controls x 5 conditions x 4 stages = 100000 addressable checks',()=>{
 assert.equal(COMPLETION_ITEMS.length,500);assert.equal(CONTROLS.length,10);
 assert.equal(CONDITIONS.length,5);assert.equal(STAGES.length,4);
 assert.equal(CHECKS_PER_REQUIREMENT,200);assert.equal(FINAL_LEVEL_TOTAL,100000);
});
test('Every check ID and criterion is unique across 100000 without precomputing memory',()=>{
 const ids=new Set(),criteria=new Set();
 for(let i=1;i<=FINAL_LEVEL_TOTAL;i++){
  const x=finalLevelCheck(i);assert.ok(!ids.has(x.id));ids.add(x.id);
  const k=x.requirementId+'|'+x.qualityControl+'|'+x.condition+'|'+x.stage;
  assert.ok(!criteria.has(k));criteria.add(k);
 }
 assert.equal(ids.size,100000);assert.equal(criteria.size,100000);
});
test('First and last check refer to real requirements and never claim completion',()=>{
 const first=finalLevelCheck(1),last=finalLevelCheck(100000);
 assert.equal(first.id,'ULQ000001');assert.equal(first.requirementId,'C001');
 assert.equal(last.id,'ULQ100000');assert.equal(last.requirementId,'C500');
 assert.equal(first.evidenceStatus,'NOT_EVALUATED');
 assert.match(last.acceptanceCriteria,/require/);
});
test('Pagination and single requirement filters are stable and bounded',()=>{
 assert.deepEqual(listFinalLevelChecks({offset:0,limit:3}).items.map(x=>x.number),[1,2,3]);
 assert.deepEqual(listFinalLevelChecks({offset:99998,limit:20}).items.map(x=>x.number),[99999,100000]);
 assert.equal(listFinalLevelChecks({requirementId:'C500',offset:199}).items[0].number,100000);
 assert.equal(listFinalLevelChecks({requirementId:'C500'}).total,200);
 assert.equal(listFinalLevelChecks({limit:9999}).items.length,100);
 assert.throws(()=>listFinalLevelChecks({requirementId:'C999'}),/Known/);
});
test('Forged or out of range references are rejected',()=>{
 assert.throws(()=>finalLevelCheck(0));assert.throws(()=>finalLevelCheck(100001));
 assert.throws(()=>finalLevelCheck(1.5));assert.throws(()=>lookupCheckId('C001'));
 assert.equal(lookupCheckId('ULQ090012').number,90012);
});
test('CSV download is lazily streamed and includes exactly 100000 rows',()=>{
 const chunks=finalLevelCsvLines();
 assert.match(chunks.next().value,/requirementId/);
 let count=0,last;
 for(const line of chunks){count++;last=line}
 assert.equal(count,100000);assert.match(last,/ULQ100000/);
});
test('Provider credentials or checklist entries are not mistaken for verified sales or passed checks',()=>{
 const x=finalLevelSummary({readiness:{gmail:{selectedSender:'hunterward199@gmail.com',configured:false}},verifiedOrders:0,verifiedRevenueUsd:0});
 assert.equal(x.registeredQualityChecks,100000);assert.equal(x.verifiedPassed,0);
 assert.equal(x.reportedVerifiedRevenueUsd,0);assert.equal(x.mandatoryExternalGates.find(k=>k.key==='RAILWAY_GMAIL').configured,false);
});
