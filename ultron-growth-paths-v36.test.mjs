import test from 'node:test';
import assert from 'node:assert/strict';
import {VERSION,PACKAGES,PHASES,TOOLKIT,SAFETY,corporateModel,mediaModel,profileKit,audit,outreachPreview,
 mediaScripts,membershipModel,makeAsset} from './ultron-growth-paths-v36.mjs';

test('v36 retains the B2B-first 90-day strategy and both channels',()=>{
 assert.equal(VERSION,'36.0.0');assert.equal(PHASES.length,4);
 assert.equal(PACKAGES.find(x=>x.usd===25000)?.status,'PROPOSED');
 assert.equal(PACKAGES.find(x=>x.usd===50000)?.status,'PROPOSED');
 assert.ok(TOOLKIT.length>=10);assert.ok(SAFETY.some(x=>x.includes('LinkedIn')));
});
test('twenty times 50k and forty times 25k reach model target, not receipts',()=>{
 assert.equal(corporateModel(20,50000).modeledGrossUsd,1000000);
 assert.equal(corporateModel(40,25000).modeledGrossUsd,1000000);
 assert.equal(corporateModel(20,50000).verifiedCollectionsUsd,0);
});
test('viral arithmetic correctly computes $980000, not $98000',()=>{
 const r=mediaModel(10000000,0.2,49);
 assert.equal(r.illustrativeBuyers,20000);assert.equal(r.modeledGrossUsd,980000);
 assert.equal(r.verifiedSalesUsd,0);
});
test('LinkedIn brand remains honest with five original unpublished posts',()=>{
 const b=profileKit();assert.equal(b.posts.length,5);
 assert.equal(b.identity,'REAL_BUSINESS_BRAND_ONLY');
 assert.ok(b.posts.every(x=>x.status==='UNPUBLISHED'));
});
test('feasibility audit never claims proven savings and protects regulated data',()=>{
 const d=audit('medical',100,20,30);assert.equal(d.estimatedBaselineMonthlyLaborUsd,1000);
 assert.match(d.compliance,/HIPAA/);assert.match(d.status,/NO_VERIFIED_SAVINGS/);
 assert.match(audit('legal').compliance,/confidentiality/);
});
test('evidence-gated outreach refuses ungrounded or insecure sources',()=>{
 assert.throws(()=>outreachPreview({company:'Example',observation:'Potential bottleneck'}),/URL/);
 const r=outreachPreview({company:'ABC Plumbing',observation:'The public website lists a contact-only process',source:'https://example.org/',niche:'plumbing'});
 assert.match(r.body,/15–30 minute/);assert.equal(r.status,'REQUIRES_REVIEW_NOT_SENT');
 assert.ok(r.body.split(/\s+/).length<100);
});
test('short-video drafts are not published or fact checked',()=>{
 const items=mediaScripts(10);assert.equal(items.length,10);
 assert.ok(items.every(x=>x.status==='DRAFT_UNFACTCHECKED_UNPUBLISHED'&&x.rightsApproved===false));
 assert.equal(mediaScripts(100).length,10);
});
test('community or affiliate scenarios do not invent provider income',()=>{
 const r=membershipModel(20,99,1000,30);assert.equal(r.illustrativeMonthlyUsd,1980);
 assert.equal(r.illustrativeAffiliateUsd,300);assert.equal(r.verifiedUsd,0);
});
test('draft factory is read-only and restricted to supported types',()=>{
 assert.equal(makeAsset('PROFILE',{}).status,'DRAFT_NOT_PUBLISHED');
 assert.equal(makeAsset('SHORTS',{}).result.length,10);
 assert.throws(()=>makeAsset('SEND_EMAIL',{}),/Unknown/);
});
