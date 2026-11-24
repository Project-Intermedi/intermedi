"""e약은요(의약품개요정보) 전수 수집 + 커버리지 확인 — 1회용"""
import csv
import os
import sys
import time
import urllib.parse as up
from datetime import date

import requests
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
KEY = os.getenv('DATA_GO_KR_API_KEY', '')
URL = 'https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList'
ROWS = 500
TRIES = 5

COLS = ('itemSeq', 'itemName', 'entpName', 'efcyQesitm', 'useMethodQesitm',
        'atpnWarnQesitm', 'atpnQesitm', 'intrcQesitm', 'seQesitm',
        'depositMethodQesitm', 'updateDe')

DEMO = ('아목시실린', '록소프로펜', '레바미피드', '심바로드', '에어탈',
        '세티리진', '몬테루카스트', '녹사필', '미노씬')


def pick_key():
    for key in (KEY, up.unquote(KEY), up.quote(KEY)):
        try:
            u = f'{URL}?serviceKey={key}&pageNo=1&numOfRows=1&type=json'
            body = requests.get(u, timeout=30).json().get('body') or {}
            if body.get('items'):
                return key, body.get('totalCount', 0)
        except Exception:
            pass
    return None, 0


def fetch_page(key, page):
    u = f'{URL}?serviceKey={key}&pageNo={page}&numOfRows={ROWS}&type=json'
    wait = 1
    for _ in range(TRIES):
        try:
            body = requests.get(u, timeout=60).json().get('body') or {}
            return body.get('items') or []
        except Exception as e:
            print(f'  {page}쪽 재시도 — {e}')
            time.sleep(wait)
            wait *= 2
    return []


def main():
    key, total = pick_key()
    if not key:
        print('인증 실패')
        return
    pages = (total + ROWS - 1) // ROWS
    print(f'전체 {total}건 · {pages}쪽')

    out = f'data/식약처_의약품개요정보_{date.today():%Y%m%d}.csv'
    os.makedirs('data', exist_ok=True)
    rows = []
    with open(out, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=COLS, extrasaction='ignore')
        w.writeheader()
        for p in range(1, pages + 1):
            items = fetch_page(key, p)
            for it in items:
                r = {c: (it.get(c) or '') for c in COLS}
                rows.append(r)
                w.writerow(r)
            print(f'  {p}/{pages}쪽 · 누적 {len(rows)}건')
            time.sleep(0.3)

    print(f'\n저장 — {out}  {len(rows)}건')

    print('\n항목별 채움률')
    for c in COLS[3:10]:
        n = sum(1 for r in rows if r[c].strip())
        print(f'  {c:22} {n:5}건  {n / len(rows) * 100:5.1f}%')

    seqs = {r['itemSeq'] for r in rows if r['itemSeq']}
    print(f'\n유니크 품목기준코드 {len(seqs)}개')

    try:
        from app.services.match import MED
        master = {s for s in MED['품목기준코드'] if s}
        hit = seqs & master
        print(f'약가마스터 품목기준코드 {len(master)}개 중 교집합 {len(hit)}개 '
              f'({len(hit) / len(master) * 100:.1f}%)')
    except Exception as e:
        print(f'약가마스터 대조 건너뜀 — {e}')

    print('\n데모 약 확인')
    for d in DEMO:
        found = [r['itemName'] for r in rows if d in r['itemName']]
        print(f'  {d:10} {len(found):3}건  {found[0] if found else "없음"}')


if __name__ == '__main__':
    main()