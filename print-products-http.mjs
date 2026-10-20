import {printFactory} from './print-products.mjs';
export async function printProductRoute(req,res,u,{authorized,json,factory=printFactory,basePath="/api/print-products"}){
 if(!u.pathname.startsWith(basePath))return false;
 if(!authorized()){json(403,{error:'Owner authorization required'});return true}
 try{
  if(u.pathname===basePath&&req.method==='GET'){json(200,{products:await factory.list()});return true}
  if(u.pathname===basePath+'/artifact'&&req.method==='GET'){
   const a=await factory.artifact(u.searchParams.get('id'),u.searchParams.get('format')||'pdf');
   res.writeHead(200,{'content-type':a.contentType,'content-length':a.bytes.length,'content-disposition':'attachment; filename="'+a.filename+'"','cache-control':'private,no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});res.end(a.bytes);return true;
  }
  if(req.method!=='POST'||![basePath,basePath+'/review'].includes(u.pathname)){json(404,{error:'Unknown product action'});return true}
  if(!(req.headers['content-type']||'').startsWith('application/json')){json(415,{error:'JSON required'});return true}
  let raw='';for await(const b of req){raw+=b;if(Buffer.byteLength(raw)>120000){json(413,{error:'Request too large'});return true}}
  let x;try{x=JSON.parse(raw)}catch{json(400,{error:'Invalid JSON'});return true}
  const result=u.pathname.endsWith('/review')?await factory.review(x?.id,x):await factory.create(x);
  json(200,{product:result});return true;
 }catch(e){
  const m=String(e.message);
  if(/^(Invalid |Product object|Unknown product|Stable requestId|Pages must|Provide |Guide needs|Request identity|Artifact storage|Actual page|Review must)/.test(m)){json(400,{error:m});return true}
  if(m==='Unknown artifact'){json(404,{error:m});return true}
  json(503,{error:'Product storage or rendering unavailable'});return true;
 }
}
