export async function serviceProductionRoute(req,res,u,{authorized,json,production}){
 if(!u.pathname.startsWith('/api/service-production'))return false;
 if(!authorized()){json(403,{error:'Owner authorization required'});return true}
 try{
  const id=u.searchParams.get('id'),scope=u.searchParams.get('scope');
  if(req.method==='GET'&&u.pathname==='/api/service-production'){json(200,{jobs:await production.list()});return true}
  if(req.method==='GET'&&u.pathname==='/api/service-production/artifact'){const a=await production.artifact(id,scope,u.searchParams.get('format')||'pdf');res.writeHead(200,{'content-type':a.contentType,'content-length':a.bytes.length,'content-disposition':'attachment; filename="'+a.filename+'"','cache-control':'private,no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff'});res.end(a.bytes);return true}
  const action=u.pathname.slice('/api/service-production/'.length);if(req.method!=='POST'||!['submit','resume','collect','review','cancel'].includes(action)){json(404,{error:'Unknown service action'});return true}
  if(!(req.headers['content-type']||'').startsWith('application/json')){json(415,{error:'JSON required'});return true}
  let raw='';for await(const b of req){raw+=b;if(Buffer.byteLength(raw)>100000){json(413,{error:'Input too large'});return true}}let x;try{x=JSON.parse(raw)}catch{json(400,{error:'Invalid JSON'});return true}
  json(200,{result:action==='submit'?await production.submit(x):await production[action](x.id,x.customerScope,x)});return true;
 }catch{json(409,{error:'Service action blocked. Check required inputs, source permissions, scope, allowance, provider job status and exact output review. No external action was authorized.'});return true}
}
