// Provider-neutral POD adapters. Secrets are read only from environment variables.
// No provider is called unless its credential is configured.

const providers={
 printful:{
  base:'https://api.printful.com',
  token:()=>process.env.PRINTFUL_TOKEN||'',
  async request(path,{method='GET',body}={}){
   const token=this.token();if(!token)throw Error('PRINTFUL_TOKEN not configured');
   const r=await fetch(this.base+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d?.error?.message||d?.result||('Printful '+r.status));return d;
  },
  async createOrder(payload){return this.request('/orders',{method:'POST',body:payload})}
 },
 printify:{
  base:'https://api.printify.com/v1',
  token:()=>process.env.PRINTIFY_TOKEN||'',
  shopId:()=>process.env.PRINTIFY_SHOP_ID||'',
  async request(path,{method='GET',body}={}){
   const token=this.token();if(!token)throw Error('PRINTIFY_TOKEN not configured');
   const r=await fetch(this.base+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d?.message||('Printify '+r.status));return d;
  },
  async createOrder(payload){const id=this.shopId();if(!id)throw Error('PRINTIFY_SHOP_ID not configured');return this.request('/shops/'+encodeURIComponent(id)+'/orders.json',{method:'POST',body:payload})}
 },
 gelato:{
  base:'https://order.gelatoapis.com/v4',
  token:()=>process.env.GELATO_API_KEY||'',
  async request(path,{method='GET',body}={}){
   const token=this.token();if(!token)throw Error('GELATO_API_KEY not configured');
   const r=await fetch(this.base+path,{method,headers:{'X-API-KEY':token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d?.message||('Gelato '+r.status));return d;
  },
  async createOrder(payload){return this.request('/orders',{method:'POST',body:payload})}
 }
};

export function podProviderStatus(){
 return {
  printful:{configured:Boolean(process.env.PRINTFUL_TOKEN)},
  printify:{configured:Boolean(process.env.PRINTIFY_TOKEN&&process.env.PRINTIFY_SHOP_ID)},
  gelato:{configured:Boolean(process.env.GELATO_API_KEY)}
 };
}
export async function createPodOrder(provider,payload,{ownerApproved=false}={}){
 if(!ownerApproved)throw Error('ownerApproved required before external POD order creation');
 if(!providers[provider])throw Error('unsupported POD provider');
 return providers[provider].createOrder(payload);
}
export function podManifest(){
 return {
  mode:'provider-neutral-POD-router',
  providers:['printful','printify','gelato'],
  status:podProviderStatus(),
  rules:['no supplier order without configured credential','no external order without ownerApproved','all designs must be original or properly licensed']
 };
}
