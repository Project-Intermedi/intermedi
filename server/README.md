# 인터메디 서버

> 현재 DB는 **SQLite**입니다. PostgreSQL 전환은 W10~11 예정.

## 준비

### 1. 약가마스터 CSV

드라이브에서 받아 `server/data/`에 넣으세요. 용량이 커서 깃에는 없습니다.

```
내 드라이브 / 인터메디 / 1_데이터 / 공공데이터 /
건강보험심사평가원_약가마스터_의약품표준코드_20260831.csv
```

### 2. 설치

```bash
cd server
python -m venv .venv
source .venv/Scripts/activate      # Windows Git Bash
pip install -r requirements.txt
```

PaddleOCR 용량이 커서 **10~20분** 걸립니다.

### 3. 실행

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

- 처음 켤 때 OCR 모델 다운로드 3~5분
- 이후 켤 때마다 약가마스터 적재 30초~1분
- `http://localhost:8000/docs` 에서 직접 눌러볼 수 있습니다

## 앱에서 붙일 주소

React Native는 `localhost`가 PC를 가리키지 않습니다.

| 환경 | 주소 |
| --- | --- |
| Android 에뮬레이터 | `http://10.0.2.2:8000` |
| iOS 시뮬레이터 | `http://localhost:8000` |
| 실기기 | `http://<PC 내부 IP>:8000` (같은 와이파이) |

PC 내부 IP는 `ipconfig`로 확인합니다.

## API

| | |
| --- | --- |
| `POST /analyze` | 사진 → 약품명 + 제품코드 (**50~70초 소요**) |
| `POST /records` | 등록 |
| `GET /records` | 목록 |
| `GET /records/{id}` | 상세 |

`/analyze`는 `multipart/form-data`로 `file`과 `source`를 보냅니다.
`Content-Type` 헤더는 직접 넣지 마세요.