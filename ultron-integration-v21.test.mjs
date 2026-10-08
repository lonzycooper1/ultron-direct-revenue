import test from 'node:test';
import assert from 'node:assert/strict';
import {readiness,book,syncApprovedContact,dnsAudit,freeBusy} from './ultron-integration-v21.mjs';
test('empty environment never masquerades as a connected provider',()=>{
 const a=readiness({});assert.equal(a.gmail.configured,false);assert.equal(a.calendar.configured,false);
 assert.equal(a.hubspot.configured,false);assert.equal(a.discovery.configured,false);
});
test('configured HubSpot key requires provider verification',()=>{const s=readiness({ULTRON_HUBSPOT_PRIVATE_APP_TOKEN:'x'});assert.match(s.hubspot.status,/VERIFY/);});
test('business sender requires verified policies and refresh credentials',()=>{const a=readiness({ULTRON_GMAIL_REFRESH_TOKEN:'x'});assert.equal(a.gmail.configured,false);});
test('calendar booking requires explicit owner approval',async()=>assert.rejects(book({}),/approval/));
test('CRM contact sync requires explicit owner approval',async()=>assert.rejects(syncApprovedContact({}),/approval/));
test('invalid public hostname is rejected',async()=>assert.rejects(dnsAudit('localhost'),/public hostname/));
test('freeBusy does not accept missing calendar ID',async()=>assert.rejects(freeBusy({start:'a',end:'b'}),/Calendar ID/));
