// Pure accounting over normalized SERVER-SIDE exchange evidence. This module
// does not accept HTTP input, certify a provider adapter or invent cost basis.
// USD values/quantities use fixed 12-place arithmetic, never binary floats.
const SCALE=10n**12n;
const decimal=value=>{
 const text=String(value);
 if(!/^-?\d+(?:\.\d{1,12})?$/.test(text)||text.length>60)throw Error('Invalid accounting decimal');
 const sign=text.startsWith('-')?-1n:1n,[whole,fraction='']=text.replace('-','').split('.');
 return sign*(BigInt(whole)*SCALE+BigInt(fraction.padEnd(12,'0')));
};
const positive=value=>{const n=decimal(value);if(n<=0n)throw Error('Positive accounting amount required');return n};
const nonnegative=value=>{const n=decimal(value);if(n<0n)throw Error('Negative accounting balance');return n};
const multiply=(a,b)=>a*b/SCALE;
const usd=n=>Number(n)/Number(SCALE);
export function calculateDailyAccounting({opening,closing,trades,flows,coverage,periodStart,periodEnd}={}){
 if(!Number.isSafeInteger(periodStart)||periodStart%86400000!==0||!Number.isSafeInteger(periodEnd)||periodEnd<=periodStart||periodEnd>periodStart+86400000)throw Error('Explicit UTC daily accounting period required');
 if(!coverage||coverage.start!==periodStart||coverage.end!==periodEnd||coverage.tradesComplete!==true||coverage.flowsComplete!==true||opening?.costBasisVerified!==true||opening?.at!==periodStart||closing?.at!==periodEnd)throw Error('Complete daily history and opening cost basis required');
 if(!Array.isArray(trades)||!Array.isArray(flows))throw Error('Missing daily history');
 const assets=['BTC','ETH'];
 const books=Object.fromEntries(assets.map(a=>[a,{quantity:nonnegative(opening.assets?.[a]?.quantity),cost:nonnegative(opening.assets?.[a]?.costUsd)}]));
 let cash=nonnegative(opening.cashUsd),startingEquity=cash,openingUnrealized=0n,realized=0n,fees=0n,capital=0n,transferredUnrealized=0n;
 for(const a of assets){const mark=positive(opening.assets[a].priceUsd),value=multiply(books[a].quantity,mark);startingEquity+=value;openingUnrealized+=value-books[a].cost;if(books[a].quantity===0n&&books[a].cost!==0n)throw Error('Invalid opening cost basis')}
 if(startingEquity<=0n)throw Error('Positive starting equity required');
 const remove=(asset,quantity)=>{
  const b=books[asset];if(!b||quantity>b.quantity)throw Error('History requires borrowed or missing holdings');
  const cost=quantity===b.quantity?b.cost:b.cost*quantity/b.quantity;
  b.quantity-=quantity;b.cost-=cost;return cost;
 };
 const seen=new Set(),events=[...trades.map(e=>({...e,kind:'TRADE'})),...flows.map(e=>({...e,kind:'FLOW'}))].sort((a,b)=>a.at-b.at||String(a.id).localeCompare(String(b.id)));
 for(const e of events){
  const id=e.kind+':'+e.id;
  if(typeof e.id!=='string'||!e.id||seen.has(id)||!Number.isSafeInteger(e.at)||e.at<periodStart||e.at>=periodEnd)throw Error('Duplicate, missing or out-of-period evidence');
  seen.add(id);
  if(e.kind==='TRADE'){
   if(!assets.includes(e.asset)||!['BUY','SELL'].includes(e.side))throw Error('Unsupported spot history');
   const quantity=positive(e.quantity),price=positive(e.priceUsd),value=multiply(quantity,price),b=books[e.asset];
   if(e.side==='BUY'){cash-=value;b.quantity+=quantity;b.cost+=value}else{const cost=remove(e.asset,quantity);cash+=value;realized+=value-cost}
   const fee=nonnegative(e.feeQuantity);
   if(e.feeAsset==='USD'){cash-=fee;fees+=fee}
   else if(e.feeAsset===e.asset){const feeValue=multiply(fee,price),feeCost=remove(e.asset,fee);fees+=feeValue;realized+=feeValue-feeCost}
   else throw Error('Unsupported fee valuation requires authoritative exchange price');
  }else{
   if(!['IN','OUT'].includes(e.direction))throw Error('Unknown external cash flow');
   const sign=e.direction==='IN'?1n:-1n,quantity=positive(e.quantity);
   if(e.asset==='USD'){cash+=sign*quantity;capital+=sign*quantity}
   else{
    if(!assets.includes(e.asset))throw Error('Unsupported external asset');
    const value=multiply(quantity,positive(e.priceUsd));let cost;
    if(sign>0){cost=nonnegative(e.costUsd);books[e.asset].quantity+=quantity;books[e.asset].cost+=cost}else cost=remove(e.asset,quantity);
    capital+=sign*value;transferredUnrealized+=sign*(value-cost);
   }
  }
  if(cash<0n)throw Error('History implies borrowed cash or invalid event ordering');
 }
 if(cash!==nonnegative(closing.cashUsd))throw Error('Cash ledger does not reconcile with provider balance');
 let endingEquity=cash,endingUnrealized=0n;
 for(const a of assets){const b=books[a],actual=closing.assets?.[a];if(b.quantity!==nonnegative(actual?.quantity))throw Error('Holdings do not reconcile with provider balances');const value=multiply(b.quantity,positive(actual.priceUsd));endingEquity+=value;endingUnrealized+=value-b.cost}
 const unrealized=endingUnrealized-openingUnrealized-transferredUnrealized,total=endingEquity-startingEquity-capital;
 if(total!==realized+unrealized-fees)throw Error('Daily P&L decomposition does not reconcile');
 return {periodStart,periodEnd,basis:'UTC_DAY_WITH_VERIFIED_OPENING_COST_BASIS',startingEquityUsd:usd(startingEquity),endingEquityUsd:usd(endingEquity),netExternalFlowsUsd:usd(capital),realizedPnlBeforeFeesUsd:usd(realized),unrealizedPnlChangeUsd:usd(unrealized),feesUsd:usd(fees),netDailyPnlUsd:usd(total),dailyPnlPct:Number(total)/Number(startingEquity),tradeCount:trades.length,flowCount:flows.length};
}
