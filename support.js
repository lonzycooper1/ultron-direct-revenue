export const contact = 'https://payhip.com/LindaWorkflowStudio/contact';
export const facts = [
 {id:'kit',title:'Booking Starter Kit',terms:'kit starter template worksheet checklist download html twenty nine 29',answer:'The Booking Starter Kit is $29 before any applicable checkout taxes or fees. It contains an intake worksheet, confirmation, reminder and follow-up templates, and a setup checklist in one HTML file for one business. It is a manual kit; it does not send messages or connect calendars.',url:'https://payhip.com/b/PokY2'},
 {id:'audit',title:'Workflow Audit',terms:'audit review improvement plan 250',answer:'The Workflow Audit is $250. It includes a review of your lead process and a written prioritized improvement plan. Typical delivery is up to 5 business days after required information is received.',url:contact},
 {id:'setup',title:'Custom setup services',terms:'setup automation custom lead 750 2500 2,500',answer:'Lead System Setup is $750; Full Automation Setup is $2,500. Contact us first to confirm the written scope, required information and delivery schedule before paying.',url:contact},
 {id:'payment',title:'Checkout and payment',terms:'pay payment paypal checkout purchase buy bank card processor',answer:'The $29 kit uses Payhip checkout. Service payment links open PayPal. Use a payment type permitted for goods and services. This assistant does not collect card or bank details and cannot verify your payment or bank deposit.',url:'https://payhip.com/b/PokY2'},
 {id:'delivery',title:'Receipt and download',terms:'delivery deliver receipt email download paid purchased order access',answer:'Payhip handles kit receipts and download access after payment. If access is missing, use the contact form with your order reference. Do not include payment credentials. This assistant cannot look up orders.',url:contact},
 {id:'refund',title:'Cancellation and refunds',terms:'refund cancel cancellation return dispute chargeback',answer:'Contact us promptly to request cancellation before work begins. After work begins, refund requests depend on work and deliverables already provided, applicable law and PayPal policies. This assistant cannot approve refunds.',url:contact},
 {id:'earnings',title:'Results and bank payouts',terms:'revenue money profit guarantee earnings payout transfer settle daily income',answer:'No sales, profit or financial returns are guaranteed. This assistant cannot initiate payouts. Processor settlement and bank deposit timing depend on the provider and account eligibility.',url:contact}
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
