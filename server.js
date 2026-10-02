import express from 'express';
const app=express();
app.use(express.json());
app.use(express.static('public'));
app.get('/health',(req,res)=>res.json({ok:true,status:'ready'}));
app.post('/api/leads',(req,res)=>res.status(201).json({ok:true,message:'Lead received'}));
const port=process.env.PORT||3000;
app.listen(port,'0.0.0.0',()=>console.log(`ULTRON listening on ${port}`));
