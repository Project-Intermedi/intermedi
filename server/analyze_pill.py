"""낱알식별 데이터 훑어보기 — 1회용"""
from pathlib import Path

import pandas as pd

CSV = Path(__file__).parent / 'data' / 'pill' / '낱알식별.csv'
df = pd.read_csv(CSV, dtype=str, encoding='utf-8-sig').fillna('')
print(f'{len(df):,}행\n')


def pct(mask):
    return f'{mask.mean() * 100:5.1f}%'


print('── 제형별 모양 (100건 이상) ' + '─' * 30)
for form, g in df.groupby('FORM_CODE_NAME'):
    if len(g) < 100 or not form:
        continue
    top = g['DRUG_SHAPE'].value_counts().head(4)
    s = ' · '.join(f'{k or "(없음)"} {v:,}' for k, v in top.items())
    print(f'{form[:20]:22} {len(g):>6,}건   {s}')

print('\n── 분할선 (앞 | 뒤) 조합 ' + '─' * 32)
pair = df['LINE_FRONT'] + ' | ' + df['LINE_BACK']
print(pair.value_counts().head(20).to_string())

print('\n── 모양 ' + '─' * 48)
print(df['DRUG_SHAPE'].value_counts().to_string())

print('\n── 색상 ' + '─' * 48)
print('앞면 색:', ' · '.join(sorted(c for c in df['COLOR_CLASS1'].unique() if c)))
print('뒷면 색이 따로 있는 품목:', pct(df['COLOR_CLASS2'] != ''))
cap = df[df['DRUG_SHAPE'] == '캡슐형']
print(f'  캡슐형 {len(cap):,}건 중 뒷면 색 있음:', pct(cap['COLOR_CLASS2'] != ''))
tab = df[df['DRUG_SHAPE'] == '원형']
print(f'  원형  {len(tab):,}건 중 뒷면 색 있음:', pct(tab['COLOR_CLASS2'] != ''))

print('\n── 각인 · 사진 ' + '─' * 41)
print('앞면 각인 있음:', pct(df['PRINT_FRONT'] != ''))
print('뒷면 각인 있음:', pct(df['PRINT_BACK'] != ''))
print('낱알 사진 있음:', pct(df['ITEM_IMAGE'] != ''))
print('마크(그림) 앞면 있음:', pct(df['MARK_CODE_FRONT'] != ''))