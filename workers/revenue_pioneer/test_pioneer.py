import asyncio, concurrent.futures, json, os, tempfile, time, unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import patch
from workers.revenue_pioneer.constitutional_guard import ConstitutionalGuard, GuardError, safe_http
from workers.revenue_pioneer.runtime_store import Store
from workers.revenue_pioneer.compute_router import ComputeRouter, RouterUnavailable, configured_nodes
from workers.revenue_pioneer.moe_router import MoERouter
from workers.revenue_pioneer.data_factory import DataFactory, CleanText
from workers.revenue_pioneer.scale_orchestrator import ScaleOrchestrator


def node(id='a', **kwargs):
    return {'id':id,'provider':'open_source','model':'micro-'+id,'endpoint':'https://cluster.example/v1/chat/completions','key_env':'ULTRON_OPEN_SOURCE_API_KEY','tier':'micro','input_per_million':.1,'output_per_million':.2,'price_verified_at':datetime.now(timezone.utc).isoformat(),'quality':.98,'open_source':True, **kwargs}

def env(nodes=None):
    return {'ULTRON_COMPUTE_NODES_JSON':json.dumps(nodes if nodes is not None else [node()]),'ULTRON_OPEN_SOURCE_API_KEY':'fixture-credential','ULTRON_COMPUTE_ALLOWED_HOSTS':'cluster.example','ULTRON_PIONEER_DAILY_BUDGET_USD':'1','ULTRON_CRAWL_ALLOWED_HOSTS':'market.example'}

def response(text='Reviewed draft', status=200, **kwargs):
    return status, kwargs, json.dumps({'choices':[{'finish_reason':'stop','message':{'content':text}}],'usage':{'prompt_tokens':30,'completion_tokens':5}}).encode()

class PioneerTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.store=Store(Path(self.temp.name)/'state.sqlite3')
    def tearDown(self): self.temp.cleanup()
    def compute(self, nodes=None, transport=lambda *a,**kw:response()): return ComputeRouter(self.store, env(nodes), transport)

    def test_guard_no_financial_authority_or_secrets(self):
        g=ConstitutionalGuard()
        for action,payload in [('transfer',{}),('generate',{'balance':4}),('generate',{'text':'sk-proj-'+'x'*32}),('generate',{'data_class':'internal'})]:
            with self.assertRaises(GuardError):g.inspect(action,payload)
        for name in ['../x.md','x.py','x.sh','/tmp/x.md']:
            with self.assertRaises(GuardError):g.artifact(name,b'content')
        with self.assertRaises(GuardError):g.artifact('x.md',b'eval("bad")')
        self.assertTrue(g.artifact('x.md',b'Original draft')['reviewRequired'])

    def test_dns_rebinding_private_address_rejected_before_request(self):
        with patch('socket.getaddrinfo',return_value=[(2,1,6,'',('127.0.0.1',443))]):
            with self.assertRaises(GuardError):safe_http('https://market.example/a',allowed_hosts={'market.example'})
        with self.assertRaises(GuardError):safe_http('http://market.example/a',allowed_hosts={'market.example'})

    def test_prices_stale_nonfinite_and_scope_mismatch_rejected(self):
        for n in [node(input_per_million=float('nan')),node(price_verified_at=(datetime.now(timezone.utc)-timedelta(days=8)).isoformat()),node(key_env='OPENAI_API_KEY'),node(endpoint='https://127.0.0.1/v1/chat/completions')]:
            with self.assertRaises((ValueError,GuardError)):configured_nodes(env([n]))
        self.assertEqual(configured_nodes({}),[])

    def test_native_provider_protocols_and_output_limits(self):
        for provider, endpoint, keyenv in [('openai','https://api.openai.com/v1/responses','OPENAI_API_KEY'),('anthropic','https://api.anthropic.com/v1/messages','ANTHROPIC_API_KEY')]:
            config=node(provider,provider=provider,endpoint=endpoint,key_env=keyenv,tier='standard',open_source=False)
            e=env([config]);e[keyenv]='fixture-key';calls=[]
            def transport(url,**kw):
                body=json.loads(kw['body']);calls.append(body)
                if provider=='openai':
                    self.assertFalse(body['store']);self.assertEqual(body['max_output_tokens'],64)
                    result={'status':'completed','output':[{'type':'message','content':[{'type':'output_text','text':'Useful draft'}]}],'usage':{'input_tokens':10,'output_tokens':5}}
                else:
                    self.assertEqual(body['max_tokens'],64);self.assertEqual(kw['headers']['anthropic-version'],'2023-06-01')
                    result={'stop_reason':'end_turn','content':[{'type':'text','text':'Useful draft'}],'usage':{'input_tokens':10,'output_tokens':5}}
                return 200,{},json.dumps(result).encode()
            result=asyncio.run(ComputeRouter(self.store,e,transport).generate('Public task',max_tokens=64))
            self.assertEqual(result['text'],'Useful draft');self.assertEqual(len(calls),1)
        with self.assertRaises(GuardError):asyncio.run(self.compute().generate('Public task',tier='micro',max_tokens=9000))

    def test_consensus_rejects_invented_quotes(self):
        vote=json.dumps({'label':'demand','evidence':'A nonexistent customer promised to buy our product.'})
        factory=DataFactory(self.store,self.compute([node('a'),node('b')],lambda *a,**kw:response(vote)),env())
        result=asyncio.run(factory.consensus(factory.extract('Only an unverified public observation','https://market.example/a')))
        self.assertEqual(result['status'],'QUARANTINED')

    def test_zero_budget_makes_no_network_calls(self):
        calls=[];e=env();e['ULTRON_PIONEER_DAILY_BUDGET_USD']='0';router=ComputeRouter(self.store,e,lambda *a,**kw:calls.append(1))
        with self.assertRaises(RouterUnavailable):asyncio.run(router.generate('Read public evidence',tier='micro'))
        self.assertEqual(calls,[])

    def test_rate_limit_fallback_and_telemetry(self):
        calls=[]
        def transport(*a,**kw):
            calls.append(kw['body'])
            return response(status=429,**{'retry-after':'120'}) if len(calls)==1 else response()
        r=asyncio.run(self.compute([node('a'),node('b',input_per_million=.2)],transport).generate('Public evidence',tier='micro'))
        self.assertEqual(r['node'],'b');self.assertEqual(len(calls),2)
        self.assertGreater(self.store.node_state()['a']['cooldown'],time.time())
        self.assertGreater(self.store.summary()['reservedOrObservedUsd'],0)

    def test_uncertain_timeout_never_falls_back(self):
        calls=[]
        def transport(*a,**kw): calls.append(1);raise TimeoutError('private provider body')
        with self.assertRaises(TimeoutError):asyncio.run(self.compute([node('a'),node('b')],transport).generate('Public evidence',tier='micro'))
        self.assertEqual(len(calls),1)
        with self.store.tx() as c:self.assertEqual(c.execute('SELECT status FROM spend').fetchone()[0],'RECONCILIATION_REQUIRED')

    def test_atomic_budget_across_competing_connections(self):
        def reserve(_):
            try:return self.store.reserve('a',600000,1000000,120)
            except ValueError:return None
        with concurrent.futures.ThreadPoolExecutor(2) as pool:results=list(pool.map(reserve,range(2)))
        self.assertEqual(sum(x is not None for x in results),1)

    def test_latency_avoids_slow_successful_node(self):
        router=self.compute([node('a',max_latency_ms=1000),node('b')]);self.store.telemetry('a',5000,success=True)
        self.assertEqual([x.id for x in router.candidates('micro',.8)],['b'])

    def test_micro_rejects_closed_models_and_heavy_needs_review(self):
        router=self.compute([node('a',provider='openai',open_source=False,endpoint='https://api.openai.com/v1/responses',key_env='OPENAI_API_KEY')])
        self.assertEqual(router.candidates('micro',.8),[])
        with self.assertRaises(GuardError):MoERouter(router).classify({'kind':'system_design'})
        self.assertEqual(MoERouter(router).classify({'kind':'system_design','requiresHeavy':True})['tier'],'heavy')

    def test_deterministic_parse_and_explicit_data_class(self):
        moe=MoERouter(ComputeRouter(self.store,{}))
        result=asyncio.run(moe.run({'kind':'parse_json','text':'{"x":1}','data_class':'public'}))
        self.assertEqual(json.loads(result['text']),{'x':1});self.assertEqual(result['node'],'deterministic')
        with self.assertRaises(GuardError):asyncio.run(moe.run({'kind':'parse_json','text':'{}'}))

    def test_html_noise_and_prices_provenance(self):
        p=CleanText();p.feed('<script>fake</script><nav>menu</nav><h1>Pricing</h1><p>USD 25.00 monthly</p>')
        self.assertNotIn('fake',p.text());self.assertNotIn('menu',p.text())
        record=DataFactory(self.store,self.compute()).extract(p.text(),'https://market.example/a')
        self.assertEqual(record['prices'],['USD 25.00']);self.assertFalse(record['marketTruthVerified'])

    def test_robots_disallow_prevents_page_fetch(self):
        calls=[]
        def transport(url,**kw):calls.append(url);return 200,{},b'User-agent: *\nDisallow: /private'
        factory=DataFactory(self.store,self.compute(),env(),transport)
        with self.assertRaises(GuardError):factory.fetch('https://market.example/private')
        self.assertEqual(len(calls),1)

    def test_consensus_needs_distinct_models_and_exact_source(self):
        quote='A real public request for help with service intake.'
        vote=json.dumps({'label':'demand','evidence':quote})
        factory=DataFactory(self.store,self.compute([node('a'),node('b')],lambda *a,**kw:response(vote)),env())
        record=factory.extract(quote,'https://market.example/a')
        result=asyncio.run(factory.consensus(record))
        self.assertEqual(result['status'],'CONSENSUS_EXTRACTED');self.assertEqual(len(result['reviewers']),2);self.assertFalse(result['marketTruthVerified'])

    def test_no_reviewers_means_quarantine(self):
        factory=DataFactory(self.store,ComputeRouter(self.store,{}),env())
        r=asyncio.run(factory.consensus(factory.extract('Unverified text','https://market.example/a')))
        self.assertEqual(r['status'],'QUARANTINED')

    def test_queue_replay_conflict_and_draft_delivery(self):
        app=ScaleOrchestrator(self.store,{})
        task={'id':'parse:1','kind':'task','payload':{'kind':'extract_prices','text':'Offer $25.00','data_class':'public'}}
        self.assertEqual(app.enqueue(task)['status'],'QUEUED');self.assertTrue(app.enqueue(task)['duplicate'])
        with self.assertRaises(GuardError):app.enqueue({**task,'kind':'product_draft'})
        r=asyncio.run(app.pulse());self.assertEqual(len(r['processed']),1)
        saved=asyncio.run(app.dispatch({'action':'job','payload':{'id':'parse:1'}}))
        self.assertEqual(saved['status'],'DRAFT_READY');self.assertEqual(json.loads(saved['result']['text']),['$25.00'])
        self.assertEqual(asyncio.run(app.pulse())['processed'],[])

    def test_stale_lease_reconciles_without_retry(self):
        app=ScaleOrchestrator(self.store,{})
        app.enqueue({'id':'old','kind':'checkout_route','payload':{}});self.assertIsNotNone(app.claim())
        with self.store.tx() as c:c.execute('UPDATE jobs SET updated=?',(time.time()-200,))
        self.assertIsNone(app.claim())
        self.assertEqual(self.store.summary()['jobs'],{'RECONCILIATION_REQUIRED':1})

    def test_checkout_is_only_existing_path_no_order(self):
        app=ScaleOrchestrator(self.store,{});app.enqueue({'id':'checkout','kind':'checkout_route','payload':{}})
        asyncio.run(app.pulse());r=asyncio.run(app.dispatch({'action':'job','payload':{'id':'checkout'}}))
        self.assertFalse(r['result']['orderCreated']);self.assertEqual(r['result']['path'],'/autonomous-audit')

if __name__=='__main__':unittest.main()
