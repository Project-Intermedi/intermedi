import json
import shutil
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import db
from match import match_names
from ocr import run_ocr

UPLOAD_DIR = Path(__file__).parent / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init()
    yield


app = FastAPI(title='인터메디 API', version='0.1', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


# ── 스키마 ────────────────────────────────────────────────
class MedicineIn(BaseModel):
    name: str
    product_code: str | None = None
    dose_once: str | None = None
    times_per_day: str | None = None
    total_days: str | None = None
    usage: str | None = None
    match_stage: str | None = None
    matched: bool = False
    raw_text: str | None = None


class RecordIn(BaseModel):
    source: str = 'bag'
    image_path: str | None = None
    hospital: str | None = None
    doctor: str | None = None
    issued_at: str | None = None
    diagnosis: str | None = None
    medicines: list[MedicineIn] = []


# ── 상태 확인 ─────────────────────────────────────────────
@app.get('/health')
def health():
    return {'ok': True}


# ── 1) 분석 ───────────────────────────────────────────────
@app.post('/analyze')
async def analyze(file: UploadFile = File(...), source: str = Form('bag')):
    ext = Path(file.filename or 'img.jpg').suffix or '.jpg'
    path = UPLOAD_DIR / f'{uuid.uuid4().hex}{ext}'
    with path.open('wb') as f:
        shutil.copyfileobj(file.file, f)

    texts, scores = run_ocr(str(path))
    medicines = match_names(texts)

    return {
        'image_path': str(path.relative_to(Path(__file__).parent)),
        'source': source,
        'line_count': len(texts),
        'medicines': medicines,
    }


# ── 2) 등록 ───────────────────────────────────────────────
@app.post('/records', status_code=201)
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


# ── 3) 목록 ───────────────────────────────────────────────
@app.get('/records')
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


# ── 4) 상세 ───────────────────────────────────────────────
@app.get('/records/{record_id}')
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