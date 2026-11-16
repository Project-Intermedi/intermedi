"""DUR 판정 동작 확인"""
from collections import defaultdict

from app.services.dur import PAIRS, ITEM_INGR, INGR_NAME, SEQ_OF, check
from app.services.match import MED

_m = MED[(MED['제품코드'] != '') & (MED['품목기준코드'] != '')]
CODE_OF = dict(zip(_m['품목기준코드'], _m['제품코드']))
NAME_OF = dict(zip(_m['품목기준코드'], _m['한글상품명']))

print(f'성분 쌍 {len(PAIRS):,}개 · 품목 {len(ITEM_INGR):,}개')
linked = [s for s in ITEM_INGR if s in CODE_OF]
print(f'제품코드까지 연결되는 품목  {len(linked):,} / {len(ITEM_INGR):,}'
      f'  ({len(linked)/len(ITEM_INGR)*100:.1f}%)')

# 성분코드 → 그 성분을 가진 품목(제품코드 있는 것만)
BY_INGR = defaultdict(list)
for seq in linked:
    for c in ITEM_INGR[seq]:
        BY_INGR[c].append(seq)

print('=' * 60)
print('실제 금기 쌍으로 판정 테스트')

done = 0
for (a, b), why in PAIRS.items():
    if not (BY_INGR.get(a) and BY_INGR.get(b)):
        continue
    s1, s2 = BY_INGR[a][0], BY_INGR[b][0]
    if s1 == s2:
        continue

    meds = [
        {'name': NAME_OF[s1], 'product_code': CODE_OF[s1]},
        {'name': NAME_OF[s2], 'product_code': CODE_OF[s2]},
    ]
    r = check(meds)
    print('-' * 60)
    print(f'  {meds[0]["name"][:24]}  +  {meds[1]["name"][:24]}')
    print(f'  기대: {INGR_NAME.get(a)} × {INGR_NAME.get(b)}')
    for c in r['combo']:
        print(f'  ▶ 병용금기  {c["ingr_a"]} × {c["ingr_b"]}  — {c["reason"][:30]}')
    for d in r['duplicate']:
        print(f'  ▶ 효능군중복  {d["effect"]}  {d["drugs"]}')
    if not r['combo']:
        print('  ✗ 안 잡힘')

    done += 1
    if done == 5:
        break

print('=' * 60)
print('안 걸려야 하는 경우')
safe = [{'name': '타이레놀정500mg', 'product_code': '644900140'},
        {'name': '없는약', 'product_code': '000000000'}]
print(f'  {check(safe)}')