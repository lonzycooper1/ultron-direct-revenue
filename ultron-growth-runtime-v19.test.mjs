import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectHtml,makeProposal,classifyIncoming,demoHtml,UPGRADE_REGISTRY,safeWebsite} from './ultron-growth-runtime-v19.mjs';
test('v19 exposes all 40 distinct upgrade modules',()=>{assert.equal(UPGRADE_REGISTRY.length,40);assert.equal(new Set(UPGRADE_REGISTRY.map(x=>x.id)).size,40);});
test('website inspection reports observations, not unproven lost revenue',()=>{const a=inspectHtml('<html><title>Local Service</title><meta name="viewport" content="width=device-width"><a href="tel:+15555551212">Call Now</a></html>','https://example.com');assert.equal(a.status,undefined);assert.equal(a.evidence.clickToCall,true);assert.ok(a.findings.some(x=>x.includes('description')));assert.match(a.limitations.join(' '),/cannot prove missed leads/);});
test('proposal requires real website evidence',()=>{const p={id:'a',name:'Shop',audit:null};assert.throws(()=>makeProposal(p),/evidence/);const q=makeProposal({...p,audit:{status:'SCANNED',findings:['CTA missing'],url:'https://example.com',observedAt:'today'}});assert.equal(q.priceUsd,99);assert.match(q.limits,/not proof/);});
test('demo is identified as a simulation and HTML is escaped',()=>{const x=demoHtml({name:'<script>alert(1)</script>',problem:'test',flow:['Book']});assert.match(x,/SIMULATION ONLY/);assert.ok(!x.includes('<script>'));});
test('opt-out cannot be misread as positive',()=>{assert.equal(classifyIncoming('Do not contact me. Interested? No.'),'OPT_OUT');assert.equal(classifyIncoming('Yes, book a call'),'INTERESTED');});
test('private and local URLs are rejected before network fetch',async()=>{await assert.rejects(safeWebsite('http://example.com'),/HTTPS/);await assert.rejects(safeWebsite('https://127.0.0.1/'),/public/);});
