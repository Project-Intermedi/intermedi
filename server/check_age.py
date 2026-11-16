"""특정연령대금기 문장에서 연령 표현 뽑기"""
import re
from collections import Counter

import pandas as pd

from app.core.config import find_csv

df = pd.read_csv(find_csv('DUR특정연령대금기'), dtype=str,
                 encoding='utf-8-sig').fillna('')
txt = df['PROHBT_CONTENT']

AGE = re.compile(r'(\d+)\s*(세|개월|살|주)\s*(미만|이하|이상|초과|까지)?')
WORD = ('신생아', '미숙아', '영아', '유아', '소아', '청소년', '어린이')

num = Counter()
word = Counter()
none = 0
for t in txt:
    hits = AGE.findall(t)
    if hits:
        for n, u, c in hits:
            num[f'{n}{u} {c}'.strip()] += 1
    ws = [w for w in WORD if w in t]
    for w in ws:
        word[w] += 1
    if not hits and not ws:
        none += 1

print(f'전체 {len(txt):,}행 · 연령 표현 없음 {none:,}행')
print('=' * 50)
print('숫자 표현')
for k, n in num.most_common(20):
    print(f'  [{n:>5}] {k}')
print('-' * 50)
print('낱말 표현')
for k, n in word.most_common():
    print(f'  [{n:>5}] {k}')