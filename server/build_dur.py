"""병용금기 790,684행 → 성분 쌍 + 품목·성분 매핑으로 압축"""
import csv
from collections import defaultdict, Counter

import pandas as pd

from app.core.config import find_csv

src = find_csv('DUR병용금기')
print(f'읽는 중 … {src.name}')

ingr_name = {}                      # 성분코드 → 한글명
pairs = defaultdict(Counter)        # (코드A, 코드B) → 사유 빈도
item_ingr = defaultdict(set)        # 품목기준코드 → {성분코드}
item_name = {}                      # 품목기준코드 → 품목명
rows = 0

for ch in pd.read_csv(src, dtype=str, encoding='utf-8-sig',
                      chunksize=100_000, low_memory=False):
    ch = ch.fillna('')
    rows += len(ch)
    print(f'\r  {rows:,}행', end='')

    for a, an, b, bn, sa, na, sb, nb, why in zip(
            ch['INGR_CODE'], ch['INGR_KOR_NAME'],
            ch['MIXTURE_INGR_CODE'], ch['MIXTURE_INGR_KOR_NAME'],
            ch['ITEM_SEQ'], ch['ITEM_NAME'],
            ch['MIXTURE_ITEM_SEQ'], ch['MIXTURE_ITEM_NAME'],
            ch['PROHBT_CONTENT']):

        ingr_name.setdefault(a, an)
        ingr_name.setdefault(b, bn)

        key = (a, b) if a <= b else (b, a)      # 순서 무관하게 통일
        if why:
            pairs[key][why] += 1
        else:
            pairs[key]                          # 사유 없어도 쌍은 등록

        item_ingr[sa].add(a)
        item_ingr[sb].add(b)
        item_name.setdefault(sa, na)
        item_name.setdefault(sb, nb)

print(f'\r  {rows:,}행 읽음')

# 1. 성분 쌍
out1 = src.with_name(src.stem + '_성분쌍.csv')
with out1.open('w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['성분코드A', '성분명A', '성분코드B', '성분명B', '금기사유'])
    for (a, b), c in sorted(pairs.items()):
        why = c.most_common(1)[0][0] if c else ''
        w.writerow([a, ingr_name.get(a, ''), b, ingr_name.get(b, ''), why])

# 2. 품목 → 성분
out2 = src.with_name(src.stem + '_품목성분.csv')
with out2.open('w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['품목기준코드', '품목명', '성분코드', '성분명'])
    for seq in sorted(item_ingr):
        for code in sorted(item_ingr[seq]):
            w.writerow([seq, item_name.get(seq, ''), code,
                        ingr_name.get(code, '')])

print('=' * 58)
print(f'성분 쌍    {len(pairs):,}개      → {out1.name}')
print(f'품목       {len(item_ingr):,}개')
print(f'품목·성분  {sum(len(v) for v in item_ingr.values()):,}행 → {out2.name}')
print(f'성분 종류  {len(ingr_name):,}개')
print('-' * 58)
multi = sum(1 for c in pairs.values() if len(c) > 1)
print(f'사유가 2종 이상인 쌍  {multi:,}개  (가장 많이 나온 문장을 씀)')
print(f'사유가 아예 없는 쌍   {sum(1 for c in pairs.values() if not c):,}개')
print(f'성분이 2개 이상인 품목 {sum(1 for v in item_ingr.values() if len(v) > 1):,}개')