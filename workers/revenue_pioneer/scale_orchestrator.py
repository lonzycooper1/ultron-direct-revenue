"""Durable, finite asynchronous pulses, driven by ULTRON's existing Node scheduler."""
from __future__ import annotations
import asyncio, json, os, re, sys, time
from .constitutional_guard import ConstitutionalGuard, GuardError
from .runtime_store import Store
from .compute_router import ComputeRouter
from .moe_router import MoERouter
from .data_factory import DataFactory

class ScaleOrchestrator:
    def __init__(self, store=None, env=None, compute=None):
        self.env = os.environ if env is None else env
        self.store = store or Store(); self.guard = ConstitutionalGuard()
        self.compute = compute or ComputeRouter(self.store, self.env)
        self.moe = MoERouter(self.compute); self.factory = DataFactory(self.store, self.compute, self.env)

    def enqueue(self, data):
        self.guard.inspect('enqueue', data)
        key = data.get('id'); kind = data.get('kind'); payload = data.get('payload')
        if not isinstance(key, str) or not re.fullmatch(r'[a-zA-Z0-9_.:-]{1,120}', key) or kind not in {'demand', 'product_draft', 'checkout_route', 'task'} or not isinstance(payload, dict):
            raise GuardError('Stable bounded job ID, supported kind and object payload required')
        self.guard.inspect('enqueue', payload)
        digest = self.guard.fingerprint({'kind': kind, 'payload': payload}); now = time.time()
        with self.store.tx() as c:
            old = c.execute('SELECT hash,status FROM jobs WHERE id=?', (key,)).fetchone()
            if old:
                if old[0] != digest: raise GuardError('Idempotency conflict')
                return {'id': key, 'status': old[1], 'duplicate': True}
            c.execute("DELETE FROM jobs WHERE id IN (SELECT id FROM jobs WHERE status IN ('DRAFT_READY','BLOCKED') ORDER BY updated DESC LIMIT -1 OFFSET 500)")
            if c.execute('SELECT COUNT(*) FROM jobs').fetchone()[0] >= 600:
                raise GuardError('Durable queue capacity reached')
            c.execute('INSERT INTO jobs VALUES(?,?,?,?,?,?,?,NULL)', (key,digest,kind,json.dumps(payload),'QUEUED',now,now))
        return {'id': key, 'status': 'QUEUED'}

    def claim(self):
        with self.store.tx() as c:
            c.execute("UPDATE jobs SET status='RECONCILIATION_REQUIRED',updated=? WHERE status='RUNNING' AND updated<?", (time.time(), time.time()-180))
            if c.execute("SELECT 1 FROM jobs WHERE status='RUNNING'").fetchone(): return None
            row = c.execute("SELECT id,kind,payload FROM jobs WHERE status='QUEUED' ORDER BY at LIMIT 1").fetchone()
            if row: c.execute("UPDATE jobs SET status='RUNNING',updated=? WHERE id=?", (time.time(),row[0]))
            return row

    async def work(self, row):
        key, kind, raw = row; payload = json.loads(raw)
        self.guard.inspect('pulse', payload)
        if kind == 'demand': result = await self.factory.crawl(payload.get('url', ''))
        elif kind == 'checkout_route':
            # Only a fixed existing application path; never create orders or manipulate balances.
            result = {'path': '/autonomous-audit', 'paymentProvider': 'EXISTING_PAYPAL_FLOW', 'orderCreated': False}
        elif kind == 'product_draft':
            draft = await self.moe.run({'kind': 'product_draft', 'data_class': 'public', 'text': payload.get('text', ''), 'max_tokens': 1024})
            result = {**draft, 'artifact': self.guard.artifact('product-draft.md', draft['text'].encode())}
        else: result = await self.moe.run(payload)
        self.guard.output('pulse', result)
        with self.store.tx() as c:
            c.execute("UPDATE jobs SET status='DRAFT_READY',result=?,updated=? WHERE id=? AND status='RUNNING'", (json.dumps(result),time.time(),key))
        self.store.audit(kind, self.guard.fingerprint(payload), 'DRAFT_READY')
        return {'id': key, 'status': 'DRAFT_READY'}

    async def pulse(self):
        targets = json.loads(self.env.get('ULTRON_CRAWL_TARGETS_JSON', '[]'))
        if not isinstance(targets, list) or len(targets) > 3 or any(not isinstance(u,str) for u in targets):
            raise GuardError('At most three explicit crawl targets are supported')
        for url in targets:
            # Hourly idempotency bounds retries and respects per-host robots cooldown.
            fingerprint = self.guard.fingerprint({'url': url})[:24]
            self.enqueue({'id': 'source:'+fingerprint+':'+str(int(time.time()//3600)), 'kind':'demand', 'payload':{'url':url}})
        completed = []
        # At most two tasks per invocation; a durable lease serializes replica admission.
        for _ in range(2):
            row = self.claim()
            if not row: break
            try: completed.append(await asyncio.wait_for(self.work(row), timeout=100))
            except BaseException as e:
                status = 'BLOCKED' if isinstance(e, (ValueError, GuardError)) else 'RECONCILIATION_REQUIRED'
                with self.store.tx() as c:
                    c.execute('UPDATE jobs SET status=?,updated=? WHERE id=?', (status,time.time(),row[0]))
                self.store.audit(row[1], self.guard.fingerprint({'id':row[0]}), status)
                completed.append({'id':row[0], 'status':status})
                if isinstance(e, (asyncio.CancelledError, KeyboardInterrupt, SystemExit)): raise
        return {'processed': completed, 'signals': self.factory.signals(), 'summary': self.store.summary()}

    async def dispatch(self, request):
        action = request.get('action'); payload = request.get('payload', {})
        self.guard.inspect(action, payload)
        if action == 'status':
            return {'version':1, 'runtime':'python-stdlib', 'compute':self.compute.status(), **self.store.summary()}
        if action == 'job':
            key = payload.get('id')
            if not isinstance(key,str) or not re.fullmatch(r'[a-zA-Z0-9_.:-]{1,120}',key): raise GuardError('Invalid job ID')
            with self.store.tx() as c:
                row=c.execute('SELECT id,kind,status,result FROM jobs WHERE id=?',(key,)).fetchone()
            return {'id':row[0], 'kind':row[1], 'status':row[2], 'result':json.loads(row[3]) if row[3] else None} if row else {'status':'NOT_FOUND'}
        if action == 'classify': return self.moe.classify(payload)
        if action == 'enqueue': return self.enqueue(payload)
        if action == 'pulse': return await self.pulse()
        if action == 'generate': return await self.moe.run(payload)
        raise GuardError('Operation is not exposed')

async def main():
    try:
        raw = sys.stdin.buffer.read(131073)
        if len(raw)>131072: raise GuardError('Bridge input too large')
        request = json.loads(raw)
        ConstitutionalGuard().inspect(request.get('action'), request.get('payload', {}))
        result = {'version':1,'python':sys.version.split()[0],'capabilities':'READ_AND_DRAFT_ONLY'} if request.get('action')=='health' else await ScaleOrchestrator().dispatch(request)
        ConstitutionalGuard().output('status', result)
        print(json.dumps({'ok':True, 'result':result}, allow_nan=False))
    except Exception:
        # No provider body, URL, prompt or credential can escape in an error.
        print(json.dumps({'ok':False, 'error':'Pioneer operation blocked; inspect configuration and bounded evidence'}))
        sys.exit(1)

if __name__ == '__main__': asyncio.run(main())
