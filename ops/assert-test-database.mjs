// Must run before any application test imports or database access.
export function assertTestDatabase(env=process.env){
 let u;try{u=new URL(env.DATABASE_URL)}catch{throw Error('An isolated loopback PostgreSQL test database is required')}
 if(env.NODE_ENV==='production'||!['postgres:','postgresql:'].includes(u.protocol)||!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||!/^\/[a-zA-Z0-9_-]*test[a-zA-Z0-9_-]*$/i.test(u.pathname))throw Error('Refusing tests against a non-test or production database');
 return true;
}
import {fileURLToPath} from 'node:url';
if(process.argv[1]===fileURLToPath(import.meta.url)){try{assertTestDatabase()}catch(e){console.error(e.message);process.exitCode=1}}
