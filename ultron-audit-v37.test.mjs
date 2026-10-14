import test from 'node:test';
import assert from 'node:assert/strict';
import {VERSION,WINDOW,WORKSTREAMS,VIDEO_COVERAGE,LEAD_SHEET,priorityQueue,evidencePolicy,agencyLaunchKit,firstVideoKit} from './ultron-audit-v37.mjs';

test('V37 catalogs 18 real workstreams without treating drafts as outcomes',()=>{
 assert.equal(VERSION,'37.0.0');
 assert.equal(WINDOW.start,'2026-10-01');
 assert.ok(WORKSTREAMS.length>=18);
 assert.ok(WORKSTREAMS.every(x=>x.status&&x.gate&&x.existing));
 assert.ok(WORKSTREAMS.every(x=>x.status!=='COMPLETE_WITH_VERIFIED_SALES'));
});
test('No invented paying customers or published video claims',()=>{
 const q=priorityQueue();
 assert.match(q.objective,/FIRST_INDEPENDENT_VERIFIED_B2B_BUYER/);
 assert.equal(q.orderVerified,false);
 assert.ok(q.jobs.find(x=>x.id==='content').status.includes('BLOCKED'));
});
test('Evidence notes remain owner reported, not independently verified',()=>{
 const p=evidencePolicy('OWNER_UPDATE','I have checked with my team and will obtain documentation');
 assert.equal(p.verified,false);
 assert.equal(p.externalActionTaken,false);
});
test('Evidence notes reject unknown actions and empty notes',()=>{
 assert.throws(()=>evidencePolicy('PUBLISH','publish everything'),/Only non-privileged/);
 assert.throws(()=>evidencePolicy('OWNER_UPDATE','short'),/specific note/);
});
test('Video coverage is accurately limited to reviewed samples',()=>{
 assert.equal(VIDEO_COVERAGE.discoveredLibraryFiles,86);
 assert.equal(VIDEO_COVERAGE.sampledHere.length,4);
 assert.equal(VIDEO_COVERAGE.fullAudioTranscriptionsVerified,0);
 assert.ok(VIDEO_COVERAGE.sampledHere.every(x=>x.coverage.includes('no spoken audio')));
});
test('Sheet and procurement workstream remain accessible and honest',()=>{
 assert.match(LEAD_SHEET,/docs.google.com\/spreadsheets/);
 assert.match(WORKSTREAMS.find(x=>x.id==='procurement').gate,/Oct 20/);
});

test('Agency copy is a two-sentence authentic LinkedIn bio',()=>{
 const a=agencyLaunchKit();assert.equal(a.brand,'ULTRON Revenue Studio');
 assert.equal((a.linkedInBio.match(/[.!?](\s|$)/g)||[]).length,2);
 assert.equal(a.targetIndustries.length,3);
 assert.equal(a.linkedInProfileUpdated,false);
});
test('All 10 researched lead drafts and video remain unsent and unpublished',()=>{
 const a=agencyLaunchKit(),v=firstVideoKit();
 assert.equal(a.firstTenLeads.count,10);
 assert.equal(a.firstTenLeads.emailsSent,0);
 assert.equal(a.firstTenLeads.sourceVerified,true);
 assert.equal(v.durationSeconds,45);
 assert.equal(v.renderedInChat,true);
 assert.equal(v.publishedInstagram,false);
 assert.equal(v.publishedTikTok,false);
 assert.equal(v.publishedYouTube,false);
});
