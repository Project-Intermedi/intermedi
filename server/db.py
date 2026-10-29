import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / 'intermedi.db'

SCHEMA = """
CREATE TABLE IF NOT EXISTS prescription (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source      TEXT NOT NULL,
    image_path  TEXT,
    hospital    TEXT,
    doctor      TEXT,
    issued_at   TEXT,
    diagnosis   TEXT,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS medicine (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    product_code    TEXT,
    name            TEXT NOT NULL,
    dose_once       TEXT,
    times_per_day   TEXT,
    total_days      TEXT,
    usage           TEXT,
    match_stage     TEXT,
    matched         INTEGER DEFAULT 0,
    raw_text        TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescription(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_medicine_pid ON medicine(prescription_id);
"""


def conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA foreign_keys = ON')
    return c


def init():
    with conn() as c:
        c.executescript(SCHEMA)
    print(f'DB 준비 완료 → {DB_PATH}')