"""스포라녹스·조코가 어디서 끊기는지 확인"""
from app.services.dur import SEQ_OF, SEQ_BY_NAME, ITEM_INGR, INGR_NAME, _seq
from app.services.match import MED, match_names

for text in ['스포라녹스캡슐', '조코정20밀리그람']:
    meds = match_names([text])
    print('=' * 58)
    for m in meds:
        name = m.get('name', '')
        print(f'매칭 이름   {name!r}')
        print(f'제품코드    {m.get("product_code") or "없음"}')
        print(f'상품명 조회  {SEQ_BY_NAME.get(name) or "실패"}')
        seq = _seq(m)
        print(f'_seq() 결과 {seq or "빈 값"}')
        if seq:
            print(f'성분 매핑    {ITEM_INGR.get(seq) or "ITEM_INGR 에 없음"}')

        # 약가마스터 원본 행 보기
        hit = MED[MED['한글상품명'] == name]
        print(f'약가마스터 {len(hit)}행')
        for _, r in hit.head(3).iterrows():
            print(f'   규격 {r["약품규격"][:12]:<14} '
                  f'제품코드 {r["제품코드"] or "-":<10} '
                  f'품목기준코드 {r["품목기준코드"] or "-"}')

# 이트라코나졸 성분을 가진 품목이 ITEM_INGR 에 몇 개나 있는지
print('=' * 58)
code = [c for c, n in INGR_NAME.items() if n == '이트라코나졸']
print(f'이트라코나졸 성분코드 {code}')
if code:
    owns = [s for s, cs in ITEM_INGR.items() if code[0] in cs]
    print(f'그 성분을 가진 품목 {len(owns)}개   예: {owns[:5]}')