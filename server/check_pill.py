"""낱알식별 전처리 검증 — 1회용"""
from app.services.pill import PILL

print()
print('── 분할선 ' + '─' * 40)
print(PILL['분할선'].value_counts().to_string())

print('\n── 제형 ' + '─' * 42)
print(PILL['제형'].value_counts().to_string())

print('\n── 색 추출 예시 ' + '─' * 34)
for _, r in PILL.head(8).iterrows():
    both = f"{r['COLOR_CLASS1']!r} + {r['COLOR_CLASS2']!r}"
    print(f"  {both:34} → {sorted(r['색'])}")

print('\n── 각인 정리 예시 ' + '─' * 32)
got = PILL[PILL['뒷각인'] != ''].head(5)
for _, r in got.iterrows():
    print(f"  {r['PRINT_FRONT']!r} / {r['PRINT_BACK']!r}"
          f"  →  {r['앞각인']!r} / {r['뒷각인']!r}")