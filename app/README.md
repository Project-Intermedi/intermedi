# InterMedi 웹 프론트엔드

Figma Make 기반 React + TypeScript + Vite + Tailwind CSS v4 웹앱입니다.
현재 루트 README의 React Native 설명과 달리 이 app/ 구현은 웹앱입니다.

## 로컬 실행

Node.js 22와 pnpm 10.34.3을 사용합니다 (.mise.toml 참고).

```powershell
cd app
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm dev
```

브라우저에서 http://127.0.0.1:8444 를 엽니다. 기존 UI 원본의 8443 포트와 충돌하지 않도록 8444를 사용합니다.
백엔드는 별도로 http://localhost:8000 에서 실행해야 합니다.

## API 연결

개발 서버가 /api/analyze 요청을 http://localhost:8000/analyze 로 전달합니다.
요청은 multipart/form-data이며 file 이미지와 source=bag을 포함합니다.
Content-Type은 브라우저가 설정합니다. 분석 대기 제한은 120초입니다.
기존 app/.env.example은 보존했으며 현재 Vite 설정은 API_BASE_URL을 읽지 않습니다.
로컬 실행에 .env 생성은 필요하지 않습니다.

이 프록시는 Vite 개발 서버 전용입니다. 배포 시 /api를 백엔드로 연결하는 리버스 프록시 등 별도 설정이 필요합니다.
pnpm preview에는 개발 프록시가 적용되지 않습니다.

## 기능과 범위

- 기존 UI 디자인과 앱 내부 화면 이동 유지
- 카메라 촬영, 갤러리 이미지 선택, 이미지 미리보기 (20MB 이하)
- OCR 요청, 실제 의약품 이름/제품 코드/매칭 상태 표시
- 로딩, 오류, 빈 결과, 재시도, 취소와 오래된 응답 무시
- 분석 결과를 수정/완료 화면으로 전달

카메라는 localhost 또는 HTTPS 및 브라우저 카메라 권한이 필요합니다.
결과는 현재 앱 메모리에서만 유지되고 새로고침하면 사라집니다. DB에는 저장하지 않습니다.
분석 외의 홈/상세/안전성 등 일부 화면은 기존 UI 데모 데이터를 사용합니다.
API에 없는 병원/복용 정보는 추측하지 않습니다.

## 수동 확인

1. 홈에서 촬영 화면으로 이동하고 카메라 권한을 확인합니다.
2. 개인정보 없는 테스트 이미지를 갤러리에서 선택하고 미리보기를 확인합니다.
3. '이 사진 사용'을 눌러 분석 대기 후 실제 약품 목록을 확인합니다.
4. 글자 없는 이미지로 빈 결과와 재시도를 확인합니다.
5. 백엔드를 중지하고 연결 오류 및 재시도를 확인합니다.
6. 분석 중 취소와 결과 화면 뒤로 가기, 정보 수정 및 완료 화면을 확인합니다.

.env, 인증정보, 실제 처방전/약봉투 이미지, node_modules, dist 및 OCR 캐시는 Git에 추가하지 않습니다.
