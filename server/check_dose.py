"""용량주의 PROHBT_CONTENT 실제 내용 확인"""
import pandas as pd
from app.core.config import find_csv

df = pd.read_csv(find_csv('DUR용량주의'), dtype=str,
                 encoding='utf-8-sig').fillna('')
has = df[df['PROHBT_CONTENT'] != '']

print(f'전체 {len(df):,}행 · 설명 있음 {len(has):,}행 ({len(has)/len(df)*100:.1f}%)')
print(f'서로 다른 문장 {has["PROHBT_CONTENT"].nunique():,}종')
print('=' * 62)

for t, n in has['PROHBT_CONTENT'].value_counts().head(20).items():
    print(f'[{n:>4}건] {t[:70]}')

print('=' * 62)
print('약 이름과 함께 보기')
for _, r in has.sample(min(8, len(has)), random_state=0).iterrows():
    print(f'  {r["ITEM_NAME"][:28]:<30} {r["PROHBT_CONTENT"][:40]}')