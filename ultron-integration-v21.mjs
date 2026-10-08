import dns from 'node:dns/promises';
import {getJson,mutateJson} from './state-store.mjs';
const KEY='ultron-v21-provider-integrations',utc=()=>new Date().toISOString();
const clip=x=>String(x||'').trim().slice(0,300);
const fallback=()=>({version:'21.0.0',crmSync:{},bookings:{},lastChecked:null});
const read=()=>getJson(KEY,fallback());
export function readiness(env=process.env){
 const has=(...a)=>a.every(k=>Boolean(env[k]));
 const gmail=has('ULTRON_GMAIL_CLIENT_ID','ULTRON_GMAIL_CLIENT_SECRET','ULTRON_GMAIL_REFRESH_TOKEN','ULTRON_BUSINESS_SENDER','ULTRON_BUSINESS_POSTAL_ADDRESS','ULTRON_UNSUBSCRIBE_SECRET');
 const calendar=has('ULTRON_GOOGLE_CLIENT_ID','ULTRON_GOOGLE_CLIENT_SECRET','ULTRON_CALENDAR_REFRESH_TOKEN','ULTRON_CALENDAR_ID');
 return {version:'21.0.0',
   discovery:{configured:has('ULTRON_DISCOVERY_FEED_URL'),status:has('ULTRON_DISCOVERY_FEED_URL')?'ADAPTER_CONFIGURED_VERIFY_SOURCE':'NEEDS_AUTHORIZED_FEED'},
   domain:{configured:has('ULTRON_BRANDED_DOMAIN'),status:has('ULTRON_BRANDED_DOMAIN')?'VERIFY_DNS_AND_OWNERSHIP':'NEEDS_OWNED_DOMAIN'},
   gmail:{configured:gmail,status:gmail?'VERIFY_RUNTIME_OAUTH_AND_DNS':'NEEDS_RAILWAY_BUSINESS_GMAIL_AUTH'},
   calendar:{configured:calendar,status:calendar?'VERIFY_RUNTIME_FREEBUSY':'NEEDS_RAILWAY_CALENDAR_OAUTH'},
   hubspot:{configured:has('ULTRON_HUBSPOT_PRIVATE_APP_TOKEN'),status:has('ULTRON_HUBSPOT_PRIVATE_APP_TOKEN')?'VERIFY_PRIVATE_APP_SCOPES':'NEEDS_RAILWAY_HUBSPOT_AUTH'},
   paypal:{configured:has('PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_WEBHOOK_ID'),status:'CHECK_SIGNED_WEBHOOK_AND_CAPTURE_STATUS'},
   fulfillment:{configured:false,status:'PURCHASE_SPECIFIC_CUSTOMER_PERMISSION_AND_DELIVERY_EVIDENCE'},
   reconciliation:{configured:false,status:'REAL_PROCESSOR_SETTLEMENT_BANK_AND_EXPENSE_RECORDS_REQUIRED'},
   partners:{configured:false,status:'SIGNED_LICENSE_AND_DISTRIBUTION_AGREEMENTS_REQUIRED'},
   caveat:'Configured variables are not proof of connected or functional provider APIs.'};
}
const hostname=x=>{const name=clip(x).toLowerCase();if(!/^(?!-)[a-z0-9-]+(\.(?!-)[a-z0-9-]+)+$/.test(name)||/\.local$/.test(name))throw Error('public hostname required');return name;};
export async function dnsAudit(domain){
 const name=hostname(domain);
 const [mx,txt,dm]=await Promise.allSettled([dns.resolveMx(name),dns.resolveTxt(name),dns.resolveTxt('_dmarc.'+name)]);
 const transform=x=>x.status==='fulfilled'?x.value.map(v=>Array.isArray(v)?v.join(''):v.exchange):[];
 const records={mx:transform(mx),spf:transform(txt).filter(s=>s.startsWith('v=spf1')),dmarc:transform(dm).filter(s=>s.startsWith('v=DMARC1'))};
 return {domain:name,checkedAt:utc(),records,mailAuthenticationCandidate:records.mx.length>0&&records.spf.length>0&&records.dmarc.length>0,
 notes:['Check DKIM selector against the email provider','Confirm ownership, Railway DNS target and TLS independently','Record existence does not prove mail delivery']};
}
async function calendarToken(){
 const e=process.env;
 if(!e.ULTRON_GOOGLE_CLIENT_ID||!e.ULTRON_GOOGLE_CLIENT_SECRET||!e.ULTRON_CALENDAR_REFRESH_TOKEN)throw Error('Railway Calendar OAuth not configured');
 const b=new URLSearchParams({grant_type:'refresh_token',client_id:e.ULTRON_GOOGLE_CLIENT_ID,client_secret:e.ULTRON_GOOGLE_CLIENT_SECRET,refresh_token:e.ULTRON_CALENDAR_REFRESH_TOKEN});
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:b,signal:AbortSignal.timeout(9000)});
 if(!r.ok)throw Error('Google Calendar OAuth token error: '+r.status);
 const d=await r.json();if(!d.access_token)throw Error('Calendar access token missing');return d.access_token;
}
export async function freeBusy({start,end}={}){
 if(!process.env.ULTRON_CALENDAR_ID)throw Error('Railway Calendar ID not configured');
 const a=new Date(start),b=new Date(end);
 if(!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime())||b<=a||b-a>7*86400000)throw Error('valid 1-7 day range required');
 const token=await calendarToken();
 const id=process.env.ULTRON_CALENDAR_ID;
 const r=await fetch('https://www.googleapis.com/calendar/v3/freeBusy',{method:'POST',
  headers:{authorization:'Bearer '+token,'content-type':'application/json'},
  body:JSON.stringify({timeMin:a.toISOString(),timeMax:b.toISOString(),items:[{id}]}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error('Calendar freeBusy provider response '+r.status);
 const j=await r.json();if(!j.calendars?.[id]||j.calendars[id].errors?.length)throw Error('Calendar availability not verified');
 return {verified:true,calendarId:id,busy:j.calendars[id].busy||[]};
}
export async function book({bookingId,customerEmail,subject,start,minutes=30,ownerApproved}={}){
 if(ownerApproved!==true)throw Error('owner approval required');
 if(!bookingId||!subject||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail||''))throw Error('valid ID, subject, customer email required');
 const t=new Date(start),m=Number(minutes),until=new Date(t.getTime()+m*60000);
 if(!Number.isFinite(t.getTime())||t<Date.now()+15*60000||t>Date.now()+60*86400000||!Number.isInteger(m)||m<15||m>90)throw Error('valid future meeting time and 15-90 minutes required');
 const old=(await read()).bookings[bookingId];if(old)return {...old,duplicate:true};
 const availability=await freeBusy({start:t.toISOString(),end:until.toISOString()});if(availability.busy.length)throw Error('calendar busy');
 const token=await calendarToken();const id=process.env.ULTRON_CALENDAR_ID;
 const r=await fetch('https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(id)+'/events?sendUpdates=all',{
   method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},
   body:JSON.stringify({summary:clip(subject),start:{dateTime:t.toISOString()},end:{dateTime:until.toISOString()},attendees:[{email:customerEmail}]}),
   signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error('Calendar event creation rejected '+r.status);
 const event=await r.json(),data={bookingId,calendarEventId:event.id,status:'CREATED_ATTENDEE_ACCEPTANCE_PENDING',at:utc()};
 await mutateJson(KEY,fallback(),s=>{s.bookings[bookingId]??=data;});
 return data;
}
export async function syncApprovedContact({sourceId,name,email,company,sourceUrl,ownerApproved}={}){
 if(ownerApproved!==true)throw Error('explicit owner CRM approval required');
 if(!sourceId||!name||!sourceUrl||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email||''))throw Error('sourced real prospect and verified business email required');
 const token=process.env.ULTRON_HUBSPOT_PRIVATE_APP_TOKEN;if(!token)throw Error('Railway HubSpot token missing');
 const prior=(await read()).crmSync[sourceId];if(prior)return {...prior,duplicate:true};
 const headers={authorization:'Bearer '+token,'content-type':'application/json'};
 const r=await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search',{method:'POST',headers,
   body:JSON.stringify({filterGroups:[{filters:[{propertyName:'email',operator:'EQ',value:email}]}],limit:1}),
   signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error('HubSpot contact search '+r.status);
 const found=await r.json();let id=found.results?.[0]?.id;
 if(!id){const names=clip(name).split(/\s+/);
   const add=await fetch('https://api.hubapi.com/crm/v3/objects/contacts',{method:'POST',headers,
    body:JSON.stringify({properties:{firstname:names[0],lastname:names.slice(1).join(' '),email,company:clip(company)}}),
    signal:AbortSignal.timeout(10000)});
   if(!add.ok)throw Error('HubSpot scoped create denied '+add.status);id=(await add.json()).id;
 }
 const data={sourceId,hubspotContactId:id,status:'PROSPECT_NOT_PAID_CUSTOMER',at:utc()};
 await mutateJson(KEY,fallback(),s=>{s.crmSync[sourceId]??=data;});return data;
}
export async function integrationSummary(){
 const s=await read();return {readiness:readiness(),syncedProspects:Object.keys(s.crmSync).length,
  confirmedCalendarInsertions:Object.keys(s.bookings).length,
  requirements:['Owned verified domain and sender','Reauthorize restricted Hunter account or replace discovery provider','Production Google OAuth refresh credentials','HubSpot app token from correct portal','Payment settlement data and bank reconciliation','Signed distribution agreements']};
}
