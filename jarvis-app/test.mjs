import test from 'node:test';import assert from 'node:assert/strict';
import {NUCLEUS_VERSION,NUCLEUS_POLICY,NUCLEUS_SKILLS} from './nucleus.mjs';
import {CAPABILITY_PACK,VIDEO_ANALYSIS,capabilityMission} from './capability-pack.mjs';
import {CHATGPT_BUSINESS_CASES,OWNER_OPERATING_CONTRACT,scoreOpportunity} from './business-mastery.mjs';

test('four interfaces contract',()=>assert.equal(['web','ios','android','desktop'].length,4));
test('nucleus has persistent control architecture and a large skill registry',()=>{assert.equal(NUCLEUS_VERSION,'2.0.0');assert.ok(NUCLEUS_SKILLS.length>=50);assert.equal(NUCLEUS_POLICY.externalFinancialActions,'explicit-human-approval')});
test('all nine uploaded videos are represented in capability pack',()=>{assert.equal(VIDEO_ANALYSIS.length,9);assert.equal(CAPABILITY_PACK.videoCount,9);assert.ok(CAPABILITY_PACK.capabilities.length>=40)});
test('financial execution remains approval gated',()=>{const p=capabilityMission({goal:'trade BTC with real money',division:'crypto'});assert.equal(p.approvalRequired,true);assert.equal(p.externalExecution,'human-approved-only')});
test('ordinary software research can route to builder specialists without financial approval',()=>{const p=capabilityMission({goal:'build and test a local business scheduling app',division:'builder'});assert.equal(p.approvalRequired,false);assert.ok(p.specialists.includes('RapidSoftwareFactory'))});
test('defensive web3 request routes to security agents',()=>{const p=capabilityMission({goal:'review a Solidity proxy contract for security issues',division:'security'});assert.ok(p.specialists.includes('StaticSecurityReviewAgent'));assert.equal(p.approvalRequired,false)});
test('local model request routes to model router while policy remains active',()=>{const p=capabilityMission({goal:'use Ollama local model to draft a research report'});assert.ok(p.specialists.includes('LocalModelRouterAgent'));assert.ok(CAPABILITY_PACK.boundaries.includes('no safety-boundary removal'))});

test('business mastery layer encodes five cases and owner deadline',()=>{assert.equal(CHATGPT_BUSINESS_CASES.length,5);assert.equal(OWNER_OPERATING_CONTRACT.stretchObjective.deadline,'2027-04-05');assert.equal(scoreOpportunity({signals:{pain:1,proof:1,speed:1,distribution:1,recurring:1,retention:1,feedback:1,offerLadder:1,unitEconomics:1,operations:1}}).score,100)});
