import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {VERSION,VIDEO_ITEMS,DEPENDENCY_LAYERS,CONTROLS,rankOpportunities,verifyClaim,storyboard,economics,queueOriginalDraft,updateDraftReview,report} from './ultron-video-intelligence-v39.mjs';
test('records both supplied recordings and fourteen distinct signals',()=>{
 assert.equal(VERSION,'39.0.0');
 assert.equal(VIDEO_ITEMS.length,14);
 assert.equal(new Set(VIDEO_ITEMS.map(x=>x.id)).size,14);
 assert.equal(new Set(VIDEO_ITEMS.map(x=>x.clip)).size,2);
 assert.equal(DEPENDENCY_LAYERS.length,6);
});
test('prioritizes original revenue content over unsupported trading returns',()=>{
 const r=rankOpportunities();
 assert.ok(r.findIndex(x=>x.id==='social-viral-hooks')<r.findIndex(x=>x.id==='trading-bot-profit'));
 assert.ok(r.find(x=>x.id==='trading-bot-profit').priority<10);
 assert.equal(VIDEO_ITEMS.find(x=>x.id==='trading-bot-profit').level,'UNVERIFIED_SOCIAL_CLAIM');
});
test('official documentation is a lead for verification, not a self-certifying fact',()=>{
 const v=verifyClaim({text:'AlphaChip made every chip overnight',sources:['https://deepmind.google/blog/how-alphachip-transformed-computer-chip-design/'],level:'DOCUMENTED_OFFICIAL'});
 assert.equal(v.canPublishAsVerifiedFact,false);
 assert.equal(v.sourceUrls.length,1);
 assert.equal(v.needsIndependentSourceInspection,true);
});
test('filters nonHTTPS and placeholder evidence URLs',()=>{
 const v=verifyClaim({text:'I made $600 to $10,000 overnight, win rate 92%',sources:['http://fake.example/x','https://localhost/admin','https://research.example/test','https://real.edu/paper']});
 assert.equal(v.claimRisk,'HIGH');
 assert.deepEqual(v.sourceUrls,['https://real.edu/paper']);
 assert.equal(v.canPublishAsVerifiedFact,false);
});
test('storyboard creates original vertical content with required AI label and rights review',()=>{
 const p=storyboard({topic:'An honest customer lead-response workflow',format:'SERVICE_OFFER',claims:[{text:'Guaranteed 10x sales overnight'}]});
 assert.equal(p.targetDurationSeconds,30);
 assert.equal(p.shots.length,5);
 assert.equal(p.originalOnly,true);
 assert.equal(p.aiGeneratedDisclosureRequired,true);
 assert.ok(p.requiredAssetChecks.includes('OWNERSHIP_OR_LICENSE'));
 assert.equal(p.publication,'NOT_AUTHORIZED_BY_SCRIPT_GENERATION');
});
test('rejects explicit direct copying of another creator',()=>{
 assert.throws(()=>storyboard({topic:'Please clone original exact video'}),/original work/i);
 assert.throws(()=>storyboard({topic:'An informative AI video',inspiration:'remove watermark and reupload'}),/original work/i);
});
test('enforces draft topic and format limits',()=>{
 assert.throws(()=>storyboard({topic:'AI'}),/required/i);
 assert.throws(()=>storyboard({topic:'A valid original topic',format:'LIVE_TRADES'}),/Invalid format/i);
});
test('scenario unit economics accounts for refund, fees and real costs separately',()=>{
 const v=economics({verifiedCustomers:2,grossRevenueUsd:500,processingFeesUsd:19,fulfillmentCostUsd:65,acquisitionCostUsd:80,refundsUsd:10});
 assert.equal(v.contributionUsd,326);
 assert.equal(v.contributionMargin,0.652);
 assert.equal(v.evidence,'USER_SUPPLIED_VALUES_NOT_VERIFIED');
});
test('untrusted values cannot create negative costs',()=>{
 const v=economics({grossRevenueUsd:100,fulfillmentCostUsd:-100,refundsUsd:-3});
 assert.equal(v.contributionUsd,100);
});
test('outbound, trades and MFA remain gated',()=>{
 assert.equal(CONTROLS.liveTrading,'DISABLED');
 assert.equal(CONTROLS.identityMFA,'OWNER_ONLY');
 assert.equal(CONTROLS.copyingOtherVideos,'DISALLOWED');
});
test('queued original creative draft does not claim media created or posting',async()=>{
 const topic='Original cost and conversion lesson '+randomUUID();
 const x=await queueOriginalDraft({topic});
 assert.equal(x.externalActionTaken,false);
 assert.equal(x.draft.status,'NEEDS_SOURCE_AND_RIGHTS_REVIEW');
 assert.equal(x.draft.mediaProduced,false);
 assert.equal(x.draft.publishResultEvidence,null);
 const same=await queueOriginalDraft({topic});
 assert.equal(same.draft.id,x.draft.id);
});
test('review cannot falsify publication without publisher evidence',async()=>{
 const x=await queueOriginalDraft({topic:'A distinct compliance-safe AI explainer '+randomUUID()});
 await assert.rejects(()=>updateDraftReview({id:x.draft.id,publicationUrl:'https://youtube.com/watch?v=fake'}),/Publication cannot be asserted/i);
 const step=await updateDraftReview({id:x.draft.id,claimsChecked:true,rightsVerified:false,ownerApproved:true,mediaProduced:false,publisherConnected:false});
 assert.equal(step.status,'NEEDS_SOURCE_AND_RIGHTS_REVIEW');
 assert.equal(step.externalActionTaken,false);
});
test('unreferenced factual assertions cannot be marked checked',async()=>{
 const x=await queueOriginalDraft({topic:'Industry AI claims need their sources '+randomUUID(),claims:[{text:'Every roof company doubles sales in ten days'}]});
 await assert.rejects(()=>updateDraftReview({id:x.draft.id,claimsChecked:true}),/without recorded sources/i);
});
test('public report omits private queued material and secrets',async()=>{
 const pub=await report({env:{ULTRON_GMAIL_REFRESH_TOKEN:'secret-do-not-echo'},privateView:false});
 const str=JSON.stringify(pub);
 assert.equal(pub.summary.observationCount,14);
 assert.equal(pub.videoSources.length,2);
 assert.equal(str.includes('secret-do-not-echo'),false);
 assert.equal(pub.drafts,undefined);
 assert.equal(pub.summary.queue.confirmedPublishedByProvider,0);
});
