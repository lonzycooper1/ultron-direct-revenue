import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {getJson,mutateJson} from './state-store.mjs';
import {makeZip} from './print-products.mjs';
import {serviceDocument} from './service-document.mjs';
const KEY='ultron-creative-products-v1',fresh=()=>({products:{}}),hash=x=>createHash('sha256').update(x).digest('hex');
const ascii=(x,max)=>typeof x==='string'&&x.trim()&&x.length<=max&&!/[^\x20-\x7e\n]/.test(x);
const xml=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function validateCreative(x={}){
 if(!['thumbnail','pod-design','game-assets','music-loop'].includes(x.type))throw Error('Supported creative type required');
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(x.requestId||'')||!ascii(x.title,60)||!ascii(x.brief,1800))throw Error('Stable identity, title and original brief required');
 if(x.rightsConfirmed!==true||!ascii(x.authorizationReference,500))throw Error('Original or authorized inputs and rights reference required');
 const palette=x.palette??['#102c24','#42e89a','#f7ead0'];if(!Array.isArray(palette)||palette.length!==3||palette.some(c=>!/^#[0-9a-f]{6}$/i.test(c)))throw Error('Three hex palette colors required');
 const label=x.label??x.title;if(!ascii(label,60))throw Error('Short printable label required');
 const notes=x.notes??[60,64,67,72,67,64,62,60],bpm=x.bpm??100;
 if(x.type==='music-loop'&&(!Number.isInteger(bpm)||bpm<60||bpm>180||!Array.isArray(notes)||notes.length<4||notes.length>32||notes.some(n=>n!==null&&(!Number.isInteger(n)||n<48||n>84))))throw Error('Music requires 4-32 MIDI notes (48-84 or null rests), tempo 60-180');
 return {type:x.type,requestId:x.requestId,title:x.title.trim(),brief:x.brief.trim(),label:label.trim(),palette,rightsConfirmed:true,authorizationReference:x.authorizationReference.trim(),demonstration:x.demonstration===true,...(x.type==='music-loop'?{notes,bpm}:{})};
}
function wav(x){
 const sampleRate=22050,beat=60/x.bpm,frames=Math.round(x.notes.length*beat*sampleRate),b=Buffer.alloc(44+frames*2);
 b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVE',8);b.write('fmt ',12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sampleRate,24);b.writeUInt32LE(sampleRate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(frames*2,40);
 for(let i=0;i<frames;i++){const t=i/sampleRate,index=Math.min(x.notes.length-1,Math.floor(t/beat)),phase=t-index*beat,n=x.notes[index],envelope=Math.max(0,Math.min(1,phase/.02,(beat-phase)/.06));const value=n===null?0:Math.sin(2*Math.PI*440*2**((n-69)/12)*phase)*envelope*.22;b.writeInt16LE(Math.round(value*32767),44+i*2)}
 return {bytes:b,filename:'music-loop.wav',contentType:'audio/wav',dimensions:{sampleRate,channels:1,bits:16,durationSeconds:frames/sampleRate},limit:'Original monophonic synthesized loop from supplied notes; no vocals, mastering, sampled recordings or provider-generated song.'};
}
function svg(x){
 const [bg,accent,ink]=x.palette;let width,height,body;
 if(x.type==='thumbnail'){
  width=1280;height=720;const words=x.label.split(/\s+/),lines=[];let line='';for(const w of words){if((line+' '+w).trim().length>20){lines.push(line);line=w}else line=(line+' '+w).trim()}if(line)lines.push(line);
  body=`<rect width="1280" height="720" fill="${bg}"/><circle cx="1100" cy="210" r="180" fill="${accent}"/><path d="M920 400L1170 310L1200 580L980 640Z" fill="${ink}"/>${lines.filter(Boolean).map((l,i)=>`<text x="70" y="${210+i*105}" textLength="${Math.min(780,l.length*34)}" lengthAdjust="spacingAndGlyphs" font-family="sans-serif" font-size="64" font-weight="bold" fill="${ink}">${xml(l)}</text>`).join('')}<text x="70" y="650" font-family="sans-serif" font-size="26" fill="${accent}">${x.demonstration?'DEMONSTRATION':'ORIGINAL EDITABLE LAYOUT'}</text>`;
 }else if(x.type==='pod-design'){
  width=4500;height=5400;body='';for(let i=0;i<12;i++){const a=i*Math.PI/6,cx=2250+1350*Math.cos(a),cy=2700+1750*Math.sin(a);body+=`<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)})"><path d="M0 -160Q160 -240 180 -30Q120 150 0 170Q-160 100 -180 -30Q-140 -210 0 -160Z" fill="${accent}"/><circle r="60" fill="${bg}"/></g>`}body+=`<text x="2250" y="2600" text-anchor="middle" font-family="serif" font-size="180" fill="${ink}" textLength="2500" lengthAdjust="spacingAndGlyphs">${xml(x.label)}</text><text x="2250" y="2900" text-anchor="middle" font-family="sans-serif" font-size="90" fill="${accent}">${x.demonstration?'DEMONSTRATION':'ORIGINAL DIGITAL DESIGN'}</text>`;
 }else{
  width=256;height=256;body='';for(let i=0;i<16;i++){const a=i%4*64,b=Math.floor(i/4)*64;body+=`<g transform="translate(${a} ${b})"><rect x="7" y="7" width="50" height="50" rx="${i%4*4}" fill="${bg}"/><path d="M32 ${10+i%4*3}L52 32L32 54L12 32Z" fill="${accent}"/><circle cx="32" cy="32" r="${5+i%5}" fill="${ink}"/></g>`}
 }
 const bytes=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${xml(x.title)}</title>${body}</svg>`);
 return {bytes,filename:x.type+'.svg',contentType:'image/svg+xml',dimensions:{width,height,...(x.type==='game-assets'?{columns:4,rows:4,tileWidth:64,tileHeight:64}:{})},limit:'Original vector layout from bounded native shapes and supplied text. Not a photorealistic AI image, commissioned illustration or verified physical product. Fonts should be outlined or licensed before print production.'};
}
export async function renderCreative(input){
 const x=validateCreative(input),primary=x.type==='music-loop'?wav(x):svg(x),primarySha256=hash(primary.bytes);
 const document=await serviceDocument({title:x.title,notice:x.demonstration?'DEMONSTRATION - unpaid original sample':'Private creative draft - review before delivery',sections:[{title:'Brief and output',body:x.brief+'\nType: '+x.type+'\n'+JSON.stringify(primary.dimensions)+'\nPrimary SHA-256: '+primarySha256},{title:'Scope and review',body:primary.limit+'\nReview the actual exported asset and agreed customer scope. No sales, publishing, print fulfillment or increased engagement is implied.'}],sources:[x.authorizationReference]});
 const manifest={...document.manifest,type:x.type,source:x.authorizationReference,primary:{filename:primary.filename,contentType:primary.contentType,sha256:primarySha256,...primary.dimensions},demonstration:x.demonstration,productionMethod:'BOUNDED_NATIVE_RENDERER',publicationApproved:false};
 const zip=makeZip({[primary.filename]:primary.bytes,'review.pdf':document.pdf,'source.json':JSON.stringify(x,null,2),'editable.md':document.markdown,'manifest.json':JSON.stringify(manifest,null,2),'FONT-LICENSE.txt':readFileSync(new URL('./assets/fonts/LICENSE-DejaVu.txt',import.meta.url)),'README.txt':primary.limit+'\nSVG files are editable source. Music WAV is 22050 Hz mono PCM. No external material was fetched. Physical fulfillment is not connected.\n'});
 return {input:x,primary,pdf:document.pdf,zip,manifest,zipSha256:hash(zip)};
}
export function createCreativeFactory({read=()=>getJson(KEY,fresh()),mutate=fn=>mutateJson(KEY,fresh(),fn),clock=Date.now}={}){
 const metadata=p=>({id:p.id,status:p.status,manifest:p.manifest,createdAt:p.createdAt,review:p.review||null});
 async function create(input){const x=validateCreative(input),id=hash('creative:'+x.requestId).slice(0,32),inputHash=hash(JSON.stringify(x)),old=(await read()).products[id];if(old){if(old.inputHash!==inputHash)throw Error('Request identity reused');return metadata(old)}const r=await renderCreative(x);
  await mutate(s=>{const old=s.products[id];if(old){if(old.inputHash!==inputHash)throw Error('Request identity reused');return}if(Object.keys(s.products).length>=40)throw Error('Creative storage capacity reached');s.products[id]={id,inputHash,manifest:r.manifest,primary:r.primary.bytes.toString('base64'),pdf:r.pdf.toString('base64'),zip:r.zip.toString('base64'),zipSha256:r.zipSha256,status:'DRAFT_REVIEW_REQUIRED',createdAt:new Date(clock()).toISOString()}});return metadata((await read()).products[id]);
 }
 async function list(){return Object.values((await read()).products).map(metadata)}
 async function artifact(id,format='pdf'){const p=(await read()).products[id];if(!p||p.status==='CANCELLED'||!['primary','pdf','zip'].includes(format))throw Error('Unknown artifact');const bytes=Buffer.from(p[format],'base64'),expected=format==='primary'?p.manifest.primary.sha256:format==='pdf'?p.manifest.pdfSha256:p.zipSha256;if(hash(bytes)!==expected)throw Error('Artifact integrity failure');return {bytes,filename:format==='primary'?p.manifest.primary.filename:'creative-'+id+'.'+format,contentType:format==='primary'?p.manifest.primary.contentType:format==='pdf'?'application/pdf':'application/zip'}}
 async function review(id,x={}){await artifact(id,'primary');await artifact(id,'zip');if(x.allPagesReviewed!==true||x.primaryReviewed!==true||x.rightsConfirmed!==true||!ascii(x.reviewer,120))throw Error('Actual page, primary asset and rights review required');await mutate(s=>{const p=s.products[id];if(p.manifest.pdfSha256!==x.pdfSha256||p.manifest.primary.sha256!==x.primarySha256)throw Error('Review must bind exact PDF and primary asset');p.status='OWNER_REVIEWED_NOT_PUBLISHED';p.review={reviewer:x.reviewer,pdfSha256:x.pdfSha256,primarySha256:x.primarySha256,at:new Date(clock()).toISOString(),rightsConfirmed:true}});return metadata((await read()).products[id]);}
 return {create,list,artifact,review};
}
export const creativeFactory=createCreativeFactory();
export function combineDeliverables(print,creative){return {list:async()=>[...await print.list(),...await creative.list()],artifact:async(id,format)=>{const p=(await creative.list()).find(x=>x.id===id);return (p?creative:print).artifact(id,format)}}}
