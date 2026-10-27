"""Bounded read/draft capabilities. AI text never grants financial authority."""
from __future__ import annotations
import hashlib, http.client, ipaddress, json, os, re, socket, ssl
from pathlib import Path
from urllib.parse import urlsplit

class GuardError(ValueError):
    pass

ALLOWED_ACTIONS = frozenset({'health', 'status', 'job', 'classify', 'generate', 'crawl', 'enqueue', 'pulse', 'product_draft', 'checkout_route'})
SECRET = re.compile(r'(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|Bearer\s+[A-Za-z0-9._-]{16,})', re.I)
DANGEROUS_CODE = re.compile(r'\b(?:eval|exec|compile)\s*\(|(?:subprocess|os)\.(?:system|popen|exec)|\brm\s+-rf\b|\bcurl\b.+\|\s*(?:sh|bash)', re.I)

class ConstitutionalGuard:
    max_bytes = 131072
    max_tokens = 4096

    def inspect(self, action: str, payload: dict) -> dict:
        if action not in ALLOWED_ACTIONS or not isinstance(payload, dict):
            raise GuardError('Unsupported capability')
        raw = json.dumps(payload, ensure_ascii=False, allow_nan=False)
        if len(raw.encode()) > self.max_bytes:
            raise GuardError('Payload exceeds bounded input size')
        if SECRET.search(raw):
            raise GuardError('Credential-like material is not allowed in task payloads')
        # Reject attempts to turn model output into control-plane authority.
        for key in ('balance', 'balanceUsd', 'verifiedRevenue', 'execute', 'shell', 'command', 'withdraw', 'transfer'):
            if key in payload:
                raise GuardError('Financial or execution authority cannot come from payloads')
        if payload.get('data_class', 'public') != 'public':
            raise GuardError('Only explicitly public data may enter multi-provider routing')
        return payload

    def output(self, action: str, payload: dict) -> dict:
        self.inspect(action, payload)
        text = str(payload.get('text', ''))
        if DANGEROUS_CODE.search(text):
            raise GuardError('Executable content requires separate code review')
        return payload

    def artifact(self, name: str, content: bytes) -> dict:
        p = Path(name)
        if p.is_absolute() or '..' in p.parts or len(p.parts) != 1 or p.suffix not in {'.txt', '.md', '.json', '.csv'}:
            raise GuardError('Only non-executable draft artifact names are supported')
        self.output('product_draft', {'text': content.decode('utf-8', errors='strict')})
        return {'name': name, 'sha256': hashlib.sha256(content).hexdigest(), 'bytes': len(content), 'reviewRequired': True}

    @staticmethod
    def fingerprint(payload: dict) -> str:
        return hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False, allow_nan=False).encode()).hexdigest()


def public_url(url: str, allowed_hosts: set[str]) -> tuple:
    p = urlsplit(url)
    if p.scheme != 'https' or not p.hostname or p.username or p.password or p.port not in (None, 443) or p.fragment:
        raise GuardError('An allowlisted HTTPS URL without credentials is required')
    if p.hostname.lower() not in allowed_hosts:
        raise GuardError('Destination host is not allowlisted')
    return p.hostname.lower(), p.path or '/', p.query


def safe_http(url: str, *, allowed_hosts: set[str], method='GET', body=None, headers=None, timeout=15, limit=262144):
    """Pin a validated public DNS address; verify TLS against the original host; never redirect."""
    host, path, query = public_url(url, allowed_hosts)
    addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(a[4][0]).is_global for a in addresses):
        raise GuardError('Private, reserved or mixed DNS destinations are prohibited')
    family, socktype, proto, _, address = addresses[0]
    raw = socket.socket(family, socktype, proto)
    raw.settimeout(timeout)
    connection = http.client.HTTPSConnection(host, timeout=timeout)
    try:
        raw.connect(address)
        connection.sock = ssl.create_default_context().wrap_socket(raw, server_hostname=host)
        connection.request(method, path + ('?' + query if query else ''), body=body, headers=headers or {})
        response = connection.getresponse()
        data = response.read(limit + 1)
        if len(data) > limit:
            raise GuardError('Remote response exceeds bounded size')
        if 300 <= response.status < 400:
            raise GuardError('Remote redirects are prohibited')
        return response.status, {k.lower(): v for k, v in response.getheaders()}, data
    finally:
        connection.close()
        raw.close()
