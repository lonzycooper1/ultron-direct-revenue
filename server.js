import {answerQuestion} from './support.js';
import {runAgentCycle,agentState,insightBySlug,renderInsightsIndex,renderInsight} from './agents.mjs';
import {runMicroTool} from './revenue-engines.mjs';
import {assertCaptureMatches,buildFulfillment,renderFulfillmentHtml,verifyPayPalRuntime} from './payment-runtime.mjs';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const PRODUCTS=Object.freeze({
 audit:{name:'Workflow Audit',amount:'250.00',currency:'USD'},
 lead:{name:'Lead System Setup',amount:'750.00',currency:'USD'},
 full:{name:'Full Automation Setup',amount:'2500.00',currency:'USD'}
});
const PAYPAL_BASE='https://api-m.paypal.com';
const PAYPAL_CLIENT_ID=process.env.PAYPAL_CLIENT_ID||'';
const PAYPAL_CLIENT_SECRET=process.env.PAYPAL_CLIENT_SECRET||'';
const PAYPAL_WEBHOOK_ID=process.env.PAYPAL_WEBHOOK_ID||'';
const PUBLIC_BASE_URL=(process.env.PUBLIC_BASE_URL||'').replace(/\/$/,'');
const LEDGER_PATH=process.env.ORDER_LEDGER_PATH||'/data/orders.json';
const PAYPAL_LIVE_READY=Boolean(PAYPAL_CLIENT_ID&&PAYPAL_CLIENT_SECRET&&PAYPAL_WEBHOOK_ID&&PUBLIC_BASE_URL);
const AGENT_AUTORUN=process.env.AGENT_AUTORUN!=='false';
const AGENT_INTERVAL_MINUTES=Math.max(15,Number(process.env.AGENT_INTERVAL_MINUTES||60));
let tokenCache={token:null,expiresAt:0},writeQueue=Promise.resolve(),agentTimer=null,paymentTimer=null;
let paymentRuntimeState={ok:false,apiAuthorized:false,webhookEndpointVerified:false,captureEventsSubscribed:false,checkedAt:null,error:'Payment runtime not checked yet'};

