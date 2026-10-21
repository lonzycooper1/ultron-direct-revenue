import test from 'node:test';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {assertTestDatabase} from './ops/assert-test-database.mjs';
import {readFileSync} from 'node:fs';
test('full suite refuses production and remote databases before application imports',()=>{
 for(const env of [{},{DATABASE_URL:'postgres://u:p@db.railway.internal/prod'},{DATABASE_URL:'postgres://u:p@localhost/ultron'},{DATABASE_URL:'postgres://u:p@localhost/ultron_test',NODE_ENV:'production'},{DATABASE_URL:'https://localhost/test'}])assert.throws(()=>assertTestDatabase(env));
 assert.equal(assertTestDatabase({DATABASE_URL:'postgres://u:p@127.0.0.1/ultron_test'}),true);
 const r=spawnSync(process.execPath,['ops/assert-test-database.mjs'],{env:{PATH:process.env.PATH,NODE_ENV:'production',DATABASE_URL:'postgres://u:p@localhost/test'},encoding:'utf8'});assert.equal(r.status,1);assert.match(r.stderr,/Refusing tests/);assert.doesNotMatch(r.stderr,/u:p/);
});
test('standalone crypto suite rejects remote databases before running tests',()=>{
 const scripts=JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8')).scripts;
 assert.ok(scripts['test:crypto-safety'].startsWith('node ops/assert-test-database.mjs && '));
 const r=spawnSync('npm',['run','test:crypto-safety'],{env:{PATH:process.env.PATH,DATABASE_URL:'postgres://u:p@db.railway.internal/prod'},encoding:'utf8'});
 assert.equal(r.status,1);
 assert.match(r.stderr,/Refusing tests/);
 assert.doesNotMatch(r.stdout,/TAP version|Subtest:|PostgreSQL App quotes/);
 assert.doesNotMatch(r.stderr,/u:p/);
});
