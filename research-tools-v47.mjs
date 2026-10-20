const number=(v,name,min=0,max=1e12)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error('Invalid '+name);return v};
const round=x=>Math.round(x*100)/100;
// Deterministic scenarios only; no provider requests, orders or tax conclusions.
export function refinanceScenario(x={}){
 const value=number(x.value,'value',1),debt=number(x.debt,'debt'),ltv=number(x.ltvPct,'LTV',0,100)/100;
 const costs=number(x.costs,'costs'),noi=number(x.annualNoi,'annual NOI',-1e12),rate=number(x.annualRatePct,'annual rate',0,100)/1200;
 const months=number(x.months,'months',1,600);if(!Number.isInteger(months))throw Error('Whole months required');
 const principal=value*ltv,payment=rate===0?principal/months:principal*rate/(1-Math.pow(1+rate,-months));
 return {status:'INPUT_SCENARIO',loanPrincipal:round(principal),cashAfterDebtAndCosts:round(principal-debt-costs),monthlyDebtService:round(payment),annualCashAfterDebtService:round(noi-payment*12),dscr:payment>0?round(noi/(payment*12)):null,taxTreatment:'NOT_DETERMINED',valuationVerified:false,financingApproved:false,externalActionsTaken:0};
}
export function screenCompanies(x={}){
 if(!Array.isArray(x.companies)||x.companies.length<1||x.companies.length>100)throw Error('Provide 1–100 company records');
 const minRoe=number(x.minRoePct,'minimum ROE',-100,100),maxDebtEquity=number(x.maxDebtEquity,'maximum debt/equity',0,100),maxPe=number(x.maxPe,'maximum P/E',0,1000);
 const records=x.companies.map(c=>{
  if(typeof c.symbol!=='string'||!/^[-A-Z0-9.]{1,15}$/.test(c.symbol))throw Error('Invalid symbol');
  if(typeof c.source!=='string'||!c.source.trim()||c.source.length>1000||!Number.isFinite(Date.parse(c.asOf)))throw Error('Source and asOf required');
  const complete=['roePct','debtEquity','pe','freeCashFlow'].every(k=>typeof c[k]==='number'&&Number.isFinite(c[k]));
  if(!complete)return {symbol:c.symbol,status:'INSUFFICIENT_DATA',source:c.source,asOf:c.asOf};
  const checks={freeCashFlow:c.freeCashFlow>0,roe:c.roePct>=minRoe,debtEquity:c.debtEquity>=0&&c.debtEquity<=maxDebtEquity,pe:c.pe>0&&c.pe<=maxPe};
  return {symbol:c.symbol,status:Object.values(checks).every(Boolean)?'MATCH':'NO_MATCH',checks,source:c.source,asOf:c.asOf};
 });
 return {status:'INPUT_SCREEN_NOT_INVESTMENT_RECOMMENDATION',rules:{minRoe,maxDebtEquity,maxPe},records,dataIndependentlyVerified:false,backtestPerformed:false,externalActionsTaken:0};
}
