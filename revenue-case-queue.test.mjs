import test from 'node:test';import assert from 'node:assert/strict';
import {recordRevenueCase,escalateRevenueCases} from './revenue-case-queue.mjs';
const input={id:'fixture-case',requestId:'research-1',stage:'RESEARCH',owner:'Owner',nextAction:'Review observed public evidence',dependency:'No buyer interest established',evidenceReference:'https://fixture-business.org/contact',dueAt:'2026-10-20T21:00:00Z'};
test('durable case resumes from serialized state and duplicate requests do not repeat work',()=>{
 let state={};recordRevenueCase(state,input);state=JSON.parse(JSON.stringify(state));recordRevenueCase(state,input);
 assert.equal(state.cases[input.id].history.length,1);assert.equal(state.cases[input.id].permissionToSend,false);
 assert.throws(()=>recordRevenueCase(state,{...input,nextAction:'Changed'}),/identity/);
 recordRevenueCase(state,{...input,requestId:'qualify-1',stage:'QUALIFICATION'});
 assert.equal(state.cases[input.id].history.length,2);assert.equal(state.cases[input.id].providerVerified,false);
 assert.throws(()=>recordRevenueCase(state,{...input,requestId:'skip',stage:'PAYMENT_REVIEW'}),/skipped/);
});
test('missing responsibility is rejected and overdue escalation is durable and never delivered by implication',()=>{
 const state={};assert.throws(()=>recordRevenueCase(state,{...input,owner:''}),/Owner/);
 assert.throws(()=>recordRevenueCase(state,{...input,dueAt:'unknown'}),/deadline/);
 recordRevenueCase(state,input);escalateRevenueCases(state,'2026-10-20T22:00:00Z');escalateRevenueCases(state,'2026-10-20T23:00:00Z');
 assert.equal(Object.keys(state.alerts).length,1);assert.equal(state.alerts['revenue-case:fixture-case'].status,'QUEUED_NOT_DELIVERED');
 assert.equal(state.cases[input.id].customer,false);
});
