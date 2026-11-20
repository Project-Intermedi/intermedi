"""품목 단위 주의 5종이 각각 걸리는지 확인"""
from app.services.dur import FLAGS, FLAG_FILES, check
from app.services.match import MED

_m = MED[MED['품목기준코드'] != '']
NAME_OF = dict(zip(_m['품목기준코드'], _m['한글상품명']))
CODE_OF = dict(zip(_m[_m['제품코드'] != '']['품목기준코드'],
                   _m[_m['제품코드'] != '']['제품코드']))

print('종류별 품목 수')
for label, _ in FLAG_FILES:
    n = sum(1 for g in FLAGS.values() if label in g)
    named = sum(1 for s, g in FLAGS.items() if label in g and s in NAME_OF)
    print(f'  {label:<12} {n:>6,}개   이름 확인되는 것 {named:,}개')

for label, _ in FLAG_FILES:
    pick = next(((s, g[label]) for s, g in FLAGS.items()
                 if label in g and s in NAME_OF), None)
    print('=' * 60)
    if not pick:
        print(f'[{label}]  표본 없음')
        continue
    seq, info = pick
    med = {'name': NAME_OF[seq]}
    if seq in CODE_OF:
        med['product_code'] = CODE_OF[seq]

    print(f'[{label}]  {med["name"][:34]}')
    for a in check([med])['alerts']:
        for d in a['drugs']:
            line = d['detail'] or f'{d["ingr"]} · {d["cls"]}'
            print(f'  ▶ {a["type"]:<12} {line[:50]}')