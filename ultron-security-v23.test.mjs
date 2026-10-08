import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const server=readFileSync(new URL('./server.js',import.meta.url),'utf8');
test('high impact legacy mutation routes require real owner authentication',()=>{
 const routes=[
 "if(path==='/api/agent-of-agents/mission'&&req.method==='POST')",
 "if(path==='/api/agent-of-agents/approvals'&&req.method==='GET')",
 "if(path==='/api/universal-marketplace/merchant'&&req.method==='POST')",
 "if(path==='/api/universal-marketplace/product'&&req.method==='POST')",
 "if(path==='/api/universal-marketplace/offer'&&req.method==='POST')",
 "if(path==='/api/pod/order'&&req.method==='POST')"
 ];
 for(const marker of routes){
  const start=server.indexOf(marker);
  assert.ok(start>=0,'route present: '+marker);
  assert.match(server.slice(start,start+160),/if\(!v13Owner\(\)\)return json\(403/,'owner gate: '+marker);
 }
});
test('owner-only v23 operator API is not public writeable',()=>{
 const i=server.indexOf("if(path.startsWith('/api/operator/v23/')&&req.method==='POST')");
 assert.ok(i>=0);assert.match(server.slice(i,i+150),/if\(!v13Owner\(\)\)/);
});
