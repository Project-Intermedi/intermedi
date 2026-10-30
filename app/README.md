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

## 기능과 범위

- 기존 UI 디자인과 앱 내부 화면 이동 유지
- 카메라 촬영, 갤러리 이미지 선택, 이미지 미리보기 (20MB 이하)
- OCR 요청, 실제 의약품 이름/제품 코드/매칭 상태 표시
- 로딩, 오류, 빈 결과, 재시도, 취소와 오래된 응답 무시
- 분석 결과를 수정/완료 화면으로 전달
