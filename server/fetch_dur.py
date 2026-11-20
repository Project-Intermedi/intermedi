"""DUR 품목정보 수집 — 1회용
   data/ 에 상세기능별로 CSV를 하나씩 저장한다.
"""
import csv
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import quote, unquote

import requests

BASE = 'https://apis.data.go.kr/1471000/DURPrdlstInfoService03'
DATA = Path(__file__).parent / 'data'
ROWS = 500      # 한 번에 받을 건수
SLEEP = 0.5     # 호출 간 간격 (초)
TRIES = 5       # 한 쪽당 시도 횟수

# 저장할 이름 → 상세기능
TARGETS = {
    # 받음 — 다시 받지 않기 (파일 덮어쓰기 방지)
    # 'DUR병용금기': 'getUsjntTabooInfoList03',
    # 'DUR효능군중복': 'getEfcyDplctInfoList03',
    # 'DUR서방정분할주의': 'getSeobangjeongPartitnAtentInfoList03',
    # 'DUR품목정보': 'getDurPrdlstInfoList03',

    'DUR임부금기': 'getPwnmTabooInfoList03',
    'DUR특정연령대금기': 'getSpcifyAgrdeTabooInfoList03',
    'DUR노인주의': 'getOdsnAtentInfoList03',
    'DUR용량주의': 'getCpctyAtentInfoList03',
    'DUR투여기간주의': 'getMdctnPdAtentInfoList03',
}

# 상세기능별로 저장할 컬럼. 안 적은 것은 전체 저장
KEEP = {
    'DUR병용금기': (
        'ITEM_SEQ', 'ITEM_NAME', 'INGR_CODE', 'INGR_KOR_NAME',
        'MIXTURE_ITEM_SEQ', 'MIXTURE_ITEM_NAME',
        'MIXTURE_INGR_CODE', 'MIXTURE_INGR_KOR_NAME',
        'TYPE_NAME', 'PROHBT_CONTENT',
    ),
}

def load_key():
    key = os.environ.get('DATA_GO_KR_API_KEY')
    if not key:
        env = Path(__file__).parent / '.env'
        if env.exists():
            for line in env.read_text(encoding='utf-8').splitlines():
                if line.startswith('DATA_GO_KR_API_KEY='):
                    key = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break
    if not key:
        sys.exit('.env 에 DATA_GO_KR_API_KEY 를 넣어주세요')
    return key


def key_forms(key):
    out, seen = [], set()
    for f in (key, unquote(key), quote(key, safe='')):
        if f not in seen:
            seen.add(f)
            out.append(f)
    return out


def call(key, op, page, tries=TRIES):
    """성공하면 (body, None), 실패하면 (None, 사유)"""
    url = (f'{BASE}/{op}?serviceKey={key}&pageNo={page}'
           f'&numOfRows={ROWS}&type=json')
    wait, err = 2, '알 수 없음'

    for t in range(1, tries + 1):
        try:
            r = requests.get(url, timeout=60)
            try:
                data = r.json()
            except ValueError:
                err = r.text[:300]
            else:
                body = data.get('body') or data.get('response', {}).get('body')
                if body is not None:
                    return body, None
                err = json.dumps(data, ensure_ascii=False)[:300]
        except requests.RequestException as e:
            err = type(e).__name__

        if t < tries:
            print(f'\n  {page}쪽 재시도 {t}/{tries - 1}  ({err[:60]})  {wait}초 대기')
            time.sleep(wait)
            wait *= 2

    return None, err


def rows_of(body):
    items = body.get('items') or []
    if isinstance(items, dict):
        items = items.get('item') or []
    if isinstance(items, dict):
        items = [items]
    return items


def fetch_one(key, label, op, stamp):
    print(f'\n{"=" * 56}\n{label}  ({op})')

    body, err = call(key, op, 1)
    if body is None:
        print(f'  실패 → {err}')
        return

    total = int(body['totalCount'])
    first = rows_of(body)
    if not first:
        print('  첫 페이지가 비어 있습니다')
        return

    size = len(first)
    pages = (total + size - 1) // size
    cols = [c for c in first[0] if c in KEEP[label]] if label in KEEP \
        else list(first[0].keys())
    print(f'  전체 {total:,}건 · 한 쪽 {size}건 · {pages}쪽')
    print(f'  저장 컬럼 {len(cols)}개 / 전체 {len(first[0])}개')

    out = DATA / f'식품의약품안전처_{label}_{stamp}.csv'
    done = 0
    with out.open('w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction='ignore')
        w.writeheader()
        w.writerows(first)
        f.flush()
        done = len(first)

        for p in range(2, pages + 1):
            b, err = call(key, op, p)
            if b is None:
                print(f'\n  {p}쪽에서 멈춤 → {err}')
                break
            got = rows_of(b)
            w.writerows(got)
            f.flush()
            done += len(got)
            print(f'\r  {p}/{pages}  {done:,}건', end='')

            time.sleep(SLEEP)

    print(f'\n  저장 → {out.name}  ({done:,}행 / 전체 {total:,}건)')


def main():
    raw = load_key()

    key = None
    probe = next(iter(TARGETS.values()))
    for i, cand in enumerate(key_forms(raw), 1):
        body, err = call(key=cand, op=probe, page=1, tries=2)
        if body is not None:
            key = cand
            print(f'인증키 형태 {i}번으로 연결됨')
            break
        print(f'형태 {i} 실패 → {err}\n')
    if key is None:
        sys.exit('인증키를 다시 확인해주세요.')

    DATA.mkdir(exist_ok=True)
    stamp = time.strftime('%Y%m%d')
    for label, op in TARGETS.items():
        fetch_one(key, label, op, stamp)

    print(f'\n{"=" * 56}\n끝')


if __name__ == '__main__':
    main()