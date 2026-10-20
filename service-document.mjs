import {PDFDocument} from 'pdfkit';
import {createHash} from 'node:crypto';
import {makeZip} from './print-products.mjs';
export const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const clean=s=>String(s).replace(/[\u2010-\u2015]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2022/g,'-');
export async function serviceDocument({title,sections,sources=[],notice='Draft - review before customer delivery',createdAt=new Date().toISOString()}){
 if(typeof title!=='string'||!title.trim()||title.length>140||!Array.isArray(sections)||sections.length<2||sections.length>30)throw Error('Invalid document structure');
 const content=sections.map(s=>({title:clean(s.title||''),body:clean(s.body||'')}));
 if(content.some(s=>!s.title||s.title.length>150||!s.body||s.body.length>16000)||content.reduce((n,s)=>n+s.body.length,0)>100000)throw Error('Invalid document content');
 const all=clean([title,notice,...content.flatMap(s=>[s.title,s.body]),...sources].join('\n'));
 if(/[^\x20-\x7e\n\r\t]/.test(all))throw Error('Unsupported document glyph; printable English text required');
 const doc=new PDFDocument({size:'LETTER',margin:54,bufferPages:true,info:{Title:clean(title),Author:'ULTRON',Subject:clean(notice)}}),chunks=[];
 let size=0;const output=new Promise((resolve,reject)=>{doc.on('data',b=>{size+=b.length;if(size>2*1024*1024)doc.destroy(Error('Document size limit'));else chunks.push(b)});doc.once('error',reject);doc.once('end',()=>resolve(Buffer.concat(chunks)))});
 doc.fillColor('#153b3c').font('Helvetica-Bold').fontSize(10).text('ULTRON / SERVICE DELIVERY');
 doc.moveDown(3).fontSize(28).text(clean(title),{width:500});doc.moveDown().font('Helvetica').fontSize(12).fillColor('#30494b').text(clean(notice),{width:500,lineGap:4});doc.moveDown().fontSize(10).text('Prepared '+createdAt);
 for(const s of content){doc.addPage();doc.fillColor('#153b3c').font('Helvetica-Bold').fontSize(19).text(s.title,{width:500});doc.moveDown();doc.fillColor('#243638').font('Helvetica').fontSize(11).text(s.body,{width:500,lineGap:4})}
 if(sources.length){doc.addPage();doc.font('Helvetica-Bold').fontSize(19).text('Sources and provenance');doc.moveDown().font('Helvetica').fontSize(10).text(clean(sources.join('\n\n')),{width:500,lineGap:4})}
 const pages=doc.bufferedPageRange().count;
 for(let i=0;i<pages;i++){doc.switchToPage(i);doc.font('Helvetica').fontSize(8).fillColor('#587071').text('ULTRON | '+(i+1)+' / '+pages,54,720,{width:500,lineBreak:false,align:'right'})}doc.end();
 const pdf=await output,markdown='# '+clean(title)+'\n\n'+clean(notice)+'\n\n'+content.map(s=>'## '+s.title+'\n\n'+s.body).join('\n\n')+'\n\n## Sources\n\n'+sources.join('\n')+'\n';
 const manifest={version:1,title:clean(title),createdAt,pages,pdfSha256:digest(pdf),editableSha256:digest(markdown),sources,customerAccepted:false};
 const zip=makeZip({'report.pdf':pdf,'editable.md':markdown,'manifest.json':JSON.stringify(manifest,null,2)});
 return {pdf,markdown,zip,manifest,zipSha256:digest(zip)};
}
