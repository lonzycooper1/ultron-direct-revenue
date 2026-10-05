import {getJson,mutateJson} from './state-store.mjs';
const KEY='order-ledger',FRESH={orders:{},events:[]};
export async function ledger(){return getJson(KEY,FRESH)}
export async function saveLedger(mutator){return mutateJson(KEY,FRESH,mutator)}
