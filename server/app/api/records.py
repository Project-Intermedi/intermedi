"""처방 기록 엔드포인트"""
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import BASE_DIR, UPLOAD_DIR
from app.models import db
from app.schemas.record import RecordIn
from app.services.match import match_codes, match_names
from app.services.ocr import run_ocr

router = APIRouter()


@router.post('/analyze')
async def analyze(file: UploadFile = File(...), source: str = Form('bag')):
    ext = Path(file.filename or 'img.jpg').suffix or '.jpg'
    path = UPLOAD_DIR / f'{uuid.uuid4().hex}{ext}'
    with path.open('wb') as f:
        shutil.copyfileobj(file.file, f)

    texts, scores = run_ocr(str(path))
    medicines = match_codes(texts) if source == 'prescription' else match_names(texts)

    return {
        'image_path': str(path.relative_to(BASE_DIR)),
        'source': source,
        'line_count': len(texts),
        'medicines': medicines,
    }


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
            c.execute(
                """INSERT INTO medicine
                   (prescription_id, product_code, name, dose_once, times_per_day,
                    total_days, usage, match_stage, matched, raw_text)
                   VALUES (?,?,?,?,?,?,?,?,?,?)""",
                (pid, m.product_code, m.name, m.dose_once, m.times_per_day,
                 m.total_days, m.usage, m.match_stage,
                 int(m.matched), m.raw_text),
            )
    return {'id': pid}


@router.get('/records')
def list_records():
    with db.conn() as c:
        rows = c.execute(
            """SELECT p.*, COUNT(m.id) AS medicine_count
               FROM prescription p
               LEFT JOIN medicine m ON m.prescription_id = p.id
               GROUP BY p.id
               ORDER BY p.id DESC"""
        ).fetchall()
    return [dict(r) for r in rows]


@router.get('/records/{record_id}')
def get_record(record_id: int):
    with db.conn() as c:
        p = c.execute('SELECT * FROM prescription WHERE id = ?',
                      (record_id,)).fetchone()
        if p is None:
            raise HTTPException(404, '없는 기록입니다')
        meds = c.execute('SELECT * FROM medicine WHERE prescription_id = ?',
                         (record_id,)).fetchall()
    out = dict(p)
    out['medicines'] = [dict(m) for m in meds]
    return out