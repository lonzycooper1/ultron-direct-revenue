import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {mutateJson,getJson} from './state-store.mjs';import {recordRevenueCase,escalateRevenueCases} from './revenue-case-queue.mjs';
test('isolated PostgreSQL serializes duplicate case updates and a fresh module recovers queued escalation',async()=>{
 const key='test-revenue-case-'+randomUUID(),input={id:'fixture-case',requestId:'research-1',stage:'RESEARCH',owner:'Fixture owner',nextAction:'Review fixture evidence',dependency:'Owner review',evidenceReference:'Synthetic fixture only',dueAt:'2020-01-01T00:00:00Z'};
 await Promise.all(Array.from({length:5},()=>mutateJson(key,{},s=>recordRevenueCase(s,input))));
 const recovered=await import('./state-store.mjs?restart='+randomUUID());
 const restored=await recovered.getJson(key,{});assert.equal(restored.cases[input.id].history.length,1);
 await mutateJson(key,{},s=>escalateRevenueCases(s));await mutateJson(key,{},s=>escalateRevenueCases(s));
 const state=await getJson(key,{});assert.equal(Object.keys(state.alerts).length,1);assert.equal(state.alerts['revenue-case:fixture-case'].status,'QUEUED_NOT_DELIVERED');
 assert.equal(state.cases[input.id].permissionToSend,false);
});
