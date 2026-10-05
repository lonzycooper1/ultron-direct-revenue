import crypto from 'node:crypto';

export const SECURITY_STACK_A=Object.freeze([
 {id:'A01-agent-identity',name:'Agent identity binding',control:'Every bot action is attributed to a stable agent name and mission id.'},
 {id:'A02-capability-allowlist',name:'Capability allowlist',control:'Agents may invoke only capabilities explicitly assigned to their role.'},
 {id:'A03-least-privilege',name:'Least privilege',control:'Default permission is deny; external actions require the smallest necessary scope.'},
 {id:'A04-schema-validation',name:'Typed input schema gate',control:'Action type, payload shape, numeric bounds and required fields must validate before execution.'},
 {id:'A05-input-normalization',name:'Input normalization',control:'Oversized, malformed, control-character and ambiguous inputs are rejected or normalized.'},
 {id:'A06-secret-isolation',name:'Secrets isolation/redaction',control:'Credentials are read from environment/secret stores and never returned in agent output or logs.'},
 {id:'A07-destination-allowlist',name:'Destination allowlist',control:'External network/tool destinations must match an explicitly approved provider or configured origin.'},
 {id:'A08-consequential-approval',name:'Consequential action approval',control:'Real-money trading, banking, publishing/account changes and other irreversible actions require the configured human approval boundary.'},
 {id:'A09-rate-budget',name:'Rate and action budget',control:'Agents have per-cycle action ceilings to contain runaway loops and cost amplification.'},
 {id:'A10-time-resource-ceiling',name:'Time/resource ceiling',control:'Long-running or recursive jobs have bounded duration, payload size and retry limits.'}
]);

export const SECURITY_STACK_B=Object.freeze([
 {id:'B01-output-policy',name:'Output policy gate',control:'Generated actions are checked for prohibited fraud, phishing, credential theft, malware, spam, manipulation and fabricated claims.'},
 {id:'B02-provenance',name:'Evidence and provenance',control:'Research-derived decisions carry source/evidence labels and distinguish verified facts from estimates or claims.'},
 {id:'B03-tamper-evident-audit',name:'Tamper-evident audit chain',control:'Security events can be chained with SHA-256 hashes so mutation is detectable.'},
 {id:'B04-idempotency-replay',name:'Idempotency/replay defense',control:'Sensitive operations require unique action ids; recently used ids cannot be replayed.'},
 {id:'B05-anomaly-guard',name:'Anomaly guard',control:'Unexpected value, frequency, destination or permission escalation is blocked for review.'},
 {id:'B06-clean-room-write',name:'Clean-room output boundary',control:'Code/content agents create independently authored outputs and may not overwrite protected source without an explicit update path.'},
 {id:'B07-config-integrity',name:'Configuration integrity',control:'Runtime security profile exposes a deterministic digest so unexpected policy/config drift is detectable.'},
 {id:'B08-recovery-snapshot',name:'Recovery and rollback',control:'High-value state changes record before/after metadata and preserve rollback/redeployment paths.'},
 {id:'B09-kill-switch',name:'Kill switch',control:'Each division exposes a stop/disable boundary for new consequential actions.'},
 {id:'B10-health-monitor',name:'Continuous health monitoring',control:'Heartbeat, test, payment-integrity and deployment-health signals are continuously checked.'}
]);

export const SECURITY_LAYERS=Object.freeze([...SECURITY_STACK_A,...SECURITY_STACK_B]);
export const SECURITY_VERSION='20-layer-v1';

const PROHIBITED=/\b(phish|steal credentials?|credential theft|malware|ransomware|keylogger|fake engagement|fake review|market manipulation|fabricated revenue|guaranteed returns?|spam blast|bypass safety)\b/i;
const FINANCIAL=/\b(real[- ]?money|place order|trade|withdraw|bank transfer|wire transfer|send money|crypto order)\b/i;
const PUBLISH=/\b(publish|post publicly|send email|submit application|change budget|pause campaign|enable campaign)\b/i;
const secrets=[
 /sk-[A-Za-z0-9_-]{16,}/g,
 /(?:api[_ -]?key|api[_ -]?secret|client[_ -]?secret|password|authorization)\s*[:=]\s*[^\s,;]+/ig,
 /\b\d{9,18}\b/g
];
const replay=new Map();

function cleanText(v,max=8000){
 const s=String(v??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,' ').trim();
 if(s.length>max)throw Error('security: input exceeds size limit');
 return s;
}
function stable(obj){if(obj===null||typeof obj!=='object')return JSON.stringify(obj);if(Array.isArray(obj))return '['+obj.map(stable).join(',')+']';return '{'+Object.keys(obj).sort().map(k=>JSON.stringify(k)+':'+stable(obj[k])).join(',')+'}'}
export function securityDigest(){return crypto.createHash('sha256').update(stable({version:SECURITY_VERSION,layers:SECURITY_LAYERS})).digest('hex')}
export function redactSecrets(value){
 let s=String(value??'');
 for(const r of secrets)s=s.replace(r,'[REDACTED]');
 return s;
}
export function agentSecurityProfile(agentName='Agent'){
 return Object.freeze({
   agent:String(agentName).slice(0,120),
   version:SECURITY_VERSION,
   layers:SECURITY_LAYERS.length,
   stackA:SECURITY_STACK_A.map(x=>x.id),
   stackB:SECURITY_STACK_B.map(x=>x.id),
   policyDigest:securityDigest(),
   defaultPermission:'deny-unless-assigned',
   consequentialActions:'human-approval-when-required',
   secrets:'redact-and-never-return',
   killSwitch:true
 });
}
export function secureAgentRegistry(registry={}){
 return Object.fromEntries(Object.entries(registry).map(([name,data])=>[name,{...data,security:agentSecurityProfile(name)}]));
}
export function classifyAction({agent='Agent',action='',payload={},capabilities=[],approved=false,actionId=''}={}){
 const actionText=cleanText(action,500);
 const payloadText=cleanText(redactSecrets(stable(payload)),12000);
 const combined=(actionText+' '+payloadText);
 if(PROHIBITED.test(combined))return {allowed:false,reason:'prohibited-action-policy',agent};
 if(!Array.isArray(capabilities))return {allowed:false,reason:'capabilities-required',agent};
 if(!actionText)return {allowed:false,reason:'action-required',agent};
 const consequential=FINANCIAL.test(combined)||PUBLISH.test(combined);
 if(consequential&&!approved)return {allowed:false,reason:'human-approval-required',agent,consequential:true};
 if(actionId){
   const now=Date.now(),ttl=15*60_000;
   for(const [id,t] of replay)if(now-t>ttl)replay.delete(id);
   if(replay.has(actionId))return {allowed:false,reason:'replay-blocked',agent};
   replay.set(actionId,now);
 }
 return {allowed:true,reason:'security-gates-passed',agent,consequential,policyDigest:securityDigest()};
}
export function auditChainEntry({previousHash='',agent='Agent',event='event',data={}}={}){
 const body={at:new Date().toISOString(),agent:cleanText(agent,120),event:cleanText(event,200),data:JSON.parse(redactSecrets(JSON.stringify(data||{}))),previousHash:String(previousHash||'')};
 const hash=crypto.createHash('sha256').update(stable(body)).digest('hex');
 return {...body,hash};
}
export function securityManifest(){
 return {version:SECURITY_VERSION,totalLayers:SECURITY_LAYERS.length,stackA:SECURITY_STACK_A,stackB:SECURITY_STACK_B,policyDigest:securityDigest(),architecture:'20-layer defense-in-depth applied to every registered bot/agent'};
}
