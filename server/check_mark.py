"""각인 칸에 섞인 한글 단어 확인 — 1회용"""
import re
from collections import Counter

from app.services.pill import PILL

KO = re.compile(r'[가-힣]+')

c = Counter()
for col in ('PRINT_FRONT', 'PRINT_BACK'):
    for s in PILL[col]:
        c.update(KO.findall(str(s)))

print('\n── 각인 칸에 들어 있는 한글 ' + '─' * 24)
for word, n in c.most_common(20):
    print(f'  {word:12} {n:>6,}')

print('\n── 정리 후 각인 보유율 ' + '─' * 28)
print(f"  앞면  {(PILL['앞각인'] != '').mean() * 100:5.1f}%")
print(f"  뒷면  {(PILL['뒷각인'] != '').mean() * 100:5.1f}%")