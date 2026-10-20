export async function auditDeliveryRoute(req,res,u,{authorized,json,delivery}){
 if(!u.pathname.startsWith('/api/audit-delivery'))return false;
 const owner=u.pathname.startsWith('/api/audit-delivery/owner');
 if(owner&&!authorized()){json(403,{error:'Owner authorization required'});return true}
 const code=(req.headers.authorization||'').replace(/^Bearer /,'');
 try{
  if(req.method==='GET'){
   if(u.pathname==='/api/audit-delivery/owner'){json(200,{packages:await delivery.list()});return true}
   if(u.pathname==='/api/audit-delivery'){json(200,await delivery.status(code));return true}
   if(['/api/audit-delivery/artifact','/api/audit-delivery/owner/artifact'].includes(u.pathname)){
    const a=owner?await delivery.ownerArtifact(u.searchParams.get('id'),u.searchParams.get('format')||'pdf'):await delivery.artifact(code,u.searchParams.get('format')||'pdf');
    res.writeHead(200,{'content-type':a.contentType,'content-length':a.bytes.length,'content-disposition':'attachment; filename="'+a.filename+'"','cache-control':'private,no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff'});res.end(a.bytes);return true;
   }
  }
  if(req.method!=='POST'||!['/api/audit-delivery/owner/prepare','/api/audit-delivery/accept','/api/audit-delivery/owner/review'].includes(u.pathname)){json(404,{error:'Unknown audit action'});return true}
  if(!(req.headers['content-type']||'').startsWith('application/json')){json(415,{error:'JSON required'});return true}
  let raw='';for await(const b of req){raw+=b;if(Buffer.byteLength(raw)>12000){json(413,{error:'Request too large'});return true}}
  let x;try{x=JSON.parse(raw)}catch{json(400,{error:'Invalid JSON'});return true}
  json(200,{result:u.pathname.endsWith('/review')?await delivery.review(x.id,x):owner?await delivery.prepare(x):await delivery.accept(code,x)});return true;
 }catch{json(owner?503:403,{error:owner?'Audit preparation or storage unavailable; review source access and capacity':'Delivery unavailable or requires review. Contact support with the order reference.'});return true}
}
