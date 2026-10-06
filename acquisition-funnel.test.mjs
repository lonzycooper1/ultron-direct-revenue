import test from 'node:test';import assert from 'node:assert/strict';
import {nicheIds,nicheConfig,scoreResponseGap,acquisitionManifest} from './acquisition-funnel.mjs';

test('acquisition funnel exposes six high-intent service niches',()=>{
 assert.deepEqual(nicheIds().sort(),['auto','hvac','medspa','plumbing','roofing','services'].sort());
 assert.equal(nicheConfig('hvac').offer,'missed-lead-recovery-99');
 assert.equal(nicheConfig('roofing').offer,'ai-revenue-audit-500');
});
test('response-gap score prioritizes slow response and missed inquiries',()=>{
 const high=scoreResponseGap({monthlyLeads:100,missedCallRate:30,responseMinutes:240,followup:'none'});
 const low=scoreResponseGap({monthlyLeads:10,missedCallRate:2,responseMinutes:2,followup:'automated'});
 assert.equal(high.severity,'high');
 assert.equal(low.severity,'low');
 assert.ok(high.score>low.score);
});
test('acquisition manifest prohibits spam and fabricated traffic',()=>{
 const m=acquisitionManifest();
 assert.match(m.funnel,/qualified lead capture/i);
 assert.ok(m.prohibited.includes('bulk unsolicited spam'));
 assert.ok(m.prohibited.includes('fake traffic'));
});
