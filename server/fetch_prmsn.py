"""의약품 제품 허가정보 전수 수집 — 효능효과·용법용량·주의사항 (1회용)"""
import csv
import html
import os
import re
import sys
import time
import urllib.parse as up
from datetime import date

import requests
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
KEY = os.getenv('DATA_GO_KR_API_KEY', '')
URL = ('https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService08'
       '/getDrugPrdtPrmsnDtlInq08')
ROWS = 200
TRIES = 5

KEEP = ('ITEM_SEQ', 'ITEM_NAME', 'ENTP_NAME', 'ETC_OTC_CODE',
        'MATERIAL_NAME', 'STORAGE_METHOD', 'VALID_TERM')
DOCS = ('EE_DOC_DATA', 'UD_DOC_DATA', 'NB_DOC_DATA')
COLS = KEEP + ('효능효과', '용법용량', '주의사항')

DEMO = ('아목시실린', '록소프로펜', '레바미피드', '심바로드', '에어탈',
        '세티리진', '몬테루카스트', '녹사필', '미노씬')

ARTICLE = re.compile(r'<ARTICLE[^>]*title="([^"]*)"', re.I)
TAG = re.compile(r'<[^>]+>')
SPACE = re.compile(r'[ \t]+')
BLANK = re.compile(r'\n{2,}')


def plain(raw) -> str:
    """XML 마크업을 소제목이 남는 평문으로"""
    if not raw:
        return ''
    s = str(raw)
    s = s.replace('<![CDATA[', '').replace(']]>', '')
    s = ARTICLE.sub(lambda m: '\n■ ' + m.group(1).strip(), s)
    s = s.replace('</PARAGRAPH>', '\n').replace('</SECTION>', '\n')
    s = TAG.sub(' ', s)
    s = html.unescape(s)
    s = SPACE.sub(' ', s)
    s = '\n'.join(line.strip() for line in s.split('\n'))
    return BLANK.sub('\n', s).strip()


def pick_key():
    for key in (KEY, up.unquote(KEY), up.quote(KEY)):
        try:
            u = f'{URL}?serviceKey={key}&pageNo=1&numOfRows=1&type=json'
            body = requests.get(u, timeout=30).json().get('body') or {}
            if body.get('items'):
                return key, int(body.get('totalCount') or 0)
        except Exception:
            pass
    return None, 0


def fetch_page(key, page):
    u = f'{URL}?serviceKey={key}&pageNo={page}&numOfRows={ROWS}&type=json'
    wait = 2
    for _ in range(TRIES):
        try:
            body = requests.get(u, timeout=120).json().get('body') or {}
            items = body.get('items') or []
            return [i.get('item', i) if isinstance(i, dict) else i for i in items]
        except Exception as e:
            print(f'  {page}쪽 재시도')
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

    os.makedirs('data', exist_ok=True)
    out = f'data/식약처_의약품허가정보_{date.today():%Y%m%d}.csv'
    rows = []
    with open(out, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=COLS, extrasaction='ignore')
        w.writeheader()
        for p in range(1, pages + 1):
            for it in fetch_page(key, p):
                r = {c: str(it.get(c) or '').strip() for c in KEEP}
                r['효능효과'] = plain(it.get('EE_DOC_DATA'))
                r['용법용량'] = plain(it.get('UD_DOC_DATA'))
                r['주의사항'] = plain(it.get('NB_DOC_DATA'))
                rows.append(r)
                w.writerow(r)
            if p % 10 == 0 or p == pages:
                print(f'  {p}/{pages}쪽 · 누적 {len(rows)}건')
            time.sleep(0.2)

    size = os.path.getsize(out) / 1024 / 1024
    print(f'\n저장 — {out}  {len(rows)}건 · {size:.1f}MB')

    print('\n항목별 채움률 / 평균 길이')
    for c in ('효능효과', '용법용량', '주의사항'):
        vals = [r[c] for r in rows if r[c]]
        avg = sum(len(v) for v in vals) / len(vals) if vals else 0
        mx = max((len(v) for v in vals), default=0)
        print(f'  {c}  {len(vals):6}건 {len(vals)/len(rows)*100:5.1f}%  '
              f'평균 {avg:6.0f}자  최대 {mx:7}자')

    seqs = {r['ITEM_SEQ'] for r in rows if r['ITEM_SEQ']}
    print(f'\n유니크 품목기준코드 {len(seqs)}개')
    try:
        from app.services.match import MED
        master = {s for s in MED['품목기준코드'] if s}
        hit = seqs & master
        print(f'약가마스터 {len(master)}개 중 교집합 {len(hit)}개 '
              f'({len(hit)/len(master)*100:.1f}%)')
    except Exception as e:
        print(f'약가마스터 대조 건너뜀 — {e}')

    print('\n데모 약 확인')
    for d in DEMO:
        f2 = [r for r in rows if d in r['ITEM_NAME']]
        if f2:
            print(f'  {d:10} {len(f2):3}건  {f2[0]["ITEM_NAME"]}')
            print(f'             효능 → {f2[0]["효능효과"][:70]}')
        else:
            print(f'  {d:10}   0건  없음')


if __name__ == '__main__':
    main()