import test from 'node:test';
import assert from 'node:assert/strict';
import {WEBSITE_LEAD_UPGRADE,qualifyProspect,buildUpgradeAudit,buildPersonalizedPreview} from './website-lead-upgrade.mjs';

test('offer is production-priced and verified-payment deliverable',()=>{
 assert.equal(WEBSITE_LEAD_UPGRADE.price,299);
 assert.match(WEBSITE_LEAD_UPGRADE.delivery,/verified payment/i);
});

test('qualifies a business with observable conversion friction',()=>{
 const p=qualifyProspect({businessName:'Example Auto Detail',website:'https://example.com',category:'auto detailing',hasClearCTA:false,hasLeadForm:false,hasBooking:false,hasMobileIssue:true,observations:['Contact path requires multiple steps']});
 assert.equal(p.qualified,true); assert.ok(p.score>=45);
});

test('generates an original implementation-ready audit and preview',()=>{
 const input={businessName:'Example Services',website:'https://example.com',category:'home services',hasClearCTA:false,hasLeadForm:false,hasBooking:false};
 const audit=buildUpgradeAudit(input), preview=buildPersonalizedPreview(input);
 assert.equal(audit.type,'ULTRON_WEBSITE_LEAD_UPGRADE');
 assert.ok(audit.deliverables.executiveAudit.length>=1);
 assert.ok(audit.acceptanceCriteria.some(x=>/No copied proprietary/.test(x)));
 assert.equal(preview.offer.price,299);
});
