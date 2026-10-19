import test from 'node:test';
import assert from 'node:assert/strict';
import {readCompleteTradeHistory,fillQuantitiesMatch,tradeTimeNs} from './crypto-trade-history.mjs';
import {reconcileExchangeOrder} from './crypto-exchange.mjs';

const options={instrument:'BTC_USD',startNs:'0',endNs:'200',wait:async()=>{}};
const page=data=>({result:{data}});
test('history recovers more than one page without skipping boundary timestamps',async()=>{
 const rows=Array.from({length:150},(_,i)=>({trade_id:String(i+1),create_time_ns:String(i+1)}));
 const calls=[];
 const result=await readCompleteTradeHistory({...options,call:async(method,p)=>{
  calls.push(p);assert.equal(method,'private/get-trades');assert.equal(p.limit,'100');
  return page(rows.filter(r=>BigInt(r.create_time_ns)>=BigInt(p.start_time)&&BigInt(r.create_time_ns)<BigInt(p.end_time)).reverse().slice(0,100));
 }});
 assert.equal(result.complete,true);assert.equal(result.trades.length,150);
 assert.equal(new Set(result.trades.map(t=>t.trade_id)).size,150);assert.ok(calls.length>1);
});
test('saturated nanoseconds, incomplete pages, duplicate identities and exhausted budgets stay unresolved',async()=>{
 const full=Array.from({length:100},(_,i)=>({trade_id:String(i+1),create_time_ns:'1'}));
 await assert.rejects(readCompleteTradeHistory({...options,endNs:'2',call:async()=>page(full)}),/Saturated nanosecond/);
 await assert.rejects(readCompleteTradeHistory({...options,maxPages:1,call:async()=>page(full)}),/budget/);
 await assert.rejects(readCompleteTradeHistory({...options,call:async()=>page([{trade_id:'1',create_time_ns:'1'},{trade_id:'1',create_time_ns:'2'}])}),/Duplicate/);
 await assert.rejects(readCompleteTradeHistory({...options,call:async()=>page([{trade_id:'1',create_time_ns:'200'}])}),/outside/);
 await assert.rejects(readCompleteTradeHistory({...options,call:async()=>({})}),/Malformed/);
 await assert.rejects(readCompleteTradeHistory({...options,call:async()=>{throw Error('timeout')}}),/timeout/);
});
test('nanosecond and quantity accounting preserves precision',()=>{
 assert.equal(tradeTimeNs({create_time_ns:'1792440000000000001'}),1792440000000000001n);
 assert.throws(()=>tradeTimeNs({create_time_ns:1792440000000000001}),/Unsafe/);
 assert.equal(fillQuantitiesMatch([{traded_quantity:'.1'},{traded_quantity:'.2'}],'.3'),true);
 assert.equal(fillQuantitiesMatch([{traded_quantity:'.00000000001'}],'0'),false);
 assert.throws(()=>fillQuantitiesMatch([{traded_quantity:'-1'}],'0'),/Invalid/);
});
test('reconciliation rechecks terminal snapshot and rejects wrong fill identity or incomplete history',async()=>{
 const old=[process.env.CRYPTOCOM_API_KEY,process.env.CRYPTOCOM_API_SECRET];
 process.env.CRYPTOCOM_API_KEY='fixture';process.env.CRYPTOCOM_API_SECRET='fixture';
 const expected={instrument:'BTC-USD',side:'BUY'};
 const base={client_oid:'client',order_id:'1',instrument_name:'BTC_USD',side:'BUY',status:'FILLED',cumulative_quantity:'.001',create_time:'1'};
 const fill={trade_id:'1',order_id:'1',client_oid:'client',instrument_name:'BTC_USD',side:'BUY',traded_quantity:'.001',create_time:'2'};
 try{
  for(const scenario of ['complete','changed','wrong-side','timeout','truncated','tiny-mismatch']){
   let detail=0;const methods=[];
   const result=await reconcileExchangeOrder('client',expected,{historyOptions:{maxPages:1,wait:async()=>{}},transport:async(url,request)=>{
    const method=JSON.parse(request.body).method;methods.push(method);assert.doesNotMatch(method,/create|cancel|withdraw/);
    let result;
    if(method==='private/get-order-detail'){detail++;result={...base,...(scenario==='changed'&&detail>1?{cumulative_quantity:'.002'}:{})}}
    else {
     if(scenario==='timeout')throw Error('timeout');
     result={data:scenario==='truncated'?Array.from({length:100},(_,i)=>({...fill,trade_id:String(i+1)})):[{...fill,...(scenario==='wrong-side'?{side:'SELL'}:{}),...(scenario==='tiny-mismatch'?{traded_quantity:'.00100000001'}:{})}]};
    }
    return {ok:true,json:async()=>({code:0,result})};
   }});
   assert.equal(result.verified,scenario==='complete',scenario);
   if(scenario==='complete'){assert.equal(detail,2);assert.equal(result.history.complete,true)}
  }
 }finally{for(const [i,key] of ['CRYPTOCOM_API_KEY','CRYPTOCOM_API_SECRET'].entries())if(old[i]===undefined)delete process.env[key];else process.env[key]=old[i]}
});
