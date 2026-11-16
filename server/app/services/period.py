"""복용 기간 판정 — records·safety가 같은 기준을 쓰도록 한 곳에 둔다"""
from datetime import date, timedelta

DEFAULT_DAYS = 14      # 투약일수를 모를 때 복용 중으로 볼 기간


def _span(row):
    """(시작일, 투약일수) — 못 읽으면 (None, 기본값)"""
    start = (row.get('issued_at') or row.get('created_at') or '')[:10]
    try:
        begin = date.fromisoformat(start)
    except ValueError:
        begin = None
    try:
        days = int(float(row.get('total_days') or 0))
    except (TypeError, ValueError):
        days = 0
    return begin, (days if days > 0 else DEFAULT_DAYS)


def taking(row, today=None):
    """처방일 + 투약일수가 아직 안 지났으면 True"""
    begin, days = _span(row)
    if begin is None:
        return True                    # 날짜를 못 읽으면 복용 중으로 본다
    return begin + timedelta(days=days) > (today or date.today())


def ends_on(row):
    """복용 종료 예정일 — 화면 표시용"""
    begin, days = _span(row)
    return '' if begin is None else (begin + timedelta(days=days)).isoformat()