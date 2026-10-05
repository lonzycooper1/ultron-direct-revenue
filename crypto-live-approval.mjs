// ULTRON approval-gated live trading control plane.
// Every real-money order requires a fresh, matching, one-order human approval.
import crypto from 'node:crypto';

const num=(name,fallback,min,max)=>Math.min(max,Math.max(min,Number(process.env[name]||fallback)||fallback));
const allowed=String(process.env.CRYPTOCOM_ALLOWED_INSTRUMENTS||'BTC-USD,ETH-USD').split(',').map(x=>x.trim()).filter(Boolean);
export const LIVE_APPROVAL_RULES=Object.freeze({
  autonomousLiveOrders:false,
  humanApprovalRequired:true,
  maxLeverage:num('CRYPTO_MAX_LEVERAGE',2,1,2),
  maxOrderUsd:num('CRYPTO_MAX_ORDER_USD',100,1,1000),
  maxPositionPct:num('CRYPTO_MAX_POSITION_PCT',0.05,0.001,0.10),
  maxDailyLossPct:num('CRYPTO_MAX_DAILY_LOSS_PCT',0.02,0.001,0.10),
  approvalTtlSeconds:num('CRYPTO_APPROVAL_TTL_SECONDS',120,30,600),
  instruments:allowed.length?allowed:['BTC-USD','ETH-USD'],
  liveExecution:'spot-only',
  withdrawals:false
});

const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function estimateRisk({side,price,notional,leverage=1,equity=0}={}){
  price=Number(price);notional=Number(notional);leverage=clamp(Number(leverage)||1,1,LIVE_APPROVAL_RULES.maxLeverage);equity=Number(equity);
  if(!(price>0&&notional>0&&equity>0)) throw Error('valid price, notional and equity required');
  const exposure=notional*leverage;
  const positionPct=exposure/equity;
  const adverseMoveToLoseMarginPct=1/leverage;
  return {leverage,exposure:+exposure.toFixed(2),positionPct:+positionPct.toFixed(4),adverseMoveToLoseMarginPct:+adverseMoveToLoseMarginPct.toFixed(4),warning:'Estimate only. Fees, spread, slippage, exchange rules and gaps can increase losses.'};
}

export function proposeLiveOrder({instrument,side,price,notional,leverage=1,equity,dailyPnlPct=0,rationale='' }={}){
  if(!LIVE_APPROVAL_RULES.instruments.includes(instrument)) throw Error('instrument not allowed');
  if(!['BUY','SELL'].includes(side)) throw Error('side must be BUY or SELL');
  notional=Math.min(Number(notional)||0,LIVE_APPROVAL_RULES.maxOrderUsd);
  if(notional<1) throw Error('order below minimum');
  if(Number(dailyPnlPct)<=-LIVE_APPROVAL_RULES.maxDailyLossPct) throw Error('daily loss kill switch active');
  const risk=estimateRisk({side,price,notional,leverage,equity});
  if(risk.positionPct>LIVE_APPROVAL_RULES.maxPositionPct) throw Error('position risk cap exceeded');
  const id=crypto.randomUUID(),createdAt=Date.now(),expiresAt=createdAt+LIVE_APPROVAL_RULES.approvalTtlSeconds*1000;
  return {id,status:'AWAITING_HUMAN_APPROVAL',instrument,side,price:Number(price),notional,leverage:risk.leverage,equity:Number(equity),risk,rationale:String(rationale).slice(0,500),createdAt:new Date(createdAt).toISOString(),expiresAt:new Date(expiresAt).toISOString(),autonomousExecution:false};
}

export function approveProposal(proposal,{approved,confirmation}={}){
  if(!proposal||proposal.status!=='AWAITING_HUMAN_APPROVAL') throw Error('proposal not approvable');
  if(Date.now()>Date.parse(proposal.expiresAt)) throw Error('proposal expired');
  if(approved!==true||String(confirmation||'')!==proposal.id) throw Error('explicit matching human confirmation required');
  return {...proposal,status:'HUMAN_APPROVED',approvedAt:new Date().toISOString(),executionPermission:'ONE_ORDER_ONLY'};
}

export function executionEnvelope(approvedProposal){
  if(approvedProposal?.status!=='HUMAN_APPROVED') throw Error('human approval required');
  return {
    order:{instrument:approvedProposal.instrument,side:approvedProposal.side,notional:approvedProposal.notional,price:approvedProposal.price,leverage:approvedProposal.leverage,type:'MARKET'},
    proposal:{id:approvedProposal.id,price:approvedProposal.price,risk:approvedProposal.risk},
    approval:{proposalId:approvedProposal.id,approvedAt:approvedProposal.approvedAt,permission:'ONE_ORDER_ONLY'},
    constraints:LIVE_APPROVAL_RULES
  };
}
