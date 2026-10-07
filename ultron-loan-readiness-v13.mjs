export const LOAN_READINESS_VERSION='13.0.0';

export const VIDEO_FINDINGS={
  source:'ScreenRecording_10-07-2026 10-31-42_1.mp4',
  visibleClaims:[
    'Social post claims three lenders may fund a brand-new LLC up to $50,000 with no documents.',
    'Fulton Bank business card products are shown.',
    'Veritex Community Bank business credit-card material is shown.'
  ],
  verificationPolicy:'Treat social-media funding claims as leads to research, never as approval criteria or guaranteed funding.',
  currentOfficialEvidence:[
    {institution:'Fulton Bank',finding:'Small-business Visa card pages state products are subject to credit approval and advertise limits from $1,000 to $500,000 depending on product.'},
    {institution:'Fulton Bank',finding:'Its Company Card is for established companies and states at least 2 years established, established credit history, and other requirements.'},
    {institution:'Veritex Community Bank',finding:'Published business-card application/agreement materials are subject to credit approval and include financial-information certifications and guarantor language.'},
    {institution:'SBA',finding:'Lender readiness commonly includes a business plan, amount/use of funds, credit history, financial projections, possible collateral, and industry experience.'}
  ]
};

export const READINESS_CATEGORIES=[
  {id:'identity',name:'Business identity & legal standing',weight:12,items:['Legal entity active and in good standing','EIN confirmed','Business address/phone/domain consistent','Operating agreement/bylaws available','Licenses and permits current','Beneficial owners documented']},
  {id:'banking',name:'Banking & cash-flow hygiene',weight:13,items:['Dedicated business checking account','No unexplained overdrafts/returns','Consistent deposits','Merchant/payment processor statements retained','Three-to-six months of bank statements organized','Cash reserve policy documented']},
  {id:'financials',name:'Financial statements',weight:18,items:['Current profit & loss statement','Current balance sheet','Cash-flow statement','Accounts receivable aging','Accounts payable aging','Debt schedule','Monthly close process']},
  {id:'tax',name:'Tax & reporting',weight:10,items:['Business tax returns available when applicable','Owner tax documents available when required','Payroll/sales-tax filings current','No unresolved tax liens or filing gaps documented']},
  {id:'plan',name:'Business plan & use of funds',weight:12,items:['Written business plan','Specific funding amount requested','Detailed use-of-funds schedule','Repayment source identified','Milestones tied to funding','Downside scenario documented']},
  {id:'projections',name:'Forecasts & debt capacity',weight:13,items:['12-month monthly forecast','Three-year annual projections','Assumptions documented','Debt-service coverage modeled','Break-even analysis','Sensitivity/downside case']},
  {id:'credit',name:'Credit profile readiness',weight:10,items:['Business credit files checked for accuracy','Owner/personal credit requirements identified for target product','Existing utilization and obligations understood','No undisclosed delinquencies','Credit inquiries planned rather than stacked']},
  {id:'evidence',name:'Revenue & operating evidence',weight:7,items:['Invoices/contracts/orders retained','Revenue reconciles to bank/payment records','Customer concentration known','Recurring revenue separated from one-time revenue','Refunds/chargebacks tracked']},
  {id:'lenderfit',name:'Lender-fit & application discipline',weight:5,items:['Only verified lender criteria used','No guaranteed-approval assumptions','Applications sequenced to minimize unnecessary hard pulls','Fees/APR/guarantees compared','Approval conditions saved as evidence']}
];

export const DOCUMENT_VAULT=[
  'Certificate/articles of formation','Certificate of good standing','EIN confirmation','Operating agreement/bylaws','Business licenses/permits','Beneficial ownership information',
  'Business bank statements','Merchant processor statements','Profit & loss','Balance sheet','Cash-flow statement','AR aging','AP aging','Debt schedule','Business tax returns',
  'Owner tax returns when required','Business plan','Use-of-funds statement','12-month monthly forecast','3-year projections','Lease','Insurance','Major customer contracts','Major vendor contracts',
  'Current loan/card statements','Identification required by lender','Proof of address','Ownership table/cap table'
];

export const LENDER_WATCH=[
 {institution:'Fulton Bank',type:'Business credit cards',status:'RESEARCHED',notes:['Official small-business card pages say subject to credit approval.','Some products advertise credit limits from $1,000 to $500,000.','Do not infer a $50,000 approval for a new LLC from a social post.']},
 {institution:'Veritex Community Bank',type:'Business credit cards / business banking',status:'RESEARCHED',notes:['Official published card documents state subject to credit approval.','Application materials include certification of business/personal financial information.','Do not label as no-doc or guaranteed new-LLC funding without current written underwriting criteria.']},
 {institution:'SBA Lender Match',type:'Loan discovery',status:'RESEARCHED',notes:['Can match businesses to interested lenders.','Matching is not a guarantee of approval.','Prepare plan, use of funds, credit history and projections before applying.']}
];

