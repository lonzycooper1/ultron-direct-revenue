import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export function createApp(){return createServer(async(req,res)=>{
 const path=new URL(req.url,'http://local').pathname;
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'none'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(path==='/health'&&req.method==='GET')return json(200,{ok:true,storefront:'ready',payments:'external Payhip/PayPal checkout',paymentVerification:'not connected',bankSettlement:'not verified'});
 if(path==='/api/leads')return json(503,{ok:false,message:'Direct inquiry storage is not connected. Use the contact form linked on the storefront.'});
 if(path==='/api/payment-status'&&req.method==='GET')return json(200,{checkoutAvailable:true,paymentVerified:false,provider:'Payhip',url:'https://payhip.com/b/PokY2'});
 if(path==='/checkout'&&req.method==='GET'){res.writeHead(302,{Location:'https://payhip.com/b/PokY2','Cache-Control':'no-store'});return res.end();}
 if(path==='/'&&(req.method==='GET'||req.method==='HEAD')){try{const body=await readFile(new URL('./public/index.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});return res.end(req.method==='HEAD'?undefined:body);}catch{return json(503,{ok:false,message:'Storefront unavailable'});}}
 return json(404,{ok:false,message:'Not found'});
});}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');createApp().listen(port,'0.0.0.0',()=>console.log('ULTRON storefront listening'));}
