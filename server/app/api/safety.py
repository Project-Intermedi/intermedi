"""안전성 검사 — 등록된 약 종합 판정"""
from datetime import date, timedelta

from fastapi import APIRouter

from app.models import db
from app.schemas.safety import SafetyIn, SafetyOut
from app.services import dur

router = APIRouter(prefix='/safety', tags=['safety'])

DEFAULT_DAYS = 14      # 투약일수를 모를 때 복용 중으로 볼 기간

SQL = """
SELECT m.name, m.product_code, m.total_days,
       p.id AS prescription_id, p.hospital, p.issued_at, p.created_at
FROM medicine m
JOIN prescription p ON p.id = m.prescription_id
ORDER BY p.id, m.id
"""


def _taking(rows, today):
    """처방일 + 투약일수가 아직 안 지난 약만"""
    out = []
    for r in rows:
        start = (r.get('issued_at') or r.get('created_at') or '')[:10]
        try:
            begin = date.fromisoformat(start)
        except ValueError:
            out.append(r)              # 날짜를 못 읽으면 일단 포함
            continue
        try:
            days = int(float(r.get('total_days') or 0))
        except ValueError:
            days = 0
        if days <= 0:
            days = DEFAULT_DAYS
        if begin + timedelta(days=days) > today:
            out.append(r)
    return out


@router.get('', response_model=SafetyOut)
def current(include_ended: bool = False):
    """등록된 약 중 복용 중인 것들을 종합 판정"""
    with db.conn() as c:
        meds = [dict(r) for r in c.execute(SQL).fetchall()]
    if not include_ended:
        meds = _taking(meds, date.today())
    return dur.check(meds)


@router.post('', response_model=SafetyOut)
def preview(body: SafetyIn):
    """등록 전 확인 화면용 — 앱이 들고 있는 목록으로 판정"""
    return dur.check([m.model_dump() for m in body.medicines])