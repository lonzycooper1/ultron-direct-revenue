import {timingSafeEqual} from 'node:crypto';
const models={openai:'openai/gpt-4.1-nano',anthropic:'anthropic/claude-haiku-5.5'};
export async function providerCheck(provider,credential,request=fetch){
 if(!models[provider])throw Error('Unsupported provider');
 if(!credential)return {ok:false,error:'VERCEL_OIDC_TOKEN unavailable'};
 const r=await request('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{authorization:'Bearer '+credential,'content-type':'application/json'},body:JSON.stringify({model:models[provider],max_tokens:128,messages:[{role:'user',content:'Reply with exactly ULTRON_PROVIDER_VERIFIED. This is an authorized infrastructure smoke test; take no other action.'}]}),signal:AbortSignal.timeout(20000)});
 const d=await r.json().catch(()=>({}));
 if(!r.ok){const message=String(d.error?.message||d.error||'Gateway request failed').slice(0,700);return {ok:false,provider,model:models[provider],httpStatus:r.status,code:d.error?.code||d.error?.type||null,message};}
 const output=String(d.choices?.[0]?.message?.content||'');
 return {ok:output.includes('ULTRON_PROVIDER_VERIFIED'),provider,model:d.model||models[provider],output:output.slice(0,300),usage:d.usage||null};
}
export default async function handler(req,res){
 res.setHeader('cache-control','no-store');res.setHeader('content-type','application/json');
 const credential=req.headers['x-vercel-oidc-token']||process.env.VERCEL_OIDC_TOKEN;
 const reply=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data))};
 if(req.method==='GET')return reply(200,{service:'ULTRON bounded provider verification',oidcConfigured:Boolean(credential),authenticationConfigured:Boolean(process.env.ULTRON_VERIFY_TOKEN)});
 if(req.method!=='POST')return reply(405,{error:'POST required'});
 const expected=Buffer.from('Bearer '+(process.env.ULTRON_VERIFY_TOKEN||'')),given=Buffer.from(String(req.headers.authorization||''));
 if(!process.env.ULTRON_VERIFY_TOKEN||expected.length!==given.length||!timingSafeEqual(expected,given))return reply(403,{error:'Owner verification authorization required'});
 try{const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};return reply(200,await providerCheck(body.provider,credential));}catch{return reply(502,{ok:false,error:'Provider verification did not complete'})}
}
