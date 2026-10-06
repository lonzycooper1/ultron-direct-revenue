// ULTRON Market Intelligence.
// Read-only research and education. This module cannot place or approve orders.

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
const finite=a=>(a||[]).map(Number).filter(Number.isFinite);
const UA='ULTRON-Market-Research/1.0';

export const MARKET_UPGRADE={
 version:'2.0.0',
 sourceVideo:'ScreenRecording_10-06-2026 09-52-50_1.mp4',
 observed:['Stocks & ETFs','Favorites','Top Gainers','Top Losers','Browse the Market','Trend Watch','portfolio/basket discovery','small-account stock balance'],
 capabilities:['US stock search','ETF search','crypto instrument search','stock movers','crypto movers','low-price stock lab','day mode','swing mode','tutorial mode','favorites-ready API'],
 execution:'research-only; real-money execution remains separately approval-gated'
};

export const TUTOR=[
 ['Stocks vs ETFs vs crypto','Stocks are single-company ownership, ETFs are baskets, and crypto uses different venues/custody and often higher volatility.'],
 ['Market, limit and stop orders','Market orders prioritize execution, limit orders prioritize price, and stop orders trigger after a chosen price.'],
 ['Bid, ask and spread','The spread is the gap between displayed buyers and sellers. Wider spreads increase trading friction.'],
 ['Candles and volume','OHLC candles summarize price movement for an interval. Volume helps show participation behind a move.'],
 ['Trend and momentum','Trend systems follow direction; momentum looks for continuation; mean reversion looks for stretched moves to normalize.'],
 ['Day trading','Day trading closes positions within the same day. Intraday noise, spread, slippage and fast losses make it high risk.'],
 ['Small and low-price stocks','A low share price is not the same as a cheap valuation. Watch liquidity, dilution, reverse splits and promotional activity.'],
 ['Risk sizing','Position size should be based on tolerated loss, not confidence alone. Small accounts are especially sensitive to spread and fees.'],
 ['Backtests','Use out-of-sample testing, realistic fees and paper trading. Past performance is not a guarantee.'],
 ['Research signals','ULTRON signals are research summaries. They are not guaranteed outcomes and do not execute trades from this module.']
].map(([title,body],i)=>({id:String(i+1).padStart(2,'0'),title,body}));

export function ema(values,period=20){
 const a=finite(values); if(!a.length)return 0;
 const k=2/(period+1);let out=a[0];
 for(let i=1;i<a.length;i++)out=a[i]*k+out*(1-k);
 return out;
}
export function rsi(values,period=14){
 const a=finite(values);if(a.length<period+1)return 50;
 let g=0,l=0;
 for(let i=a.length-period;i<a.length;i++){const d=a[i]-a[i-1];if(d>=0)g+=d;else l-=d}
 if(l===0)return 100;const rs=(g/period)/(l/period||1e-12);return 100-(100/(1+rs));
}
export function analyzeBars(bars=[],mode='swing'){
 const clean=(bars||[]).filter(x=>Number.isFinite(Number(x?.close))).map(x=>({...x,close:Number(x.close),volume:Number(x.volume||0)}));
 const p=clean.map(x=>x.close),v=clean.map(x=>x.volume);if(p.length<20)return {ready:false,action:'HOLD',confidence:0,reason:'Need at least 20 valid bars.'};
 const fast=ema(p,mode==='day'?8:12),slow=ema(p,mode==='day'?21:26),rv=rsi(p),last=p.at(-1);
 const look=p.slice(-Math.min(p.length,mode==='day'?20:40)),hi=Math.max(...look.slice(0,-1)),lo=Math.min(...look.slice(0,-1));
 const rets=p.slice(1).map((x,i)=>x/p[i]-1),vol=sd(rets.slice(-60)),mom=last/p[Math.max(0,p.length-(mode==='day'?6:11))]-1,vr=(v.at(-1)||0)/(mean(v.slice(-20))||1);
 const votes={trend:fast>slow?1:fast<slow?-1:0,momentum:mom>.003?1:mom<-.003?-1:0,breakout:last>hi?1:last<lo?-1:0,rsi:rv<32?1:rv>68?-1:0,volume:vr>1.5?(mom>=0?1:-1):0};
 const vals=Object.values(votes),active=vals.filter(Boolean).length,sum=vals.reduce((a,b)=>a+b,0),agree=active?Math.abs(sum)/active:0,signal=sum>0?'BULLISH':sum<0?'BEARISH':'NEUTRAL';
 const confidence=clamp(active/5*.42+agree*.43+clamp(Math.abs(mom)/(vol*3||.01),0,1)*.15);
 return {ready:true,mode,signal,action:confidence>=.65?(signal==='BULLISH'?'BUY':signal==='BEARISH'?'SELL':'HOLD'):'HOLD',confidence:+confidence.toFixed(3),price:+last.toFixed(6),rsi:+rv.toFixed(2),momentum:+mom.toFixed(6),volatility:+vol.toFixed(6),volumeRatio:+vr.toFixed(2),votes,execution:'NONE',ownerApprovalRequired:true};
}
export function lowPriceRisk(x={}){
 const p=Number(x.price)||0,mc=Number(x.marketCap),av=Number(x.avgVolume),flags=[];
 if(p>0&&p<5)flags.push('sub-$5 price: elevated volatility/manipulation/delisting risk');
 else if(p>0&&p<20)flags.push('low-price stock: price alone does not imply value');
 if(Number.isFinite(mc)&&mc>0&&mc<300000000)flags.push('micro-cap risk');
 else if(Number.isFinite(mc)&&mc>0&&mc<2000000000)flags.push('small-cap risk');
 if(Number.isFinite(av)&&av>0&&av<500000)flags.push('thin average volume');
 return {flags,risk:flags.length>=3?'HIGH':flags.length?'ELEVATED':'NORMAL'};
}

