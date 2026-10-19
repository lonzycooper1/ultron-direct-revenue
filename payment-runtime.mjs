import {randomBytes,createHmac,timingSafeEqual} from 'node:crypto';

function moneyString(value){
  const n=Number(value);
  if(!Number.isFinite(n)||n<0)throw Error('Invalid payment amount');
  return n.toFixed(2);
}

export function assertCaptureMatches(order,capture){
  if(!order||!capture)throw Error('Missing order or capture');
  if(String(capture.status||'')!=='COMPLETED')throw Error('Capture not completed');
  const expectedAmount=moneyString(order.amount);
  const actualAmount=moneyString(capture.amount?.value);
  const expectedCurrency=String(order.currency||'').toUpperCase();
  const actualCurrency=String(capture.amount?.currency_code||'').toUpperCase();
  if(expectedAmount!==actualAmount)throw Error('Capture amount mismatch');
  if(!expectedCurrency||expectedCurrency!==actualCurrency)throw Error('Capture currency mismatch');
  return true;
}

export function buildFulfillment(order,capture,createdAt=new Date().toISOString()){
  assertCaptureMatches(order,capture);
  const token=randomBytes(24).toString('hex');
  const product=String(order.product||'');
  const plans={
    audit:{
      title:'Workflow Audit onboarding',
      nextSteps:['Complete the intake checklist below.','Describe your current lead process and the biggest bottleneck.','Provide only the non-sensitive business information needed for the review.']
    },
    lead:{
      title:'Lead System Setup onboarding',
      nextSteps:['Confirm the agreed scope before implementation begins.','Provide your current lead stages, follow-up process and booking flow.','Do not send passwords, banking credentials or unrelated personal data.']
    },
    full:{
      title:'Full Automation Setup onboarding',
      nextSteps:['Confirm the written scope and delivery schedule.','List the tools and business workflows that are in scope.','Share access only through the official authorization flow of each platform; never send passwords in plain text.']
    }
  };
  const plan=plans[product];
  if(!plan)throw Error('Unknown fulfillment product');
  return {
    status:'READY',
    token,
    product,
    title:plan.title,
    nextSteps:plan.nextSteps,
    orderId:String(order.id||''),
    captureId:String(capture.id||''),
    amount:moneyString(capture.amount?.value),
    currency:String(capture.amount?.currency_code||'').toUpperCase(),
    createdAt
  };
}

