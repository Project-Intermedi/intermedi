"""API 입출력 형식"""
from pydantic import BaseModel


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