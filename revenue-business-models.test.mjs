import test from 'node:test';import assert from 'node:assert/strict';
import {BUSINESS_MODELS,rankBuyerProblems,chooseBusinessModel,executionPlan,revenueFrameworkManifest} from './revenue-business-models.mjs';

test('revenue framework contains three distinct customer-value models',()=>{
 assert.deepEqual(Object.keys(BUSINESS_MODELS).sort(),['aiSoftware','contentAgency','digitalProducts'].sort());
 assert.equal(revenueFrameworkManifest().businessModels.aiSoftware.recurringOffer.priceUsdMonthly,1500);
 assert.equal(rankBuyerProblems(5).length,5);
});
test('business model selector maps goals to the right delivery model',()=>{
 assert.equal(chooseBusinessModel({goal:'monthly copywriting and email marketing'}).key,'contentAgency');
 assert.equal(chooseBusinessModel({goal:'build a no-code SaaS workflow subscription'}).key,'aiSoftware');
 assert.equal(chooseBusinessModel({goal:'sell a course template and ebook'}).key,'digitalProducts');
});
test('execution plan requires verified customer payments and fulfillment',()=>{
 const p=executionPlan({goal:'build AI automation for small businesses'});
 assert.ok(p.stages.some(x=>/verified customer payments/i.test(x)));
 assert.ok(p.stages.some(x=>/fulfill/i.test(x)));
 assert.match(p.principle,/real paid problem/i);
});
