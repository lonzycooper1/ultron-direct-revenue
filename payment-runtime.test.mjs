import test from 'node:test';
import assert from 'node:assert/strict';
import {assertCaptureMatches,buildFulfillment,renderFulfillmentHtml,verifyPayPalRuntime} from './payment-runtime.mjs';

const order={id:'ORDER123',product:'audit',amount:'250.00',currency:'USD'};
const capture={id:'CAPTURE123',status:'COMPLETED',amount:{value:'250.00',currency_code:'USD'}};

test('completed matching capture creates fulfillment',()=>{
  assert.equal(assertCaptureMatches(order,capture),true);
  const f=buildFulfillment(order,capture,'2026-10-05T00:00:00.000Z');
  assert.equal(f.status,'READY');
  assert.equal(f.product,'audit');
  assert.equal(f.amount,'250.00');
  assert.equal(f.currency,'USD');
  assert.match(f.token,/^[a-f0-9]{48}$/);
  assert.match(renderFulfillmentHtml(f),/Payment verified/);
});

test('mismatched amount or currency is rejected',()=>{
  assert.throws(()=>assertCaptureMatches(order,{...capture,amount:{value:'249.99',currency_code:'USD'}}),/amount mismatch/);
  assert.throws(()=>assertCaptureMatches(order,{...capture,amount:{value:'250.00',currency_code:'EUR'}}),/currency mismatch/);
});

test('paypal runtime self-test verifies configured webhook',async()=>{
  const paypal=async()=>({url:'https://example.com/webhooks/paypal',event_types:[{name:'PAYMENT.CAPTURE.COMPLETED'}]});
  const s=await verifyPayPalRuntime({paypal,webhookId:'WH-1',publicBaseUrl:'https://example.com'});
  assert.equal(s.ok,true);
  assert.equal(s.apiAuthorized,true);
  assert.equal(s.webhookEndpointVerified,true);
  assert.equal(s.captureEventsSubscribed,true);
});
