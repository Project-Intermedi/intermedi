"""OCR 원본 줄 전체 출력 — 작업용 임시 스크립트"""
import sys

from app.services.ocr import run_ocr

path = sys.argv[1]
texts, scores = run_ocr(path)

print(f'\n총 {len(texts)}줄\n' + '-' * 50)
for i, (t, s) in enumerate(zip(texts, scores)):
    print(f'{i:3d}  {s:.2f}  {t}')