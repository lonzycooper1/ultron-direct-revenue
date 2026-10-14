#!/usr/bin/env node
import pg from 'pg';
import {readFile,writeFile} from 'node:fs/promises';
import {encryptSnapshot,decryptSnapshot} from '../ultron-revenue-operations-v41.mjs';
const [action,file]=process.argv.slice(2);
if(!['export','verify','restore'].includes(action)||!file){console.error('Usage: node scripts/state-backup-v41.mjs export|verify|restore FILE [--apply]. Restore is validation-only unless --apply is supplied. Use an isolated restore database for drills. DATABASE_URL and ULTRON_BACKUP_KEY_BASE64 must be supplied securely.');process.exit(1)}
const key=process.env.ULTRON_BACKUP_KEY_BASE64;
if(action==='verify'){
 const snapshot=decryptSnapshot(JSON.parse(await readFile(file,'utf8')),key);
 if(snapshot.version!==1||!Array.isArray(snapshot.rows))throw Error('Invalid snapshot');
 console.log(JSON.stringify({verified:true,rows:snapshot.rows.length,createdAt:snapshot.createdAt,plaintextPrinted:false}));
}else{
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');
 const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:1}),c=await pool.connect();
 try{
  if(action==='export'){
   await c.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
   const {rows}=await c.query('SELECT key,value,updated_at FROM ultron_state ORDER BY key');
   const encrypted=encryptSnapshot({version:1,createdAt:new Date().toISOString(),rows},key);
   await c.query('COMMIT');await writeFile(file,JSON.stringify(encrypted),{mode:0o600,flag:'wx'});
   console.log(JSON.stringify({encrypted:true,rows:rows.length,file}));
  }else{
   const snapshot=decryptSnapshot(JSON.parse(await readFile(file,'utf8')),key);
   if(snapshot.version!==1||!Array.isArray(snapshot.rows)||snapshot.rows.some(r=>typeof r.key!=='string'||!Object.hasOwn(r,'value')))throw Error('Invalid snapshot');
   if(!process.argv.includes('--apply'))console.log(JSON.stringify({dryRun:true,rows:snapshot.rows.length,changedDatabase:false}));
   else{
    if(process.env.ULTRON_RESTORE_APPROVED!=='true')throw Error('Explicit restore approval required');
    await c.query('BEGIN');await c.query("SELECT pg_advisory_xact_lock(hashtext('ultron-v41-restore'))");
    for(const r of snapshot.rows)await c.query('INSERT INTO ultron_state(key,value,updated_at) VALUES($1,$2::jsonb,now()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()',[r.key,JSON.stringify(r.value)]);
    await c.query('COMMIT');console.log(JSON.stringify({restored:true,rows:snapshot.rows.length,deletedRows:false}));
   }
  }
 }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e}finally{c.release();await pool.end()}
}
