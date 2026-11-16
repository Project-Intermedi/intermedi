"""테스트에 쓸 만한 병용금기 조합 찾기 — 먹는 약(정/캡슐) 위주"""
from app.services.dur import PAIRS, ITEM_INGR, INGR_NAME, FLAGS
from app.services.match import MED

_m = MED[(MED['제품코드'] != '') & (MED['품목기준코드'] != '')]
NAME_OF = dict(zip(_m['품목기준코드'], _m['한글상품명']))
CODE_OF = dict(zip(_m['품목기준코드'], _m['제품코드']))

ORAL = ('정', '캡슐', '캅셀')

def oral(seq):
    n = NAME_OF.get(seq, '')
    return any(k in n for k in ORAL) and '주' not in n and '패취' not in n

BY = {}
for seq, codes in ITEM_INGR.items():
    if seq in NAME_OF and oral(seq):
        for c in codes:
            BY.setdefault(c, seq)       # 성분당 대표 품목 하나

print('먹는 약으로 짝이 맞는 병용금기 조합')
print('=' * 66)
n = 0
for (a, b), why in PAIRS.items():
    if a in BY and b in BY and why:
        s1, s2 = BY[a], BY[b]
        print(f'[{n}] {NAME_OF[s1][:26]}')
        print(f'    {NAME_OF[s2][:26]}')
        print(f'    {INGR_NAME[a]} × {INGR_NAME[b]} — {why[:40]}')
        print(f'    제품코드 {CODE_OF[s1]} / {CODE_OF[s2]}')
        flags1 = list(FLAGS.get(s1, {}))
        flags2 = list(FLAGS.get(s2, {}))
        print(f'    주의 {flags1} / {flags2}')
        print('-' * 66)
        n += 1
        if n == 12:
            break