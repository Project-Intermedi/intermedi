"""복용법 추출 — 약봉투 하단 투약 표에서 1회량·1일횟수·총일수·용법을 읽는다."""
import re

# '1.00 2 7' / '1.002 7' / '1.00 2' 처럼 한 줄에 몰려 나오는 투약 숫자
DOSE_ROW = re.compile(r'^(\d+\.\d{2}|\d{1,2})\s*(\d{1,2})\s*(\d{1,3})?\s*$')

# 문서 전체에 한 번 찍히는 총 투약일수 ('투약일수7')
TOTAL_DAYS_DOC = re.compile(r'투약\s*일수\s*[:：]?\s*(\d{1,3})')

# 복용 시점 — 이 중 하나는 반드시 있어야 용법으로 본다
# '아침·점심·저녁'은 시점이 아니라 시간대라서 이것만으로는 용법이 아니다
USAGE_TIMING = ('식전', '식후', '식간', '공복', '취침')

# 서로 못 쓰는 시점 — 둘 다 있으면 고르라고 인쇄된 보기다
USAGE_EXCLUSIVE = ('식전', '식후')

# 약봉투에 인쇄된 보기·안내 문구 — 실제 복용법이 아니다
USAGE_SKIP = ('·', '(', '<', '>', '①', '②', '③', '④',
              '매식사', '표시대로', '복용법', '시간마다', '의사지시', '마다', '씩')

def _is_usage(t: str) -> bool:
    t = str(t).strip()
    if not (3 <= len(t) <= 40):
        return False
    if any(s in t for s in USAGE_SKIP):
        return False
    if sum(w in t for w in USAGE_EXCLUSIVE) > 1:
        return False
    return any(w in t for w in USAGE_TIMING)

def extract_dosage(texts: list[str], is_drug, core) -> dict:
    """{정규화된 약품명: {dose_once, times_per_day, total_days, usage}}"""
    doc_days = None
    for t in texts:
        m = TOTAL_DAYS_DOC.search(str(t))
        if m:
            doc_days = m.group(1)
            break
    # 용법은 약봉투에 도장 하나로 찍히는 경우가 대부분이라 문서 단위로도 찾아둔다
    doc_usage = None
    for t in texts:
        if _is_usage(t):
            doc_usage = str(t).strip()
            break

    out = {}
    n = len(texts)
    for i, t in enumerate(texts):
        if not is_drug(t):
            continue

        # 약품명 다음 2줄 안에서 숫자 줄을 찾는다
        row = None
        j = i + 1
        while j < min(i + 3, n):
            if is_drug(texts[j]):
                break
            m = DOSE_ROW.match(str(texts[j]).strip())
            if m:
                row = m
                break
            j += 1
        if row is None:
            continue

        # 숫자 줄 다음 2줄 안에서 용법을 찾는다
        usage = None
        k = j + 1
        while k < min(j + 3, n):
            if is_drug(texts[k]) or DOSE_ROW.match(str(texts[k]).strip()):
                break
            if _is_usage(texts[k]):
                usage = str(texts[k]).strip()
                break
            k += 1

        out[core(t)] = {
            'dose_once': row.group(1),
            'times_per_day': row.group(2),
            'total_days': row.group(3) or doc_days,
            'usage': usage or doc_usage,
        }
    return out