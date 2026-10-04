import assert from 'node:assert/strict';
import {createApp} from './server.js';
import {answerQuestion} from './support.js';
assert.equal(answerQuestion('What is included in the Booking Starter Kit?').sources[0].id,'kit');
assert.equal(answerQuestion('What is your refund policy?').sources[0].id,'refund');
assert.equal(answerQuestion('What about penguins?').escalated,true);
assert.equal(answerQuestion('My account number is 1000000000000').mode,'privacy');
assert.throws(()=>answerQuestion('x'));
const app=createApp();await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${app.address().port}`;
try{
 for(const path of ['/support','/support-client.js','/health','/'])assert.equal((await fetch(base+path)).status,200);
 assert.equal((await fetch(base+'/support.js')).status,404);
 assert.equal((await fetch(base+'/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'How do I pay?'})})).status,200);
 assert.equal((await fetch(base+'/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:'invalid'})).status,400);
 assert.equal((await fetch(base+'/api/support',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.example'},body:'{}'})).status,403);
 assert.equal((await fetch(base+'/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(5000)})).status,413);
 console.log('Support retrieval, escalation, privacy, HTTP validation and source isolation passed.');
}finally{await new Promise(resolve=>app.close(resolve));}
