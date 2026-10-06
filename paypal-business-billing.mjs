import {getJson,setJson} from './state-store.mjs';

const KEY='paypal-business-billing-v1';
const DEFAULT_RETAINER=Object.freeze({
 name:'ULTRON AI Growth & Automation Retainer',
 description:'Monthly AI workflow optimization, support, measured improvements and operating review.',
 amount:'1500.00',currency:'USD'
});

function stateSeed(){return {productId:null,planId:null,planStatus:null,invoiceApi:false,subscriptionApi:false,lastVerifiedAt:null,lastError:null}}

export async function billingState(){return getJson(KEY,stateSeed())}

export async function verifyBusinessBilling(paypal){
 const next=await billingState(),at=new Date().toISOString();
 try{
  await paypal('/v1/catalogs/products?page_size=1');
  next.subscriptionApi=true;
 }catch{next.subscriptionApi=false}
 try{
  await paypal('/v2/invoicing/invoices?page=1&page_size=1&total_required=false');
  next.invoiceApi=true;
 }catch{next.invoiceApi=false}
 next.lastVerifiedAt=at;next.lastError=null;await setJson(KEY,next);return next;
}

export async function ensureDefaultRetainer(paypal){
 const s=await billingState();
 if(s.productId&&s.planId)return s;
 const product=await paypal('/v1/catalogs/products','POST',{
  name:DEFAULT_RETAINER.name,description:DEFAULT_RETAINER.description,type:'SERVICE',category:'SOFTWARE'
 },'ultron-retainer-product-v1');
 const plan=await paypal('/v1/billing/plans','POST',{
  product_id:product.id,name:DEFAULT_RETAINER.name,description:DEFAULT_RETAINER.description,
  billing_cycles:[{frequency:{interval_unit:'MONTH',interval_count:1},tenure_type:'REGULAR',sequence:1,total_cycles:0,pricing_scheme:{fixed_price:{value:DEFAULT_RETAINER.amount,currency_code:DEFAULT_RETAINER.currency}}}],
  payment_preferences:{auto_bill_outstanding:true,setup_fee:{value:'0.00',currency_code:DEFAULT_RETAINER.currency},setup_fee_failure_action:'CONTINUE',payment_failure_threshold:3}
 },'ultron-retainer-plan-v1');
 const next={...s,productId:product.id,planId:plan.id,planStatus:plan.status||null,subscriptionApi:true,lastVerifiedAt:new Date().toISOString(),lastError:null};
 await setJson(KEY,next);return next;
}

export async function createSubscriptionApproval(paypal,{planId,returnUrl,cancelUrl}={}){
 if(!planId)throw Error('planId required');
 const sub=await paypal('/v1/billing/subscriptions','POST',{
  plan_id:planId,application_context:{brand_name:'ULTRON',user_action:'SUBSCRIBE_NOW',return_url:returnUrl,cancel_url:cancelUrl}
 },'subscription-'+Date.now());
 const approve=(sub.links||[]).find(x=>x.rel==='approve')?.href;
 if(!sub.id||!approve)throw Error('PayPal subscription approval URL unavailable');
 return {id:sub.id,status:sub.status,approveUrl:approve};
}

export async function createDraftInvoice(paypal,{email,description,amount,currency='USD',invoiceNumber}={}){
 if(!email)throw Error('customer email required');
 const value=Number(amount);if(!Number.isFinite(value)||value<=0)throw Error('positive invoice amount required');
 const invoice=await paypal('/v2/invoicing/invoices','POST',{
  detail:{invoice_number:String(invoiceNumber||('ULTRON-'+Date.now())).slice(0,50),currency_code:String(currency).toUpperCase(),note:'Thank you for choosing ULTRON.'},
  primary_recipients:[{billing_info:{email_address:String(email).slice(0,254)}}],
  items:[{name:String(description||'ULTRON AI service').slice(0,200),quantity:'1',unit_amount:{currency_code:String(currency).toUpperCase(),value:value.toFixed(2)}}]
 },'invoice-'+Date.now());
 return {id:invoice.id,status:'DRAFT'};
}
export async function sendInvoice(paypal,invoiceId){
 if(!invoiceId)throw Error('invoiceId required');
 await paypal('/v2/invoicing/invoices/'+encodeURIComponent(invoiceId)+'/send','POST',{send_to_invoicer:true,send_to_recipient:true},'invoice-send-'+invoiceId);
 return {id:invoiceId,status:'SENT'};
}
export function paypalBusinessBillingManifest(){
 return {version:'1.0.0',oneTime:'PayPal Orders API',agency:'PayPal Invoicing API',recurring:'PayPal Catalog Products + Billing Plans + Subscriptions API',defaultRetainer:DEFAULT_RETAINER,accounting:'Only provider-confirmed completed payments count as realized revenue.'};
}
