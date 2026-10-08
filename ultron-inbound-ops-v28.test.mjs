import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreInboundLead,inboundDraft,reviewInbound} from './ultron-inbound-ops-v28.mjs';
const lead={id:'lead-1777700000000-abcdef',email:'business@example.org',company:'Example Works',niche:'services',score:45,severity:'medium',
 followupConsent:true,consentScope:'REQUESTED_ONE_TO_ONE_DIAGNOSTIC_FOLLOWUP',status:'new'};
test('Consented diagnostic can generate a truthful unsent follow-up draft',()=>{
 const d=inboundDraft(lead);assert.equal(d.status,'DRAFT_NOT_SENT');assert.match(d.body,/self-reported/);assert.match(d.body,/optional \$500/);
 assert.ok(d.to==='business@example.org');assert.ok(!/guarantee|we measured|we audited your/.test(d.body));
});
test('Consent is mandatory for sales follow-up draft',()=>{
 assert.throws(()=>inboundDraft({...lead,followupConsent:false}),/consent/);
 assert.throws(()=>inboundDraft({...lead,status:'suppressed'}),/consent/);
});
test('Owner inbox scoring retains consent and does not fabricate buyer qualification',()=>{
 assert.equal(scoreInboundLead(lead).contactPermitted,true);
 assert.equal(scoreInboundLead({...lead,followupConsent:false}).contactPermitted,false);
 assert.equal(scoreInboundLead({...lead,consentScope:'NO_MARKETING_PERMISSION'}).contactPermitted,false);
});
test('Only documented status transitions can be accepted',async()=>{
 await assert.rejects(reviewInbound({id:lead.id,status:'emailed'}),/Select/);
 await assert.rejects(reviewInbound({id:'x',status:'reviewed'}),/identifier/);
});
