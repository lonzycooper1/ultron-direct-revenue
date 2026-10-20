// Read-only runtime probe. Provider response bodies and credentials never leave here.
export async function verifyHubSpot({env=process.env,fetchImpl=fetch}={}){
 const checkedAt=new Date().toISOString();
 const base={checkedAt,readVerified:false,writeVerified:false};
 const token=env.ULTRON_HUBSPOT_PRIVATE_APP_TOKEN;
 if(!token)return {...base,category:'NOT_CONFIGURED',httpStatus:null};
 try{
  const r=await fetchImpl('https://api.hubapi.com/crm/v3/objects/contacts?limit=1&properties=createdate',{
   method:'GET',headers:{authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(10000)
  });
  if(!r.ok)return {...base,httpStatus:r.status,category:r.status===401?'CREDENTIAL_REJECTED':r.status===403?'SCOPE_OR_ACCOUNT_ACCESS_DENIED':r.status===429?'RATE_LIMITED':'PROVIDER_ERROR'};
  const body=await r.json();
  if(!Array.isArray(body.results))return {...base,httpStatus:r.status,category:'INVALID_PROVIDER_RESPONSE'};
  return {...base,httpStatus:r.status,readVerified:true,category:'CONTACT_READ_VERIFIED',note:'Read access verified; no contact was created or modified. Write access requires a separately approved real contact sync.'};
 }catch{return {...base,httpStatus:null,category:'NETWORK_OR_RESPONSE_ERROR'};}
}
