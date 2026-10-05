import test from 'node:test';
import assert from 'node:assert/strict';
import {VIDEO_CAPABILITY_BATCH,buildGrowthMission} from './video-batch-0268-0272.mjs';

test('all five requested videos map to guarded ULTRON capabilities',()=>{
 assert.equal(VIDEO_CAPABILITY_BATCH.status,'integrated');
 assert.equal(VIDEO_CAPABILITY_BATCH.capabilities.length,5);
 assert.deepEqual(VIDEO_CAPABILITY_BATCH.capabilities.map(x=>x.source),['IMG_0268','IMG_0269','IMG_0270','IMG_0271','IMG_0272']);
 for(const c of VIDEO_CAPABILITY_BATCH.capabilities){assert.ok(c.name);assert.ok(c.purpose);assert.ok(c.controls.length>=3)}
});

test('growth mission preserves verified-revenue accounting and safety gates',()=>{
 const m=buildGrowthMission({offer:'ULTRON automation',audience:'businesses'});
 assert.equal(m.accounting.actualRevenue,'verified payments only');
 assert.ok(m.stages.includes('build-or-update-landing-page'));
 assert.ok(m.stages.includes('route-qualified-leads-to-sales'));
 assert.ok(m.stages.includes('verify-payment-before-fulfillment'));
 assert.ok(m.prohibited.includes('spam'));
 assert.ok(m.prohibited.includes('fabricated revenue'));
});
