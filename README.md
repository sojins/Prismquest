# Prism Quest

초등학생의 학습·생활 습관을 아이프리풍 퀘스트와 보상으로 관리하는 가족용 웹앱 MVP입니다.

## 구조
- `frontend/`: React + Vite 정적 프론트
- `backend/`: PHP + SQLite API
- `docs/`: 요구사항과 배포 메모

## MVP 기능
- 오늘의 미션 확인
- 완료 요청
- 부모 PIN 승인
- 포인트 적립
- 보상 사용
- 기록 조회

## 개발 시작
```bash
cd frontend
npm install
npm run dev
```

## 빌드
```bash
npm run build
```

`frontend/dist`의 내용을 웹호스팅 공개 디렉터리에 업로드하고, `backend`는 PHP 실행 경로에 배치합니다.
