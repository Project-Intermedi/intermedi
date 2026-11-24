"""의약품 상세정보 조회 — 허가정보 SQLite(data/drug_info.db)

약가마스터의 3단계 코드 조회(제품코드 → 대표코드 복원 → 표준코드 복원)를
그대로 써서 품목기준코드를 얻고, 그 코드로 허가정보를 꺼낸다.
전체를 메모리에 올리지 않고 조회할 때마다 읽는다.
"""
import sqlite3

from app.core.config import DRUG_DB
from app.services.match import MED


def _seq_index(col):
    sub = MED[(MED[col] != '') & (MED['품목기준코드'] != '')].drop_duplicates(col)
    return dict(zip(sub[col], sub['품목기준코드']))


# match.py 의 CODE_TIERS 와 같은 순서 — 결과만 품목기준코드
SEQ_TIERS = (
    ('코드일치', _seq_index('제품코드')),
    ('대표코드', _seq_index('코드_대표복원')),
    ('포장코드', _seq_index('코드_표준복원')),
)

_n = MED[MED['품목기준코드'] != ''].drop_duplicates('한글상품명')
SEQ_BY_NAME = dict(zip(_n['한글상품명'], _n['품목기준코드']))

print('상세정보 조회표 — ' + ' / '.join(f'{s} {len(t):,}종' for s, t in SEQ_TIERS))


def available() -> bool:
    return DRUG_DB.exists()


def _conn():
    con = sqlite3.connect(f'file:{DRUG_DB}?mode=ro', uri=True)
    con.row_factory = sqlite3.Row
    return con


def _candidates(code, name):
    """(품목기준코드, 찾은 경로) 후보를 순서대로"""
    c = (code or '').strip()
    if c:
        for stage, tbl in SEQ_TIERS:
            if c in tbl:
                yield tbl[c], stage
        yield c, '품목기준코드'
    n = (name or '').strip()
    if n and n in SEQ_BY_NAME:
        yield SEQ_BY_NAME[n], '상품명'


def find(code: str | None = None, name: str | None = None):
    if not available():
        return None, None

    con = _conn()
    try:
        seen = set()
        for seq, stage in _candidates(code, name):
            if seq in seen:
                continue
            seen.add(seq)
            r = con.execute('SELECT * FROM drug_info WHERE item_seq=?', (seq,)).fetchone()
            if r:
                return dict(r), stage
        n = (name or '').strip()
        if n:
            r = con.execute('SELECT * FROM drug_info WHERE item_name LIKE ? LIMIT 1',
                            (f'%{n}%',)).fetchone()
            if r:
                return dict(r), '이름부분일치'
    finally:
        con.close()
    return None, None


def _drop_empty(d):
    return {k: v for k, v in d.items() if v}


def _paras(text):
    """긴 본문을 문단 배열로 — 소제목 기호(■)는 뗀다"""
    out = []
    for line in (text or '').split('\n'):
        line = line.lstrip('■○ \t').strip()
        if line:
            out.append(line)
    return out


def detail(code: str | None = None, name: str | None = None):
    """화면 탭 구조에 맞춘 형태 — 빈 항목은 넣지 않는다"""
    r, stage = find(code, name)
    if not r:
        return None

    easy = (r['easy'] or '').strip()
    eff = _paras(r['efficacy'])
    summary = easy or (eff[0] if eff else '')

    return {
        'item_seq': r['item_seq'],
        'name': r['item_name'],
        'entp': r['entp_name'],
        'etc_otc': r['etc_otc'],
        'lookup_stage': stage,
        'atc': (r['atc'] or '').strip(),
        'summary': summary,
        'summary_is_rule': bool(easy),
        'basic': _drop_empty({'efficacy': eff, 'material': _paras(r['material'])}),
        'dosage': _drop_empty({'usage': _paras(r['dosage']),
                               'storage': _paras(r['storage']),
                               'valid_term': (r['valid_term'] or '').strip()}),
        'caution': _drop_empty({'warn': _paras(r['warn']), 'contra': _paras(r['contra']),
                                'adverse': _paras(r['adverse']),
                                'pregnancy': _paras(r['pregnancy']),
                                'child': _paras(r['child']),
                                'elderly': _paras(r['elderly'])}),
        'source': '식품의약품안전처 의약품 제품 허가정보',
    }
