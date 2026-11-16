"""안전성 검사 요청·응답 모델"""
from pydantic import BaseModel


class MedicineIn(BaseModel):
    name: str = ''
    product_code: str | None = None
    hospital: str | None = None
    issued_at: str | None = None


class SafetyIn(BaseModel):
    medicines: list[MedicineIn]


class Who(BaseModel):
    name: str
    hospital: str = ''
    issued_at: str = ''


class ComboOut(BaseModel):
    a: Who
    b: Who
    ingr_a: str
    ingr_b: str
    reason: str


class DuplicateOut(BaseModel):
    effect: str
    same_drug: bool
    drugs: list[Who]


class FlagDrug(Who):
    detail: str = ''
    ingr: str = ''
    cls: str = ''


class AlertOut(BaseModel):
    type: str
    drugs: list[FlagDrug]


class SafetyOut(BaseModel):
    combo: list[ComboOut]
    duplicate: list[DuplicateOut]
    alerts: list[AlertOut]