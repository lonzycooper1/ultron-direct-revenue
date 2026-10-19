import crypto from 'node:crypto';
import {claimDelivery,finishDelivery,appendEnterpriseAudit} from './enterprise-store-v45.mjs';
const address=x=>typeof x==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.trim());
export function smtpReadiness(env=process.env){
 return Boolean(env.ULTRON_SMTP_HOST&&env.ULTRON_SMTP_USER&&env.ULTRON_SMTP_PASSWORD&&env.ULTRON_SMTP_FROM&&address(env.ULTRON_SMTP_FROM));
}
export async function sendSmtp({to,subject,text,replyTo,env=process.env}={}){
 if(!smtpReadiness(env))throw Error('SMTP transport credentials are not configured');
 if(!address(to)||!subject||typeof text!=='string'||text.length>32000)throw Error('Invalid message');
 // The only accepted SMTP destination is a configured provider; STARTTLS/TLS is mandatory.
 const port=Number(env.ULTRON_SMTP_PORT||587);
 if(![465,587].includes(port))throw Error('SMTP port must be 465 or 587');
 const host=String(env.ULTRON_SMTP_HOST||'');
 if(!/^[a-z0-9.-]{4,255}$/i.test(host)||host==='localhost')throw Error('Invalid SMTP host');
 const {default:nodemailer}=await import('nodemailer');
 const transport=nodemailer.createTransport({
  host,port,secure:port===465,requireTLS:port===587,pool:false,
  auth:{user:env.ULTRON_SMTP_USER,pass:env.ULTRON_SMTP_PASSWORD},
  connectionTimeout:12000,greetingTimeout:10000,socketTimeout:20000,
  tls:{rejectUnauthorized:true}
 });
 try{
  const info=await transport.sendMail({from:env.ULTRON_SMTP_FROM,to,replyTo:replyTo||env.ULTRON_SMTP_FROM,subject,
   text,headers:{'X-ULTRON-Execution':'v45'}});
  if(!info.accepted?.includes(to))throw Error('SMTP recipient not accepted');
  return {messageId:String(info.messageId||''),accepted:true};
 }finally{transport.close()}
}
export function eligibleDigitalDelivery(order){
 return Boolean(order&&order.status==='COMPLETED'&&order.captureId&&
   order.fulfillment?.token&&order.product!=='ai-revenue-audit-500'&&
   order.fulfillment?.status!=='PENDING'&&order.fulfillment?.status!=='REVIEW_REQUIRED'&&
   !order.auditIntake&&!order.videoQuote);
}
export async function deliverVerifiedDigitalOrder({order,buyerEmail,baseUrl,send=sendSmtp}={}){
 if(!eligibleDigitalDelivery(order))return {status:'NOT_AUTOMATICALLY_DELIVERABLE'};
 if(!address(buyerEmail))return {status:'PROVIDER_BUYER_EMAIL_REQUIRED'};
 const link=new URL(baseUrl);
 if(link.protocol!=='https:'||link.username||link.password)throw Error('Public HTTPS origin required');
 const token=order.fulfillment.token;
 if(!/^[a-f0-9]{48}$/i.test(token))return {status:'FULFILLMENT_TOKEN_REVIEW_REQUIRED'};
 const receipt=await claimDelivery({provider:'paypal',captureId:order.captureId,toEmail:buyerEmail,
   artifactSha256:crypto.createHash('sha256').update(order.id+':'+token).digest('hex')});
 if(!receipt)return {status:'ALREADY_CLAIMED_NO_DUPLICATE_SEND'};
 const url=new URL('/fulfillment',link);url.searchParams.set('token',token);
 try{
  const result=await send({to:buyerEmail,subject:'Your ULTRON digital order',
   text:'Your payment has been confirmed for an eligible digital product. Your private delivery link:\n'+url.href+
   '\n\nPlease keep this link private. If your order involves a consulting service, production is not completed until separately confirmed.\nSupport: '+link.origin+'/support'});
  await finishDelivery(receipt.id,{messageId:result.messageId});
  // If the audit subsystem is unavailable, preserve delivery record and reconcile separately.
  try{await appendEnterpriseAudit({eventId:'delivery:'+order.captureId,kind:'DIGITAL_DELIVERY_ACCEPTED',
    payload:{provider:'paypal',captureId:order.captureId,deliveryId:receipt.id,messageId:result.messageId}})}catch{}
  return {status:'SMTP_PROVIDER_ACCEPTED',messageId:result.messageId,deliveredToInboxUnverified:true};
 }catch(e){
  await finishDelivery(receipt.id,{uncertain:true}).catch(()=>{});
  return {status:'RECONCILIATION_REQUIRED_NO_AUTORETRY'};
 }
}
