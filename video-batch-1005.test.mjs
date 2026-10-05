import test from 'node:test';import assert from 'node:assert/strict';
import {OCT05_VIDEO_ANALYSIS,OCT05_CAPABILITY_PACK,LOCAL_MODEL_RESOURCES,capabilityMission} from './video-batch-1005.mjs';

test('all nine uploaded videos are captured',()=>{assert.equal(OCT05_VIDEO_ANALYSIS.length,9);assert.equal(OCT05_CAPABILITY_PACK.videoCount,9);assert.equal(OCT05_CAPABILITY_PACK.screenshotCount,3)});
test('new capability pack includes core video themes',()=>{for(const x of ['creator deal discovery','AI software factory','ecommerce product research','business workflow loss audit','defensive Solidity review','backtesting','ambient audio concepting','faceless media research','local model routing'])assert.ok(OCT05_CAPABILITY_PACK.capabilities.includes(x))});
test('local model resources include Ollama and LM Studio adapters',()=>{assert.ok(LOCAL_MODEL_RESOURCES.runtimes.some(x=>x.name==='Ollama'));assert.ok(LOCAL_MODEL_RESOURCES.runtimes.some(x=>x.name==='LM Studio'))});
test('financial mission remains human approved',()=>{const p=capabilityMission({goal:'trade BTC with real money',division:'crypto'});assert.equal(p.approvalRequired,true);assert.equal(p.externalExecution,'human-approved-only')});
test('defensive security mission routes to review agents',()=>{const p=capabilityMission({goal:'review Solidity proxy contract for security issues',division:'security'});assert.ok(p.specialists.includes('StaticSecurityReviewAgent'))});
