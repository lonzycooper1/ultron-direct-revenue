import test from 'node:test';
import assert from 'node:assert/strict';
import {ownerActionPage} from './ultron-owner-actions-v30.mjs';
test('ULTRON owner action page renders buyer and approval links',()=>{
 const text=ownerActionPage();
 assert.ok(text.includes('Owner Action Center'));
 assert.ok(text.includes('Pending commerce approvals'));
 assert.ok(text.includes('/api/activation/v27'));
 assert.ok(text.includes('/free-response-gap-scan'));
 assert.ok(text.includes('type="password"'));
});
