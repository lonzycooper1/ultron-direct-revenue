// ULTRON approval-gated live trading control plane.
// This module never submits an exchange order itself. It creates bounded order proposals
// that require an explicit human approval token before an external execution adapter may act.
import crypto from 'node:crypto';

export const LIVE_APPROVAL_RULES=Object.freeze({
  autonomousLiveOrders:false,
  humanApprovalRequired:true,
  maxLeverage:2,
  maxOrderUsd:100,
  maxPositionPct:0.05,
  maxDailyLossPct:0.02,
  approvalTtlSeconds:120,
  instruments:['BTC-USD','ETH-USD']
});

const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function estimateRisk({side,price,notional,leverage=1,equity=0}={}){
  price=Number(price);notional=Number(notional);leverage=clamp(Number(leverage)||1,1,LIVE_APPROVAL_RULES.maxLeverage);equity=Number(equity);
  if(!(price>0&&notional>0&&equity>0)) throw Error('valid price, notional and equity required');
  const exposure=notional*leverage;
  const positionPct=exposure/equity;
  const adverseMoveToLoseMarginPct=1/leverage;
  return {leverage,exposure:+exposure.toFixed(2),positionPct:+positionPct.toFixed(4),adverseMoveToLoseMarginPct:+adverseMoveToLoseMarginPct.toFixed(4),warning:'Estimate only. Fees, maintenance margin, exchange rules and gaps can cause losses/liquidation sooner.'};
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
  return {id,status:'AWAITING_HUMAN_APPROVAL',instrument,side,price:Number(price),notional,leverage:risk.leverage,risk,rationale:String(rationale).slice(0,500),createdAt:new Date(createdAt).toISOString(),expiresAt:new Date(expiresAt).toISOString(),autonomousExecution:false};
}

export function approveProposal(proposal,{approved,confirmation}={}){
  if(!proposal||proposal.status!=='AWAITING_HUMAN_APPROVAL') throw Error('proposal not approvable');
  if(Date.now()>Date.parse(proposal.expiresAt)) throw Error('proposal expired');
  if(approved!==true||String(confirmation||'')!==proposal.id) throw Error('explicit matching human confirmation required');
  return {...proposal,status:'HUMAN_APPROVED',approvedAt:new Date().toISOString(),executionPermission:'ONE_ORDER_ONLY'};
}

export function executionEnvelope(approvedProposal){
  if(approvedProposal?.status!=='HUMAN_APPROVED') throw Error('human approval required');
  return {order:{instrument:approvedProposal.instrument,side:approvedProposal.side,notional:approvedProposal.notional,leverage:approvedProposal.leverage,type:'MARKET'},approval:{proposalId:approvedProposal.id,approvedAt:approvedProposal.approvedAt,permission:'ONE_ORDER_ONLY'},constraints:LIVE_APPROVAL_RULES};
}
