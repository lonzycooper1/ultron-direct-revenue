// Durable execution safety primitives. Not wired into order submission until audited.
// Requires PostgreSQL. All methods fail closed on DB errors.
export async function installSafetySchema(pool){
  await pool.query(`CREATE TABLE IF NOT EXISTS crypto_execution_control (id integer PRIMARY KEY CHECK(id=1), stopped boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now());
    INSERT INTO crypto_execution_control(id,stopped) VALUES(1,true) ON CONFLICT(id) DO NOTHING;
    CREATE TABLE IF NOT EXISTS crypto_order_ledger (proposal_id uuid PRIMARY KEY, client_oid text UNIQUE NOT NULL, state text NOT NULL CHECK(state IN ('RESERVED','SUBMISSION_UNKNOWN','ACCEPTED','REJECTED','RECONCILED')), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());`);
}
export async function setEmergencyStop(pool,stopped=true){
  if(stopped!==true)throw Error('Restarting live execution requires a separate audited activation flow');
  await pool.query('UPDATE crypto_execution_control SET stopped=true, updated_at=now() WHERE id=1');
}
export async function assertNotStopped(pool){
  const {rows}=await pool.query('SELECT stopped FROM crypto_execution_control WHERE id=1');
  if(rows.length!==1||rows[0].stopped!==false)throw Error('Persistent emergency stop active');
}
// Reserve once before any network call. A duplicate never submits again.
export async function reserveOrder(pool,proposalId,clientOid){
  const {rows}=await pool.query(`INSERT INTO crypto_order_ledger(proposal_id,client_oid,state) VALUES($1,$2,'RESERVED') ON CONFLICT DO NOTHING RETURNING proposal_id`,[proposalId,clientOid]);
  if(rows.length!==1)throw Error('Duplicate or ambiguous order; reconcile before retry');
}
export async function markSubmissionUnknown(pool,proposalId){
  await pool.query(`UPDATE crypto_order_ledger SET state='SUBMISSION_UNKNOWN',updated_at=now() WHERE proposal_id=$1 AND state='RESERVED'`,[proposalId]);
}
// Never resubmit an unknown order. Query the exchange by client_oid and reconcile
// with order history/fills; if absent or uncertain, require manual investigation.
export async function recordReconciliation(pool,proposalId,state){
  if(!['ACCEPTED','REJECTED','RECONCILED'].includes(state))throw Error('Invalid reconciliation state');
  await pool.query('UPDATE crypto_order_ledger SET state=$2,updated_at=now() WHERE proposal_id=$1',[proposalId,state]);
}
