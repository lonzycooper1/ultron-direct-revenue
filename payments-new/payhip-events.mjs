import { createHash, timingSafeEqual } from 'node:crypto';

/** Payhip documents a static sha256(apiKey), not a payload-bound MAC. */
export function verifySignature(signature, apiKey) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw Error('Server API key required');
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(Buffer.from(signature.toLowerCase(), 'hex'), createHash('sha256').update(apiKey).digest());
}
function cents(v, label) {
  if (!Number.isSafeInteger(v) || v < 0) throw Error(`${label} must be nonnegative safe integer cents`);
  return v;
}
function identifier(v) {
  if (typeof v !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(v)) throw Error('Invalid transaction ID');
  return v;
}
function time(v) {
  if (!Number.isSafeInteger(v) || v <= 0 || v > 253402300799) throw Error('Invalid event timestamp');
  return v;
}
export function normalizeEvent(payload, apiKey) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw Error('Object payload required');
  if (!verifySignature(payload.signature, apiKey)) throw Error('Invalid signature');
  if (!['paid', 'refunded'].includes(payload.type)) throw Error('Unsupported event type');
  const id = identifier(payload.id);
  if (typeof payload.currency !== 'string' || !/^[A-Z]{3}$/.test(payload.currency)) throw Error('Invalid currency');
  const priceCents = cents(payload.price, 'price');
  const refundedCents = payload.type === 'refunded' ? cents(payload.amount_refunded, 'amount_refunded') : 0;
  if (refundedCents > priceCents) throw Error('Refund exceeds original amount');
  const timestamp = time(payload.type === 'paid' ? payload.date : payload.date_refunded);
  const stripeFeeCents = payload.stripe_fee === undefined ? null : cents(payload.stripe_fee, 'stripe_fee');
  const payhipFeeCents = payload.payhip_fee === undefined ? null : cents(payload.payhip_fee, 'payhip_fee');
  return Object.freeze({provider:'payhip', id, type:payload.type, currency:payload.currency, priceCents, refundedCents, timestamp,
    stripeFeeCents, payhipFeeCents, eventKey:JSON.stringify([id,payload.type,timestamp,refundedCents]), bankSettlement:'unverified', delivery:'unverified'});
}
export function emptyLedger() { return {transactions:{}, events:{}}; }
/** Pure reducer. Persist ledger + event key in ONE database transaction when integrating. */
export function applyEvent(ledger, event) {
  if (!event || event.provider !== 'payhip') throw Error('Normalized Payhip event required');
  const id = identifier(event.id);
  cents(event.priceCents, 'price'); cents(event.refundedCents, 'refund'); time(event.timestamp);
  if (!['paid','refunded'].includes(event.type) || !/^[A-Z]{3}$/.test(event.currency)) throw Error('Invalid normalized event');
  if (event.refundedCents > event.priceCents || (event.type==='paid' && event.refundedCents!==0)) throw Error('Invalid normalized refund');
  const expectedKey=JSON.stringify([id,event.type,event.timestamp,event.refundedCents]);
  if (event.eventKey!==expectedKey) throw Error('Invalid event key');
  const fingerprint = JSON.stringify(event);
  if (Object.hasOwn(ledger.events, expectedKey)) {
    if (ledger.events[expectedKey]!==fingerprint) throw Error('Conflicting duplicate requires review');
    return {ledger, disposition:'duplicate'};
  }
  const prior = Object.hasOwn(ledger.transactions,id) ? ledger.transactions[id] : undefined;
  if (prior && (prior.currency!==event.currency || prior.priceCents!==event.priceCents)) throw Error('Conflicting transaction requires review');
  const record = prior ? {...prior} : {id,currency:event.currency,priceCents:event.priceCents,paidObserved:false,refundedCents:0,refundTimestamp:0,bankSettlement:'unverified',delivery:'unverified'};
  if (event.type==='paid') record.paidObserved=true;
  else if (event.timestamp >= record.refundTimestamp) {
    if (event.refundedCents < record.refundedCents) throw Error('Decreasing reported refund requires reconciliation');
    record.refundedCents=event.refundedCents; record.refundTimestamp=event.timestamp;
  }
  record.status=record.refundedCents===record.priceCents&&record.refundedCents>0?'refunded':record.refundedCents>0?'partially_refunded':record.paidObserved?'paid_observed':'refund_observed';
  record.retainedGrossCents=record.paidObserved?record.priceCents-record.refundedCents:null;
  return {ledger:{transactions:{...ledger.transactions,[id]:record},events:{...ledger.events,[expectedKey]:fingerprint}},disposition:'applied'};
}
