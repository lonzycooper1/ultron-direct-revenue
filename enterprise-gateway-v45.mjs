import express from 'express';
import {verifyStripeEvent,getVerifiedStripeCheckout} from './payment-runtime.mjs';
import {enqueueEnterpriseJob,appendEnterpriseAudit,enterpriseStoreHealth} from './enterprise-store-v45.mjs';
import {turnSignalIntoBrief,enterpriseCycle} from './enterprise-cycle-v45.mjs';
import {marketProduct} from './ai-market.mjs';
export function createEnterpriseGateway({env=process.env,request=fetch,storeHealth=enterpriseStoreHealth,
 audit=appendEnterpriseAudit,enqueue=enqueueEnterpriseJob}={}){
 const app=express();app.disable('x-powered-by');
 app.use((req,res,next)=>{res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');next()});
 const owner=(req,res,next)=>{
  const key=env.ULTRON_ACQUISITION_ADMIN_TOKEN;
  if(!key||req.get('authorization')!=='Bearer '+key)return res.status(403).json({ok:false,error:'Owner authorization required'});
  next();
 };
 app.get('/api/enterprise/v45/health',async(req,res)=>{
  const database=await storeHealth();
  res.status(database.ok?200:503).json({ok:database.ok,database,
   payments:{paypal:'EXISTING_SIGNED_RUNTIME',stripe:Boolean(env.STRIPE_SECRET_KEY&&env.STRIPE_WEBHOOK_SECRET)?'CONFIGURED_NOT_SETTLEMENT_VERIFIED':'OWNER_AUTH_REQUIRED',payhip:'PROVISIONAL_SIGNATURE_ONLY'},
   autonomy:{enabled:env.ULTRON_ENTERPRISE_ENABLED==='true',approvalGates:true},
   smtp:{configured:Boolean(env.ULTRON_SMTP_HOST&&env.ULTRON_SMTP_USER&&env.ULTRON_SMTP_PASSWORD)},
   financialTargetUsdAnnual:50000000,revenueVerifiedByThisEndpoint:false});
 });
 app.post('/webhooks/stripe',express.raw({type:'application/json',limit:'128kb'}),async(req,res)=>{
  if(!env.STRIPE_WEBHOOK_SECRET||!env.STRIPE_SECRET_KEY||!env.ULTRON_EVENT_HMAC_SECRET)
   return res.status(503).json({ok:false,error:'Provider authorization incomplete'});
  let event;
  try{event=verifyStripeEvent(req.body,req.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET)}
  catch{return res.status(401).json({ok:false,error:'Invalid Stripe event signature'})}
  try{
   // No financial claim follows from a signed webhook alone.
   const kind=event.type;
   let verified=null, disposition='EVENT_RECORDED';
   if(kind==='checkout.session.completed'&&event.data?.object?.payment_status==='paid'){
    verified=await getVerifiedStripeCheckout(event.data.object.id,{apiKey:env.STRIPE_SECRET_KEY,request});
    const product=marketProduct(verified.productId);
    const expected=product?Math.round(Number(product.price)*100):null;
    if(expected===null||expected!==verified.amountCents||verified.currency!=='USD')disposition='PRICE_OR_SKU_REQUIRES_OWNER_REVIEW';
    else disposition='PAYMENT_CONFIRMED_DELIVERY_REVIEW_REQUIRED';
   }
   await audit({eventId:'stripe:'+event.id,kind:'STRIPE_PROVIDER_EVENT',
    payload:{eventType:kind,providerId:event.id,sessionId:verified?.sessionId||null,disposition,
     paymentIntentId:verified?.paymentIntentId||null,amountCents:verified?.amountCents||null,
     bankSettlementVerified:false,customerAccepted:false}});
   if(verified&&disposition==='PAYMENT_CONFIRMED_DELIVERY_REVIEW_REQUIRED'){
    await enqueue({kind:'ORDER_REVIEW',dedupeKey:'stripe:order:'+verified.sessionId,
     payload:{provider:'stripe',sessionId:verified.sessionId,productId:verified.productId,
      amountCents:verified.amountCents,currency:verified.currency,
      // Buyer identity is stored only in the protected database, never emitted by the public endpoint.
      buyerEmail:verified.buyerEmail,bankSettlementVerified:false}});
   }
   res.status(200).json({ok:true,eventId:event.id,disposition});
  }catch(e){
   res.status(500).json({ok:false,error:'Provider event requires reconciliation'});
  }
 });
 app.post('/api/enterprise/v45/demand',owner,express.json({limit:'24kb'}),async(req,res)=>{
  try{const brief=turnSignalIntoBrief(req.body);
   const record=await enqueue({kind:'PRODUCT_DRAFT',dedupeKey:'owner:demand:'+String(req.body.eventId||brief.title).slice(0,100),
    payload:{brief,sourceStatus:'OWNER_VERIFIED_REFERENCE_NOT_PROVEN_BUYER'}});
   return res.status(202).json({ok:true,job:record,publiclyPublished:false});
  }catch(e){return res.status(400).json({ok:false,error:String(e.message).slice(0,150)})}
 });
 app.post('/api/enterprise/v45/pulse',owner,async(req,res)=>{
  try{return res.status(200).json({ok:true,cycle:await enterpriseCycle.pulse()})}
  catch{return res.status(500).json({ok:false,error:'Cycle requires operator investigation'})}
 });
 return app;
}
export const enterpriseGateway=createEnterpriseGateway();
