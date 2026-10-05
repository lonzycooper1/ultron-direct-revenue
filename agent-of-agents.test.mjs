import test from 'node:test';import assert from 'node:assert/strict';
import {AGENT_OF_AGENTS_VERSION,COMMERCE_AGENTS,POD_STRATEGY,spawnCommerceTeam,buildCommerceMission,visualAgentGraph,agentOfAgentsManifest} from './agent-of-agents.mjs';

test('agent-of-agents layer has CEO architecture and four commerce specialists',()=>{
  assert.equal(AGENT_OF_AGENTS_VERSION,'2.0.0');
  assert.deepEqual(Object.keys(COMMERCE_AGENTS).sort(),['CustomerSupportAgent','MediaBuyerAgent','ProductScoutAgent','StoreBuilderAgent'].sort());
  assert.equal(agentOfAgentsManifest().security.totalLayers,20);
});
test('commerce mission dynamically assembles agents from goal',()=>{
  const m=buildCommerceMission({goal:'Find POD products, build a Shopify store, run ads and support customers'});
  const names=m.team.agents.map(x=>x.name);
  for(const n of ['ProductScoutAgent','StoreBuilderAgent','MediaBuyerAgent','CustomerSupportAgent'])assert.ok(names.includes(n));
  assert.ok(m.tasks.some(x=>x.stage==='AD_APPROVAL'&&x.approvalRequired));
  assert.ok(m.tasks.some(x=>x.stage==='PUBLISH_APPROVAL'&&x.approvalRequired));
  assert.ok(m.tasks.some(x=>x.stage==='REFUND_POLICY'&&x.approvalRequired));
});
test('POD strategy ranks digital and POD before supplier physical goods',()=>{
  assert.equal(POD_STRATEGY.preferredLaunchOrder[0],'digital-download');
  assert.ok(POD_STRATEGY.preferredLaunchOrder.indexOf('print-on-demand-art')<POD_STRATEGY.preferredLaunchOrder.indexOf('supplier-fulfilled-physical-product'));
});
test('visual graph includes editor-in-chief approval paths and analytics feedback',()=>{
  const g=visualAgentGraph();
  assert.ok(g.nodes.some(x=>x.id==='editor'));
  assert.ok(g.nodes.some(x=>x.id==='ceo'));
  assert.ok(g.edges.some(x=>x.from==='MediaBuyerAgent'&&x.to==='editor'));
  assert.ok(g.edges.some(x=>x.from==='analytics'&&x.to==='ceo'));
});
