"""DUR 안전성 판정 — 병용금기 · 효능군중복 · 품목 단위 주의"""
from collections import defaultdict

import pandas as pd
import re

from app.core.config import find_csv
from app.services.match import MED, spec_of
from app.services.plain import GUIDE, age_guide, age_of, plain


def _read(keyword):
    return pd.read_csv(find_csv(keyword), dtype=str,
                       encoding='utf-8-sig', low_memory=False).fillna('')

_DOT = re.compile(r'\.(?=[가-힣A-Za-z])')

def _clean(s):
    """따옴표 벗기고 마침표 뒤 띄우기"""
    return _DOT.sub('. ', (s or '').strip().strip('"').strip())


# 제품코드 → 품목기준코드
_m = MED[(MED['제품코드'] != '') & (MED['품목기준코드'] != '')]
SEQ_OF = dict(zip(_m['제품코드'], _m['품목기준코드']))

# 상품명 → 품목기준코드 (제품코드가 빈 품목 대비)
_n = MED[MED['품목기준코드'] != '']
SEQ_BY_NAME = dict(zip(_n['한글상품명'], _n['품목기준코드']))

# 품목기준코드 → {성분코드}, 성분코드 → 성분명
_pi = _read('병용금기_20261116_품목성분')
ITEM_INGR = defaultdict(set)
INGR_NAME = {}
for seq, code, name in zip(_pi['품목기준코드'], _pi['성분코드'], _pi['성분명']):
    ITEM_INGR[seq].add(code)
    INGR_NAME.setdefault(code, name)

# (성분코드A, 성분코드B) → 금기사유
_pr = _read('병용금기_20261116_성분쌍')
PAIRS = {(a, b): _clean(why) for a, b, why
         in zip(_pr['성분코드A'], _pr['성분코드B'], _pr['금기사유'])}

# 품목기준코드 → {효능군명}
_ef = _read('DUR효능군중복')
EFFECT = defaultdict(set)
for seq, eff in zip(_ef['ITEM_SEQ'], _ef['EFFECT_NAME']):
    if eff:
        EFFECT[seq].add(eff)


# ── 품목 단위 주의 ──────────────────────────────────
SKIP_DOSE = {'모든 제형', '역가'}        # 용량이 아니라 조건만 적힌 맹탕

FLAG_FILES = (
    ('임부금기', 'DUR임부금기'),
    ('특정연령대금기', 'DUR특정연령대금기'),
    ('고령자주의', 'DUR노인주의'),
    ('용량주의', 'DUR용량주의'),
    ('분할주의', 'DUR서방정분할주의'),
)

FLAGS = defaultdict(dict)   # 품목기준코드 → {종류: {detail, ingr, cls}}

for _label, _key in FLAG_FILES:
    _df = _read(_key)
    _blank = [''] * len(_df)
    for _seq_, _why, _ingr, _cls in zip(
            _df['ITEM_SEQ'],
            _df['PROHBT_CONTENT'] if 'PROHBT_CONTENT' in _df else _blank,
            _df['INGR_NAME'] if 'INGR_NAME' in _df else _blank,
            _df['CLASS_NAME'] if 'CLASS_NAME' in _df else _blank):

        _why = _clean(_why)
        if _label == '용량주의':
            if not _why or _why in SKIP_DOSE:
                continue                  # 띄울 용량이 없으면 건너뜀
        cur = FLAGS[_seq_].setdefault(_label,
                                      {'detail': '', 'ingr': '', 'cls': ''})
        if _why and not cur['detail']:
            cur['detail'] = _why
        if _ingr and not cur['ingr']:
            cur['ingr'] = _ingr.strip()
        if _cls and not cur['cls']:
            cur['cls'] = _cls.strip()


def _seq(med):
    """등록 약 하나에서 품목기준코드 꺼내기 — 제품코드 우선, 없으면 상품명"""
    code = (med.get('product_code') or '').strip()
    if code and code in SEQ_OF:
        return SEQ_OF[code]
    return SEQ_BY_NAME.get((med.get('name') or '').strip(), '')


def _who(m):
    """화면에 띄울 약 한 줄 — 규격과 어느 병원 처방인지 같이"""
    return {'name': m.get('name', ''),
            'spec': spec_of(m.get('product_code'), m.get('name')),
            'hospital': m.get('hospital') or '',
            'issued_at': (m.get('issued_at') or '')[:10]}


def combo(meds):
    """병용금기 — 두 약씩 짝지어 성분 쌍 대조"""
    out, seen = [], set()
    for i in range(len(meds)):
        for j in range(i + 1, len(meds)):
            s1, s2 = _seq(meds[i]), _seq(meds[j])
            if not s1 or not s2 or s1 == s2:
                continue
            for a in ITEM_INGR.get(s1, ()):
                for b in ITEM_INGR.get(s2, ()):
                    key = (a, b) if a <= b else (b, a)
                    if key not in PAIRS:
                        continue
                    tag = (s1, s2, key) if s1 <= s2 else (s2, s1, key)
                    if tag in seen:
                        continue
                    seen.add(tag)
                    out.append({
                        'a': _who(meds[i]),
                        'b': _who(meds[j]),
                        'ingr_a': INGR_NAME.get(a, ''),
                        'ingr_b': INGR_NAME.get(b, ''),
                        'reason': PAIRS[key],
                        'plain': plain(PAIRS[key]),
                    })
    return out


def duplicate(meds):
    """효능군중복 — 같은 효능군을 쓰는 약이 둘 이상인지"""
    bucket = defaultdict(list)
    for m in meds:
        for eff in EFFECT.get(_seq(m), ()):
            bucket[eff].append(m)

    out = []
    for eff, group in bucket.items():
        uniq, seen = [], set()
        for m in group:                       # 같은 처방 안의 같은 약은 한 번만
            k = (_seq(m), m.get('prescription_id'))
            if k in seen:
                continue
            seen.add(k)
            uniq.append(m)
        if len(uniq) < 2:
            continue
        out.append({
            'effect': eff,
            'same_drug': len({_seq(m) for m in uniq}) == 1,
            'drugs': [_who(m) for m in uniq],
        })
    return out


def _note(label, v):
    """약 칩 옆에 붙일 짧은 한마디"""
    if label == '특정연령대금기':
        return age_of(v['detail'])
    if label == '용량주의':
        return v['detail']
    return ''


def alerts(meds):
    """품목 단위 주의 — 종류별로, 한 약은 한 번만"""
    bucket, seen = defaultdict(list), defaultdict(set)
    for m in meds:
        seq = _seq(m)
        for label, v in FLAGS.get(seq, {}).items():
            if seq in seen[label]:
                continue
            seen[label].add(seq)
            bucket[label].append({**_who(m), **v, 'note': _note(label, v)})
    out = []
    for label, _ in FLAG_FILES:
        rows = bucket.get(label)
        if not rows:
            continue
        guide = GUIDE.get(label, '')
        if label == '특정연령대금기':
            guide = age_guide(r['note'] for r in rows)
        out.append({'type': label, 'guide': guide, 'drugs': rows})
    return out


def check(meds):
    return {'combo': combo(meds),
            'duplicate': duplicate(meds),
            'alerts': alerts(meds)}