export function lenderReadinessManifest(){
 return {
  name:'ULTRON Lender Readiness & Capital Access OS',
  version:LOAN_READINESS_VERSION,
  purpose:'Make the company application-ready without fabricating revenue, documents, credit history, approvals, or lender requirements.',
  categories:READINESS_CATEGORIES,
  documentVault:DOCUMENT_VAULT,
  lenderWatch:LENDER_WATCH,
  videoFindings:VIDEO_FINDINGS,
  rules:[
   'Never claim preapproval, approval, funding amount, no-doc status, or no-PG status unless confirmed by the lender for this applicant.',
   'Never create fake invoices, revenue, bank statements, tax returns, tradelines, addresses, employees, or contracts.',
   'Separate business-card marketing limits from the amount an applicant is actually approved for.',
   'Prioritize lender-fit and debt-service capacity over application volume.',
   'Require owner approval before submitting any credit application or accepting financing terms.'
  ]
 }
}

export function scoreLoanReadiness(input={}){
 const completed=new Set(Array.isArray(input.completed)?input.completed:[]);
 const categoryScores=READINESS_CATEGORIES.map(c=>{
   const done=c.items.filter(x=>completed.has(x)).length;
   const ratio=c.items.length?done/c.items.length:0;
   return {id:c.id,name:c.name,weight:c.weight,completed:done,total:c.items.length,percent:Math.round(ratio*100),weighted:+(ratio*c.weight).toFixed(2),missing:c.items.filter(x=>!completed.has(x))};
 });
 const score=Math.round(categoryScores.reduce((a,c)=>a+c.weighted,0));
 const tier=score>=85?'APPLICATION_READY':score>=70?'NEAR_READY':score>=50?'BUILDING':score>=25?'EARLY':'NOT_READY';
 return {
  score,tier,categoryScores,
  blockers:categoryScores.flatMap(c=>c.missing.map(item=>({category:c.name,item}))).slice(0,20),
  nextActions:categoryScores.filter(c=>c.percent<100).sort((a,b)=>(b.weight*(100-b.percent))-(a.weight*(100-a.percent))).slice(0,5).map(c=>({category:c.name,action:'Complete missing evidence',missing:c.missing.slice(0,4)})),
  disclaimer:'This is an internal readiness score, not a lender approval score.'
 }
}

export function buildCapitalPacket(input={}){
 return {
  generatedAt:new Date().toISOString(),
  business:{legalName:input.legalName||null,entityType:input.entityType||null,state:input.state||null,einLast4:input.einLast4||null,yearsOperating:input.yearsOperating??null},
  request:{amount:input.amount??null,purpose:input.purpose||null,termPreference:input.termPreference||null},
  financialSnapshot:{annualRevenue:input.annualRevenue??null,monthlyRevenue:input.monthlyRevenue??null,grossMargin:input.grossMargin??null,existingDebtPayment:input.existingDebtPayment??null,cashOnHand:input.cashOnHand??null},
  documents:DOCUMENT_VAULT.map(name=>({name,status:(input.documents||{})[name]||'MISSING_OR_UNVERIFIED'})),
  lenderNarrativeSections:['Company overview','Ownership and management','Problem and market','Products/services','Historical performance','Funding request','Use of funds','Repayment plan','Risks and mitigations','Financial projections','Supporting documents'],
  fraudGuard:'All figures and documents must reconcile to source records. No synthetic lender documents are permitted.'
 }
}

export function debtCapacity({monthlyOperatingCashFlow=0,existingMonthlyDebtService=0,newMonthlyDebtService=0}={}){
 const total=Number(existingMonthlyDebtService||0)+Number(newMonthlyDebtService||0);
 const dscr=total>0?Number(monthlyOperatingCashFlow||0)/total:null;
 return {monthlyOperatingCashFlow:Number(monthlyOperatingCashFlow||0),totalMonthlyDebtService:total,dscr:dscr==null?null:+dscr.toFixed(2),interpretation:dscr==null?'NO_DEBT_SERVICE_INPUT':dscr>=1.25?'STRONGER_CUSHION':dscr>=1?'THIN_CUSHION':'INSUFFICIENT_CASH_FLOW'};
}
