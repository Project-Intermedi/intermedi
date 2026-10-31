"""약가마스터 매칭 — 노트북 로직 이식"""
import re
import unicodedata

import numpy as np
import pandas as pd
from rapidfuzz import distance, process

from app.core.config import DATA_DIR
from app.services.dosage import extract_dosage

# ── 정규화 규칙 ──────────────────────────────────────────
LEAD_SYM = re.compile(r'^[*©®※·∙:：\s]+')
LEAD_PAREN = re.compile(r'^\([^)]*\)')
PREFIX_MARK = re.compile(r'^[^(]{0,2}\)')
FIRST_PAREN = re.compile(r'\(.*$', re.S)
TAIL_JUNK = re.compile(r'[,.·;:_\s]+$')
DOSE_TAIL = re.compile(
    r'\s*\d+(?:\.\d+)?(?:\s*/\s*\d+(?:\.\d+)?)*\s*'
    r'(?:밀리그램|밀리그람|일리그램|미리그램|밀리그|밀리|mcg|μg|µg|㎍|mg|㎎|IU|ml|㎖|g|%)?\s*$')

SUFFIX = ('정', '캡슐', '캡슬', '시럽', '산', '과립', '연고', '크림', '겔', '좌제', '패치')
NOISE = ('금액', '총액', '합계', '부담금', '영수증', '계산서', '급여', '가산',
         '조제약', '신분확인', '사업자', '승인번호', '1일')
COLOR = ('흰색', '하양', '백색', '노란색', '노랑', '분홍', '연분홍', '녹색', '녹샘',
         '초록', '황색', '담황색', '적갈색', '주황색', '갈색', '파랑', '연두',
         '회색', '청색', '자색')
SHAPE = ('원형', '타원형', '장방형', '삼각형', '마름모', '팔각형', '오각형', '캡슐형')
FORM_ONLY = {'서방정', '장용정', '설하정', '필름코팅정', '당의정', '나정',
             '구강붕해정', '구강봉해정', '정제', '산제'}
TYPO = {'캅셀': '캡슐'}


def core(t: str) -> str:
    t = unicodedata.normalize('NFKC', str(t).strip())
    for w, c in TYPO.items():
        t = t.replace(w, c)
    t = LEAD_SYM.sub('', t)
    t = LEAD_PAREN.sub('', t)
    t = PREFIX_MARK.sub('', t)
    t = FIRST_PAREN.sub('', t)
    t = TAIL_JUNK.sub('', t)
    prev = None
    while prev != t:
        prev = t
        t = TAIL_JUNK.sub('', DOSE_TAIL.sub('', t))
    return unicodedata.normalize('NFC', t).replace(' ', '')


def is_drug(t: str) -> bool:
    t = str(t).strip()
    if not (3 <= len(t) <= 60):
        return False
    if any(w in t for w in NOISE):
        return False
    if any(c in t for c in COLOR) or any(s in t for s in SHAPE):
        return False
    c = core(t)
    if c in FORM_ONLY:
        return False
    for sfx in SUFFIX:
        if c.endswith(sfx):
            stem = c[:-len(sfx)]
            if len(re.findall(r'[가-힣A-Za-z]', stem)) >= 2:
                return True
    return False


# ── 용량 추출 ────────────────────────────────────────────
DOSE_UNIT = re.compile(
    r'((?:\d+(?:\.\d+)?)(?:\s*/\s*\d+(?:\.\d+)?)*)\s*'
    r'(?:밀리그램|밀리그람|일리그램|미리그램|밀리그|밀리|mcg|μg|µg|㎍|mg|㎎|IU|ml|㎖|g)')
NUM = re.compile(r'\d+(?:\.\d+)?')


def doses(texts) -> set:
    out = set()
    for t in texts:
        for m in DOSE_UNIT.finditer(str(t)):
            out |= set(NUM.findall(m.group(1)))
    return out


# ── 약가마스터 적재 (서버 켤 때 1회) ─────────────────────
def _load_master():
    files = sorted(DATA_DIR.glob('*.csv'))
    if not files:
        raise FileNotFoundError(f'{DATA_DIR} 안에 csv가 없습니다')

    df = None
    for enc in ('cp949', 'utf-8-sig', 'euc-kr'):
        try:
            df = pd.read_csv(files[0], dtype=str, encoding=enc, low_memory=False)
            break
        except UnicodeDecodeError:
            continue
    if df is None:
        raise RuntimeError('CSV 인코딩 판별 실패')

    df = df.fillna('')
    med = df[df['전문일반구분'].isin(['전문의약품', '일반의약품'])].copy()
    c = med['제품코드(개정후)'].str.strip()
    med['제품코드'] = c.where(c == '', c.str.zfill(9))
    med['매칭키'] = med['한글상품명'].map(core)
    med = med[med['매칭키'] != '']
    return med.drop_duplicates(subset=['매칭키', '약품규격'])


CAND = _load_master()
KEYS = sorted(CAND['매칭키'].unique())
KEY_SET = set(KEYS)
print(f'약가마스터 적재 완료 — 매칭키 {len(KEYS):,}종 / {len(CAND):,}행')


def _row_doses(r):
    return doses([r['약품규격'], r['한글상품명']])


# ── 매칭 ─────────────────────────────────────────────────
def match_names(texts: list[str]) -> list[dict]:
    raw = {}
    for t in texts:
        if is_drug(t):
            raw.setdefault(core(t), []).append(t)
    if not raw:
        return []

    dose_map = extract_dosage(texts, is_drug, core)

    keys = sorted(raw)
    unknown = [k for k in keys if k not in KEY_SET]
    dist = None
    if unknown:
        dist = process.cdist(unknown, KEYS,
                             scorer=distance.Levenshtein.distance, workers=-1)
    pos = {k: i for i, k in enumerate(unknown)}

    blank = {'dose_once': None, 'times_per_day': None,
             'total_days': None, 'usage': None}

    results = []
    for k in keys:
        d_ocr = doses(raw[k])
        dose = {**blank, **dose_map.get(k, {})}

        if k in KEY_SET:
            tops, best = [k], 0
        else:
            row = dist[pos[k]]
            best = int(row.min())
            if best > 2:
                results.append({
                    'name': k,
                    'product_code': None,
                    'matched': False,
                    'raw_text': raw[k][0],
                    'match_stage': '실패',
                    'distance': best,
                    **dose,
                })
                continue
            tops = [KEYS[i] for i in np.where(row == best)[0]]

        sub = CAND[CAND['매칭키'].isin(tops)]

        if d_ocr:
            keep = sub.apply(lambda r: bool(_row_doses(r) & d_ocr), axis=1)
            if keep.any():
                sub = sub[keep]

        pick = sub.copy()
        pick['_code'] = (pick['제품코드'] != '').astype(int)
        pick['_len'] = pick['한글상품명'].str.len()
        pick = pick.sort_values(['_code', '_len'], ascending=[False, True])
        top = pick.iloc[0]

        results.append({
            'name': top['한글상품명'],
            'product_code': top['제품코드'] or None,
            'matched': True,
            'raw_text': raw[k][0],
            'match_stage': '정확일치' if best == 0 else '유사도확정',
            'distance': best,
            **dose,
        })

    merged = {}
    for r in results:
        key = r['name'] if r['matched'] else f"__{r['name']}"
        if key not in merged:
            merged[key] = r
            continue
        # 같은 약이 두 번 읽힌 경우 — 비어 있는 복용법만 채운다
        cur = merged[key]
        for f in blank:
            if cur[f] is None and r[f] is not None:
                cur[f] = r[f]
    return list(merged.values())