async function ledger(){try{return JSON.parse(await readFile(LEDGER_PATH,'utf8'))}catch{return {orders:{},events:[]}}}
async function saveLedger(mut){writeQueue=writeQueue.then(async()=>{const l=await ledger();mut(l);await mkdir(dirname(LEDGER_PATH),{recursive:true});await writeFile(LEDGER_PATH,JSON.stringify(l,null,2))}).catch(e=>console.error('ledger',e));return writeQueue}
async function paypalToken(){
 if(!PAYPAL_CLIENT_ID||!PAYPAL_CLIENT_SECRET)throw Error('PayPal live credentials not configured');
 if(tokenCache.token&&Date.now()<tokenCache.expiresAt-60000)return tokenCache.token;
 const auth=Buffer.from(PAYPAL_CLIENT_ID+':'+PAYPAL_CLIENT_SECRET).toString('base64');
 const r=await fetch(PAYPAL_BASE+'/v1/oauth2/token',{method:'POST',headers:{authorization:'Basic '+auth,'content-type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
 const d=await r.json().catch(()=>({}));if(!r.ok||!d.access_token)throw Error('PayPal OAuth failed: '+r.status);
 tokenCache={token:d.access_token,expiresAt:Date.now()+Number(d.expires_in||300)*1000};return d.access_token
}
async function paypal(path,method='GET',body=null,requestId=null){
 const token=await paypalToken();
 const h={authorization:'Bearer '+token,'content-type':'application/json'};if(requestId)h['paypal-request-id']=requestId;
 const r=await fetch(PAYPAL_BASE+path,{method,headers:h,body:body?JSON.stringify(body):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok){const e=Error(d.message||('PayPal error '+r.status));e.status=r.status;e.data=d;throw e}return d
}
async function createPayPalOrder(key){
 const p=PRODUCTS[key];if(!p)throw Error('Unknown product');
 const body={intent:'CAPTURE',purchase_units:[{reference_id:key,description:p.name,amount:{currency_code:p.currency,value:p.amount}}],payment_source:{paypal:{experience_context:{user_action:'PAY_NOW',return_url:PUBLIC_BASE_URL+'/paypal/return',cancel_url:PUBLIC_BASE_URL+'/paypal/cancel'}}}};
 const o=await paypal('/v2/checkout/orders','POST',body,'create-'+key+'-'+crypto.randomUUID());
 const approve=(o.links||[]).find(x=>x.rel==='payer-action'||x.rel==='approve')?.href;if(!o.id||!approve)throw Error('No PayPal approval URL');
 await saveLedger(l=>{l.orders[o.id]={id:o.id,product:key,name:p.name,amount:p.amount,currency:p.currency,status:o.status,createdAt:new Date().toISOString()}});
 return {id:o.id,approve}
}
async function capturePayPalOrder(id){
 if(!/^[A-Z0-9]{8,32}$/i.test(id))throw Error('Invalid PayPal order');
 const o=await paypal('/v2/checkout/orders/'+encodeURIComponent(id)+'/capture','POST',{},'capture-'+id);
 const c=o.purchase_units?.flatMap(u=>u.payments?.captures||[])[0]||null;
 await saveLedger(l=>{l.orders[id]={...(l.orders[id]||{id}),status:c?.status||o.status||'UNKNOWN',captureId:c?.id||null,capturedAmount:c?.amount?.value||null,capturedCurrency:c?.amount?.currency_code||null,capturedAt:new Date().toISOString()}});
 return {order:o,capture:c}
}
async function verifyPayPalWebhook(req,event){
 if(!PAYPAL_WEBHOOK_ID)throw Error('PayPal webhook ID not configured');
 const body={auth_algo:req.headers['paypal-auth-algo'],cert_url:req.headers['paypal-cert-url'],transmission_id:req.headers['paypal-transmission-id'],transmission_sig:req.headers['paypal-transmission-sig'],transmission_time:req.headers['paypal-transmission-time'],webhook_id:PAYPAL_WEBHOOK_ID,webhook_event:event};
 const r=await paypal('/v1/notifications/verify-webhook-signature','POST',body);return r.verification_status==='SUCCESS'
}
async function repairPayPalWebhook(){
 if(!PAYPAL_WEBHOOK_ID||!PUBLIC_BASE_URL)return;
 const hook=await paypal('/v1/notifications/webhooks/'+encodeURIComponent(PAYPAL_WEBHOOK_ID));
 const desiredUrl=PUBLIC_BASE_URL+'/webhooks/paypal';
 const names=new Set((hook.event_types||[]).map(x=>x?.name).filter(Boolean));
 names.add('PAYMENT.CAPTURE.COMPLETED');
 names.add('CHECKOUT.ORDER.COMPLETED');
 const patch=[];
 if(String(hook.url||'').replace(/\/$/,'')!==desiredUrl)patch.push({op:'replace',path:'/url',value:desiredUrl});
 if(!(hook.event_types||[]).some(x=>x?.name==='PAYMENT.CAPTURE.COMPLETED'))patch.push({op:'replace',path:'/event_types',value:[...names].map(name=>({name}))});
 if(patch.length)await paypal('/v1/notifications/webhooks/'+encodeURIComponent(PAYPAL_WEBHOOK_ID),'PATCH',patch);
}
async function runPaymentSelfTest(reason='scheduled'){
 try{
  paymentRuntimeState=await verifyPayPalRuntime({paypal,webhookId:PAYPAL_WEBHOOK_ID,publicBaseUrl:PUBLIC_BASE_URL});
  if(!paymentRuntimeState.ok&&paymentRuntimeState.apiAuthorized){
   await repairPayPalWebhook();
   paymentRuntimeState=await verifyPayPalRuntime({paypal,webhookId:PAYPAL_WEBHOOK_ID,publicBaseUrl:PUBLIC_BASE_URL});
  }
  console.log('ULTRON payment self-test',reason,paymentRuntimeState.ok?'READY':'BLOCKED',JSON.stringify(paymentRuntimeState));
  return paymentRuntimeState;
 }catch(e){
  paymentRuntimeState={ok:false,apiAuthorized:false,webhookEndpointVerified:false,captureEventsSubscribed:false,checkedAt:new Date().toISOString(),error:String(e?.message||e)};
  console.error('payment-self-test',e);return paymentRuntimeState;
 }
}
async function ensureFulfillment(id,capture){
 let out=null;
 await saveLedger(l=>{
  const order=l.orders[id];
  if(!order)throw Error('Unknown local order');
  assertCaptureMatches(order,capture);
  if(!order.fulfillment)order.fulfillment=buildFulfillment(order,capture);
  order.status='COMPLETED';
  order.captureId=capture.id||order.captureId||null;
  order.capturedAmount=capture.amount?.value||order.capturedAmount||null;
  order.capturedCurrency=capture.amount?.currency_code||order.capturedCurrency||null;
  order.capturedAt=order.capturedAt||new Date().toISOString();
  out=order.fulfillment;
 });
 return out;
}
async function reconcileCompletedCaptureEvent(event){
 const capture=event?.resource||null;
 const orderId=capture?.supplementary_data?.related_ids?.order_id||null;
 if(!orderId||!capture)return {matched:false};
 const l=await ledger();
 if(!l.orders?.[orderId])return {matched:false};
 const fulfillment=await ensureFulfillment(orderId,capture);
 return {matched:true,orderId,fulfillment};
}
async function fulfillmentByToken(token){
 if(!/^[a-f0-9]{48}$/.test(String(token||'')))return null;
 const l=await ledger();
 for(const order of Object.values(l.orders||{}))if(order?.fulfillment?.token===token)return order.fulfillment;
 return null;
}

async function runAgents(reason='scheduled'){
 try{const s=await runAgentCycle({ledger:await ledger(),baseUrl:PUBLIC_BASE_URL||'https://ultron-direct-revenue-production.up.railway.app'});console.log('ULTRON agents cycle',reason,s.metrics?.lastCycleAt);return s}
 catch(e){console.error('agent-cycle',e);return null}
}
function startAgents(){
 if(!paymentTimer){
  setTimeout(()=>runPaymentSelfTest('startup'),1500);
  paymentTimer=setInterval(()=>runPaymentSelfTest('scheduled'),60*60*1000);
  paymentTimer.unref?.();
 }
 if(!AGENT_AUTORUN||agentTimer)return;
 setTimeout(()=>runAgents('startup'),5000);
 agentTimer=setInterval(()=>runAgents('scheduled'),AGENT_INTERVAL_MINUTES*60*1000);
 agentTimer.unref?.();
}

export function createApp(){return createServer(async(req,res)=>{
 const url=new URL(req.url,'http://local');const path=url.pathname;
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
  if(path==='/api/support'&&req.method==='POST'){
   if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'Use application/json'});
   if(req.headers.origin&&req.headers.origin!==`https://${req.headers.host}`&&req.headers.origin!==`http://${req.headers.host}`)return json(403,{error:'Origin rejected'});
   try{let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>4096)return json(413,{error:'Question too long'});}const data=JSON.parse(body);return json(200,answerQuestion(data.question));}catch{return json(400,{error:'Enter a question between 2 and 600 characters.'});}
  }
  if((path==='/support'||path==='/support-client.js')&&req.method==='GET'){
   try{const file=path==='/support'?'support.html':'support-client.js';const body=await readFile(new URL('./public/'+file,import.meta.url));res.writeHead(200,{'Content-Type':path==='/support'?'text/html; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-cache'});return res.end(body);}catch{return json(503,{error:'Support unavailable'});}
  }
  if(path==='/blog/booking-guide'&&req.method==='GET'){try{const body=await readFile(new URL('./public/booking-guide.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});return res.end(body);}catch{return json(503,{error:'Guide unavailable'});}}
  if(path==='/booking-kit-cover.jpg'&&req.method==='GET'){try{const body=await readFile(new URL('./public/booking-kit-cover.jpg',import.meta.url));res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'public, max-age=3600'});return res.end(body);}catch{return json(404,{error:'Image unavailable'});}}
  if(path==='/health'&&req.method==='GET'){const a=await agentState();return json(200,{ok:true,environment:'production-only',storefront:'ready',paymentReady:PAYPAL_LIVE_READY&&paymentRuntimeState.ok,paypal:{mode:'live',apiBase:PAYPAL_BASE,credentialsConfigured:Boolean(PAYPAL_CLIENT_ID&&PAYPAL_CLIENT_SECRET),webhookConfigured:Boolean(PAYPAL_WEBHOOK_ID),runtime:paymentRuntimeState},agents:{autorun:AGENT_AUTORUN,intervalMinutes:AGENT_INTERVAL_MINUTES,lastCycleAt:a.metrics?.lastCycleAt||null,cycles:a.metrics?.cycles||0,insightsPublished:a.metrics?.insightsPublished||0},sandboxFallback:false});}
  if(path==='/api/revenue-bots'&&req.method==='GET'){const a=await agentState();return json(200,{ok:true,suite:a.revenueBotSuite||null,metrics:a.metrics||{}});}
  if(path.startsWith('/api/tools/')&&req.method==='POST'){
   if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'Use application/json'});
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16384)return json(413,{error:'Payload too large'})}
   let data;try{data=raw?JSON.parse(raw):{}}catch{return json(400,{error:'Invalid JSON'})}
   try{return json(200,{ok:true,result:runMicroTool(decodeURIComponent(path.slice('/api/tools/'.length)),data)})}catch(e){return json(400,{error:e.message})}
  }
  if(path.startsWith('/api/reports/')&&req.method==='GET'){
   const report=decodeURIComponent(path.slice('/api/reports/'.length));const a=await agentState();
   if(report==='revenue-pipeline')return json(200,{ok:true,report,orders:a.metrics?.lastOrderCount||0,completed:a.metrics?.lastCompletedCount||0,revenueUsd:a.metrics?.lastRevenueUsd||0,asOf:a.metrics?.lastCycleAt||null});
   if(report==='content-performance')return json(200,{ok:true,report,insightsPublished:a.metrics?.insightsPublished||0,queuedCampaigns:a.campaignQueue?.length||0,asOf:a.metrics?.lastCycleAt||null});
   if(report==='opportunity-scorecard')return json(200,{ok:true,report,lastRun:a.runs?.[0]?.orchestration||null,asOf:a.metrics?.lastCycleAt||null});
   return json(404,{error:'Unknown report'});
  }
  if(path==='/api/payment-status'&&req.method==='GET')return json(200,{provider:'PayPal',mode:'live',configured:PAYPAL_LIVE_READY,apiAuthorized:paymentRuntimeState.apiAuthorized,webhookConfigured:Boolean(PAYPAL_WEBHOOK_ID),webhookEndpointVerified:paymentRuntimeState.webhookEndpointVerified,captureEventsSubscribed:paymentRuntimeState.captureEventsSubscribed,ready:PAYPAL_LIVE_READY&&paymentRuntimeState.ok,lastCheckedAt:paymentRuntimeState.checkedAt,error:paymentRuntimeState.error,sandboxFallback:false});
  if(path==='/api/agent-status'&&req.method==='GET'){const a=await agentState();return json(200,{ok:true,metrics:a.metrics,agents:a.agents,recentRuns:a.runs?.slice(0,10)||[],campaignQueue:a.campaignQueue?.slice(0,10)||[]});}
  if(path==='/api/agent-run'&&req.method==='POST'){if(!process.env.ADMIN_API_KEY||req.headers['x-ultron-admin-key']!==process.env.ADMIN_API_KEY)return json(401,{error:'Unauthorized'});const a=await runAgents('manual');return json(a?200:500,a?{ok:true,metrics:a.metrics}:{ok:false});}
  if(path==='/insights'&&req.method==='GET'){const body=await renderInsightsIndex();res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300'});return res.end(body);}
  if(path.startsWith('/insights/')&&req.method==='GET'){const slug=decodeURIComponent(path.slice('/insights/'.length));const item=await insightBySlug(slug);if(!item)return json(404,{error:'Insight not found'});const body=renderInsight(item);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300'});return res.end(body);}
  if(path==='/buy'&&req.method==='GET'){if(!PAYPAL_LIVE_READY)return json(503,{error:'Live PayPal authorization is not configured'});const key=url.searchParams.get('product')||'';const o=await createPayPalOrder(key);res.writeHead(303,{Location:o.approve,'Cache-Control':'no-store'});return res.end();}
  if(path==='/paypal/return'&&req.method==='GET'){if(!PAYPAL_LIVE_READY)return json(503,{error:'Live PayPal authorization is not configured'});const id=url.searchParams.get('token')||'';const x=await capturePayPalOrder(id);if(!x.capture||x.capture.status!=='COMPLETED')return json(409,{error:'PayPal capture not completed'});const fulfillment=await ensureFulfillment(id,x.capture);await runAgents('completed-payment');res.writeHead(303,{Location:'/fulfillment?token='+encodeURIComponent(fulfillment.token),'Cache-Control':'no-store'});return res.end();}
  if(path==='/fulfillment'&&req.method==='GET'){const f=await fulfillmentByToken(url.searchParams.get('token')||'');if(!f)return json(404,{error:'Fulfillment not found'});res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(renderFulfillmentHtml(f));}
  if(path==='/paypal/cancel'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end('<!doctype html><meta charset="utf-8"><title>Payment canceled</title><h1>Payment canceled</h1><p>No charge was completed. <a href="/">Return</a>.</p>');}
  if((path==='/webhooks/paypal'||path==='/api/paypal/webhook')&&req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>512000)return json(413,{error:'Webhook too large'})}let event;try{event=JSON.parse(raw)}catch{return json(400,{error:'Invalid JSON'})}if(!(await verifyPayPalWebhook(req,event)))return json(400,{error:'Webhook verification failed'});await saveLedger(l=>{l.events.unshift({id:event.id||null,type:event.event_type||null,resourceId:event.resource?.id||null,at:new Date().toISOString()});l.events=l.events.slice(0,5000)});let reconciled=null;if((event.event_type||'')==='PAYMENT.CAPTURE.COMPLETED')reconciled=await reconcileCompletedCaptureEvent(event);if(/PAYMENT\.CAPTURE\.COMPLETED|CHECKOUT\.ORDER\.COMPLETED/.test(event.event_type||''))setTimeout(()=>runAgents('paypal-webhook'),10);return json(200,{ok:true,reconciled:Boolean(reconciled?.matched)});}
  if(path==='/api/orders'&&req.method==='GET'){if(!process.env.ADMIN_API_KEY||req.headers['x-ultron-admin-key']!==process.env.ADMIN_API_KEY)return json(401,{error:'Unauthorized'});return json(200,await ledger());}
  if(path==='/'&&(req.method==='GET'||req.method==='HEAD')){try{const body=await readFile(new URL('./public/index.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});return res.end(req.method==='HEAD'?undefined:body);}catch{return json(503,{ok:false,message:'Storefront unavailable'});}}
  return json(404,{ok:false,message:'Not found'});
 }catch(e){console.error('request',path,e);return json(500,{error:'Request failed'});}
});}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
 createApp().listen(port,'0.0.0.0',()=>{console.log('ULTRON storefront listening');startAgents()});
}
