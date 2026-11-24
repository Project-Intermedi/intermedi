"""의약품 상세정보 엔드포인트 — 검색·복용 중 두 경로가 같은 화면을 쓴다"""
from datetime import date

from fastapi import APIRouter, HTTPException, Query

from app.api.safety import SQL, _taking
from app.models import db
from app.services import druginfo, dur, pillimage

router = APIRouter(prefix='/medicines')

UNIT = (('정제', '정'), ('캡슐', '캡슐'), ('시럽', 'mL'), ('액', 'mL'),
        ('과립', '포'), ('산제', '포'), ('주사', '앰플'))


NAME_UNIT = (('캡슐', '캡슐'), ('시럽', 'mL'), ('현탁액', 'mL'), ('주', '앰플'),
             ('과립', '포'), ('정', '정'))


def _unit(chart: str, name: str = '') -> str:
    for k, v in UNIT:                      # 낱알 모양 설명이 있으면 그걸 쓴다
        if k in (chart or ''):
            return v
    for k, v in NAME_UNIT:                 # 없으면 약 이름에서 제형을 읽는다
        if k in (name or ''):
            return v
    return ''


def _material(text: str) -> list[str]:
    """'성분명 : X|분량 : 1|단위 : mg' → 'X 1mg'"""
    out = []
    for block in (text or '').split('\n'):
        d = {}
        for part in block.split('|'):
            if ':' in part:
                k, v = part.split(':', 1)
                d[k.strip()] = v.strip()
        nm, amt, un = d.get('성분명'), d.get('분량'), d.get('단위', '')
        if nm:
            out.append(f'{nm} {amt}{un}'.strip() if amt else nm)
        elif block.strip():
            out.append(block.strip())
    return out


def _taken_row(medicine_id: int):
    with db.conn() as c:
        r = c.execute(
            'SELECT m.*, p.hospital, p.issued_at, p.created_at '
            'FROM medicine m JOIN prescription p ON p.id = m.prescription_id '
            'WHERE m.id = ?', (medicine_id,)).fetchone()
    return dict(r) if r else None


def _personal(name: str):
    """복용 중인 약 전체를 판정하고, 이 약에 걸린 것만 남긴다"""
    with db.conn() as c:
        meds = [dict(r) for r in c.execute(SQL).fetchall()]
    res = dur.check(_taking(meds, date.today()))

    combo = [x for x in res['combo']
             if name in (x['a']['name'], x['b']['name'])]
    dup = [x for x in res['duplicate']
           if any(d['name'] == name for d in x['drugs'])]
    alerts = []
    for a in res['alerts']:
        hit = [d for d in a['drugs'] if d['name'] == name]
        if hit:
            alerts.append({**a, 'drugs': hit})
    return {'combo': combo, 'duplicate': dup, 'alerts': alerts}


def _build(code: str | None, name: str | None, medicine_id: int | None):
    taken = _taken_row(medicine_id) if medicine_id else None
    if taken:
        # 등록된 약이 기준 — URL 코드보다 우선한다
        code = taken.get('product_code') or code
        name = taken.get('name') or name

    d = druginfo.detail(code=code, name=name)
    if not d:
        raise HTTPException(404, f'상세정보 없음 — {code or name}')

    image, chart = pillimage.of(d['item_seq'])
    basic = dict(d['basic'])
    if basic.get('material'):
        basic['material'] = _material('\n'.join(basic['material']))
    if chart:
        basic['chart'] = chart
    unit = _unit(chart, d['name'])

    label = d['dosage']
    if taken:
        dosage = {
            'source': 'prescription',
            'prescription': {
                'dose_once': f"{taken.get('dose_once') or ''}{unit}".strip(),
                'times_per_day': taken.get('times_per_day') or '',
                'usage': taken.get('usage') or '',
                'total_days': taken.get('total_days') or '',
                'hospital': taken.get('hospital') or '',
                'issued_at': (taken.get('issued_at') or '')[:10],
            },
            'label': label,
        }
    else:
        dosage = {'source': 'label', 'prescription': None, 'label': label}

    return {
        'item_seq': d['item_seq'],
        'name': d['name'],
        'entp': d['entp'],
        'etc_otc': d['etc_otc'],
        'atc': d['atc'],
        'image': image,
        'summary': d['summary'],
        'summary_is_rule': d['summary_is_rule'],
        'basic': basic,
        'dosage': dosage,
        'caution': {
            'personal': _personal(name or d['name']) if taken else
                        {'combo': [], 'duplicate': [], 'alerts': []},
            'label': d['caution'],
        },
        'source': d['source'],
    }


@router.get('')
def by_name(name: str = Query(..., description='약품명'),
            medicine_id: int | None = Query(None, description='등록된 약 id')):
    return _build(None, name, medicine_id)


@router.get('/{code}')
def by_code(code: str,
            name: str | None = Query(None, description='못 찾을 때 보조'),
            medicine_id: int | None = Query(None, description='등록된 약 id')):
    return _build(code, name, medicine_id)
