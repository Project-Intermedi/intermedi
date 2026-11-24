"""허가정보 CSV → SQLite (효능·용법·주의사항 선별) — 1회용"""
import csv
import glob
import os
import re
import sqlite3
import sys

csv.field_size_limit(min(sys.maxsize, 2**31 - 1))

SRC = sorted(glob.glob('data/식약처_의약품허가정보_*.csv'))[-1]
DB = 'data/drug_info.db'
CAP = 1500

TAIL = re.compile(r'\s*/?>\s*$')
NUM = re.compile(r'^\s*\d+\s*[.)]\s*')


def norm(t):
    t = TAIL.sub('', t)
    t = NUM.sub('', t)
    return t.replace(' ', '').rstrip('.').strip()


def bucket(title):
    t = norm(title)
    if t == '경고':
        return 'warn'
    if '투여하지말것' in t or '복용하지말것' in t:
        return 'contra'
    if t in ('이상반응', '부작용'):
        return 'adverse'
    if '임부' in t or '수유부' in t:
        return 'pregnancy'
    if '소아' in t:
        return 'child'
    if '고령자' in t or '노인' in t:
        return 'elderly'
    return None


def clean(s):
    if not s:
        return ''
    out = []
    for line in s.split('\n'):
        line = TAIL.sub('', line.rstrip())
        if line:
            out.append(line)
    return '\n'.join(out).strip()


def split_sections(nb):
    got = {}
    cur = None
    buf = []
    for line in (nb or '').split('\n'):
        if line.startswith('■'):
            if cur and buf:
                got.setdefault(cur, []).append('\n'.join(buf).strip())
            cur = bucket(line[1:])
            buf = []
        elif cur:
            line = TAIL.sub('', line.rstrip())
            if line:
                buf.append(line)
    if cur and buf:
        got.setdefault(cur, []).append('\n'.join(buf).strip())
    out = {}
    for k, v in got.items():
        t = '\n'.join(v)
        if len(t) > CAP:                      # 문장 중간에서 끊기지 않게
            t = t[:CAP].rsplit('\n', 1)[0]
        out[k] = t
    return out


def main():
    print('원본 —', SRC)
    if os.path.exists(DB):
        os.remove(DB)
    con = sqlite3.connect(DB)
    con.execute('''CREATE TABLE drug_info (
        item_seq TEXT PRIMARY KEY, item_name TEXT, entp_name TEXT,
        etc_otc TEXT, material TEXT, storage TEXT, valid_term TEXT,
        efficacy TEXT, dosage TEXT,
        warn TEXT, contra TEXT, adverse TEXT, pregnancy TEXT,
        child TEXT, elderly TEXT)''')

    batch, n = [], 0
    stat = {k: 0 for k in ('warn', 'contra', 'adverse', 'pregnancy', 'child', 'elderly')}

    with open(SRC, encoding='utf-8-sig', newline='') as f:
        for row in csv.DictReader(f):
            seq = (row['ITEM_SEQ'] or '').strip()
            if not seq:
                continue
            sec = split_sections(row['주의사항'])
            for k in stat:
                if sec.get(k):
                    stat[k] += 1
            batch.append((
                seq, row['ITEM_NAME'], row['ENTP_NAME'], row['ETC_OTC_CODE'],
                clean(row['MATERIAL_NAME'])[:CAP], clean(row['STORAGE_METHOD'])[:300],
                row['VALID_TERM'],
                clean(row['효능효과'])[:CAP], clean(row['용법용량'])[:CAP],
                sec.get('warn', ''), sec.get('contra', ''),
                sec.get('adverse', ''), sec.get('pregnancy', ''),
                sec.get('child', ''), sec.get('elderly', '')))
            n += 1
            if len(batch) >= 2000:
                con.executemany('INSERT OR REPLACE INTO drug_info VALUES '
                                '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', batch)
                batch.clear()
                print(f'  {n}건')

    if batch:
        con.executemany('INSERT OR REPLACE INTO drug_info VALUES '
                        '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', batch)
    con.commit()
    con.execute('VACUUM')
    con.close()

    src_mb = os.path.getsize(SRC) / 1024 / 1024
    db_mb = os.path.getsize(DB) / 1024 / 1024
    print(f'\n{SRC}  {src_mb:.1f}MB')
    print(f'{DB}  {db_mb:.1f}MB   ({src_mb / db_mb:.0f}배 축소)')
    print(f'적재 {n}건\n')
    for k, v in stat.items():
        print(f'  {k:10} {v:6}건  {v / n * 100:5.1f}%')

    con = sqlite3.connect(DB)
    for name in ('무코스타정', '동화록소닌정', '에어탈정'):
        r = con.execute('SELECT item_name, efficacy, adverse FROM drug_info '
                        'WHERE item_name LIKE ? LIMIT 1', (f'%{name}%',)).fetchone()
        if r:
            print(f'\n[{r[0]}]')
            print('  효능 →', (r[1] or '')[:80].replace('\n', ' '))
            print('  부작용 →', (r[2] or '')[:80].replace('\n', ' '))
    con.close()


if __name__ == '__main__':
    main()
