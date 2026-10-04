import {answerQuestion} from './support.js';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export function createApp(){return createServer(async(req,res)=>{
 const path=new URL(req.url,'http://local').pathname;
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(path==='/api/support'&&req.method==='POST'){
  if(!(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'Use application/json'});
  if(req.headers.origin&&req.headers.origin!==`https://${req.headers.host}`&&req.headers.origin!==`http://${req.headers.host}`)return json(403,{error:'Origin rejected'});
  try{let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>4096)return json(413,{error:'Question too long'});}const data=JSON.parse(body);return json(200,answerQuestion(data.question));}catch{return json(400,{error:'Enter a question between 2 and 600 characters.'});}
 }
 if((path==='/support'||path==='/support-client.js')&&req.method==='GET'){
  try{const file=path==='/support'?'support.html':'support-client.js';const body=await readFile(new URL('./public/'+file,import.meta.url));res.writeHead(200,{'Content-Type':path==='/support'?'text/html; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-cache'});return res.end(body);}catch{return json(503,{error:'Support unavailable'});}
 }
 if(path==='/health'&&req.method==='GET')return json(200,{ok:true,support:'document retrieval ready',aiModel:'not connected',storefront:'ready',payments:'external Payhip/PayPal checkout',paymentVerification:'not connected',bankSettlement:'not verified'});
 if(path==='/api/leads')return json(503,{ok:false,message:'Direct inquiry storage is not connected. Use the contact form linked on the storefront.'});
 if(path==='/api/payment-status'&&req.method==='GET')return json(200,{checkoutAvailable:true,paymentVerified:false,provider:'Payhip',url:'https://payhip.com/b/PokY2'});
 if(path==='/checkout'&&req.method==='GET'){res.writeHead(302,{Location:'https://payhip.com/b/PokY2','Cache-Control':'no-store'});return res.end();}
 if(path==='/'&&(req.method==='GET'||req.method==='HEAD')){try{const body=await readFile(new URL('./public/index.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});return res.end(req.method==='HEAD'?undefined:body);}catch{return json(503,{ok:false,message:'Storefront unavailable'});}}
 return json(404,{ok:false,message:'Not found'});
});}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');createApp().listen(port,'0.0.0.0',()=>console.log('ULTRON storefront listening'));}

