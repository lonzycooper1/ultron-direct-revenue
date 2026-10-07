import test from 'node:test';import assert from 'node:assert/strict';import {LOOP,classifyReply,objectionDraft,scoreboard} from './ultron-acquisition-v17.mjs';
test('customer acquisition loop is preserved',()=>assert.equal(LOOP[0],'find buyer'));
test('reply classifier honors opt-outs',()=>assert.equal(classifyReply('Please unsubscribe me'),'unsubscribe'));
test('objection responses remain drafts',()=>assert.equal(objectionDraft('price').status,'DRAFT_NOT_SENT'));
test('paid ads and outbound stay gated',async()=>{const s=await scoreboard();assert.equal(s.repeatGate.open,false);assert.equal(s.autopilot.externalSend,'OWNER_APPROVED_ONLY')});