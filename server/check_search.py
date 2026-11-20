"""검색 함수 검증 — 1회용"""
from app.services.pill import PILL, search


def show(title, **kw):
    r = search(**kw, limit=3)
    print(f'\n── {title} ' + '─' * max(0, 42 - len(title)))
    print(f'   {r["total"]:,}건')
    for it in r['items']:
        print(f"   · {it['name'][:28]:30} {it['shape']:5} "
              f"{'/'.join(it['colors']):12} {it['print_front']}|{it['print_back']}")


# 데이터에 실제로 있는 앞뒤 각인 한 쌍을 꺼내 양방향을 확인한다
both = PILL[(PILL['앞각인'] != '') & (PILL['뒷각인'] != '')].iloc[0]
a, b = both['앞각인'], both['뒷각인']
print(f'\n양방향 검사용 각인 — 앞 {a!r} · 뒤 {b!r}')
n1 = search(front=a, back=b)['total']
n2 = search(front=b, back=a)['total']
print(f'  바로 입력  {n1}건')
print(f'  뒤집어 입력 {n2}건')
print('  ' + ('일치' if n1 == n2 and n1 > 0 else '← 확인 필요'))

show('각인 앞 VT', front='VT')
show('하양 원형 정제', colors=['하양'], shapes=['원형'], form='정제')
show('빨강+하양 (AND)', colors=['빨강', '하양'])
show('빨강+하양+장방형', colors=['빨강', '하양'], shapes=['장방형'])
show('한쪽 한 줄 + 타원형', line='한쪽 한 줄', shapes=['타원형'])
show('경질캡슐 + 장방형', form='경질캡슐', shapes=['장방형'])