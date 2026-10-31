"""특정 제품코드가 약가마스터에 있는지 확인 — 1회용"""
import pandas as pd

from app.core.config import DATA_DIR

f = sorted(DATA_DIR.glob('*.csv'))[0]
df = pd.read_csv(f, dtype=str, encoding='cp949', low_memory=False).fillna('')

code = df['제품코드(개정후)'].str.strip()
code = code.where(code == '', code.str.zfill(9))

print('--- 코드 645205212 ---')
hit = df[code == '645205212']
print(f'{len(hit)}건')
if len(hit):
    print(hit[['한글상품명', '전문일반구분', '제품코드(개정후)']].to_string(index=False))

print('\n--- 이름에 "나바론" 포함 ---')
nav = df[df['한글상품명'].str.contains('나바론', na=False)]
print(f'{len(nav)}건')
if len(nav):
    print(nav[['한글상품명', '전문일반구분', '제품코드(개정후)']].to_string(index=False))