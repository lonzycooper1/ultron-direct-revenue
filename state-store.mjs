import pg from 'pg';
const {Pool}=pg;
const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,max:10}):null;
let initialized=false;
async function init(){if(initialized)return;if(!pool)throw Error('DATABASE_URL is required');await pool.query(`CREATE TABLE IF NOT EXISTS ultron_state (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`);initialized=true}
export async function getJson(key,fallback){await init();const r=await pool.query('SELECT value FROM ultron_state WHERE key=$1',[key]);return r.rows[0]?.value??structuredClone(fallback)}
export async function setJson(key,value){await init();await pool.query(`INSERT INTO ultron_state(key,value,updated_at) VALUES($1,$2::jsonb,now()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`,[key,JSON.stringify(value)]);return value}
export async function mutateJson(key,fallback,mutator){await init();const c=await pool.connect();try{await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[key]);const r=await c.query('SELECT value FROM ultron_state WHERE key=$1 FOR UPDATE',[key]);const value=r.rows[0]?.value??structuredClone(fallback);await mutator(value);await c.query(`INSERT INTO ultron_state(key,value,updated_at) VALUES($1,$2::jsonb,now()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`,[key,JSON.stringify(value)]);await c.query('COMMIT');return value}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
export async function storeHealth(){try{await init();await pool.query('SELECT 1');return {ok:true,backend:'postgres'}}catch(e){return {ok:false,backend:'postgres',error:String(e?.message||e)}}}
