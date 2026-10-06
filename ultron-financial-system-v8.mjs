const n=v=>Number.isFinite(Number(v))?Number(v):0,c=(v,a=0,b=100)=>Math.max(a,Math.min(b,n(v)));
export const FINANCIAL_SYSTEM_LAYERS=[
 {name:'Customer Value Layer',role:'Earn external revenue by solving real customer problems.'},
 {name:'Operating Cash Layer',role:'Separate captured revenue, refunds, costs, obligations and contribution profit.'},
 {name:'Reserve Layer',role:'Preserve liquidity needed for taxes, refunds, fulfillment, continuity and known obligations.'},
 {name:'Reinvestment Layer',role:'Allocate retained contribution profit toward validated product, distribution, reliability and learning.'},
 {name:'Financing Optionality Layer',role:'Maintain evidence and readiness for lawful external financing without assuming approval or borrowing need.'},
 {name:'Macro & Credit Intelligence Layer',role:'Use rates, liquidity, inflation and credit conditions as contextual planning signals.'},
 {name:'Compounding Asset Layer',role:'Accumulate durable software, data, websites, audience, integrations, brand, IP and customer relationships.'}
];
export function capitalPosition(x={}){
 const captured=Math.max(0,n(x.capturedRevenue)),refunds=Math.max(0,n(x.refunds)),direct=Math.max(0,n(x.directCosts)),ops=Math.max(0,n(x.operatingCosts)),obligations=Math.max(0,n(x.obligations)),reserveTarget=Math.max(0,n(x.reserveTarget));
 const contribution=captured-refunds-direct-ops,freeAfterObligations=contribution-obligations,reserveGap=Math.max(0,reserveTarget-Math.max(0,n(x.currentReserves)));
 return {capturedRevenue:captured,contributionProfit:+contribution.toFixed(2),freeAfterObligations:+freeAfterObligations.toFixed(2),reserveGap:+reserveGap.toFixed(2),reinvestmentCapacity:+Math.max(0,freeAfterObligations-reserveGap).toFixed(2),rule:'Reinvestment capacity is not bank balance or payout availability unless verified from the relevant financial source.'};
}
export function creditCycleContext(x={}){
 const rate=n(x.policyRate),inflation=n(x.inflation),liquidity=c(x.liquidity),creditGrowth=n(x.creditGrowth),stress=c(x.financialStress);
 let phase='TRANSITION_OR_UNKNOWN';
 if(liquidity>=65&&rate<5&&stress<40)phase='EXPANSION';
 else if(inflation>=5&&creditGrowth>5)phase='INFLATION_OR_EXCESS';
 else if(stress>=65||liquidity<=30)phase='CONTRACTION_OR_DELEVERAGING';
 return {phase,signals:{policyRate:rate,inflation,liquidity,creditGrowth,financialStress:stress},uses:['demand scenario planning','pricing sensitivity','cash reserve planning','capital intensity decisions','supplier/customer credit-risk context'],notAuthorityFor:['automatic borrowing','automatic lending','credit applications','transfers','investment orders']};
}
export function financialFoodChain(){
 return {positioning:'ULTRON should seek the highest-value lawful economic position: own customer relationships, differentiated products, distribution, proprietary learning, recurring value and durable digital assets—not pretend to be a bank.',cycle:['solve problem','earn verified external payment','fulfill value','retain contribution profit','preserve reserves','reinvest in validated growth and assets','increase customer value and operating leverage','repeat'],boundary:'Banking, lending, credit underwriting, custody, money transmission and investment execution are regulated or consequential activities and remain outside autonomous execution unless properly authorized and legally supported.'};
}
