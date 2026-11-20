"""처방 문서 머리말 추출 — 병원·의사·처방일.

약봉투와 처방전 모두에서 쓴다. 진단명은 문서에 질병분류기호(예: E118)만
찍히고 병명 자체가 없는 경우가 대부분이라 뽑지 않는다. 사용자 입력으로 둔다.
"""
import re

# 의료기관 이름이 끝나는 말 (약국은 조제한 곳이지 처방한 곳이 아니라 뺀다)
ORG_SUFFIX = ('병원', '의원', '의료원', '한의원', '치과', '보건소', '보건지소')

# 사람 이름으로 볼 모양 — 한글 2~4자
PERSON = re.compile(r'^[가-힣]{2,4}$')

# '김종욱/의사 정형외과1'
DOCTOR_SLASH = re.compile(r'([가-힣]{2,4})\s*/\s*의사')

# '2025-06-02' · '2026년01월31일' · '2026.5.14'
DATE = re.compile(r'(20\d{2})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})')

# 처방일 라벨 — 앞쪽일수록 우선
DATE_LABEL = ('조제일자', '조제일', '발급연월일', '교부일자', '처방일')

# 날짜가 있어도 처방일이 아닌 줄
DATE_SKIP = ('최근내방일', '복약만료일', '양도양수', '허가일')

WINDOW = 2   # 라벨 줄에서 위아래 몇 줄까지 날짜를 찾을지


def _org_and_doctor(t: str):
    """'정안의료재단중앙병원 이진성' → ('정안의료재단중앙병원', '이진성')"""
    t = str(t).strip()
    if ':' in t:
        t = t.rsplit(':', 1)[1].strip()
    if not (3 <= len(t) <= 40):
        return None, None

    parts = t.split()
    if len(parts) >= 2 and PERSON.match(parts[-1]):
        org = ' '.join(parts[:-1])
        if org.endswith(ORG_SUFFIX):
            return org, parts[-1]

    t = t.replace(' ', '')
    if t.endswith(ORG_SUFFIX):
        return t, None
    return None, None


def _find_date(texts):
    n = len(texts)

    for label in DATE_LABEL:
        for i, t in enumerate(texts):
            if label not in str(t):
                continue
            for j in range(max(0, i - WINDOW), min(n, i + WINDOW + 1)):
                s = str(texts[j])
                if any(w in s for w in DATE_SKIP):
                    continue
                m = DATE.search(s)
                if m:
                    return f'{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}'

    # 라벨을 못 찾으면 문서에서 처음 나오는 날짜
    for t in texts:
        s = str(t)
        if any(w in s for w in DATE_SKIP):
            continue
        m = DATE.search(s)
        if m:
            return f'{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}'
    return None


def extract_meta(texts: list[str]) -> dict:
    """{hospital, doctor, issued_at} — 못 찾은 항목은 None"""
    hospital = doctor = None
    for t in texts:
        org, who = _org_and_doctor(t)
        if org:
            hospital, doctor = org, who
            break

    if doctor is None:
        for t in texts:
            m = DOCTOR_SLASH.search(str(t))
            if m:
                doctor = m.group(1)
                break

    return {'hospital': hospital, 'doctor': doctor, 'issued_at': _find_date(texts)}