import express from 'express';
const app=express();
app.use(express.json());
app.use(express.static('public'));

app.get('/health',(req,res)=>res.json({ok:true,status:'ready'}));

app.post('/api/leads',(req,res)=>{
  const {name,email,need}=req.body||{};
  if(!name||!email) return res.status(400).json({ok:false,message:'Name and email are required.'});
  return res.status(201).json({ok:true,message:'Lead received'});
});

app.get('/api/payment-status',(req,res)=>{
  const url=(process.env.PAYPAL_PAYMENT_URL||'').trim();
  res.json({configured:Boolean(url)});
});

app.get('/checkout',(req,res)=>{
  const url=(process.env.PAYPAL_PAYMENT_URL||'').trim();
  if(!url){
    return res.status(503).send('PayPal checkout is not connected yet.');
  }
  return res.redirect(302,url);
});

const port=process.env.PORT||3000;
app.listen(port,'0.0.0.0',()=>console.log(`ULTRON listening on ${port}`));
