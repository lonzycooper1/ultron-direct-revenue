import test from 'node:test';
import assert from 'node:assert/strict';
import {LIVE_APPROVAL_RULES,proposeLiveOrder,approveProposal,executionEnvelope} from './crypto-live-approval.mjs';

test('live execution always requires a human',()=>{
 assert.equal(LIVE_APPROVAL_RULES.autonomousLiveOrders,false);
 assert.equal(LIVE_APPROVAL_RULES.humanApprovalRequired,true);
});

test('proposal is bounded and cannot execute before approval',()=>{
 const p=proposeLiveOrder({instrument:'BTC-USD',side:'BUY',price:60000,notional:50,leverage:1,equity:10000,rationale:'test'});
 assert.equal(p.status,'AWAITING_HUMAN_APPROVAL');
 assert.throws(()=>executionEnvelope(p),/human approval/i);
});

test('approval requires matching explicit confirmation',()=>{
 const p=proposeLiveOrder({instrument:'ETH-USD',side:'BUY',price:3000,notional:50,leverage:1,equity:10000});
 assert.throws(()=>approveProposal(p,{approved:true,confirmation:'wrong'}),/explicit matching/i);
 const a=approveProposal(p,{approved:true,confirmation:p.id});
 const e=executionEnvelope(a);
 assert.equal(a.status,'HUMAN_APPROVED');
 assert.equal(e.approval.permission,'ONE_ORDER_ONLY');
});

test('daily loss kill switch blocks new proposals',()=>{
 assert.throws(()=>proposeLiveOrder({instrument:'BTC-USD',side:'BUY',price:60000,notional:20,leverage:1,equity:10000,dailyPnlPct:-.03}),/kill switch/i);
});
