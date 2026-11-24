"""효능효과 쉬운 말 요약 생성 → drug_info.easy 컬럼 (1회용)"""
import random
import sqlite3

import pandas as pd

from app.core.config import DRUG_DB, find_csv
from app.services.easy import head_of, diseases, summary


def read(p):
    for enc in ('cp949', 'utf-8-sig', 'euc-kr'):
        try:
            return pd.read_csv(p, dtype=str, encoding=enc, low_memory=False).fillna('')
        except UnicodeDecodeError:
            continue


m = read(find_csv('약가마스터'))
col = '국제표준코드(ATC코드)'
m['품목기준코드'] = m['품목기준코드'].str.strip()
m[col] = m[col].str.strip()
u = m[m['품목기준코드'] != ''].drop_duplicates('품목기준코드')
ATC_OF = dict(zip(u['품목기준코드'], u[col]))
print(f'ATC 매핑 {len(ATC_OF):,}종')

con = sqlite3.connect(DRUG_DB)
cols = {r[1] for r in con.execute('PRAGMA table_info(drug_info)')}
if 'easy' not in cols:
    con.execute('ALTER TABLE drug_info ADD COLUMN easy TEXT')
if 'atc' not in cols:
    con.execute('ALTER TABLE drug_info ADD COLUMN atc TEXT')

rows = con.execute('SELECT item_seq, item_name, efficacy FROM drug_info').fetchall()
upd, made = [], 0
for seq, name, eff in rows:
    a = ATC_OF.get(seq, '')
    s = summary(a, eff)
    made += bool(s)
    upd.append((s, a, seq))

con.executemany('UPDATE drug_info SET easy=?, atc=? WHERE item_seq=?', upd)
con.commit()

n = len(rows)
print(f'생성 {made:,} / {n:,}  ({made / n * 100:.1f}%)')

# 검증용 샘플 — 직접 읽어서 확인
random.seed(11)
pick = random.sample([r for r in rows if r[2]], 200)
with open('data/easy_검증샘플.txt', 'w', encoding='utf-8') as f:
    for i, (seq, name, eff) in enumerate(pick, 1):
        a = ATC_OF.get(seq, '')
        f.write(f'--- {i} / ATC {a or "없음"} ---\n')
        f.write(f'{name}\n')
        f.write(f'원문: {eff[:200].replace(chr(10), " ")}\n')
        f.write(f'요약: {summary(a, eff) or "(없음)"}\n\n')
print('검증 샘플 → data/easy_검증샘플.txt (200건)')
con.close()
