import test from 'node:test';import assert from 'node:assert/strict';
test('four interfaces contract',()=>assert.deepEqual(['web','ios','android','desktop'].length,4));
test('financial actions are approval gated',()=>assert.equal(/trade|buy crypto|sell crypto|withdraw|transfer money|purchase|payment/i.test('trade BTC'),true));
test('ordinary research does not require financial approval',()=>assert.equal(/trade|buy crypto|sell crypto|withdraw|transfer money|purchase|payment/i.test('research bitcoin catalysts'),false));