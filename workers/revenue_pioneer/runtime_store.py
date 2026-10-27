"""Single-volume SQLite queue, reservations and telemetry shared across subprocesses."""
from __future__ import annotations
from contextlib import contextmanager
from datetime import datetime, timezone
import json, os, sqlite3, time
from pathlib import Path

class Store:
    def __init__(self, path=None):
        root = Path(path).parent if path else Path(os.environ.get('ULTRON_PIONEER_STATE_DIR', '/data/revenue-pioneer'))
        root.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.path = str(path or root / 'runtime.sqlite3')
        with self.tx() as c:
            c.executescript('''
            CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY, hash TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL, at REAL NOT NULL, updated REAL NOT NULL, result TEXT);
            CREATE TABLE IF NOT EXISTS spend(id INTEGER PRIMARY KEY, day TEXT NOT NULL, node TEXT NOT NULL, reserved INTEGER NOT NULL, observed INTEGER, status TEXT NOT NULL, at REAL NOT NULL);
            CREATE TABLE IF NOT EXISTS nodes(id TEXT PRIMARY KEY, latency REAL, cooldown REAL NOT NULL DEFAULT 0, remaining INTEGER, successes INTEGER NOT NULL DEFAULT 0, failures INTEGER NOT NULL DEFAULT 0, updated REAL NOT NULL);
            CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, at REAL NOT NULL, action TEXT NOT NULL, hash TEXT NOT NULL, status TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS sources(url TEXT PRIMARY KEY, fetched REAL NOT NULL, hash TEXT NOT NULL, record TEXT NOT NULL);
            ''')

    @contextmanager
    def tx(self):
        c = sqlite3.connect(self.path, timeout=5)
        try:
            c.execute('PRAGMA busy_timeout=5000')
            c.execute('PRAGMA max_page_count=8192')
            c.execute('BEGIN IMMEDIATE')
            yield c
            c.commit()
        except BaseException:
            c.rollback()
            raise
        finally:
            c.close()

    def audit(self, action, fingerprint, status):
        with self.tx() as c:
            c.execute('INSERT INTO audit(at,action,hash,status) VALUES(?,?,?,?)', (time.time(), action, fingerprint, status))
            c.execute('DELETE FROM audit WHERE id NOT IN (SELECT id FROM audit ORDER BY id DESC LIMIT 1000)')

    def reserve(self, node, micro_usd, cap, rpm):
        now = time.time(); day = datetime.now(timezone.utc).date().isoformat()
        with self.tx() as c:
            used = c.execute('SELECT COALESCE(SUM(COALESCE(observed,reserved)),0) FROM spend WHERE day=?', (day,)).fetchone()[0]
            if cap <= 0 or used + micro_usd > cap:
                raise ValueError('Compute budget exhausted or not configured')
            if c.execute('SELECT COUNT(*) FROM spend WHERE node=? AND at>?', (node, now - 60)).fetchone()[0] >= rpm:
                raise ValueError('Local rate limit reached')
            receipt = c.execute('INSERT INTO spend(day,node,reserved,status,at) VALUES(?,?,?,?,?)', (day, node, micro_usd, 'RESERVED', now)).lastrowid
            c.execute('DELETE FROM spend WHERE day<?', (datetime.fromtimestamp(now - 31*86400, timezone.utc).date().isoformat(),))
            return receipt

    def settle(self, receipt, observed=None, status='OBSERVED'):
        with self.tx() as c:
            # Unknown outcomes retain their full conservative reservation.
            c.execute('UPDATE spend SET observed=?,status=? WHERE id=?', (observed, status, receipt))

    def telemetry(self, node, latency, *, cooldown=0, remaining=None, success=False):
        with self.tx() as c:
            c.execute('''INSERT INTO nodes(id,latency,cooldown,remaining,successes,failures,updated) VALUES(?,?,?,?,?,?,?)
            ON CONFLICT(id) DO UPDATE SET latency=excluded.latency,cooldown=excluded.cooldown,remaining=excluded.remaining,
            successes=nodes.successes+excluded.successes,failures=nodes.failures+excluded.failures,updated=excluded.updated''',
                      (node, latency, cooldown, remaining, int(success), int(not success), time.time()))

    def node_state(self):
        with self.tx() as c:
            c.row_factory = sqlite3.Row
            return {r['id']: dict(r) for r in c.execute('SELECT * FROM nodes')}

    def summary(self):
        day = datetime.now(timezone.utc).date().isoformat()
        with self.tx() as c:
            jobs = dict(c.execute('SELECT status,COUNT(*) FROM jobs GROUP BY status'))
            used = c.execute('SELECT COALESCE(SUM(COALESCE(observed,reserved)),0) FROM spend WHERE day=?', (day,)).fetchone()[0]
            sources = c.execute('SELECT COUNT(*) FROM sources').fetchone()[0]
        return {'jobs': jobs, 'sources': sources, 'day': day, 'reservedOrObservedUsd': used / 1_000_000, 'financialTransactionsExecuted': False}
