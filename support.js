export const contact='/support';
export const facts=[
 {id:'kit',title:'Template and digital products',terms:'kit starter template worksheet checklist download html twenty nine 29',answer:'Review the current product page for its contents and server-confirmed PayPal price. Historical kit listings do not establish a current offer or availability.',url:'/market'},
 {id:'audit',title:'Scoped audit offers',terms:'audit review improvement report 99 500',answer:'The $99 Instant Lead Conversion Audit covers supplied inputs and one accessible public homepage. Private downloads require verified payment and owner quality review. The separate $500 Revenue Leak Audit has its own intake and five-business-day scope. Neither promises increased sales.',url:'/autonomous-audit'},
 {id:'setup',title:'Custom services',terms:'setup automation custom implementation scope',answer:'Confirm written deliverables, price, required permissions and delivery schedule before purchasing implementation work. An audit purchase does not include implementation.',url:contact},
 {id:'payment',title:'Checkout and payment',terms:'pay payment paypal checkout purchase buy bank card processor',answer:'ULTRON direct sales use the existing PayPal checkout. Enter payment information only with PayPal. This FAQ cannot verify a payment, settlement or bank deposit.',url:'/autonomous-audit'},
 {id:'delivery',title:'Receipt and download',terms:'delivery deliver receipt email download paid purchased order access',answer:'Use your private purchase delivery page. Access requires matching payment and artifact review. If access is unavailable, submit a support request with the order reference and no payment credentials.',url:contact},
 {id:'refund',title:'Refund review',terms:'refund cancel cancellation return dispute chargeback',answer:'Request refund review through your private order page or the Support form. Submission queues an individual review; it does not approve or initiate a refund. Consult the terms for your purchased service.',url:contact},
 {id:'earnings',title:'Results and settlement',terms:'revenue money profit guarantee earnings payout transfer settle daily income',answer:'No sales, profit or financial returns are guaranteed. Application capture records are distinct from settlement and profit. This FAQ cannot initiate payouts.',url:contact}
];
const stop=new Set('a an the is are can how what where when do does i my you your to for of and it this me with in on please'.split(' '));
function tokens(s){return [...new Set(s.toLowerCase().match(/[a-z0-9]+/g)||[])].filter(w=>!stop.has(w));}
export function answerQuestion(question){
 if(typeof question!=='string'||question.trim().length<2||question.length>600)throw new Error('Enter a question between 2 and 600 characters.');
 if(/(?:password|api.key|\bpin\b|routing.number|account.number|\b\d{12,}\b)/i.test(question))return {mode:'privacy',answer:'Please keep passwords, API keys, bank and card details out of chat. Use the payment provider directly.',sources:[],escalated:true,contact};
 const q=tokens(question);const ranked=facts.map(f=>({f,score:q.reduce((s,w)=>s+(tokens(f.terms+' '+f.title).includes(w)?2:tokens(f.answer).includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score);
 if(!ranked[0].score)return {mode:'retrieval',answer:'I do not have a published answer for that question. Please contact the owner to confirm.',sources:[],escalated:true,contact};
 const matches=ranked.filter(x=>x.score>=Math.max(2,ranked[0].score*.8)).slice(0,2).map(x=>x.f);
 if(!matches.length)return {mode:'retrieval',answer:'Please contact the owner to confirm the details.',sources:[],escalated:true,contact};
 return {mode:'retrieval',answer:matches.map(x=>x.answer).join('\n\n'),sources:matches.map(x=>({id:x.id,title:x.title,url:x.url})),escalated:false,contact};
}
