"""낱알식별 — 품목기준코드로 알약 사진과 성상을 찾는다"""
import pandas as pd

from app.core.config import find_csv


def _load():
    p = find_csv('낱알')
    for enc in ('cp949', 'utf-8-sig', 'euc-kr'):
        try:
            df = pd.read_csv(p, dtype=str,
                             usecols=['ITEM_SEQ', 'ITEM_IMAGE', 'CHART'],
                             encoding=enc).fillna('')
            break
        except UnicodeDecodeError:
            continue
    else:
        raise RuntimeError('낱알 CSV 인코딩 판별 실패')

    df['ITEM_SEQ'] = df['ITEM_SEQ'].str.strip()
    df = df[df['ITEM_SEQ'] != ''].drop_duplicates('ITEM_SEQ')
    img = dict(zip(df['ITEM_SEQ'], df['ITEM_IMAGE'].str.strip()))
    chart = dict(zip(df['ITEM_SEQ'], df['CHART'].str.strip()))
    return img, chart


IMAGE, CHART = _load()
print(f'낱알 사진 {sum(1 for v in IMAGE.values() if v):,}건 적재')


def of(item_seq: str):
    """(사진 URL 또는 None, 성상 문자열)"""
    s = (item_seq or '').strip()
    return (IMAGE.get(s) or None), CHART.get(s, '')
