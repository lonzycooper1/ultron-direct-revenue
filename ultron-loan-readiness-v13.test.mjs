import test from 'node:test';import assert from 'node:assert/strict';import {lenderReadinessManifest,scoreLoanReadiness,debtCapacity,DOCUMENT_VAULT} from './ultron-loan-readiness-v13.mjs';

test('loan readiness system contains lender guardrails and document vault',()=>{const m=lenderReadinessManifest();assert.equal(m.version,'13.0.0');assert.ok(DOCUMENT_VAULT.length>=20);assert.ok(m.rules.some(x=>/fake invoices/i.test(x)))});
test('empty company does not look loan ready',()=>{const s=scoreLoanReadiness({completed:[]});assert.equal(s.score,0);assert.equal(s.tier,'NOT_READY');assert.ok(s.blockers.length>0)});
test('completed evidence scores as application ready',()=>{const all=lenderReadinessManifest().categories.flatMap(c=>c.items);const s=scoreLoanReadiness({completed:all});assert.equal(s.score,100);assert.equal(s.tier,'APPLICATION_READY')});
test('debt capacity models DSCR without approval claim',()=>{assert.equal(debtCapacity({monthlyOperatingCashFlow:2500,existingMonthlyDebtService:500,newMonthlyDebtService:1000}).dscr,1.67)});
