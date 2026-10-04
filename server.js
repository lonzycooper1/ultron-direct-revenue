import {answerQuestion} from './support.js';
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
const PAYPAL_LIVE_READY=Boolean(PAYPAL_CLIENT_ID&&PAYPAL_CLIENT_SECRET&&PUBLIC_BASE_URL);
let tokenCache={token:null,expiresAt:0},writeQueue=Promise.resolve();
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

export function createApp(){return createServer(async(req,res)=>{
 const path=new URL(req.url,'http://local').pathname;
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
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
 if(path==='/health'&&req.method==='GET')return json(200,{ok:true,environment:'production-only',storefront:'ready',paymentReady:PAYPAL_LIVE_READY,paypal:{mode:'live',apiBase:PAYPAL_BASE,credentialsConfigured:Boolean(PAYPAL_CLIENT_ID&&PAYPAL_CLIENT_SECRET),webhookConfigured:Boolean(PAYPAL_WEBHOOK_ID)},sandboxFallback:false});
 if(path==='/api/leads')return json(503,{ok:false,message:'Direct inquiry storage is not connected. Use the contact form linked on the storefront.'});
 if(path==='/api/payment-status'&&req.method==='GET')return json(200,{provider:'PayPal',mode:'live',apiAuthorized:PAYPAL_LIVE_READY,webhookConfigured:Boolean(PAYPAL_WEBHOOK_ID),sandboxFallback:false});
 if(path==='/buy'&&req.method==='GET'){if(!PAYPAL_LIVE_READY)return json(503,{error:'Live PayPal authorization is not configured'});const key=new URL(req.url,'http://local').searchParams.get('product')||'';const o=await createPayPalOrder(key);res.writeHead(303,{Location:o.approve,'Cache-Control':'no-store'});return res.end();}
 if(path==='/paypal/return'&&req.method==='GET'){if(!PAYPAL_LIVE_READY)return json(503,{error:'Live PayPal authorization is not configured'});const id=new URL(req.url,'http://local').searchParams.get('token')||'';const x=await capturePayPalOrder(id);if(!x.capture||x.capture.status!=='COMPLETED')return json(409,{error:'PayPal capture not completed'});res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end('<!doctype html><meta charset="utf-8"><title>Payment received</title><style>body{font-family:system-ui;background:#090c10;color:#fff;padding:40px}main{max-width:700px;margin:auto;background:#141920;padding:28px;border-radius:16px}a{color:#6ee77a}</style><main><h1>Payment received</h1><p>Status: COMPLETED</p><p>Amount: '+String(x.capture.amount?.value||'')+' '+String(x.capture.amount?.currency_code||'USD')+'</p><p>PayPal capture ID: '+String(x.capture.id||'')+'</p><p><a href="/">Return to storefront</a></p></main>');}
 if(path==='/paypal/cancel'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end('<!doctype html><meta charset="utf-8"><title>Payment canceled</title><h1>Payment canceled</h1><p>No charge was completed. <a href="/">Return</a>.</p>');}
 if(path==='/api/paypal/webhook'&&req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>512000)return json(413,{error:'Webhook too large'})}let event;try{event=JSON.parse(raw)}catch{return json(400,{error:'Invalid JSON'})}if(!(await verifyPayPalWebhook(req,event)))return json(400,{error:'Webhook verification failed'});await saveLedger(l=>{l.events.unshift({id:event.id||null,type:event.event_type||null,resourceId:event.resource?.id||null,at:new Date().toISOString()});l.events=l.events.slice(0,5000)});return json(200,{ok:true});}
 if(path==='/api/orders'&&req.method==='GET'){if(!process.env.ADMIN_API_KEY||req.headers['x-ultron-admin-key']!==process.env.ADMIN_API_KEY)return json(401,{error:'Unauthorized'});return json(200,await ledger());}
 if(path==='/'&&(req.method==='GET'||req.method==='HEAD')){try{const body=await readFile(new URL('./public/index.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});return res.end(req.method==='HEAD'?undefined:body);}catch{return json(503,{ok:false,message:'Storefront unavailable'});}}
 return json(404,{ok:false,message:'Not found'});
});}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');createApp().listen(port,'0.0.0.0',()=>console.log('ULTRON storefront listening'));}

