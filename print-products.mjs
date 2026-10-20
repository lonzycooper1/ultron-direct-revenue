import {PDFDocument} from 'pdfkit';
import {createHash} from 'node:crypto';
import {getJson,mutateJson} from './state-store.mjs';
const KEY='ultron-print-products-v1',fresh=()=>({products:{}});
const hash=x=>createHash('sha256').update(x).digest('hex');
function text(x,name,max){if(typeof x!=='string'||!x.trim()||x.length>max||/[^\x20-\x7e\n]/.test(x))throw Error('Invalid '+name+'; use printable English text');return x.trim()}
export function validateProduct(x){
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Product object required');
 if(!['journal','planner','workbook','guide','coloring'].includes(x.type))throw Error('Unknown product type');
 const title=text(x.title,'title',70),audience=text(x.audience,'audience',160),source=text(x.source,'source reference',500);
 if(typeof x.requestId!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(x.requestId))throw Error('Stable requestId required');
 const pages=x.pages??30;if(!Number.isInteger(pages)||pages<2||pages>60)throw Error('Pages must be 2–60 including cover');
 const prompts=x.prompts??['What matters most today?','What progress did I make?','What will I do next?'];
 if(!Array.isArray(prompts)||prompts.length<1||prompts.length>20)throw Error('Provide 1–20 prompts');
 const clean=prompts.map(p=>text(p,'prompt',180));
 let sections=[];
 if(x.type==='guide'){
  if(!Array.isArray(x.sections)||x.sections.length<2||x.sections.length>20)throw Error('Guide needs 2–20 original supplied sections');
  sections=x.sections.map(s=>({heading:text(s?.heading,'heading',100),body:text(s?.body,'body',5000)}));
 }
 return {type:x.type,title,audience,source,pages,prompts:clean,sections,requestId:x.requestId};
}
function crc32(b){let c=0xffffffff;for(const n of b){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
export function makeZip(files){
 const chunks=[],central=[];let offset=0;
 for(const [filename,bytes] of Object.entries(files)){
  const name=Buffer.from(filename),data=Buffer.from(bytes),crc=crc32(data),head=Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50);head.writeUInt16LE(20,4);head.writeUInt32LE(crc,14);head.writeUInt32LE(data.length,18);head.writeUInt32LE(data.length,22);head.writeUInt16LE(name.length,26);
  chunks.push(head,name,data);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);central.push(c,name);offset+=head.length+name.length+data.length;
 }
 const cb=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(Object.keys(files).length,8);end.writeUInt16LE(Object.keys(files).length,10);end.writeUInt32LE(cb.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...chunks,cb,end]);
}
export async function renderProduct(input){
 const x=validateProduct(input),doc=new PDFDocument({size:'LETTER',margin:54,bufferPages:true,autoFirstPage:false,info:{Title:x.title,Author:'ULTRON',Subject:'Owner-reviewed digital draft'}});
 const chunks=[];let total=0;const output=new Promise((resolve,reject)=>{doc.on('data',b=>{total+=b.length;if(total>2*1024*1024)doc.destroy(Error('Artifact size exceeded'));else chunks.push(b)});doc.on('error',reject);doc.on('end',()=>resolve(Buffer.concat(chunks)))});
 const add=()=>{doc.addPage();doc.fillColor('#183a42').font('Helvetica-Bold').fontSize(11).text('ULTRON / '+x.type.toUpperCase(),54,40,{width:500});doc.moveTo(54,65).lineTo(558,65).strokeColor('#b9c7c8').stroke()};
 add();doc.font('Helvetica-Bold').fontSize(30).text(x.title,54,180,{width:490});doc.font('Helvetica').fontSize(14).fillColor('#415359').text('For '+x.audience,54,330,{width:490});doc.fontSize(11).text('Original printable resource\nUS Letter - 8.5 x 11 inches\nReview before commercial publication',54,440,{width:490,lineGap:8});
 if(x.type==='guide'){
  for(const s of x.sections){add();doc.fillColor('#183a42').font('Helvetica-Bold').fontSize(21).text(s.heading,54,90,{width:500});doc.moveDown();doc.font('Helvetica').fontSize(12).fillColor('#243238').text(s.body,{width:500,lineGap:5});}
 }else for(let i=1;i<x.pages;i++){
  add();doc.fillColor('#183a42').font('Helvetica-Bold').fontSize(20).text(x.type==='coloring'?'Pattern '+i:'Session '+i,54,90);
  if(x.type==='coloring'){
   doc.strokeColor('#111111').lineWidth(1.5);
   for(let r=0;r<6;r++)for(let c=0;c<5;c++){const xx=100+c*100,yy=190+r*75;const radius=18+((i+r*3+c)%5)*2;doc.circle(xx,yy,radius).stroke();doc.circle(xx,yy,7+(i%5)).stroke();doc.moveTo(xx-34,yy).lineTo(xx,yy-34).lineTo(xx+34,yy).lineTo(xx,yy+34).closePath().stroke();}
  }else{
   doc.font('Helvetica').fontSize(11).text('Date: ____________________',54,130);
   const prompts=x.type==='planner'?['Top three priorities','Appointments and commitments','Notes and next steps']:Array.from({length:Math.min(3,x.prompts.length)},(_,k)=>x.prompts[((i-1)*3+k)%x.prompts.length]);
   prompts.forEach((p,k)=>{const y=180+k*165;doc.font('Helvetica-Bold').fontSize(12).text(p,54,y,{width:500,height:45});for(let n=0;n<5;n++)doc.moveTo(54,y+55+n*20).lineTo(558,y+55+n*20).strokeColor('#c5cfd0').lineWidth(0.5).stroke()});
  }
 }
 const count=doc.bufferedPageRange().count;
 for(let i=0;i<count;i++){doc.switchToPage(i);doc.font('Helvetica').fontSize(9).fillColor('#526568').text((i+1)+' / '+count,54,720,{width:500,align:'right',lineBreak:false})}
 doc.end();const pdf=await output;
 return {input:x,pdf,pageCount:count,pdfSha256:hash(pdf)};
}
export function createPrintFactory({read=()=>getJson(KEY,fresh()),mutate=fn=>mutateJson(KEY,fresh(),fn),clock=Date.now}={}){
 async function create(input){
  const x=validateProduct(input),id=hash(x.requestId).slice(0,32),inputHash=hash(JSON.stringify(x));const old=(await read()).products[id];
  if(old){if(old.inputHash!==inputHash)throw Error('Request identity reused for different product');return metadata(old)}
  const r=await renderProduct(x);
  const manifest={version:1,type:x.type,title:x.title,audience:x.audience,source:x.source,pageCount:r.pageCount,paper:'US Letter',pdfSha256:r.pdfSha256,publicationApproved:false,customerAccepted:false,generatedAt:new Date(clock()).toISOString()};
  const listing=x.title+'\nAudience: '+x.audience+'\nIncludes '+r.pageCount+' US Letter PDF pages. Digital download; no physical product. Pricing and marketplace publication require owner review. Source/content reference: '+x.source+'\n';
  const zip=makeZip({'product.pdf':r.pdf,'manifest.json':JSON.stringify(manifest,null,2),'listing.txt':listing,'launch-plan.txt':'Day 1: inspect every page and confirm rights.\nDay 2: validate target audience and value.\nDay 3: prepare accurate listing and previews.\nDay 4: review pricing and delivery.\nDay 5: publish only through an authorized account.\nDay 6: measure genuine inquiries and delivery.\nDay 7: review feedback and improve.\n'});
  const record={id,inputHash,manifest,listing,pdf:r.pdf.toString('base64'),zip:zip.toString('base64'),zipSha256:hash(zip),status:'DRAFT_REVIEW_REQUIRED',createdAt:manifest.generatedAt};
  await mutate(s=>{const prior=s.products[id];if(prior){if(prior.inputHash!==inputHash)throw Error('Request identity reused for different product');return}if(Object.keys(s.products).length>=40)throw Error('Artifact storage limit reached');s.products[id]=record});return metadata((await read()).products[id]);
 }
 function metadata(p){return {id:p.id,status:p.status,manifest:p.manifest,createdAt:p.createdAt,review:p.review||null}}
 async function list(){return Object.values((await read()).products).map(metadata)}
 async function artifact(id,format='pdf'){
  if(!/^[a-f0-9]{32}$/.test(id||'')||!['pdf','zip'].includes(format))throw Error('Unknown artifact');
  const p=(await read()).products[id];if(!p)throw Error('Unknown artifact');const bytes=Buffer.from(p[format],'base64'),expected=format==='pdf'?p.manifest.pdfSha256:p.zipSha256;if(hash(bytes)!==expected)throw Error('Artifact integrity failure');return {bytes,filename:'ultron-'+id+'.'+format,contentType:format==='pdf'?'application/pdf':'application/zip'};
 }
 async function review(id,x={}){
  if(!/^[a-f0-9]{32}$/.test(id||''))throw Error('Unknown artifact');
  const reviewer=text(x.reviewer,'reviewer',120);
  if(x.allPagesReviewed!==true||x.rightsConfirmed!==true||typeof x.pdfSha256!=='string')throw Error('Actual page and rights review required');
  await artifact(id);
  await mutate(s=>{const p=s.products[id];if(!p||p.manifest.pdfSha256!==x.pdfSha256)throw Error('Review must bind exact PDF');p.review={reviewer,pdfSha256:x.pdfSha256,at:new Date(clock()).toISOString(),allPagesReviewed:true,rightsConfirmed:true};p.status='OWNER_REVIEWED_NOT_PUBLISHED'});return metadata((await read()).products[id]);
 }
 return {create,list,artifact,review};
}
export const printFactory=createPrintFactory();
