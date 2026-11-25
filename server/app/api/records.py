"""처방 기록 엔드포인트"""
import shutil
import uuid
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import UPLOAD_DIR
from app.models import db
from app.schemas.record import RecordIn
from app.services import period
from app.services.match import match_all, match_names, spec_of
from app.services.ocr import run_ocr
from app.services.meta import extract_meta

router = APIRouter()


@router.post('/analyze')
async def analyze(file: UploadFile = File(...), source: str = Form('bag')):
    ext = Path(file.filename or 'img.jpg').suffix or '.jpg'
    path = UPLOAD_DIR / f'{uuid.uuid4().hex}{ext}'
    with path.open('wb') as f:
        shutil.copyfileobj(file.file, f)

    try:
        texts, scores = run_ocr(str(path))
    finally:
        # 처방전 원본에는 환자 이름과 주민등록번호가 찍혀 있다.
        # 분석에 쓴 뒤 바로 지우고 서버에 남기지 않는다.
        path.unlink(missing_ok=True)

    medicines = match_all(texts)

    return {
        'image_path': None,
        'source': source,
        'line_count': len(texts),
        **extract_meta(texts),
        'diagnosis': None,
        'medicines': medicines,
    }


def _recheck(m):
    """저장 직전 이름으로 코드를 다시 확인한다.

    사용자가 검토 화면에서 약 이름을 고쳤을 수 있다. 화면에서 확정한 것은
    이름이므로 이름을 기준으로 삼는다. 코드가 없으면 DUR 검사에서 조용히
    빠지므로, 채울 수 있으면 여기서 채운다.
    """
    hit = match_names([m.name]) if m.name else []
    got = hit[0] if hit else None
    if got and got.get('product_code'):
        return got['product_code'], got.get('match_stage') or m.match_stage, True
    code = (m.product_code or '').strip()
    return code, m.match_stage, bool(code)


@router.post('/records', status_code=201)
def create_record(body: RecordIn):
    now = datetime.now().isoformat(timespec='seconds')
    with db.conn() as c:
        cur = c.execute(
            """INSERT INTO prescription
               (source, image_path, hospital, doctor, issued_at, diagnosis, created_at)
               VALUES (?,?,?,?,?,?,?)""",
            (body.source, body.image_path, body.hospital, body.doctor,
             body.issued_at, body.diagnosis, now),
        )
        pid = cur.lastrowid
        for m in body.medicines:
            code, stage, ok = _recheck(m)
            c.execute(
                """INSERT INTO medicine
                   (prescription_id, product_code, name, dose_once, times_per_day,
                    total_days, usage, match_stage, matched, raw_text)
                   VALUES (?,?,?,?,?,?,?,?,?,?)""",
                (pid, code, m.name, m.dose_once, m.times_per_day,
                 m.total_days, m.usage, stage,
                 int(ok), m.raw_text),
            )
    return {'id': pid}


def _mark(rec, meds):
    """처방 하나에 복용 중 정보를 달아준다"""
    when = {'issued_at': rec['issued_at'], 'created_at': rec['created_at']}
    for m in meds:
        m['taking'] = period.taking({**m, **when})
        m['spec'] = spec_of(m.get('product_code'), m.get('name'))
    rec['medicine_count'] = len(meds)
    rec['taking_count'] = sum(1 for m in meds if m['taking'])
    rec['taking'] = rec['taking_count'] > 0
    rec['ends_on'] = max((period.ends_on({**m, **when}) for m in meds),
                         default='')
    return rec


@router.get('/records')
def list_records(status: str = 'all'):
    """status — all · taking(복용 중) · done(복용 완료)"""
    with db.conn() as c:
        ps = c.execute('SELECT * FROM prescription ORDER BY id DESC').fetchall()
        ms = c.execute('SELECT * FROM medicine ORDER BY id').fetchall()

    by_pid = defaultdict(list)
    for m in ms:
        by_pid[m['prescription_id']].append(dict(m))

    out = []
    for p in ps:
        rec = dict(p)
        meds = by_pid.get(rec['id'], [])
        _mark(rec, meds)
        rec['medicines'] = [{'id': m['id'], 'name': m['name'],
                             'spec': m['spec'], 'taking': m['taking']}
                            for m in meds]
        out.append(rec)

    if status == 'taking':
        out = [r for r in out if r['taking']]
    elif status == 'done':
        out = [r for r in out if not r['taking']]
    return out


@router.get('/records/{record_id}')
def get_record(record_id: int):
    with db.conn() as c:
        p = c.execute('SELECT * FROM prescription WHERE id = ?',
                      (record_id,)).fetchone()
        if p is None:
            raise HTTPException(404, '없는 기록입니다')
        meds = c.execute('SELECT * FROM medicine WHERE prescription_id = ?',
                         (record_id,)).fetchall()

    rec = dict(p)
    out_meds = [dict(m) for m in meds]
    _mark(rec, out_meds)
    rec['medicines'] = out_meds
    return rec