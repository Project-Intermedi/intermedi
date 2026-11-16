"""병용금기 사유 문장 종류 세기"""
from collections import Counter

from app.services.dur import PAIRS

c = Counter(PAIRS.values())
print(f'성분 쌍 {len(PAIRS):,}개 · 서로 다른 사유 {len(c):,}종')
print('=' * 62)
for why, n in c.most_common():
    print(f'[{n:>3}쌍] {why}')