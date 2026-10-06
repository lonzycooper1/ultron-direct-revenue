export const REVENUE_FRAMEWORK_VERSION='1.0.0';

export const BUYER_PROBLEMS=Object.freeze([
 {id:'lead-response',problem:'Slow or inconsistent lead response, qualification, booking and follow-up.',buyers:['local services','professional services','agencies','real estate','clinics'],solutions:['automation','AI intake','CRM follow-up','booking recovery'],score:.94},
 {id:'content-throughput',problem:'Small teams struggle to publish enough useful on-brand content without adding headcount.',buyers:['SMBs','ecommerce','agencies','creators'],solutions:['content agency','email sequences','SEO briefs','social calendars'],score:.86},
 {id:'fragmented-tools',problem:'Teams manually move information between inboxes, calendars, CRM, spreadsheets and support tools.',buyers:['operations-heavy SMBs','agencies','professional services','ecommerce'],solutions:['workflow automation','MCP/connectors','agent workflows'],score:.92},
 {id:'customer-support',problem:'Repetitive questions, tracking requests and simple service issues consume staff time.',buyers:['ecommerce','service businesses','software companies'],solutions:['knowledge assistant','support triage','FAQ automation','human escalation'],score:.88},
 {id:'knowledge-monetization',problem:'Experts have useful knowledge but no packaged product, checkout, delivery system or validation loop.',buyers:['consultants','creators','coaches','operators'],solutions:['digital products','courses','templates','guides','paid audits'],score:.76}
]);

export const PLATFORM_FACTS=Object.freeze([
 {fact:'Salesforce reports three out of four small businesses are investing in AI in its latest SMB trends recap.',source:'https://www.salesforce.com/ap/blog/ai-and-the-future-of-small-business/'},
 {fact:'Salesforce reports strong customer expectations for personalized experiences, making customer response and service quality a practical SMB problem area.',source:'https://www.salesforce.com/small-business/smb-trends/'},
 {fact:'PayPal supports recurring billing through Catalog Products, Billing Plans and Subscriptions APIs.',source:'https://developer.paypal.com/platforms/subscriptions/'},
 {fact:'PayPal Invoicing API supports creating, sending and managing invoices from a backend.',source:'https://developer.paypal.com/api/invoicing/'},
 {fact:'For U.S. Shopify merchants, PayPal is integrated as PayPal Wallet through Shopify Payments rather than a separate PayPal Express gateway.',source:'https://help.shopify.com/en/manual/payments/paypal'}
]);

export const BUSINESS_MODELS=Object.freeze({
 contentAgency:{
  name:'AI-Assisted Content & Copywriting Agency',model:'productized-service-plus-retainer',
  problems:['content-throughput','lead-response'],
  aiRole:['research','outlines','first drafts','variations','content calendar','QA assistance'],
  ownerValue:['brand fit','fact checking','editing','strategy','client communication','final approval'],
  launchOffer:{name:'Content Growth Sprint',priceUsd:1250,scope:'30-day content and copy package with strategy, edited assets and handoff'},
  recurringOffer:{name:'Content & Growth Retainer',priceUsdMonthly:1500,scope:'monthly content, copy, optimization and reporting'}
 },
 aiSoftware:{
  name:'No-Code Software & Custom AI Workflows',model:'implementation-plus-subscription',
  problems:['lead-response','fragmented-tools','customer-support'],
  aiRole:['requirements','code generation','integration scaffolding','tests','debugging','documentation'],
  ownerValue:['niche selection','scope control','authorization','acceptance criteria','deployment approval'],
  launchOffer:{name:'Niche AI Tool Sprint',priceUsd:3500,scope:'one bounded AI-enabled tool or workflow MVP with tests and handoff'},
  recurringOffer:{name:'AI Growth & Automation Retainer',priceUsdMonthly:1500,scope:'monitoring, optimization, support and one controlled improvement cycle per month'}
 },
 digitalProducts:{
  name:'Digital Products & Educational Content',model:'one-time-digital-sales',
  problems:['knowledge-monetization','content-throughput'],
  aiRole:['outline','drafting','examples','worksheets','product descriptions','creative briefs'],
  ownerValue:['expertise validation','originality','rights review','quality control','audience selection'],
  launchOffer:{name:'Digital Product Launch Pack',priceUsd:750,scope:'one original validated digital product plus listing, checkout, delivery and launch assets'},
  recurringOffer:null
 }
});

export function rankBuyerProblems(limit=5){return [...BUYER_PROBLEMS].sort((a,b)=>b.score-a.score).slice(0,limit)}
export function chooseBusinessModel({goal='',preferred='',capitalUsd=0,weeklyHours=20}={}){
 const g=String(goal||'').toLowerCase();let key=BUSINESS_MODELS[preferred]?preferred:null;
 if(!key){if(/content|copy|blog|email|social|marketing/.test(g))key='contentAgency';else if(/software|app|automation|workflow|saas|subscription|gpt/.test(g))key='aiSoftware';else if(/ebook|guide|template|course|digital product|download/.test(g))key='digitalProducts';else key=capitalUsd<=100&&weeklyHours>=10?'contentAgency':'aiSoftware'}
 return {key,...BUSINESS_MODELS[key]};
}
export function executionPlan({goal='',preferred='',capitalUsd=0,weeklyHours=20}={}){
 const model=chooseBusinessModel({goal,preferred,capitalUsd,weeklyHours});
 return {version:REVENUE_FRAMEWORK_VERSION,selectedModel:model,rankedProblems:rankBuyerProblems(),stages:[
  'define one niche and one measurable paid problem','create a fixed-scope offer','build proof/demo','stage storefront and fulfillment',
  'use permissioned acquisition','count only verified customer payments','fulfill the promised scope','measure conversion, margin, support, refunds and retention'
 ],principle:'Solve a real paid problem first; AI lowers production and operating cost but does not create genuine demand by itself.'};
}
export function revenueFrameworkManifest(){return {version:REVENUE_FRAMEWORK_VERSION,businessModels:BUSINESS_MODELS,buyerProblems:rankBuyerProblems(),platformFacts:PLATFORM_FACTS,defaultPlan:executionPlan({})}}
