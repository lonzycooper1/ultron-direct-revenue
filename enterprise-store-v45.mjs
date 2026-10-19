import crypto from 'node:crypto';
import pg from 'pg';
// Dedicated bounded connection pool for normalized v45 tables; v44 JSONB storage remains intact.
const {Pool}=pg;
let pool, schemaPromise;
const db=()=>{if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');return pool??=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:6000,idleTimeoutMillis:30000,statement_timeout:15000,application_name:'ultron-v45'})};
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(x);
const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const asJson=(v,limit=32000)=>{const s=JSON.stringify(v);if(!s||Buffer.byteLength(s)>limit)throw Error('Invalid or oversized JSON');return s};
export async function initEnterpriseStore(){
 if(schemaPromise)return schemaPromise;
 schemaPromise=(async()=>{const c=await db().connect();try{
 await c.query('SELECT pg_advisory_lock(hashtext($1))',['ultron-v45-schema']);
 await c.query("CREATE TABLE IF NOT EXISTS ultron_v45_jobs (id uuid PRIMARY KEY, dedupe_key text UNIQUE NOT NULL, kind text NOT NULL, payload jsonb NOT NULL, result jsonb, status text NOT NULL DEFAULT 'QUEUED', attempts integer NOT NULL DEFAULT 0, lease_id uuid, lease_until timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())");
 await c.query("CREATE INDEX IF NOT EXISTS ultron_v45_job_claim ON ultron_v45_jobs(status,created_at) WHERE status='QUEUED'");
 await c.query("CREATE TABLE IF NOT EXISTS ultron_v45_audit (seq bigserial PRIMARY KEY, event_id text UNIQUE NOT NULL, kind text NOT NULL, payload jsonb NOT NULL, prev_hash text NOT NULL, event_hmac text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())");
 await c.query("CREATE TABLE IF NOT EXISTS ultron_v45_delivery (id uuid PRIMARY KEY, provider text NOT NULL, capture_id text NOT NULL, to_email text NOT NULL, artifact_sha256 text NOT NULL, status text NOT NULL, provider_message_id text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(provider,capture_id))");
 }finally{await c.query('SELECT pg_advisory_unlock(hashtext($1))',['ultron-v45-schema']).catch(()=>{});c.release()}})().catch(e=>{schemaPromise=null;throw e});return schemaPromise;
}
async function tx(fn){await initEnterpriseStore();const c=await db().connect();try{await c.query('BEGIN');const v=await fn(c);await c.query('COMMIT');return v}catch(e){await c.query('ROLLBACK').catch(()=>{});throw e}finally{c.release()}}
export async function enqueueEnterpriseJob({kind,dedupeKey,payload}){
 if(!id(kind)||!id(dedupeKey)||!payload||typeof payload!=='object')throw Error('Invalid job');
 await initEnterpriseStore();
 const r=await db().query("INSERT INTO ultron_v45_jobs(id,dedupe_key,kind,payload) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT(dedupe_key) DO UPDATE SET updated_at=ultron_v45_jobs.updated_at WHERE ultron_v45_jobs.payload=EXCLUDED.payload AND ultron_v45_jobs.kind=EXCLUDED.kind RETURNING id,status,kind,dedupe_key",[crypto.randomUUID(),dedupeKey,kind,asJson(payload,24000)]);
 if(!r.rows[0])throw Error('Conflicting durable job dedupe key');return r.rows[0];
}
export async function claimEnterpriseJob({kinds=['RESEARCH'],leaseSeconds=300}={}){
 if(!kinds.length||kinds.some(x=>!id(x))||!Number.isInteger(leaseSeconds)||leaseSeconds<30||leaseSeconds>900)throw Error('Invalid lease');
 const lease=crypto.randomUUID();
 return tx(async c=>{await c.query("UPDATE ultron_v45_jobs SET status='REVIEW_REQUIRED',result='{}'::jsonb,lease_id=NULL,lease_until=NULL,updated_at=now() WHERE status='RUNNING' AND lease_until<now()");const r=await c.query("WITH selected AS (SELECT id FROM ultron_v45_jobs WHERE status='QUEUED' AND kind=ANY($1::text[]) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1) UPDATE ultron_v45_jobs j SET status='RUNNING',attempts=j.attempts+1,lease_id=$2::uuid,lease_until=now()+($3::integer*interval '1 second'),updated_at=now() FROM selected WHERE j.id=selected.id RETURNING j.id,j.kind,j.payload,j.lease_id,j.attempts",[kinds,lease,leaseSeconds]);return r.rows[0]||null});
}
export async function finishEnterpriseJob(job,{status='DONE',result={}}={}){
 if(!job?.id||!job?.lease_id||!['DONE','REVIEW_REQUIRED'].includes(status))throw Error('Invalid completion lease');
 await initEnterpriseStore();
 const r=await db().query("UPDATE ultron_v45_jobs SET status=$3,result=$4::jsonb,lease_id=NULL,lease_until=NULL,updated_at=now() WHERE id=$1 AND lease_id=$2 AND status='RUNNING' AND lease_until>now() RETURNING id,status",[job.id,job.lease_id,status,asJson(result)]);
 if(!r.rowCount)throw Error('Job lease expired or was already handled');return r.rows[0];
}
export async function appendEnterpriseAudit({eventId,kind,payload}){
 if(!id(eventId)||!id(kind)||!payload||typeof payload!=='object')throw Error('Invalid audit event');
 const secret=process.env.ULTRON_EVENT_HMAC_SECRET;
 if(!secret||Buffer.byteLength(secret)<32)throw Error('ULTRON_EVENT_HMAC_SECRET of at least 32 bytes required');
 return tx(async c=>{
 await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',['ultron-v45-audit-chain']);
 const raw=asJson(payload),old=await c.query('SELECT kind,payload,event_hmac FROM ultron_v45_audit WHERE event_id=$1',[eventId]);
 if(old.rows.length){if(old.rows[0].kind!==kind||canonical(old.rows[0].payload)!==canonical(payload))throw Error('Conflicting event ID');return {eventId,duplicate:true,signature:old.rows[0].event_hmac}}
 const prev=await c.query('SELECT event_hmac FROM ultron_v45_audit ORDER BY seq DESC LIMIT 1');
 const prevHash=prev.rows[0]?.event_hmac||'GENESIS';
 const h=crypto.createHmac('sha256',secret).update(canonical({eventId,kind,payload,prevHash})).digest('hex');
 await c.query('INSERT INTO ultron_v45_audit(event_id,kind,payload,prev_hash,event_hmac) VALUES($1,$2,$3::jsonb,$4,$5)',[eventId,kind,raw,prevHash,h]);return {eventId,duplicate:false,signature:h};
 });
}
export async function claimDelivery({provider,captureId,toEmail,artifactSha256}){
 if(!id(provider)||!id(captureId)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)||!/^[a-f0-9]{64}$/i.test(artifactSha256))throw Error('Invalid delivery');
 await initEnterpriseStore();const r=await db().query("INSERT INTO ultron_v45_delivery(id,provider,capture_id,to_email,artifact_sha256,status) VALUES($1,$2,$3,$4,$5,'SENDING') ON CONFLICT(provider,capture_id) DO NOTHING RETURNING id,status",[crypto.randomUUID(),provider,captureId,toEmail,artifactSha256]);return r.rows[0]||null;
}
export async function finishDelivery(id,{messageId=null,uncertain=false}={}){
 await initEnterpriseStore();const r=await db().query("UPDATE ultron_v45_delivery SET status=$2,provider_message_id=$3,updated_at=now() WHERE id=$1 AND status='SENDING' RETURNING id,status",[id,uncertain?'RECONCILE':'SENT',messageId]);
 if(!r.rowCount)throw Error('Delivery already completed or not claimed');return r.rows[0];
}
export async function enterpriseStoreHealth(){try{await initEnterpriseStore();await db().query('SELECT 1');return {ok:true,backend:'postgres-v45'}}catch{return {ok:false,backend:'postgres-v45'}}}
