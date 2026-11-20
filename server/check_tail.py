"""detail 문장의 절 끝이 어떻게 끝나는지"""
import re
from collections import Counter

from app.services.dur import FLAGS

parts = []
for got in FLAGS.values():
    for v in got.values():
        for p in re.split(r'[.。]\s*', v['detail']):
            p = p.strip()
            if p:
                parts.append(p)

tails = Counter(p[-4:] for p in parts)
print(f'절 {len(parts):,}개 · 서로 다른 끝 {len(tails):,}종')
print('=' * 54)
for t, n in tails.most_common(40):
    print(f'[{n:>5}] …{t}')