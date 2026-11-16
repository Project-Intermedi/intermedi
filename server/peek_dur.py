"""받은 DUR CSV 전부 훑기 — 행수 · 컬럼 · 빈 칸 비율 · 성분 쌍 수"""
from pathlib import Path
import pandas as pd

DATA = Path(__file__).parent / 'data'

for path in sorted(DATA.glob('*DUR*.csv')):
    rows, cols, blank, first, pairs = 0, None, None, None, set()

    for chunk in pd.read_csv(path, dtype=str, encoding='utf-8-sig',
                             chunksize=100_000, low_memory=False):
        chunk = chunk.fillna('')
        if cols is None:
            cols = list(chunk.columns)
            blank = pd.Series(0, index=cols, dtype='int64')
            first = chunk.iloc[0]
        rows += len(chunk)
        blank += (chunk == '').sum()
        if 'MIXTURE_INGR_CODE' in cols:
            pairs |= set(zip(chunk['INGR_CODE'], chunk['MIXTURE_INGR_CODE']))

    print('=' * 62)
    print(f'{path.name}')
    print(f'  {rows:,}행 · {len(cols)}컬럼')
    for c in cols:
        pct = blank[c] / rows * 100
        mark = '   ← 절반 넘게 빔' if pct >= 50 else ''
        print(f'  {c:<26} 빈칸 {pct:5.1f}%   {str(first[c])[:30]}{mark}')
    if pairs:
        print(f'  성분 쌍 {len(pairs):,}개   압축률 {rows / len(pairs):.0f}배')