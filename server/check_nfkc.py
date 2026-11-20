"""NFKC로 바뀌는 상품명 확인 — 1회용"""
import unicodedata

import pandas as pd

from app.core.config import DATA_DIR

f = sorted(DATA_DIR.glob('*.csv'))[0]
df = pd.read_csv(f, dtype=str, encoding='cp949', low_memory=False).fillna('')
med = df[df['전문일반구분'].isin(['전문의약품', '일반의약품'])]

names = med['한글상품명'].unique()
changed = [n for n in names if unicodedata.normalize('NFKC', n) != n]

print(f'전체 상품명 {len(names):,}종 중 NFKC로 글자가 바뀌는 것: {len(changed)}종\n')
for n in changed[:40]:
    print(f'  {n}\n  → {unicodedata.normalize("NFKC", n)}\n')