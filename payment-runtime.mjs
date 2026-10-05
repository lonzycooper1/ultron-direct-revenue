import {randomBytes} from 'node:crypto';

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
  const items=(record.nextSteps||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
  return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(record.title)+'</title><style>body{font-family:system-ui;background:#090c10;color:#fff;padding:32px}main{max-width:760px;margin:auto;background:#141920;border:1px solid #29313b;padding:28px;border-radius:16px}a{color:#6ee77a}.muted{color:#aeb7c3}</style><main><h1>'+esc(record.title)+'</h1><p>Payment verified. Your onboarding package is ready.</p><p class="muted">Order '+esc(record.orderId)+' · Capture '+esc(record.captureId)+' · '+esc(record.amount)+' '+esc(record.currency)+'</p><h2>Next steps</h2><ol>'+items+'</ol><p><a href="/support">Open support assistant</a> · <a href="/">Return to storefront</a></p></main>';
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