let stocks={at:0,rows:[]},cryptos={at:0,rows:[]};
function parsePipe(text,kind){
 const lines=String(text||'').trim().split(/\r?\n/),h=lines[0]?.split('|')||[];
 return lines.slice(1).filter(x=>x&&!/^File Creation Time/i.test(x)).map(line=>{
  const a=line.split('|'),o=Object.fromEntries(h.map((k,i)=>[k,a[i]??'']));
  return kind==='nasdaq'
   ?{symbol:o.Symbol,name:o['Security Name'],exchange:'NASDAQ',etf:o.ETF==='Y',test:o['Test Issue']==='Y'}
   :{symbol:o['ACT Symbol']||o['NASDAQ Symbol'],name:o['Security Name'],exchange:({N:'NYSE',A:'NYSE American',P:'NYSE Arca',Z:'BATS',V:'IEX'})[o.Exchange]||o.Exchange,etf:o.ETF==='Y',test:o['Test Issue']==='Y'};
 }).filter(x=>x.symbol&&!x.test);
}
export async function usUniverse(){
 if(Date.now()-stocks.at<900000&&stocks.rows.length)return stocks.rows;
 const out=[];
 for(const [kind,url] of [['nasdaq','https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt'],['other','https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt']]){
  const r=await fetch(url,{headers:{'user-agent':UA},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('symbol directory '+r.status);out.push(...parsePipe(await r.text(),kind));
 }
 const seen=new Set(),rows=[];for(const x of out){const k=x.symbol.toUpperCase();if(!seen.has(k)){seen.add(k);rows.push({...x,symbol:k})}}
 stocks={at:Date.now(),rows};return rows;
}
export async function searchUs(q='',type='all',limit=60){
 const s=String(q||'').toLowerCase(),rows=await usUniverse();
 return rows.filter(x=>(type==='all'||(type==='etf'?x.etf:!x.etf))&&(!s||x.symbol.toLowerCase().includes(s)||String(x.name).toLowerCase().includes(s))).slice(0,Math.min(200,Math.max(1,Number(limit)||60)));
}
export async function cryptoUniverse(){
 if(Date.now()-cryptos.at<600000&&cryptos.rows.length)return cryptos.rows;
 const r=await fetch('https://api.crypto.com/exchange/v1/public/get-instruments',{headers:{accept:'application/json','user-agent':UA},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('crypto instruments '+r.status);
 const j=await r.json(),a=j?.result?.data||j?.result?.instruments||[];
 cryptos={at:Date.now(),rows:a.filter(Boolean).map(x=>({symbol:x.symbol||x.instrument_name,name:x.display_name||x.symbol||x.instrument_name,base:x.base_ccy,quote:x.quote_ccy,type:x.inst_type||x.instrument_type||'SPOT',tradable:x.tradable!==false}))};return cryptos.rows;
}
export async function searchCrypto(q='',limit=80){
 const s=String(q||'').toLowerCase(),rows=await cryptoUniverse();return rows.filter(x=>!s||String(x.symbol).toLowerCase().includes(s)||String(x.name).toLowerCase().includes(s)||String(x.base||'').toLowerCase().includes(s)).slice(0,Math.min(200,Math.max(1,Number(limit)||80)));
}
async function stockBars(symbol,mode='day'){
 const interval=mode==='day'?'5m':'1h',range=mode==='day'?'5d':'3mo',u='https://query2.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?interval='+interval+'&range='+range+'&includePrePost=false';
 const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 ULTRON-private-research'},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('stock chart '+r.status);
 const j=await r.json(),x=j?.chart?.result?.[0];if(!x)throw Error('No stock chart data');const q=x.indicators?.quote?.[0]||{},ts=x.timestamp||[];
 return {bars:ts.map((t,i)=>({time:t*1000,close:Number(q.close?.[i]),volume:Number(q.volume?.[i])})).filter(x=>Number.isFinite(x.close)),meta:x.meta||{}};
}
async function cryptoBars(symbol,mode='day'){
 const u=new URL('https://api.crypto.com/exchange/v1/public/get-candlestick');u.searchParams.set('instrument_name',symbol);u.searchParams.set('timeframe',mode==='day'?'5m':'1h');u.searchParams.set('count',mode==='day'?'120':'168');
 const r=await fetch(u,{headers:{accept:'application/json','user-agent':UA},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('crypto chart '+r.status);const j=await r.json(),a=j?.result?.data||[];
 return a.map(x=>({time:Number(x.t),close:Number(x.c),volume:Number(x.v)})).sort((a,b)=>a.time-b.time);
}
export async function analyzeSymbol(asset,symbol,mode='day'){
 const s=String(symbol||'').trim().toUpperCase();if(!s)throw Error('symbol required');
 if(asset==='crypto'){const bars=await cryptoBars(s,mode);return {asset:'crypto',symbol:s,provider:'Crypto.com public market data',analysis:analyzeBars(bars,mode),bars:bars.slice(-80)}}
 const d=await stockBars(s,mode),analysis=analyzeBars(d.bars,mode);return {asset:'stock',symbol:s,name:d.meta?.longName||d.meta?.shortName||s,exchange:d.meta?.exchangeName||null,provider:'public chart fallback for research',providerWarning:'Connect a licensed real-time equity feed before using this for time-sensitive execution.',analysis,risk:lowPriceRisk({price:analysis.price}),bars:d.bars.slice(-80)};
}
async function screen(id,count=100){
 const u='https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?count='+Math.min(250,count)+'&scrIds='+encodeURIComponent(id),r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 ULTRON-private-research'},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('stock screener '+r.status);const j=await r.json();return j?.finance?.result?.[0]?.quotes||[];
}
const quote=q=>({symbol:q.symbol,name:q.shortName||q.longName||q.symbol,price:Number(q.regularMarketPrice),changePct:Number(q.regularMarketChangePercent),volume:Number(q.regularMarketVolume),avgVolume:Number(q.averageDailyVolume3Month),marketCap:Number(q.marketCap),exchange:q.fullExchangeName||q.exchange});
export async function stockMovers(limit=30){
 const out={provider:'public screener fallback for private research',warning:'Connect a licensed real-time feed for execution.'};
 for(const [k,id] of [['gainers','day_gainers'],['losers','day_losers'],['active','most_actives']])try{out[k]=(await screen(id,Math.max(60,limit))).slice(0,limit).map(quote)}catch(e){out[k]=[];out[k+'Error']=String(e?.message||e)}
 return out;
}
export async function lowPriceLab(maxPrice=25,limit=30){
 const m=await stockMovers(120),map=new Map();for(const q of [...(m.gainers||[]),...(m.active||[])])if(q.price>0&&q.price<=maxPrice)map.set(q.symbol,q);
 return [...map.values()].map(x=>({...x,...lowPriceRisk(x)})).sort((a,b)=>(b.changePct||0)-(a.changePct||0)).slice(0,limit);
}
export async function cryptoMovers(limit=30){
 const u=new URL('https://api.coingecko.com/api/v3/coins/markets');u.searchParams.set('vs_currency','usd');u.searchParams.set('order','volume_desc');u.searchParams.set('per_page','120');u.searchParams.set('page','1');u.searchParams.set('sparkline','false');
 const r=await fetch(u,{headers:{accept:'application/json','user-agent':UA},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('crypto movers '+r.status);
 const rows=(await r.json()).map(x=>({symbol:String(x.symbol||'').toUpperCase(),name:x.name,price:Number(x.current_price),marketCap:Number(x.market_cap),volume:Number(x.total_volume),changePct:Number(x.price_change_percentage_24h)}));
 return {provider:'CoinGecko public market discovery',gainers:[...rows].sort((a,b)=>b.changePct-a.changePct).slice(0,limit),losers:[...rows].sort((a,b)=>a.changePct-b.changePct).slice(0,limit),active:rows.slice(0,limit)};
}
export function manifest(){return {upgrade:MARKET_UPGRADE,tutor:TUTOR,boundaries:{research:'automatic',education:'automatic',paperTrading:'automatic',realMoney:'separate explicit approval required',guarantees:false}}}
