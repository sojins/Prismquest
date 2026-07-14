# Prism Quest

Prism Quest는 **가족이 함께 성장하는 작은 RPG**를 목표로 하는 웹앱입니다.
아이가 미션을 완료하면 부모가 승인하고, 포인트를 모아 원하는 보상을 얻습니다. 푸딩이와 찡찡이는 가족만의 NPC로 함께 성장합니다.

## 프로젝트 구조

- `frontend/` : React + Vite
- `backend/` : PHP + SQLite API
- `docs/` : 설계 문서, 세계관, 컨셉아트

## MVP 기능

- 오늘의 미션
- 완료 요청
- 부모 PIN 승인
- 포인트 원장
- 보상 상점
- 부모 승인 화면 (`/parent`)

## 개발 환경

- Node.js 20+
- PHP 8+
- SQLite

## 실행

### 1. 백엔드

```bash
php -S 127.0.0.1:8081 -t backend
```

정상 동작 확인:

```
http://127.0.0.1:8081/api/state.php
```

### 2. 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

접속:

- 아이 화면: http://localhost:8080/
- 부모 화면: http://localhost:8080/parent

> macOS에서는 PHP 서버를 `127.0.0.1`로 실행해야 Vite Proxy와 정상 연결됩니다.

## 빌드

```bash
cd frontend
npm run build
```

빌드 결과물은 `frontend/dist`에 생성됩니다.

## 문서

- `docs/vision.md`
- `docs/characters.md`
- `docs/lore/`
- `docs/concept-art/`
