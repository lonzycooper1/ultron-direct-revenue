import test from 'node:test';import assert from 'node:assert/strict';
import {dispatchOperationalAlerts} from './ultron-alert-delivery-v41.mjs';
test('alerts stay queued without approved destination and activation',async()=>{
 const result=await dispatchOperationalAlerts({env:{},fetchImpl:()=>{throw Error('must not send')}});assert.equal(result.submitted,0);
});
test('provider acceptance is never marked received and no customer data is sent',async()=>{
 const state={alerts:{a:{id:'a',kind:'PAID_AUDIT_NEEDS_REVIEW',status:'QUEUED_NOT_DELIVERED',reference:'PRIVATE_ORDER'}}};let body;
 const deps={env:{ULTRON_ALERTS_ENABLED:'true',ULTRON_ALERT_WEBHOOK_URL:'https://fixture-notify.org/'},read:async()=>state,mutate:async f=>f(state),validateUrl:async x=>x,fetchImpl:async(_u,o)=>{body=o.body;return {ok:true,status:200}}};
 const r=await dispatchOperationalAlerts(deps);assert.equal(r.submitted,1);assert.equal(r.received,0);assert.equal(body.includes('PRIVATE_ORDER'),false);
 assert.equal((await dispatchOperationalAlerts(deps)).submitted,0);
});
test('timeout cannot trigger a duplicate alert POST',async()=>{
 const state={alerts:{a:{id:'a',kind:'PAID_AUDIT_NEEDS_REVIEW',status:'QUEUED_NOT_DELIVERED'}}};let sends=0;
 const deps={env:{ULTRON_ALERTS_ENABLED:'true',ULTRON_ALERT_WEBHOOK_URL:'https://fixture-notify.org/'},read:async()=>state,mutate:async f=>f(state),validateUrl:async x=>x,fetchImpl:async()=>{sends++;throw Error('ambiguous timeout')}};
 await dispatchOperationalAlerts(deps);await dispatchOperationalAlerts(deps);assert.equal(sends,1);assert.match(state.alerts.a.status,/NO_AUTORETRY/);
});
