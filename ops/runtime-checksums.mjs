import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const files=['package.json','package-lock.json','crypto-bot-runtime.mjs','crypto-app.mjs','crypto-app-approval.mjs','crypto-provider.mjs','crypto-readiness.mjs','crypto-order-gateway.mjs','crypto-reserved-dispatch.mjs','crypto-durable-safety.mjs','crypto-live-approval.mjs','crypto-bots.mjs','crypto-opportunity-engine.mjs','crypto-exchange.mjs','crypto-trade-history.mjs'];
console.log(JSON.stringify(Object.fromEntries(files.map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]))));
