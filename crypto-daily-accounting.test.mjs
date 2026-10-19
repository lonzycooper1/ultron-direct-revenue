import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateDailyAccounting as calculate} from './crypto-daily-accounting.mjs';
const start=Date.UTC(2026,9,19),end=start+100000;
const input=()=>({periodStart:start,periodEnd:end,coverage:{start,end,tradesComplete:true,flowsComplete:true},opening:{at:start,costBasisVerified:true,cashUsd:'1000',assets:{BTC:{quantity:'1',costUsd:'50000',priceUsd:'60000'},ETH:{quantity:'0',costUsd:'0',priceUsd:'2000'}}},closing:{at:end,cashUsd:'1000',assets:{BTC:{quantity:'1',priceUsd:'61000'},ETH:{quantity:'0',priceUsd:'2000'}}},trades:[],flows:[]});
test('daily accounting separates overnight unrealized gains from daily change',()=>{const x=calculate(input());assert.equal(x.netDailyPnlUsd,1000);assert.equal(x.unrealizedPnlChangeUsd,1000);assert.equal(x.realizedPnlBeforeFeesUsd,0)});
test('realized gains, USD fees and remaining unrealized reconcile exactly',()=>{
 const x=input();x.trades=[{id:'1',at:start+1,asset:'BTC',side:'SELL',quantity:'0.1',priceUsd:'61000',feeAsset:'USD',feeQuantity:'6.1'}];x.closing.cashUsd='7093.9';x.closing.assets.BTC.quantity='0.9';
 const result=calculate(x);assert.equal(result.realizedPnlBeforeFeesUsd,1100);assert.equal(result.feesUsd,6.1);assert.equal(result.netDailyPnlUsd,993.9);
});
test('USD deposits and withdrawals do not become trading profit or loss',()=>{
 const x=input();x.flows=[{id:'in',at:start+1,asset:'USD',direction:'IN',quantity:'100'},{id:'out',at:start+2,asset:'USD',direction:'OUT',quantity:'50'}];x.closing.cashUsd='1050';assert.equal(calculate(x).netDailyPnlUsd,1000);
});
test('crypto transfer valuation and cost basis preserve the daily attribution',()=>{
 const x=input();x.flows=[{id:'in',at:start+1,asset:'BTC',direction:'IN',quantity:'0.1',priceUsd:'61000',costUsd:'5500'}];x.closing.assets.BTC.quantity='1.1';assert.equal(calculate(x).netDailyPnlUsd,1000);
});
test('fees paid in the traded asset use the execution price and reconcile holdings',()=>{
 const x=input();x.trades=[{id:'1',at:start+1,asset:'BTC',side:'SELL',quantity:'0.1',priceUsd:'61000',feeAsset:'BTC',feeQuantity:'0.0001'}];x.closing.cashUsd='7100';x.closing.assets.BTC.quantity='0.8999';assert.equal(calculate(x).netDailyPnlUsd,993.9);
});
test('incomplete history, unknown cost basis, mismatched balances and unsupported fees fail closed',()=>{
 for(const change of [x=>x.coverage.tradesComplete=false,x=>x.coverage.flowsComplete=false,x=>x.opening.costBasisVerified=false,x=>x.closing.cashUsd='1001',x=>x.closing.assets.BTC.quantity='0.99',x=>x.periodStart++,x=>x.opening.cashUsd='',x=>x.flows=[{id:'x',at:start+1,asset:'CRO',direction:'IN',quantity:'1'}],x=>x.trades=[{id:'x',at:start+1,asset:'BTC',side:'SELL',quantity:'0.1',priceUsd:'61000',feeAsset:'CRO',feeQuantity:'1'}]]){
  const x=input();change(x);assert.throws(()=>calculate(x));
 }
 const duplicate=input();duplicate.flows=[{id:'x',at:start+1,asset:'USD',direction:'IN',quantity:'1'},{id:'x',at:start+2,asset:'USD',direction:'IN',quantity:'1'}];assert.throws(()=>calculate(duplicate),/Duplicate/);
});
