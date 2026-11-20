"""쉬운 말 분류가 제대로 되는지"""
from collections import Counter

from app.services.dur import PAIRS
from app.services.plain import plain, DEFAULT

rows = [(why, plain(why)) for why in set(PAIRS.values())]
done = [r for r in rows if r[1] != DEFAULT]

print(f'사유 {len(rows)}종 · 분류됨 {len(done)}종 '
      f'({len(done)/len(rows)*100:.0f}%)')
print('=' * 62)
for text, n in Counter(p for _, p in rows).most_common():
    print(f'[{n:>3}종] {text}')

print('=' * 62)
print('분류 안 된 것')
for why, p in rows:
    if p == DEFAULT:
        print(f'  {why[:60]}')