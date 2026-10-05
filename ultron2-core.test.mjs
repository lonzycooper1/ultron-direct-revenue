import test from 'node:test';import assert from 'node:assert/strict';
import {wizardFromConversation,generateCandidates,critiqueCandidate,buildAcquisitionPlan,prospectToPaymentWorkflow,capabilityManifest} from './ultron2-core.mjs';
test('wizard creates persistent-style project graph',()=>{const p=wizardFromConversation({objective:'Launch a compliant AI product business'});assert.equal(p.milestones.length,5);assert.ok(p.skills.length>20)});
test('candidate engine creates multiple alternatives',()=>{assert.equal(generateCandidates({problem:'slow lead response',count:8}).length,8)});
test('critic advances strong candidate and revises weak one',()=>{assert.equal(critiqueCandidate({name:'x'},{evidenceStrength:.9,differentiation:.8,fulfillmentCost:.2,complianceRisk:.1}).decision,'ADVANCE');assert.equal(critiqueCandidate({name:'x'},{evidenceStrength:.2,differentiation:.2,complianceRisk:.5}).decision,'REVISE')});
test('growth plan has guardrails',()=>{const p=buildAcquisitionPlan({product:'kit'});assert.ok(p.experiments.every(x=>x.guardrail.includes('No spam')))});
test('sales/payment workflow gates fulfillment',()=>{const w=prospectToPaymentWorkflow({prospect:'Acme',offer:'Automation Kit',amountUsd:99});assert.equal(w.steps[4].stage,'fulfill');assert.match(w.accountingRule,/verified/i)});
test('manifest unifies requested systems',()=>{const m=capabilityManifest();assert.equal(m.version,'2.0');assert.ok(m.systems.includes('Project Wizard'));assert.ok(m.systems.includes('Market Intelligence'))});