function esc(value){
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function renderFulfillmentHtml(record){
 const title=esc(record?.title||'Your ULTRON digital delivery');
 const items=(record?.nextSteps||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
 const sections=(Array.isArray(record?.sections)?record.sections:[])
  .map(x=>'<section><h2>'+esc(x?.title||'Section')+'</h2><p>'+esc(x?.body||'').replace(/\n/g,'<br>')+'</p></section>').join('');
 const hasContent=Boolean(items||sections);
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>'+title+'</title>'+
 '<style>body{font:16px/1.6 system-ui;background:#08130e;color:#eafff0;margin:0;padding:24px}main{max-width:900px;margin:auto;background:#112219;border:1px solid #47765b;padding:clamp(16px,4vw,32px);border-radius:16px}h1{font-size:clamp(26px,5vw,42px)}h2{color:#7bffc0}section{border-top:1px solid #365543;margin-top:20px;padding-top:12px}p{white-space:normal;overflow-wrap:anywhere}a{color:#86f0ad}.muted{color:#bad2c2}</style>'+
 '<main><h1>'+title+'</h1><p>Payment confirmed. Your digital material is ready.</p>'+
 (record.orderId?'<p class="muted">Order '+esc(record.orderId)+'</p>':'')+
 (record.createdAt?'<p class="muted">Prepared '+esc(record.createdAt)+'</p>':'')+
 (sections?'<h2>Digital deliverables</h2>'+sections:'')+
 (items?'<h2>Next steps</h2><ol>'+items+'</ol>':'')+
 (!hasContent?'<p>Delivery contents are not yet available. Contact support with your order reference.</p>':'')+
 '<p><a href="/support">Support</a> · <a href="/">Return to ULTRON</a></p></main></html>';
}

export async function verifyPayPalRuntime({paypal,webhookId,publicBaseUrl}){
  const checkedAt=new Date().toISOString();
  if(!webhookId||!publicBaseUrl)return {ok:false,apiAuthorized:false,webhookEndpointVerified:false,captureEventsSubscribed:false,checkedAt,error:'Payment configuration incomplete'};
  try{
    const hook=await paypal('/v1/notifications/webhooks/'+encodeURIComponent(webhookId));
    const actual=String(hook.url||'').replace(/\/$/,'');
    const base=String(publicBaseUrl||'').replace(/\/$/,'');
    const allowed=new Set([base+'/webhooks/paypal',base+'/api/paypal/webhook']);
    const eventNames=new Set((hook.event_types||[]).map(x=>x?.name).filter(Boolean));
    const captureEventsSubscribed=eventNames.has('PAYMENT.CAPTURE.COMPLETED')||eventNames.has('*');
    return {
      ok:allowed.has(actual)&&captureEventsSubscribed,
      apiAuthorized:true,
      webhookEndpointVerified:allowed.has(actual),
      captureEventsSubscribed,
      webhookUrl:actual,
      checkedAt,
      error:null
    };
  }catch(e){
    return {ok:false,apiAuthorized:false,webhookEndpointVerified:false,captureEventsSubscribed:false,checkedAt,error:String(e?.message||e)};
  }
}

/**
 * Stripe optionally complements the existing verified PayPal implementation.
 * Verify the exact raw request bytes and independently retrieve the paid checkout.
 * Webhook receipt alone never marks a financial settlement or completed service.
 */
export function verifyStripeEvent(rawBody,signatureHeader,secret,{clock=Date.now,toleranceSeconds=300}={}){
 if(!secret||typeof secret!=='string'||secret.length<16)throw Error('Stripe signing secret unavailable');
 if(!Buffer.isBuffer(rawBody)||rawBody.length>128*1024)throw Error('Stripe webhook raw bytes required');
 if(typeof signatureHeader!=='string')throw Error('Stripe signature header missing');
 const values=signatureHeader.split(',').map(s=>s.trim().split('='));
 const timestamp=values.find(([k])=>k==='t')?.[1];
 if(!/^\d{10}$/.test(timestamp||'')||Math.abs(clock()/1000-Number(timestamp))>toleranceSeconds)throw Error('Expired Stripe signature');
 const sigs=values.filter(([k,v])=>k==='v1'&&/^[a-f0-9]{64}$/i.test(v||'')).map(([,v])=>Buffer.from(v,'hex'));
 if(!sigs.length)throw Error('Stripe signature absent');
 const expected=createHmac('sha256',secret).update(timestamp+'.').update(rawBody).digest();
 if(!sigs.some(x=>x.length===expected.length&&timingSafeEqual(x,expected)))throw Error('Invalid Stripe signature');
 const parsed=JSON.parse(rawBody.toString('utf8'));
 if(!parsed||!/^evt_[A-Za-z0-9]+$/.test(parsed.id||'')||typeof parsed.type!=='string')throw Error('Unsupported Stripe event');
 return parsed;
}
export async function getVerifiedStripeCheckout(sessionId,{apiKey=process.env.STRIPE_SECRET_KEY,request=fetch}={}){
 if(!apiKey||!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId||''))throw Error('Stripe API connection or session missing');
 const response=await request('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId),{
  headers:{authorization:'Bearer '+apiKey,accept:'application/json'},
  redirect:'error',signal:AbortSignal.timeout(12000)
 });
 if(!response.ok)throw Error('Stripe session verification HTTP '+response.status);
 const session=await response.json();
 if(session.id!==sessionId||session.payment_status!=='paid'||session.status!=='complete'||!Number.isSafeInteger(session.amount_total)||session.amount_total<1||!/^[a-z]{3}$/.test(session.currency||''))throw Error('Stripe session is not a verified completed payment');
 return {provider:'stripe',sessionId,amountCents:session.amount_total,currency:session.currency.toUpperCase(),
  paymentIntentId:String(session.payment_intent||''),buyerEmail:session.customer_details?.email||null,
  productId:String(session.metadata?.ultronProductId||''),bankSettlementVerified:false};
}
