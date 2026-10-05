import test from 'node:test';import assert from 'node:assert/strict';
import {PROSPECT_MISSION,TARGET_VERTICALS,TARGET_METROS,targetingMatrix,scoreProspect,personalizedEmailDraft,prospectMissionStatus} from './prospect-outreach.mjs';

test('prospect mission builds exactly 1000 distinct research slots',()=>{
  const rows=targetingMatrix();
  assert.equal(TARGET_METROS.length,20);
  assert.equal(TARGET_VERTICALS.length,10);
  assert.equal(rows.length,1000);
  assert.equal(new Set(rows.map(x=>x.slot)).size,1000);
  assert.equal(PROSPECT_MISSION.targetDistinctProspects,1000);
});
test('private-contact scraping and bulk spam are explicitly prohibited',()=>{
  assert.ok(PROSPECT_MISSION.prohibited.includes('private-contact scraping'));
  assert.ok(PROSPECT_MISSION.prohibited.includes('bulk unsolicited spam'));
  assert.match(PROSPECT_MISSION.sending,/draft-first/);
});
test('qualification requires a public or permissioned contact path',()=>{
  const noContact=scoreProspect({painMatch:1,buyerFit:1,activeBusiness:1,digitalGap:1});
  assert.equal(noContact.qualified,false);
  const publicContact=scoreProspect({publicBusinessEmail:'info@example.com',painMatch:.9,buyerFit:.9,activeBusiness:.9,digitalGap:.8});
  assert.equal(publicContact.qualified,true);
});
test('email draft is individualized and contains opt-out',()=>{
  const d=personalizedEmailDraft({companyName:'Example Plumbing',contactFirstName:'Sam',publicBusinessEmail:'info@example.com',primaryPain:'missed-call follow-up',publicObservation:'your public site promotes 24/7 service calls',evidenceSource:'https://example.com',painMatch:.9,buyerFit:.9,activeBusiness:.9,digitalGap:.8});
  assert.match(d.subject,/Example Plumbing/);
  assert.match(d.body,/Sam/);
  assert.match(d.body,/no thanks/i);
  assert.equal(d.compliance.draftOnly,true);
  assert.equal(d.compliance.privateDataUsed,false);
});
test('mission status reports remaining prospect work without fabricating contacts',()=>{
  const s=prospectMissionStatus([]);
  assert.equal(s.enriched,0);assert.equal(s.remainingToEnrich,1000);assert.equal(s.sending,'not autonomous');
});
