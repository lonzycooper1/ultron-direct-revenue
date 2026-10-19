import test from 'node:test';import assert from 'node:assert/strict';
import {runHostedJob,recoverHostedBuild} from './hosted-executor.mjs';
function setup({kind='build',exitCode=0,status='completed',approval=false,action}={}){
 const calls=[],checkpoints=[];const item=kind==='build'?{type:'command_execution',command:'npm test',exit_code:exitCode,status:'completed',output:'1 test passed'}:{type:'computer_use_call',status:'completed',output:{image_url:'data:image/jpeg;base64,aW1hZ2U='}};
 const events=[{type:'agent.session.created',session:{id:'SESSION'}},{type:'agent.session.turn.created',session_id:'SESSION',turn_id:'TURN'},{type:'agent.session.turn.item.done',session_id:'SESSION',turn_id:'TURN',item},...(approval?[{type:'agent.session.requires_action',session:{required_actions:action?[action]:[]}}]:[])];
 const stream={async *[Symbol.asyncIterator](){yield*events},withResultCollection(){},finalResult:async()=>({session_id:'SESSION',turn_id:'TURN',turn:{status,usage:{}},output_text:'Actual result'}),controller:{abort(){calls.push('abort')}}};
 const sessions={create:async(body)=>{calls.push('create');assert.equal(body.environment.type,'openai_hosted');assert.equal(body.spend_control,undefined);assert.equal(JSON.stringify(body).includes('private-key'),false);return stream},artifacts:{async *list(){yield {id:'ARTIFACT',turn_id:'TURN',path:kind==='build'?'/workspace/outputs/product.zip':'/workspace/outputs/report.txt',size_bytes:4}},content:async()=>new Response(Buffer.from('data'))},events:{create:async()=>calls.push('cancel')},delete:async()=>{assert.ok(checkpoints.some(x=>x.downloadedResult));calls.push('delete')}};
 return {args:{job:{id:'JOB',kind,prompt:'Build and test'},key:'private-key',env:{},client:{beta:{agents:{sessions}}},checkpoint:async x=>checkpoints.push(x)},calls,checkpoints};
}
test('hosted coding requires real test execution, downloads exact-turn files and saves before cleanup',async()=>{const f=setup(),result=await runHostedJob(f.args);assert.equal(result.evidence.commands[0].exitCode,0);assert.equal(result.artifacts[0].base64,Buffer.from('data').toString('base64'));assert.deepEqual(f.calls,['create','abort','delete']);assert.equal(result.responseId,'TURN')});
test('a generated success claim cannot replace a passing test command',async()=>{const f=setup({exitCode:1});await assert.rejects(runHostedJob(f.args),/successful standalone test/);assert.ok(f.calls.includes('cancel'));assert.ok(!f.calls.includes('delete'));assert.ok(f.checkpoints.some(x=>x.reconciliationRequired))});
test('browser execution requires observed screenshot activity',async()=>{const f=setup({kind:'computer'}),result=await runHostedJob(f.args);assert.equal(result.evidence.computerActions,1);assert.equal(result.evidence.screenshots,1)});
test('pending authentication causes reconciliation, never implicit approval',async()=>{const f=setup({approval:true});await assert.rejects(runHostedJob(f.args),/external authorization/);assert.ok(f.calls.includes('cancel'));assert.ok(!f.calls.includes('delete'))});
test('failed turn is never returned as completed work',async()=>{const f=setup({status:'failed'});await assert.rejects(runHostedJob(f.args),/did not complete/)});

test('fixed acceptance validation errors retain a diagnosis without the existing key',async()=>{const f=setup();f.args.job.idempotencyKey='verification:fixture';f.args.client.beta.agents.sessions.create=async()=>{throw {status:400,error:{message:'Invalid model; private-key sk-fixture-secret'}}};await assert.rejects(runHostedJob(f.args),e=>e.message.includes('Invalid model')&&!e.message.includes('private-key')&&!e.message.includes('sk-fixture-secret'));assert.equal(f.checkpoints.length,0)});

import {successfulTestExecution} from './test-execution-evidence.mjs';
test('recognizes actual hosted shell receipts without accepting shell scripts',()=>{
 const receipt=command=>({command,exitCode:0,status:'completed'});
 for(const c of ["/bin/bash -lc 'node --test'", '/bin/sh -c "npm test"', 'node --test calculator.test.cjs']) assert.equal(successfulTestExecution(receipt(c)),true,c);
 for(const c of ["/bin/bash -lc 'node --test; true'", 'node --test || true', 'node --test > fake.log', 'node --test $(echo test)', "echo 'node --test'", 'node --test\ntrue']) assert.equal(successfulTestExecution(receipt(c)),false,c);
 assert.equal(successfulTestExecution({...receipt('node --test'),exitCode:1}),false);
 assert.equal(successfulTestExecution({...receipt('node --test'),status:'running'}),false);
});

test('recovery verifies provider ownership and completed turn without replay',async()=>{
 const f=setup(),sessions=f.args.client.beta.agents.sessions;
 sessions.retrieve=async()=>({metadata:{ultron_job_id:'JOB'},agent:{model:'fixture'}});
 sessions.turns={retrieve:async()=>({status:'completed',usage:{}})};
 const job={id:'JOB',kind:'build',status:'RECONCILIATION_REQUIRED',hosted:{sessionId:'SESSION',turnId:'TURN',commands:[{command:"/bin/bash -lc 'node --test'",exitCode:0,status:'completed'}]}};
 const result=await recoverHostedBuild({job,sessions});assert.equal(result.artifacts.length,1);assert.equal(result.evidence.cleanup,'RETAINED_AFTER_RECOVERY');assert.deepEqual(f.calls,[]);
 sessions.retrieve=async()=>({metadata:{ultron_job_id:'OTHER'}});await assert.rejects(recoverHostedBuild({job,sessions}),/belong/);
 sessions.retrieve=async()=>({metadata:{ultron_job_id:'JOB'}});sessions.turns.retrieve=async()=>({status:'cancelled'});await assert.rejects(recoverHostedBuild({job,sessions}),/not completed/);
});

test('fixed public verification approves only its exact origin and never login requests',async()=>{
 const action={type:'computer_use_approval_request',request_id:'REQUEST',request:{type:'browser_origin_access',origin:'https://ultron-product-lab.vercel.app'}};
 const f=setup({kind:'computer',approval:true,action});f.args.job.idempotencyKey='verification:hosted-browser:read-only:v3';
 f.args.client.beta.agents.sessions.events.create=async(id,body)=>{assert.equal(body.events[0].response.decision,'approve')};
 assert.equal((await runHostedJob(f.args)).evidence.screenshots,1);
 for(const request of [{type:'browser_origin_access',origin:'https://other.example'},{type:'browser_authentication'}]){
  const g=setup({kind:'computer',approval:true,action:{...action,request}});g.args.job.idempotencyKey=f.args.job.idempotencyKey;await assert.rejects(runHostedJob(g.args),/external authorization/);
 }
});
