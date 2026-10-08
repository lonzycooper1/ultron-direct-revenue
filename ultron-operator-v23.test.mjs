import test from 'node:test';
import assert from 'node:assert/strict';
import {TARGET_COUNT,requiredStatus,prioritize,publicReadiness} from './ultron-operator-v23.mjs';
test('every requested workstream is individually tracked',()=>{const r=requiredStatus({});assert.equal(TARGET_COUNT,30);assert.equal(r.length,30);assert.deepEqual(r.map(x=>x.id),Array.from({length:30},(_,i)=>i+1));});
test('owner-only actions remain blocked without external credentials',()=>{const r=requiredStatus({});for(const id of [1,2,3,6,7,8,9,10,17])assert.notEqual(r[id-1].status,'COMPLETED');});
test('configuration never pretends an external provider is verified',()=>{const r=requiredStatus({integration:{discovery:{configured:true},gmail:{configured:true},hubspot:{configured:true},calendar:{configured:true}},domainVerified:true,shopifyLive:true,paidOrders:1});assert.ok(r.every(x=>x.status!=='COMPLETED'));assert.equal(r[0].status,'FEED_CONFIGURED_NOT_VERIFIED');});
test('customer work and replies outrank acquisition',()=>{assert.equal(prioritize({paid:1,interested:3,blockers:10}),'FULFILL_PAID_ORDERS');assert.equal(prioritize({interested:2,blockers:10}),'RESPOND_TO_INTERESTED_BUYERS');});
test('pipeline blockers outrank speculation',()=>assert.equal(prioritize({blockers:3}),'REPAIR_REVENUE_PIPELINE'));
test('public summary removes internal task records',()=>{const v=publicReadiness({asOf:'2026-10-08',objective:'REPAIR_REVENUE_PIPELINE',verifiedOrders:0,blockedCount:7,taskCounts:{blocked:7},tasks:[{id:1,name:'sensitive'}]});assert.equal(v.tasks,undefined);assert.equal(v.verifiedOrders,0);});
