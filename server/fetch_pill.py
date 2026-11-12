"""의약품 낱알식별 정보 전체 수집 — 1회용
   data/pill/낱알식별.csv 로 저장한다.
"""
import csv
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import quote, unquote

import requests

BASE = ('https://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService03'
        '/getMdcinGrnIdntfcInfoList03')
OUT = (Path(__file__).parent / 'data' /
       f'식품의약품안전처_의약품낱알식별정보_{time.strftime("%Y%m%d")}.csv')
ROWS = 500      # 한 번에 받을 건수
SLEEP = 0.5     # 호출 간 간격 (초)
TRIES = 5       # 한 쪽당 시도 횟수


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
    """포털이 Encoding/Decoding 키를 구분해 주지 않으므로 세 형태를 다 시도한다"""
    out, seen = [], set()
    for f in (key, unquote(key), quote(key, safe='')):
        if f not in seen:
            seen.add(f)
            out.append(f)
    return out


def call(key, page, tries=TRIES):
    """성공하면 (body, None), 실패하면 (None, 사유). 실패 시 간격을 늘려 재시도한다"""
    url = f'{BASE}?serviceKey={key}&pageNo={page}&numOfRows={ROWS}&type=json'
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
    """items 모양이 응답마다 달라서 전부 받아준다"""
    items = body.get('items') or []
    if isinstance(items, dict):
        items = items.get('item') or []
    if isinstance(items, dict):
        items = [items]
    return items


def main():
    raw = load_key()

    key, body = None, None
    for i, cand in enumerate(key_forms(raw), 1):
        body, err = call(cand, 1, tries=2)
        if body is not None:
            key = cand
            print(f'인증키 형태 {i}번으로 연결됨\n')
            break
        print(f'형태 {i} 실패 → {err}\n')
    if key is None:
        sys.exit('인증키를 다시 확인해주세요.')

    total = int(body['totalCount'])
    first = rows_of(body)
    if not first:
        sys.exit('첫 페이지가 비어 있습니다.')

    # 포털이 ROWS보다 적게 주는 경우가 있어 실제 받은 수로 쪽수를 다시 센다
    size = len(first)
    pages = (total + size - 1) // size
    print(f'전체 {total:,}건 · 한 쪽 {size}건 · {pages}쪽\n')

    OUT.parent.mkdir(parents=True, exist_ok=True)
    done = 0
    with OUT.open('w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=list(first[0].keys()),
                           extrasaction='ignore')
        w.writeheader()
        w.writerows(first)
        f.flush()
        done = len(first)

        for p in range(2, pages + 1):
            b, err = call(key, p)
            if b is None:
                print(f'\n{p}쪽에서 멈춤 → {err}')
                break
            got = rows_of(b)
            w.writerows(got)
            f.flush()
            done += len(got)
            print(f'\r{p}/{pages}  {done:,}건', end='')
            time.sleep(SLEEP)

    print(f'\n저장 → {OUT}')
    print(f'{done:,}행 / 전체 {total:,}건')
    if done < total:
        print('덜 받았습니다. 다시 돌리면 처음부터 받습니다.')


if __name__ == '__main__':
    main()