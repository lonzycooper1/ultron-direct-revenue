import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
const KEY='owner-browser-sessions-v1',COOKIE='__Host-ultron-owner',TTL=7*24*3600*1000;
const hash=x=>createHash('sha256').update(x).digest('hex');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&timingSafeEqual(Buffer.from(hash(a)),Buffer.from(hash(b)));
export function createOwnerSessions({secret,origin,clock=Date.now,read=()=>getJson(KEY,{sessions:{}}),mutate=fn=>mutateJson(KEY,{sessions:{}},fn)}={}){
 let expected;try{const u=new URL(origin);if(u.protocol==='https:'&&!u.username&&!u.password)expected=u.origin}catch{}
 const direct=req=>Boolean(secret)&&(equal(req.headers.authorization,'Bearer '+secret)||equal(req.headers['x-ultron-admin'],secret));
 const sameOrigin=req=>Boolean(expected)&&req.headers.origin===expected&&(!req.headers['sec-fetch-site']||req.headers['sec-fetch-site']==='same-origin');
 const cookieContext=req=>Boolean(expected)&&(req.headers.origin?sameOrigin(req):req.headers['sec-fetch-site']==='same-origin');
 function id(req){const values=String(req.headers.cookie||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(COOKIE+'='));if(values.length!==1)return null;const value=values[0].slice(COOKIE.length+1);return /^[a-f0-9]{64}$/.test(value)?hash(value):null}
 async function authenticated(req){
  if(!secret||!cookieContext(req))return false;
  const key=id(req);if(!key)return false;
  const row=(await read()).sessions[key];return Boolean(row&&row.expiresAt>clock()&&row.secretHash===hash(secret));
 }
 async function route(req,res,u,json){
  if(u.pathname!=='/api/owner/session')return false;
  if(req.method==='GET'){json(200,{authenticated:await authenticated(req),persistent:true,maxAgeDays:7});return true}
  if(!['POST','DELETE'].includes(req.method)){json(405,{error:'Method not allowed'});return true}
  if(!sameOrigin(req)){json(403,{error:'Same-origin owner request required'});return true}
  if(req.method==='DELETE'){
   const key=id(req);if(key)await mutate(s=>{delete s.sessions[key]});
   res.setHeader('set-cookie',COOKIE+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');json(200,{signedOut:true});return true;
  }
  if(!direct(req)){json(403,{error:'Existing owner authorization required'});return true}
  const value=randomBytes(32).toString('hex'),key=hash(value),now=clock(),expiresAt=now+TTL;
  await mutate(s=>{
   for(const [k,row]of Object.entries(s.sessions))if(row.expiresAt<=now||row.secretHash!==hash(secret))delete s.sessions[k];
   // Bound retained sessions; an older device may need to sign in again.
   const oldest=Object.keys(s.sessions).sort((a,b)=>s.sessions[a].createdAt-s.sessions[b].createdAt);
   while(oldest.length>=10)delete s.sessions[oldest.shift()];
   s.sessions[key]={createdAt:now,expiresAt,secretHash:hash(secret)};
  });
  res.setHeader('set-cookie',COOKIE+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+TTL/1000);
  json(200,{authenticated:true,expiresAt:new Date(expiresAt).toISOString()});return true;
 }
 return {direct,authenticated,route};
}
