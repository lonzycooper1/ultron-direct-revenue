import test from 'node:test';import assert from 'node:assert/strict';
import {NUCLEUS_VERSION,NUCLEUS_POLICY,NUCLEUS_SKILLS} from './nucleus.mjs';
import {CAPABILITY_PACK,VIDEO_ANALYSIS,capabilityMission} from './capability-pack.mjs';
import {CHATGPT_BUSINESS_CASES,OWNER_OPERATING_CONTRACT,scoreOpportunity} from './business-mastery.mjs';
import {MILLIONAIRE_SPRINT,sprintPace} from './millionaire-sprint.mjs';
import {CREATOR_OPPORTUNITY_COMPONENTS,scoreCreatorOpportunity} from './latest-video-components.mjs';
import {SECURITY_LAYERS,SECURITY_STACK_A,SECURITY_STACK_B,agentSecurityProfile} from './agent-security.mjs';
import {PROSPECT_MISSION,targetingMatrix,scoreProspect,personalizedEmailDraft} from './prospect-outreach.mjs';

test('four interfaces contract',()=>assert.equal(['web','ios','android','desktop'].length,4));
test('nucleus has persistent control architecture and a large skill registry',()=>{assert.equal(NUCLEUS_VERSION,'2.2.0');assert.ok(NUCLEUS_SKILLS.length>=50);assert.equal(NUCLEUS_POLICY.externalFinancialActions,'explicit-human-approval')});
test('all nine uploaded videos are represented in capability pack',()=>{assert.equal(VIDEO_ANALYSIS.length,9);assert.equal(CAPABILITY_PACK.videoCount,9);assert.ok(CAPABILITY_PACK.capabilities.length>=40)});
test('financial execution remains approval gated',()=>{const p=capabilityMission({goal:'trade BTC with real money',division:'crypto'});assert.equal(p.approvalRequired,true);assert.equal(p.externalExecution,'human-approved-only')});
test('ordinary software research can route to builder specialists without financial approval',()=>{const p=capabilityMission({goal:'build and test a local business scheduling app',division:'builder'});assert.equal(p.approvalRequired,false);assert.ok(p.specialists.includes('RapidSoftwareFactory'))});
test('defensive web3 request routes to security agents',()=>{const p=capabilityMission({goal:'review a Solidity proxy contract for security issues',division:'security'});assert.ok(p.specialists.includes('StaticSecurityReviewAgent'));assert.equal(p.approvalRequired,false)});
test('local model request routes to model router while policy remains active',()=>{const p=capabilityMission({goal:'use Ollama local model to draft a research report'});assert.ok(p.specialists.includes('LocalModelRouterAgent'));assert.ok(CAPABILITY_PACK.boundaries.includes('no safety-boundary removal'))});

test('business mastery layer encodes five cases and owner deadline',()=>{assert.equal(CHATGPT_BUSINESS_CASES.length,5);assert.equal(OWNER_OPERATING_CONTRACT.stretchObjective.deadline,'2027-04-05');assert.equal(scoreOpportunity({signals:{pain:1,proof:1,speed:1,distribution:1,recurring:1,retention:1,feedback:1,offerLadder:1,unitEconomics:1,operations:1}}).score,100)});

test('latest reel components include opportunity feed fit matcher proof builder and autonomous build queue',()=>{const ids=CREATOR_OPPORTUNITY_COMPONENTS.components.map(x=>x.id);for(const id of ['opportunity-feed','fit-matcher','proof-builder','application-queue','night-build-queue'])assert.ok(ids.includes(id));assert.equal(scoreCreatorOpportunity({proofFit:1,skillFit:1,audienceFit:1,deadlineFit:1,sourceTrust:1,payoutVerified:true}).fitScore,1)});
test('end-of-year sprint is installed without revenue guarantees',()=>{assert.equal(MILLIONAIRE_SPRINT.targetUsd,1_000_000);assert.equal(MILLIONAIRE_SPRINT.deadline,'2026-12-31');assert.match(MILLIONAIRE_SPRINT.classification,/not a forecast or guarantee/);assert.ok(sprintPace({verifiedRevenueUsd:0,now:new Date('2026-10-05T17:30:00-05:00')}).requiredPerDay>11000)});

test('every JARVIS bot receives twenty security layers',()=>{
  assert.equal(SECURITY_STACK_A.length,10);
  assert.equal(SECURITY_STACK_B.length,10);
  assert.equal(SECURITY_LAYERS.length,20);
  assert.equal(agentSecurityProfile('ProspectResearchAgent').layers,20);
});
test('prospect mission contains exactly one thousand lawful targeting slots',()=>{
  const rows=targetingMatrix();
  assert.equal(PROSPECT_MISSION.targetDistinctProspects,1000);
  assert.equal(rows.length,1000);
  assert.ok(PROSPECT_MISSION.prohibited.includes('private-contact scraping'));
  assert.ok(PROSPECT_MISSION.prohibited.includes('bulk unsolicited spam'));
});
test('personalized prospect email requires public or permissioned contact and contains opt-out',()=>{
  const p={companyName:'Example Co',publicBusinessEmail:'info@example.com',primaryPain:'lead follow-up',publicObservation:'your public site invites service inquiries',evidenceSource:'https://example.com',painMatch:.9,buyerFit:.9,activeBusiness:.9,digitalGap:.7};
  assert.equal(scoreProspect(p).qualified,true);
  const d=personalizedEmailDraft(p);
  assert.equal(d.to,'info@example.com');
  assert.match(d.body,/no thanks/i);
  assert.equal(d.compliance.privateDataUsed,false);
});
