"""낱알식별 데이터 — 적재와 전처리

CSV 원본을 그대로 쓰지 않고 검색에 쓸 형태로 한 번 정리해서 메모리에 올린다.
서버 켤 때 1회 실행된다.
"""
import re

import pandas as pd

from app.core.config import find_csv
from collections import Counter


# 색이 아니라 농도 표현이라 버린다
COLOR_MODIFIER = {'진한', '옅은'}

# 제형 앞머리로 캡슐을 가른다
FORM_HARD = ('경질캡슐제', '서방성캡슐제')
FORM_SOFT = ('연질캡슐제',)

TAIL_PAREN = re.compile(r'\([^)]*\)\s*$')
SPACES = re.compile(r'\s+')
NOT_MARK = re.compile(r'십자분할선|분할선|마크')   # 각인이 아니라 구조 표시


def _colors(row):
    """앞면·뒷면 색 칸을 쉼표로 쪼개 기본 색 집합으로 만든다"""
    out = set()
    for cell in (row['COLOR_CLASS1'], row['COLOR_CLASS2']):
        for t in str(cell).split(','):
            t = t.strip()
            if t and t not in COLOR_MODIFIER:
                out.add(t)
    return out


def _line(row):
    """분할선 앞·뒤를 화면 선택지 하나로 묶는다. 위에서부터 먼저 맞는 것"""
    f = str(row['LINE_FRONT']).strip()
    b = str(row['LINE_BACK']).strip()
    if '기타' in (f, b):
        return '기타'
    if f == '+' and b == '+':
        return '양쪽 십자'
    if '+' in (f, b):
        return '한쪽 십자'
    if f == '-' and b == '-':
        return '양쪽 한 줄'
    if '-' in (f, b):
        return '한쪽 한 줄'
    return '없음'


def _form(name):
    """세분화된 제형명을 화면의 4분류로 묶는다"""
    name = str(name).strip()
    if name.startswith(FORM_HARD):
        return '경질캡슐'
    if name.startswith(FORM_SOFT):
        return '연질캡슐'
    # '추어블정(저작정)' 처럼 뒤에 괄호가 붙은 경우를 떼고 본다
    if TAIL_PAREN.sub('', name).strip().endswith('정'):
        return '정제'
    return '기타'


def _mark(s):
    """각인 비교용 — '분할선' 표기를 빼고, 공백 제거하고 대문자로"""
    return SPACES.sub('', NOT_MARK.sub('', str(s))).upper()


def _load():
    df = pd.read_csv(find_csv('낱알식별'), dtype=str,
                     encoding='utf-8-sig', low_memory=False).fillna('')

    df['색'] = df.apply(_colors, axis=1)
    df['분할선'] = df.apply(_line, axis=1)
    df['제형'] = df['FORM_CODE_NAME'].map(_form)
    df['앞각인'] = df['PRINT_FRONT'].map(_mark)
    df['뒷각인'] = df['PRINT_BACK'].map(_mark)
    return df


PILL = _load()
print(f'낱알식별 적재 완료 — {len(PILL):,}건')

# ── 검색 ─────────────────────────────────────────────────
CONDITION_LABEL = {
    'name': '약품명', 'front': '앞면 각인', 'back': '뒷면 각인',
    'shapes': '모양', 'colors': '색상', 'form': '제형',
    'line': '분할선', 'entp': '제조사',
}


def _row(r):
    return {
        'item_seq': r['ITEM_SEQ'],
        'name': r['ITEM_NAME'],
        'entp': r['ENTP_NAME'],
        'image': r['ITEM_IMAGE'],
        'shape': r['DRUG_SHAPE'],
        'colors': sorted(r['색']),
        'line': r['분할선'],
        'form': r['제형'],
        'print_front': r['PRINT_FRONT'],
        'print_back': r['PRINT_BACK'],
        'class_name': r['CLASS_NAME'],
        'etc_otc': r['ETC_OTC_NAME'],
    }


def _has(col, text):
    return PILL[col].str.contains(re.escape(text), case=False, na=False)


def _mask(name=None, front=None, back=None, shapes=None, colors=None,
          form=None, line=None, entp=None):
    """조건에 맞는 행을 True로 표시한다. 빈 조건은 무시한다."""
    m = pd.Series(True, index=PILL.index)

    if name:
        m &= _has('ITEM_NAME', name)
    if entp:
        m &= _has('ENTP_NAME', entp)

    # 각인 — 사용자가 어느 쪽을 앞으로 넣든 상관없게 양방향으로 본다
    f = _mark(front) if front else ''
    b = _mark(back) if back else ''
    if f and b:
        m &= ((_has('앞각인', f) & _has('뒷각인', b)) |
              (_has('앞각인', b) & _has('뒷각인', f)))
    elif f or b:
        one = f or b
        m &= (_has('앞각인', one) | _has('뒷각인', one))

    if shapes:
        m &= PILL['DRUG_SHAPE'].isin(shapes)
    if form:
        m &= PILL['제형'] == form
    if line:
        m &= PILL['분할선'] == line

    want = set(colors or ())
    if want:
        # 고른 색을 모두 가진 약만. 한 색만 골랐으면 앞뒤 어디든 있으면 통과
        m &= PILL['색'].map(lambda s: want <= s)

    return m


def search(limit=50, **cond):
    """조건에 맞는 낱알 목록"""
    hit = PILL[_mask(**cond)]

    f = _mark(cond['front']) if cond.get('front') else ''
    if len(hit) and f:
        # 각인이 정확히 일치하는 약을 위로 올린다
        score = ((hit['앞각인'] == f) | (hit['뒷각인'] == f)).astype(int)
        hit = hit.loc[score.sort_values(ascending=False, kind='stable').index]

    return {
        'total': int(len(hit)),
        'items': [_row(r) for _, r in hit.head(limit).iterrows()],
    }


def count(**cond):
    """건수만 센다. 0건이면 조건을 하나씩 뺐을 때의 건수도 같이 준다"""
    total = int(_mask(**cond).sum())

    relaxed = []
    if total == 0:
        for k, v in cond.items():
            if not v:
                continue
            rest = {kk: vv for kk, vv in cond.items() if kk != k}
            n = int(_mask(**rest).sum())
            if n:
                relaxed.append({'drop': k, 'label': CONDITION_LABEL.get(k, k),
                                'total': n})
        relaxed.sort(key=lambda x: x['total'])

    return {'total': total, 'relaxed': relaxed}


def options():
    """화면에 띄울 선택지와 각 건수"""
    def vc(series, skip=()):
        return [{'value': k, 'count': int(v)}
                for k, v in series.value_counts().items()
                if k and k not in skip]

    color_count = Counter()
    for s in PILL['색']:
        color_count.update(s)

    return {
        'shapes': vc(PILL['DRUG_SHAPE']),
        'forms': vc(PILL['제형']),
        'lines': vc(PILL['분할선'], skip=('기타',)),
        'colors': [{'value': k, 'count': n}
                   for k, n in color_count.most_common()],
    }