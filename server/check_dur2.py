"""OCR 이름 → 매칭 → 품목기준코드 → DUR 판정 (실제 흐름 그대로)"""
from app.services.match import MED, match_names
from app.services.dur import check

ok = MED[MED['제품코드'] != '']
has = ok[ok['품목기준코드'] != '']
print(f'약가마스터 제품코드 보유 {len(ok):,}행 중 '
      f'품목기준코드도 있음 {len(has):,}행 ({len(has)/len(ok)*100:.1f}%)')
print('=' * 60)

CASES = [
    ('금기 조합', ['스포라녹스캡슐', '조코정20밀리그람']),
    ('흔한 처방', ['록소프로펜나트륨정60mg', '레바미피드정100mg',
                   '세티리진염산염정10mg']),
]

for label, texts in CASES:
    meds = match_names(texts)
    print(f'[{label}]')
    for m in meds:
        print(f'  {m.get("name", "?"):<28} 제품코드 {m.get("product_code") or "없음"}'
              f'   {m.get("how", "")}')
    r = check(meds)
    for c in r['combo']:
        print(f'  ▶ 병용금기  {c["drug_a"]} × {c["drug_b"]}')
        print(f'              {c["ingr_a"]} × {c["ingr_b"]} — {c["reason"][:40]}')
    for d in r['duplicate']:
        print(f'  ▶ 효능군중복  {d["effect"]}  {d["drugs"]}')
    if not r['combo'] and not r['duplicate']:
        print('  (걸리는 것 없음)')
    print('-' * 60)