"""약가마스터에 DUR 품목기준코드(ITEM_SEQ)와 연결되는 컬럼이 있는지 확인"""
import pandas as pd
from app.core.config import find_csv

# 1. 약가마스터 컬럼 전부 보기
path = find_csv('약가마스터')
for enc in ('cp949', 'utf-8-sig', 'euc-kr'):
    try:
        med = pd.read_csv(path, dtype=str, encoding=enc, low_memory=False)
        break
    except UnicodeDecodeError:
        continue
med = med.fillna('')

print(f'약가마스터  {len(med):,}행 · {len(med.columns)}컬럼')
print('-' * 56)
for c in med.columns:
    sample = med[c][med[c] != ''].head(1)
    v = sample.iloc[0] if len(sample) else ''
    print(f'  {c:<24} {v[:28]}')

# 2. 받는 중인 병용금기에서 ITEM_SEQ 샘플 뽑기
dur = pd.read_csv(find_csv('DUR병용금기'), dtype=str,
                  encoding='utf-8-sig', nrows=3000).fillna('')
seq = set(dur['ITEM_SEQ'][dur['ITEM_SEQ'] != ''])
print('-' * 56)
print(f'DUR ITEM_SEQ 샘플 {len(seq):,}개   예: {sorted(seq)[:3]}')

# 3. 어느 컬럼과 겹치는지
print('-' * 56)
print('겹치는 개수')
hit = False
for c in med.columns:
    vals = set(med[c][med[c] != ''].str.strip())
    n = len(seq & vals)
    if n:
        print(f'  {c:<24} {n:,} / {len(seq):,}')
        hit = True
if not hit:
    print('  없음 — 그대로 겹치는 컬럼이 하나도 없습니다')
