import test from 'node:test';
import assert from 'node:assert/strict';
import {runCircuit,propertyScenario,pilotBlueprint,quantumManifest} from './ultron-quantum-core-v39.mjs';
test('Bell state has 50/50 00 and 11 without QPU claim',()=>{
 const v=runCircuit({});
 assert.deepEqual(v.probabilities,{'00':0.5,'11':0.5});
 assert.equal(v.hardwareUsed,false);
});
test('GHZ superposition supports three qubits',()=>{
 const v=runCircuit({qubits:3,gates:[{op:'H',target:0},{op:'CX',control:0,target:1},{op:'CX',control:0,target:2}]});
 assert.deepEqual(v.probabilities,{'000':0.5,'111':0.5});
});
test('X and RY gates normalize, reject unsafe circuits',()=>{
 assert.deepEqual(runCircuit({qubits:1,gates:[{op:'X',target:0}]}).probabilities,{'1':1});
 assert.equal(runCircuit({qubits:1,gates:[{op:'RY',target:0,theta:Math.PI}]}).probabilities['1'],1);
 assert.throws(()=>runCircuit({qubits:12}),/qubits/);
 assert.throws(()=>runCircuit({qubits:2,gates:[{op:'CX',control:0,target:0}]}),/control/);
 assert.throws(()=>runCircuit({qubits:1,gates:[{op:'RY',target:0,theta:Infinity}]}),/theta/);
});
test('Property and pilot are evidence labeled and nonexecuting',()=>{
 const p=propertyScenario({purchase:10000,afterRepairValue:35000,repairs:5000,closing:1500,holding:500,assignment:2000});
 assert.equal(p.illustrativeSpreadUsd,16000);
 assert.equal(p.dealClosed,false);
 const b=pilotBlueprint({});
 assert.equal(b.automatedOutreach,false);
 assert.equal(b.expectedQuantumAdvantage,'NONE_ASSUMED');
 assert.equal(quantumManifest().qpuConnected,false);
});
