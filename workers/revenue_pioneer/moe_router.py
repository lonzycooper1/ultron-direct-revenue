"""Task-level expert routing, not a neural model's internal mixture-of-experts."""
import json, re
from .constitutional_guard import ConstitutionalGuard, GuardError

class MoERouter:
    def __init__(self, compute):
        self.compute = compute
        self.guard = ConstitutionalGuard()

    def classify(self, task):
        kind = task.get('kind')
        if kind in {'parse_json', 'extract_prices'}:
            return {'tier': 'deterministic', 'minQuality': 1.0, 'reason': 'Parsing needs no model or API spend'}
        if kind in {'classify_text', 'label_signal'}:
            return {'tier': 'micro', 'minQuality': .85, 'reason': 'Only configured benchmarked open-source micro nodes eligible'}
        if kind in {'product_draft', 'marketing', 'support'}:
            return {'tier': 'standard', 'minQuality': .85, 'reason': 'Bounded text draft; no action execution'}
        if kind in {'system_design', 'market_analysis'}:
            if task.get('requiresHeavy') is not True:
                raise GuardError('Heavywork requires an explicit reviewed complexity request')
            return {'tier': 'heavy', 'minQuality': .95, 'reason': 'Explicit complex task and benchmark threshold'}
        raise GuardError('Unsupported task kind; model-generated database writes and trades are prohibited')

    async def run(self, task):
        self.guard.inspect('classify', task)
        if task.get('data_class') != 'public':
            raise GuardError('Explicit public-data classification is required for model or parsing tasks')
        route = self.classify(task)
        text = task.get('text', '')
        if not isinstance(text, str) or not text or len(text.encode()) > 32000:
            raise GuardError('Bounded task text required')
        if task['kind'] == 'parse_json':
            result = {'text': json.dumps(json.loads(text), ensure_ascii=False, allow_nan=False), 'draftOnly': True, 'node': 'deterministic'}
        elif task['kind'] == 'extract_prices':
            result = {'text': json.dumps(re.findall(r'(?:USD\s*|\$)\d+(?:,\d{3})*(?:\.\d{1,2})?', text)[:100]), 'draftOnly': True, 'node': 'deterministic'}
        else:
            result = await self.compute.generate(text, tier=route['tier'], min_quality=route['minQuality'], max_tokens=task.get('max_tokens', 1024))
        return {**self.guard.output('generate', result), 'routing': route}
