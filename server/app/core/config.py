"""경로·설정 모음"""
from pathlib import Path

# 이 파일이 server/app/core/config.py 이므로, 두 단계 위가 server/
BASE_DIR = Path(__file__).resolve().parents[2]

DB_PATH = BASE_DIR / 'intermedi.db'
DATA_DIR = BASE_DIR / 'data'
UPLOAD_DIR = BASE_DIR / 'uploads'

UPLOAD_DIR.mkdir(exist_ok=True)