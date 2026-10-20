export async function customerJourneyRoute(req,res,u,{authorized,json,journey}){
 const owner=u.pathname.startsWith('/api/customer-journey/owner');
 if(!owner&&!u.pathname.startsWith('/api/customer-journey/buyer'))return false;
 if(owner&&!authorized()){json(403,{error:'Owner authorization required'});return true}
 const token=owner?null:(req.headers.authorization||'').replace(/^Bearer /,'');
 try{
  if(owner&&u.pathname==='/api/customer-journey/owner'&&req.method==='GET'){json(200,await journey.snapshot());return true}
  if(!owner&&req.method==='GET'){
   if(u.pathname==='/api/customer-journey/buyer'){json(200,await journey.status(token));return true}
   if(u.pathname==='/api/customer-journey/buyer/artifact'){
    const a=await journey.download(token,u.searchParams.get('format')||'pdf');res.writeHead(200,{'content-type':a.contentType,'content-length':a.bytes.length,'content-disposition':'attachment; filename="'+a.filename+'"','cache-control':'private,no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});res.end(a.bytes);return true;
   }
  }
  const actions=owner?{'/api/customer-journey/owner/inquiry':'inquiry','/api/customer-journey/owner/proposal':'proposal','/api/customer-journey/owner/bind':'bind'}:{'/api/customer-journey/buyer/accept':'accept'},action=actions[u.pathname];
  if(req.method!=='POST'||!action){json(404,{error:'Unknown journey action'});return true}
  if(!(req.headers['content-type']||'').startsWith('application/json')){json(415,{error:'JSON required'});return true}
  let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>12000){json(413,{error:'Request too large'});return true}}
  let x;try{x=JSON.parse(raw)}catch{json(400,{error:'Invalid JSON'});return true}
  const result=owner?await journey[action](x):await journey.accept(token,x);json(200,{result});return true;
 }catch(e){
  if(!owner){json(403,{error:'Delivery is unavailable or requires review. Contact support with your purchase reference.'});return true}
  const message=String(e.message);
  if(/^(Invalid |Request identity|Journey capacity|Consented |Exact reviewed|Existing catalog|Eligible digital|Proposal not found|Order binding|Order already|Verified matching|Refunded |Trusted delivery|Provider buyer|Artifact changed|Provider capture)/.test(message))json(400,{error:message});
  else json(503,{error:'Journey storage or provider verification unavailable'});return true;
 }
}
