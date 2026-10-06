import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateStrategies,rankOpportunities,buildProposalCandidates,portfolioRiskSummary} from './crypto-opportunity-engine.mjs';

test('strategy pack evaluates multiple independent signals',()=>{
  const prices=Array.from({length:40},(_,i)=>100+i*1.5);
  const x=evaluateStrategies(prices);
  assert.equal(x.ready,true);
  assert.ok(Object.keys(x.strategies).length>=5);
  assert.ok(x.confidence>=0&&x.confidence<=1);
});

test('opportunities rank strongest first and create approval-only drafts',()=>{
  const ranked=rankOpportunities([
    {instrument:'BTC-USD',lastPrice:100,analysis:{confidence:.9,signal:'BULLISH',regime:'uptrend'},strategyPack:{confidence:.9,signal:'BULLISH'}},
    {instrument:'ETH-USD',lastPrice:50,analysis:{confidence:.7,signal:'BULLISH',regime:'range'},strategyPack:{confidence:.6,signal:'BULLISH'}}
  ]);
  assert.equal(ranked[0].instrument,'BTC-USD');
  const drafts=buildProposalCandidates(ranked,{maxOrderUsd:100,referenceEquity:1000,maxPositionPct:.05,minScore:.65});
  assert.equal(drafts[0].execution,'NONE');
  assert.equal(drafts[0].ownerApprovalRequired,true);
  assert.ok(drafts[0].suggestedNotional<=50);
});

test('portfolio risk summary is based on draft exposure only',()=>{
  const r=portfolioRiskSummary([{suggestedNotional:25},{suggestedNotional:25}],{referenceEquity:1000});
  assert.equal(r.grossDraftExposureUsd,50);
  assert.match(r.note,/not a live account/i);
});
