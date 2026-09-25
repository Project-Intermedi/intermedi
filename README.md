\# 인터메디 (InterMedi)



AI 기반 병원 진료 처방전 해석기



처방전 한 장에 담긴 정보를 환자의 언어로 해석하고,

여러 병원의 처방을 한 곳에 모아 위험한 조합을 알리는 서비스입니다.



\## 팀 — 식후 30분



프로젝트종합설계 II | 소프트웨어융합학과



\- 김소연 — 프론트엔드 · AI

\- 배서연 — 백엔드 · AI



\## 기술 스택



\- App: React Native

\- Server: FastAPI, PostgreSQL

\- OCR: PaddleOCR, Google ML Kit

\- Data: 식약처 의약품 제품허가정보 / DUR 품목정보, 심평원 약제급여목록표



\## 폴더 구조



```

intermedi/

├── app/                      # React Native

│   └── src/

│       ├── app/

│       │   ├── components/   # 공통 컴포넌트

│       │   ├── screens/      # 화면

│       │   ├── services/     # 서버 API 호출

│       │   └── utils/

│       └── styles/

├── server/                   # FastAPI

│   └── app/

│       ├── api/              # 라우터

│       ├── core/             # 설정, 환경변수

│       ├── models/           # DB 모델

│       └── services/         # OCR, 공공API, DUR 판정

├── docs/

│   ├── sample/               # 개인정보 제거된 처방전 샘플

│   └── meeting/              # 회의록

└── .github/

```



\## 시작하기



```

git clone https://github.com/Project-Intermedi/intermedi.git

cd intermedi



cp server/.env.example server/.env

cp app/.env.example app/.env

```



환경변수 값은 팀 내부에서 별도 공유합니다.



\## 브랜치 전략



\- `main` — 항상 동작하는 상태

\- `feature/#이슈번호-작업명` — 기능 개발용, 머지 후 삭제



```

git checkout main

git pull origin main

git checkout -b feature/#12-camera-screen



git add .

git commit -m "feat: 작업 내용"

git push origin feature/#12-camera-screen

```



이후 GitHub에서 PR을 생성합니다.



\## 커밋 컨벤션



\- `feat` — 새 기능

\- `fix` — 버그 수정

\- `docs` — 문서

\- `style` — 코드 포맷

\- `refactor` — 리팩토링

\- `test` — 테스트

\- `chore` — 설정, 의존성



예시: `feat: 처방전 OCR 파싱 로직 추가`



\## 주의사항



\- `.env` 파일과 API 키는 절대 커밋하지 않습니다

\- 실제 처방전 이미지는 레포에 올리지 않습니다

