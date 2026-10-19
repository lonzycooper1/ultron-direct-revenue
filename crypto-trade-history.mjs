// Read-only recovery. Split saturated time windows instead of moving a cursor
// past a timestamp that may contain more than one page of fills.
const PAGE_SIZE=100;
const integer=value=>{
  if(typeof value==='number'&&!Number.isSafeInteger(value))throw Error('Unsafe exchange integer');
  if(!/^\d+$/.test(String(value)))throw Error('Missing exchange integer');
  return BigInt(value);
};
export function tradeTimeNs(row){
  return row?.create_time_ns!==undefined?integer(row.create_time_ns):integer(row?.create_time)*1000000n;
}
export function fillQuantitiesMatch(fills,cumulative){
  const atomic=value=>{
    const text=String(value);
    if(text.length>80||!/^\d*(?:\.\d+)?$/.test(text)||!/[0-9]/.test(text))throw Error('Invalid decimal quantity');
    const [whole,fraction='']=text.split('.');
    if(fraction.length>30)throw Error('Unsupported quantity precision');
    return BigInt(whole||'0')*10n**30n+BigInt(fraction.padEnd(30,'0'));
  };
  return fills.reduce((sum,fill)=>sum+atomic(fill.traded_quantity),0n)===atomic(cumulative);
}
export async function readCompleteTradeHistory({call,instrument,startNs,endNs,maxPages=32,
  now=Date.now,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),deadlineMs=30000}){
  const start=integer(startNs),end=integer(endNs),began=now();
  if(start>=end||!Number.isSafeInteger(maxPages)||maxPages<1||maxPages>64)throw Error('Invalid history bounds');
  const pending=[[start,end]],trades=[],seen=new Set();let pages=0;
  while(pending.length){
    if(pages>=maxPages||now()-began>=deadlineMs)throw Error('History recovery budget exhausted');
    // Crypto.com limits get-trades to one request per second per key.
    if(pages)await wait(1100);
    if(now()-began>=deadlineMs)throw Error('History recovery deadline exceeded');
    const [lo,hi]=pending.pop();pages++;
    const response=await call('private/get-trades',{instrument_name:instrument,
      start_time:String(lo),end_time:String(hi),limit:String(PAGE_SIZE)});
    const rows=response?.result?.data;
    if(!Array.isArray(rows)||rows.length>PAGE_SIZE)throw Error('Malformed trade history');
    for(const row of rows){const time=tradeTimeNs(row);if(time<lo||time>=hi)throw Error('Trade outside requested window')}
    if(rows.length===PAGE_SIZE){
      if(hi-lo<=1n)throw Error('Saturated nanosecond requires investigation');
      const mid=lo+(hi-lo)/2n;
      pending.push([lo,mid],[mid,hi]);
      continue;
    }
    for(const row of rows){
      const id=String(integer(row.trade_id));
      if(seen.has(id))throw Error('Duplicate trade identity');
      seen.add(id);trades.push(row);
    }
  }
  return {trades,pages,complete:true,startNs:String(start),endNs:String(end)};
}
