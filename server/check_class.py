"""약효분류 목록 — 1회용"""
from app.services.pill import PILL

pair = PILL.groupby(['CLASS_NO', 'CLASS_NAME']).size().sort_values(ascending=False)

print(f'\n분류 {len(pair)}종 · 상위 80개\n')
print(f'{"건수":>7}  {"번호":<8}  분류명')
print('─' * 60)
for (no, name), n in pair.head(80).items():
    print(f'{n:>7,}  {no:<8}  {name}')

covered = pair.head(80).sum()
print(f'\n상위 80개가 전체의 {covered / len(PILL) * 100:.1f}%')
print(f'분류번호가 빈 것: {(PILL["CLASS_NO"] == "").sum():,}건')