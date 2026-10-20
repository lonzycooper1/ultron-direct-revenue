// Dispatch boundary for a previously committed, owner-approved reservation.
// The gateway must hold the shared advisory lock until this function returns.
// No retries are made here; every exception leaves durable uncertainty.
export async function dispatchReservedOrder(pool,proposalId,params,{call}={}){
 if(typeof call!=='function')throw Error('Reviewed exchange transport required');
 const claimed=await pool.query(`UPDATE crypto_order_ledger SET state='SUBMISSION_UNKNOWN',updated_at=now()
   WHERE proposal_id=$1 AND state='RESERVED' AND order_params IS NOT NULL RETURNING client_oid`,[proposalId]);
 if(claimed.rows.length!==1)throw Error('Order already claimed or unresolved; reconcile before retry');
 if(params.client_oid!==claimed.rows[0].client_oid)throw Error('Reserved exchange identifier mismatch');
 // This UPDATE is committed before sending bytes. Process death, timeout,
 // malformed acknowledgments and database outages can never restore RESERVED.
 try{
  const result=await call('private/create-order',params);
  const ack=result?.result;
  if(result?.code!==0||!ack||!/^\d+$/.test(String(ack.order_id||''))||
    (ack.client_oid!==undefined&&ack.client_oid!==params.client_oid))throw Error('Uncertain exchange acknowledgment');
  const evidence={submission:{orderId:String(ack.order_id),clientOid:params.client_oid,receivedAt:new Date().toISOString()}};
  const saved=await pool.query(`UPDATE crypto_order_ledger SET state='ACCEPTED',evidence=COALESCE(evidence,'{}'::jsonb)||$2::jsonb,updated_at=now()
    WHERE proposal_id=$1 AND state='SUBMISSION_UNKNOWN' RETURNING state`,[proposalId,JSON.stringify(evidence)]);
  if(saved.rows.length!==1)throw Error('Acknowledgment persistence uncertain');
  return {state:'ACCEPTED',accepted:true,orderId:String(ack.order_id),clientOrderId:params.client_oid,filled:false,reconciliationRequired:true};
 }catch{
  return {state:'SUBMISSION_UNKNOWN',accepted:false,clientOrderId:params.client_oid,reconciliationRequired:true};
 }
}
