"""약가마스터 일반명코드와 DUR INGR_CODE가 같은 체계인지 확인"""
import pandas as pd
from app.core.config import find_csv

path = find_csv('약가마스터')
for enc in ('cp949', 'utf-8-sig', 'euc-kr'):
    try:
        med = pd.read_csv(path, dtype=str, encoding=enc, low_memory=False)
        break
    except UnicodeDecodeError:
        continue
med = med.fillna('')

dur = pd.read_csv(find_csv('DUR병용금기'), dtype=str,
                  encoding='utf-8-sig', nrows=5000).fillna('')

gen = set(med['일반명코드(성분명코드)'][med['일반명코드(성분명코드)'] != ''].str.strip())
ing = set(dur['INGR_CODE'][dur['INGR_CODE'] != ''].str.strip())

print(f'약가마스터 일반명코드  {len(gen):,}종   예: {sorted(gen)[:3]}')
print(f'DUR INGR_CODE        {len(ing):,}종   예: {sorted(ing)[:3]}')
print('-' * 56)
print(f'겹침  {len(gen & ing):,} / {len(ing):,}')