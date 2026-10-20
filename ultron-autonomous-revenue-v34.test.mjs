import {EventEmitter} from 'node:events';
import test from 'node:test';
import assert from 'node:assert/strict';
import {V34_SKU,V34_PRICE_USD,DIRECTOR,validateV34Intake,inspectHtmlV34,inspectV34Homepage,pinnedV34Lookup,buyerIntent,competitorGaps,
 buildV34Report,artifactFactory,qualityGate,delegatedAuthority,retryPlan,reconcileVerifiedRevenue,
 experimentDecision,retentionOpportunity,nextObjective,simulationCustomers,publicV34Manifest} from './ultron-autonomous-revenue-v34.mjs';
const input={company:'Example Plumbing LLC',website:'https://public-plumbing.example.org/',industry:'plumbing',
 monthlyLeads:80,missedPercent:20,responseMinutes:120,bookingMethod:'phone',followup:'manual'};
test('director coordinates the 12 scoped roles and one $99 mission',()=>{
 assert.equal(DIRECTOR.roles.length,12);assert.equal(V34_PRICE_USD,99);assert.equal(V34_SKU,'instant-lead-audit-99');
 assert.equal(publicV34Manifest().agentRoles.length,12);
});
test('intake rejects localhost, private IP and deceptive URLs',()=>{
 for(const bad of ['http://example.org','https://127.0.0.1','https://localhost','https://evil:pass@example.org','https://internal.test'])assert.throws(()=>validateV34Intake({...input,website:bad}));
 assert.equal(validateV34Intake(input).evidence,'CUSTOMER_SELF_REPORT');
});
test('public HTML observer makes bounded observations not performance promises',()=>{
 const r=inspectHtmlV34('<title>Widget Shop</title><h1>Welcome</h1><form></form><a href="tel:555">Call</a><b>Request a quote</b>');
 assert.equal(r.status,'INSPECTED');assert.equal(r.h1Count,1);assert.equal(r.telLink,true);assert.equal(r.bookingText,true);
});
test('buyer-intent requires authorization, freshness and explicit need',()=>{
 const recent={source:'CUSTOMER_INBOUND',observedAt:new Date().toISOString(),evidenceUrl:'https://example.org/need',explicitNeed:true,contactPermission:true};
 assert.equal(buyerIntent(recent).qualified,true);
 assert.equal(buyerIntent({...recent,source:'SCRAPED_PRIVATE_LIST'}).qualified,false);
 assert.equal(buyerIntent({...recent,explicitNeed:false}).qualified,false);
 assert.equal(buyerIntent({...recent,contactPermission:false}).contactAllowed,false);
});
test('competitor gaps are clearly hypotheses and not claims',()=>{
 const res=competitorGaps([{name:'Alternative A',capabilities:['appointment scheduling'],evidenceUrl:'https://example.org'}],['booking','follow-up']);
 assert.equal(res.length,1);assert.equal(res[0].potentialGaps.length,2);assert.match(res[0].qualification,/hypothesis/);
});
test('report is substantive and separates sources',()=>{
 const report=buildV34Report(input,{status:'INSPECTED',title:'Example',h1Count:1,formCount:0,telLink:false,bookingText:false});
 assert.equal(report.sections.length,9);assert.equal(report.quality.passed,true);
 assert.match(report.sections[1].body,/customer/i);
 assert.match(report.sections[2].body,/static public homepage/i);
 assert.match(report.sections[3].body,/phone link/i);
});
test('artifact factory produces substantive original outputs and escapes unsafe text',()=>{
 const web=artifactFactory('website',{company:'<script>bad</script>'});
 assert.equal(web.kind,'website');assert.match(web.files[0].content,/&lt;script&gt;/);
 assert.equal(artifactFactory('software-scaffold',{company:'Local Co'}).files.length,2);
 assert.equal(artifactFactory('template',{company:'Local Co'}).sections.length,2);
 assert.equal(artifactFactory('followup-scripts',input).sections.length,2);
});
test('quality gate rejects missing and guaranteed outcomes',()=>{
 assert.equal(qualityGate([{title:'One',body:'too short'}]).passed,false);
 assert.equal(qualityGate([{title:'A',body:'This self-reported information offers enough detail but guaranteed revenue is impossible'},{title:'B',body:'Another qualifying statement with at least forty characters and measurement'}]).passed,false);
});
test('delegation is scoped and fails closed',()=>{
 assert.equal(delegatedAuthority('READ_PUBLIC').allowed,true);
 assert.equal(delegatedAuthority('FULFILL_CAPTURED_DIGITAL_PRODUCT',{captureVerified:true,productScope:V34_SKU}).allowed,true);
 assert.equal(delegatedAuthority('FULFILL_CAPTURED_DIGITAL_PRODUCT',{captureVerified:false,productScope:V34_SKU}).allowed,false);
 assert.equal(delegatedAuthority('SEND_CUSTOMER_EMAIL',{ownerStandingApproval:true}).allowed,false);
 assert.equal(delegatedAuthority('REFUND').allowed,false);
 assert.equal(delegatedAuthority('VERIFY_IDENTITY').allowed,false);
});
test('self healing retries only safe work with cap',()=>{
 assert.equal(retryPlan({kind:'HEALTH_CHECK',attempts:0}).shouldRetry,true);
 assert.equal(retryPlan({kind:'HEALTH_CHECK',attempts:3}).shouldRetry,false);
 assert.equal(retryPlan({kind:'SEND_EMAIL',attempts:0}).shouldRetry,false);
});
test('financial reconciliation ignores fake and unpaid orders, never guesses net profit',()=>{
 const order={status:'COMPLETED',captureId:'real1',capturedAt:'2026-10-01T00:00:00Z',capturedAmount:99,
 paypalFeeUsd:3.5,paypalFeeSource:'PROVIDER',refunds:[]};
 const a=reconcileVerifiedRevenue([order,order,{status:'PENDING',captureId:null,capturedAmount:99}]);
 assert.equal(a.verifiedCaptures,1);assert.equal(a.grossCapturedUsd,99);assert.equal(a.netProfitUsd,null);
 const costs=[{amountUsd:4,verified:true,source:'BILLING'}];costs.complete=true;
 const b=reconcileVerifiedRevenue([order],costs);assert.equal(b.netProfitUsd,91.5);
 assert.equal(b.settledBankUsd,null);
});
test('growth/retention refuse to scale when economics are unknown',()=>{
 assert.equal(experimentDecision({visits:50,paidOrders:1}).action,'COLLECT_EVIDENCE');
 assert.equal(experimentDecision({visits:150,paidOrders:7}).action,'RECONCILE_COSTS');
 assert.equal(experimentDecision({visits:150,paidOrders:7,contributionProfitUsd:40}).action,'CONTROLLED_EXPANSION');
 assert.equal(retentionOpportunity({paid:true,consent:false}).marketingContactAllowed,false);
 assert.equal(nextObjective({unfulfilledPaid:1}),'DELIVER_VERIFIED_ORDERS');
 assert.equal(nextObjective({verifiedPaid:0}),'RESEARCH_FIRST_REAL_BUYER');
});
test('ten anonymous synthetic customers exercise quality checks WITHOUT sales',()=>{
 const group=simulationCustomers();assert.equal(group.length,10);assert.equal(new Set(group.map(x=>x.id)).size,10);
 for(const sim of group){
  assert.equal(sim.realSale,false);assert.equal(sim.sendToPayPal,false);assert.equal(sim.countAsRevenueUsd,0);
  const r=buildV34Report(sim,{status:'UNAVAILABLE',reason:'simulated run'});
  assert.equal(r.quality.passed,true);assert.equal(r.sections.length,9);
 }
});

