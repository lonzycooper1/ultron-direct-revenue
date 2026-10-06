import test from 'node:test';import assert from 'node:assert/strict';
import {NUCLEUS_VERSION,NUCLEUS_POLICY,NUCLEUS_SKILLS} from './nucleus.mjs';
import {CAPABILITY_PACK,VIDEO_ANALYSIS,capabilityMission} from './capability-pack.mjs';
import {CHATGPT_BUSINESS_CASES,OWNER_OPERATING_CONTRACT,scoreOpportunity} from './business-mastery.mjs';
import {MILLIONAIRE_SPRINT,sprintPace} from './millionaire-sprint.mjs';
import {CREATOR_OPPORTUNITY_COMPONENTS,scoreCreatorOpportunity} from './latest-video-components.mjs';
import {SECURITY_LAYERS,SECURITY_STACK_A,SECURITY_STACK_B,agentSecurityProfile} from './agent-security.mjs';
import {PROSPECT_MISSION,targetingMatrix,scoreProspect,personalizedEmailDraft} from './prospect-outreach.mjs';
import {AGENT_OF_AGENTS_VERSION,COMMERCE_AGENTS,POD_STRATEGY,visualAgentGraph,agentOfAgentsManifest} from './agent-of-agents.mjs';
import {UNIVERSAL_MARKET_VERSION,UNIVERSAL_MARKET_SUMMARY,universalMarketManifest} from './universal-marketplace.mjs';
import {OMNI_VERSION,OMNI_CAPABILITIES,omniStatus,planOmniTask,omniManifest,inferOmniMode} from './omni-runtime.mjs';
import {automationManifest} from './automations.mjs';
import {chatManifest} from './chat-runtime.mjs';

test('four interfaces contract',()=>assert.equal(['web','ios','android','desktop'].length,4));
test('nucleus has persistent control architecture and a large skill registry',()=>{assert.equal(NUCLEUS_VERSION,'2.7.0');assert.ok(NUCLEUS_SKILLS.length>=50);assert.equal(NUCLEUS_POLICY.externalFinancialActions,'explicit-human-approval')});
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

test('JARVIS includes second-layer Agent-of-Agents commerce architecture',()=>{
  assert.equal(AGENT_OF_AGENTS_VERSION,'2.0.0');
  assert.equal(Object.keys(COMMERCE_AGENTS).length,4);
  assert.equal(agentOfAgentsManifest().security.totalLayers,20);
  assert.equal(POD_STRATEGY.preferredLaunchOrder[0],'digital-download');
  const g=visualAgentGraph();
  assert.ok(g.nodes.some(x=>x.id==='ceo'));
  assert.ok(g.nodes.some(x=>x.id==='editor'));
  assert.ok(g.edges.some(x=>x.from==='MediaBuyerAgent'&&x.to==='editor'));
});

test('JARVIS includes Amazon-inspired Everything Market without impersonating Amazon',()=>{
 assert.equal(UNIVERSAL_MARKET_VERSION,'1.0.0');
 assert.ok(UNIVERSAL_MARKET_SUMMARY.domains.includes('offer-engine'));
 assert.ok(UNIVERSAL_MARKET_SUMMARY.domains.includes('fulfillment'));
 assert.ok(UNIVERSAL_MARKET_SUMMARY.commerceTypes.includes('service'));
 assert.ok(UNIVERSAL_MARKET_SUMMARY.commerceTypes.includes('print-on-demand'));
 const m=universalMarketManifest();
 assert.equal(m.security.totalLayers,20);
 assert.ok(m.differentiators.some(x=>/provider-neutral/i.test(x)));
});


test('JARVIS Omni runtime exposes broad capability classes without pretending missing credentials are live',()=>{
 assert.equal(OMNI_VERSION,'1.0.0');
 assert.ok(OMNI_CAPABILITIES.length>=20);
 const ids=OMNI_CAPABILITIES.map(x=>x.id);
 for(const id of ['reason','research','vision','file-analysis','code','compute','image-generation','memory','agent-orchestration','automation','shopify','commerce','payments'])assert.ok(ids.includes(id));
 const status=omniStatus();
 assert.equal(status.capabilities.length,OMNI_CAPABILITIES.length);
 assert.ok(status.capabilities.every(x=>['LIVE','READY_NEEDS_CREDENTIAL','APPROVAL_GATED'].includes(x.status)));
});
test('Omni planner routes research code compute image and files to the right modes',()=>{
 assert.equal(inferOmniMode('search the internet for current AI news'),'research');
 assert.equal(inferOmniMode('write code and debug this function'),'code');
 assert.equal(inferOmniMode('analyze this CSV and make a chart'),'compute');
 assert.equal(inferOmniMode('generate an image of a storefront'),'image');
 assert.equal(inferOmniMode('summarize this PDF file'),'file');
 const p=planOmniTask({prompt:'search the internet for current AI news'});
 assert.equal(p.mode,'research');
 assert.ok(p.capabilities.some(x=>x.id==='research'));
});
test('Omni manifest preserves truthful execution parity and security',()=>{
 const m=omniManifest();
 assert.match(m.parityRule,/does not claim access/i);
 assert.equal(m.security.totalLayers,20);
 assert.ok(m.openaiResponses.supportedWhenConfigured.includes('web_search'));
 assert.ok(m.openaiResponses.supportedWhenConfigured.includes('code_interpreter'));
 assert.ok(m.openaiResponses.supportedWhenConfigured.includes('image_generation'));
});

test('JARVIS automation engine is persistent and bounded',()=>{
 const m=automationManifest();
 assert.equal(m.persistent,true);
 assert.ok(m.supportedSchedules.includes('once'));
 assert.ok(m.supportedSchedules.includes('interval >=60 minutes'));
 assert.equal(m.maxTasks,200);
});

test('JARVIS chat runtime keeps bounded persistent multi-turn conversation history',()=>{
 const m=chatManifest();
 assert.equal(m.persistent,true);
 assert.equal(m.maxChats,100);
 assert.equal(m.maxMessagesPerChat,120);
 assert.equal(m.historyTurnsSentToModel,24);
 assert.match(m.attachments,/image\/file inputs supported/i);
});
