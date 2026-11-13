"""낱알 식별 검색 엔드포인트"""
from fastapi import APIRouter, Query

from app.services import pill

router = APIRouter(prefix='/pills')


def _cond(name, front, back, shapes, colors, form, line, entp, category):
    return {
        'name': name, 'front': front, 'back': back,
        'shapes': shapes, 'colors': colors,
        'form': form, 'line': line, 'entp': entp,
        'category': category,
    }


@router.get('/search')
def search(
    name: str | None = None,
    front: str | None = None,
    back: str | None = None,
    shapes: list[str] | None = Query(None),
    colors: list[str] | None = Query(None),
    form: str | None = None,
    line: str | None = None,
    entp: str | None = None,
    category: str | None = None,
    limit: int = 50,
):
    return pill.search(
        limit=limit,
        **_cond(name, front, back, shapes, colors, form, line, entp, category))


@router.get('/count')
def count(
    name: str | None = None,
    front: str | None = None,
    back: str | None = None,
    shapes: list[str] | None = Query(None),
    colors: list[str] | None = Query(None),
    form: str | None = None,
    line: str | None = None,
    entp: str | None = None,
    category: str | None = None,
):
    return pill.count(
        **_cond(name, front, back, shapes, colors, form, line, entp, category))


@router.get('/options')
def options():
    return pill.options()