test('pinned public DNS honors Node all-address lookup and keeps private or mixed DNS blocked',async()=>{
 const lookup=pinnedV34Lookup(['93.184.216.34']);lookup('example.org',{all:true},(e,addresses)=>{assert.equal(e,null);assert.deepEqual(addresses,[{address:'93.184.216.34',family:4}])});lookup('example.org',{},(e,address,family)=>{assert.equal(address,'93.184.216.34');assert.equal(family,4)});
 for(const ips of [[],['127.0.0.1'],['93.184.216.34','10.0.0.1'],['::1']])assert.throws(()=>pinnedV34Lookup(ips),/Public/);
 let requests=0;const get=(url,options,receive)=>{requests++;const request=new EventEmitter();request.destroy=()=>{};queueMicrotask(()=>{options.lookup(url.hostname,{all:true},(error,addresses)=>{assert.equal(error,null);assert.equal(addresses[0].family,4);assert.equal(addresses[0].address,'93.184.216.34');const response=new EventEmitter();response.statusCode=200;response.headers={'content-type':'text/html; charset=utf-8'};receive(response);response.emit('data',Buffer.from('<title>Actual fixture HTML</title><h1>Inquiry</h1>'));response.emit('end')})});return request};
 const result=await inspectV34Homepage('https://public.example.org/',{resolve4:async()=>['93.184.216.34'],get});assert.equal(result.status,'INSPECTED');assert.equal(result.title,'Actual fixture HTML');assert.equal(requests,1);
 const blocked=await inspectV34Homepage('https://public.example.org/',{resolve4:async()=>['93.184.216.34','169.254.169.254'],get});assert.equal(blocked.failureCode,'PUBLIC_PAGE_DNS_UNAVAILABLE');assert.equal(requests,1);
 const noDns=await inspectV34Homepage('https://127.0.0.1/',{resolve4:async()=>{throw Error('must not resolve')},get});assert.equal(noDns.failureCode,'PUBLIC_PAGE_URL_RESTRICTED');assert.equal(requests,1);
});
test('public inspection refuses redirects and produces bounded safe diagnostics for network failures',async()=>{
 const get=(status,fail=false)=>(_url,_options,receive)=>{const request=new EventEmitter();request.destroy=()=>{};queueMicrotask(()=>{if(fail){request.emit('error',Error('Sensitive fixture error must not escape'));return}const response=new EventEmitter();response.statusCode=status;response.headers={'content-type':'text/html',location:'https://127.0.0.1/'};response.resume=()=>{};receive(response)});return request};
 const redirect=await inspectV34Homepage('https://public.example.org/',{resolve4:async()=>['93.184.216.34'],get:get(302)});assert.equal(redirect.failureCode,'PUBLIC_PAGE_NOT_HTML');
 const failure=await inspectV34Homepage('https://public.example.org/',{resolve4:async()=>['93.184.216.34'],get:get(200,true)});assert.equal(failure.failureCode,'PUBLIC_PAGE_NETWORK_UNAVAILABLE');assert.doesNotMatch(JSON.stringify(failure),/Sensitive/);
});
