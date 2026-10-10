// ULTRON owner action UI — review only, no automated spending.
export function ownerActionPage(){
return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>ULTRON Owner Actions</title><style>body{background:#07140e;color:#e8ffed;font:16px system-ui;max-width:900px;margin:auto;padding:24px}a{color:#72e69b}section{border:1px solid #427451;padding:18px;margin:20px 0}button,input{padding:12px;margin:6px}button{cursor:pointer}</style></head><body>
<nav><a href="/">Mainframe</a> · <a href="/activation-center">Activation</a> · <a href="/inbound-inbox">Lead inbox</a> · <a href="/free-response-gap-scan">Free diagnostic</a> · <a href="/flagship">$500 audit</a></nav>
<h1>ULTRON Owner Action Center</h1><p>Review owner approvals and live activation blockers. No public publishing, spending, or refunds happen merely by viewing this page.</p>
<section><h2>Provider readiness</h2><div id="readiness">Loading...</div></section>
<section><h2>Pending commerce approvals</h2><p>Enter your Railway acquisition-admin token. It stays on this page only and is never stored in a URL.</p><input id="key" type="password" autocomplete="off" aria-label="Owner token"><button id="load">Load approvals</button><p id="status" role="status"></p><div id="queue"></div></section>
<script>
(function(){
 const status=document.getElementById('status'),queue=document.getElementById('queue'),readiness=document.getElementById('readiness');
 async function request(url,opts){const r=await fetch(url,opts);const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed');return d;}
 async function load(){
   const token=document.getElementById('key').value.trim();queue.replaceChildren();if(!token){status.textContent='Owner token required';return;}
   try{
     const d=await request('/api/agent-of-agents/approvals',{headers:{authorization:'Bearer '+token}});
     status.textContent=d.pending.length+' pending approvals';
     for(const a of d.pending){
       const box=document.createElement('section'),title=document.createElement('h3'),copy=document.createElement('p');
       title.textContent=a.owner;copy.textContent=a.action;box.append(title,copy);
       for(const decision of ['approve','reject']){
         const btn=document.createElement('button');btn.textContent=decision==='approve'?'Approve':'Reject';
         btn.onclick=async()=>{if(!confirm('Confirm '+decision+' for '+a.action+'?'))return;try{await request('/api/agent-of-agents/approvals/'+encodeURIComponent(a.id)+'/decision',{method:'POST',headers:{authorization:'Bearer '+document.getElementById('key').value.trim(),'content-type':'application/json'},body:JSON.stringify({decision})});await load();}catch(e){status.textContent=e.message;}};box.append(btn);
       }
       queue.append(box);
     }
   }catch(e){status.textContent=e.message;}
 }
 document.getElementById('load').onclick=load;
 request('/api/activation/v27').then(d=>{const p=d.report||{};readiness.textContent='Revenue: $'+Number(p.verifiedRevenueUsd||0)+'; '+Object.entries(p.providerGates||{}).map(([k,v])=>k+': '+v.status).join(' | ');}).catch(e=>{readiness.textContent=e.message;});
})();
</script></body></html>`;
}
